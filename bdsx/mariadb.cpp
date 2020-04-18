#include "mariadb.h"
#include "native.h"
#include "jsctx.h"
#include "console.h"
#include <KRMySQL/db.h>
#include <KRMySQL/statement.h>
#include <KR3/win/eventhandle.h>

using namespace kr;

namespace
{
	Manual<sql::MySQLServer> s_mysqlServer;
	size_t s_serverInitCounter = 0;
	LinkedList<MariaDB> s_conns;
	atomic<size_t> s_db_ref;
	Event s_db_removed;

	AText argstring(const JsArguments& args, size_t index) throws(JsException)
	{
		if (index >= args.size()) return nullptr;
		const JsValue& value = args[index];
		switch (value.getType())
		{
		case JsType::Undefined:
		case JsType::Null:
			return nullptr;
		case JsType::String: break;
		default: throw JsException(TSZ16() << u"parameter " << (index+1) << u": must be string or null or undefined");
		}
		Text16 text = value.cast<Text16>();
		AText out;
		out << (Utf16ToUtf8)text;
		out << nullterm;
		return out;
	}
	const char* argtext(const AText& text) noexcept
	{
		if (text == nullptr) return nullptr;
		return text.data();
	}
}

class MariaDBInternal
{
public:
	MariaDBInternal(JsValue cb, AText host, AText id, AText password, AText db, int port) noexcept;
	~MariaDBInternal() noexcept;
	void fetch(JsValue callback) throws(JsException);
	void close() noexcept;

	Manual<sql::MySQL> m_sql;
	AText m_host;
	AText m_id;
	AText m_password;
	AText m_db;
	int m_port;
	TaskThread m_thread;
	bool m_closed;

	kr::sql::Result m_res;
	kr::uint m_fieldCount;
};


MariaDBStatement::MariaDBStatement(const JsArguments& args) noexcept
	:JsObjectT(args)
{
}
void MariaDBStatement::initMethods(JsClassT<MariaDBStatement>* cls) noexcept
{
}

MariaDBInternal::MariaDBInternal(JsValue cb, AText host, AText id, AText password, AText db, int port) noexcept
	:m_host(move(host)),
	m_id(move(id)),
	m_password(move(password)),
	m_db(move(db)),
	m_port(port)
{
	s_db_ref++;
	m_closed = false;

	EventPump* pump = EventPump::getInstance();
	m_thread.post([this, cbp = (JsPersistent)cb, pump = (Keep<EventPump>)pump]() mutable {
		if (s_serverInitCounter++ == 0)
		{
			s_mysqlServer.create();
		}
		m_sql.create(argtext(m_host), argtext(m_id), argtext(m_password), argtext(m_db), "UTF8", m_port);
		try
		{
			m_sql->connect();
			pump->post([cbp = move(cbp)]() {
				JsValue cb = cbp;
				if (cb.getType() == JsType::Function) cb();
				});
		}
		catch (SqlException &)
		{
			int no = m_sql->getErrorNumber();
			const char * errstr = m_sql->getErrorMessage();

			pump->post([cbp=move(cbp), no, errstr = (AText16)(Utf8ToUtf16)(Text)errstr]() {
				JsValue cb = cbp;
				if (cb.getType() == JsType::Function) cb(errstr, no);
				});
		}
		});

}
MariaDBInternal::~MariaDBInternal() noexcept
{
	s_db_ref--;
	s_db_removed->set();
}
void MariaDBInternal::fetch(JsValue callback) throws(JsException)
{
	EventPump* pump = EventPump::getInstance();

	JsPersistent* cbptr;
	if (callback.getType() == JsType::Function)
	{
		cbptr = _new JsPersistent(callback);
	}
	else
	{
		return;
	}

	m_thread.post([this, pump = (Keep<EventPump>)pump, cbptr] {
		MYSQL_ROW row;

		if (m_res.isEmpty() || (row = m_res.fetch()) == nullptr)
		{
			pump->post([cbptr] {
				JsValue cb = *cbptr;
				delete cbptr;
				try
				{
					cb(nullptr);
				}
				catch (JsException & err)
				{
					g_native->fireError(err.getValue());
				}
				});
			return;
		}
		Array<AText16> array;
		array.reserve(m_fieldCount);
		for (const char* column : View<const char*>(row, m_fieldCount))
		{
			if (column == nullptr)
			{
				array.push(nullptr);
			}
			else
			{
				array.push((AText16)(Utf8ToUtf16)(Text)column);
			}
		}
		pump->post([this, array = move(array), cbptr]{
			size_t size = array.size();
			JsValue jsarray = JsNewArray(size);
			for (uint i = 0; i < size; i++)
			{
				const AText16 &text = array[i];
				if (text == nullptr)
				{
					jsarray.set(i, nullptr);
				}
				else
				{
					jsarray.set(i, text);
				}
			}

			JsValue cb = *cbptr;
			delete cbptr;
			try
			{
				cb(jsarray);
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
			});
		});
}
void MariaDBInternal::close() noexcept
{
	if (m_closed) return;
	m_closed = true;
	m_thread.post([this] {
		m_res.close();
		m_sql.remove();
		if ((--s_serverInitCounter) == 0)
		{
			s_mysqlServer.remove();
		}
		});
	m_thread.postQuit();
	EventHandle* ev = m_thread.getThreadObject().getRawHandle();
	ev->callbackThreaded([this](DispatchedEvent* dispatched) {
			delete this;
			dispatched->cancel(); // 람다를 지워 this참조가 지워지게 된다
		});
}

MariaDB::MariaDB(const JsArguments& args) throws(JsException)
	:JsObjectT(args)
{
	m_sql = _new MariaDBInternal(
		args.at<JsValue>(0),
		argstring(args, 1), 
		argstring(args, 2),
		argstring(args, 3),
		argstring(args, 4),
		args.at<int>(5)
		);
	s_conns.attach(this);
}
MariaDB::~MariaDB() noexcept
{
	close();
}
void MariaDB::close() noexcept
{
	if (m_sql == nullptr) return;
	s_conns.detach(this);

	MariaDBInternal* sql = m_sql;
	m_sql = nullptr;

	sql->close();
}
void MariaDB::autocommit(bool enabled) noexcept
{
	MariaDBInternal* sql = m_sql;
	if (sql == nullptr) return;
	sql->m_thread.post([sql, enabled] {
		sql->m_sql->autocommit(enabled);
		});
}
void MariaDB::rollback() noexcept
{
	MariaDBInternal* sql = m_sql;
	if (sql == nullptr) return;
	sql->m_thread.post([sql] {
		sql->m_sql->rollback();
		});
}
void MariaDB::commit() noexcept
{
	MariaDBInternal* sql = m_sql;
	if (sql == nullptr) return;
	sql->m_thread.post([sql] {
		sql->m_sql->commit();
		});
}
void MariaDB::query(Text16 text, JsValue callback) throws(JsException)
{
	MariaDBInternal* sql = m_sql;
	if (sql == nullptr) throw JsException(u"DB already closed");

	EventPump* pump = EventPump::getInstance();
	struct PersistentData
	{
		JsPersistent callback;
	};

	PersistentData* data;
	bool logError;
	
	if (callback.getType() == JsType::Function)
	{
		data = _new PersistentData;
		data->callback = callback;
		logError = false;
	}
	else
	{
		data = nullptr;
		logError = callback != false;
	}

	sql->m_thread.post([sql, pump = (Keep<EventPump>)pump, data, query = (AText)(Utf16ToUtf8)text, logError]{
		sql->m_res.close();
		sql->m_res = nullptr;

		try
		{
			for (;;)
			{
				try
				{
					sql->m_sql->query(query);
					break;
				}
				catch (ThrowRetry&)
				{
					sql->m_sql->connect();
				}
			}
			sql->m_res = sql->m_sql->useResult();
			int fieldCount = sql->m_sql->fieldCount();
			sql->m_fieldCount = fieldCount;
			if (data == nullptr) return;
			pump->post([sql, data, fieldCount](){
				if (!isContextExisted())
				{
					delete data;
					return;
				}
				JsValue callback = data->callback;
				delete data;
				try
				{
					callback(nullptr, fieldCount);
				}
				catch (JsException & err)
				{
					g_native->fireError(err.getValue());
				}
			});
			return;
		}
		catch (SqlException&)
		{
			if (logError)
			{
				Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
				console.logA(TSZ() << "MariaDB Error " << sql->m_sql->getErrorNumber() << ": " << sql->m_sql->getErrorMessage() << '\n');
			}
		}
		catch (ThrowRetry&)
		{
			Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			console.logA("MariaDB disconnected?\n");
		}
		if (data == nullptr) return;

		pump->post([
			message = (AText16)(Utf8ToUtf16)(Text)sql->m_sql->getErrorMessage(), data]{
			if (!isContextExisted())
			{
				delete data;
				return;
			}
			JsValue callback = data->callback;
			delete data;
			try{
				callback(message);
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
			});
		});
}
void MariaDB::fetch(kr::JsValue callback) throws(kr::JsException)
{
	MariaDBInternal* sql = m_sql;
	if (sql == nullptr) throw JsException(u"DB already closed");
	sql->fetch(callback);
}
void MariaDB::closeResult() throws(kr::JsException)
{
	MariaDBInternal* sql = m_sql;
	if (sql == nullptr) throw JsException(u"DB already closed");
	sql->m_thread.post([sql] {
		sql->m_res.close();
		sql->m_res = nullptr;
		});
}
MariaDBStatement* MariaDB::createStatement(Text16 text) noexcept
{
	return nullptr;
}

void MariaDB::initMethods(JsClassT<MariaDB>* cls) noexcept
{
	cls->setMethod(u"close", &MariaDB::close);
	cls->setMethod(u"autocommit", &MariaDB::autocommit);
	cls->setMethod(u"rollback", &MariaDB::rollback);
	cls->setMethod(u"commit", &MariaDB::commit);
	cls->setMethod(u"query", &MariaDB::query);
	cls->setMethod(u"fetch", &MariaDB::fetch);
	cls->setMethod(u"close", &MariaDB::close);
	cls->setMethod(u"closeResult", &MariaDB::closeResult);
}
void MariaDB::clearMethods() noexcept
{
	reset();
}
void MariaDB::reset() noexcept
{
	for (MariaDB& db : s_conns)
	{
		db.m_sql->close();
		db.m_sql = nullptr;
	}
	s_conns.detachAll();
	while (s_db_ref != 0)
	{
		s_db_removed->wait();
	}
}
