#pragma once

#include <KR3/js/js.h>
#include <KR3/data/linkedlist.h>
#include <KR3/mt/thread.h>
#include <KR3/msg/pool.h>
#include <KR3/msg/pump.h>
#include <KRMySQL/db.h>

class MariaDB;
class MariaDBInternal;

class MariaDBStatement :public kr::JsObjectT<MariaDBStatement>
{
	friend MariaDB;
public:
	static constexpr const char16_t className[] = u"MariaDBStatement";
	static constexpr bool global = false;

	MariaDBStatement(const kr::JsArguments& args) noexcept;
	static void initMethods(kr::JsClassT<MariaDBStatement>* cls) noexcept;
};

class MariaDB:public kr::JsObjectT<MariaDB>, public kr::Node<MariaDB, true>
{
public:
	static constexpr const char16_t className[] = u"MariaDB";
	static constexpr bool global = false;

	MariaDB(const kr::JsArguments& args) throws(kr::JsException);
	~MariaDB() noexcept;
	void close() noexcept;
	void autocommit(bool enabled) noexcept;
	void rollback() noexcept;
	void commit() noexcept;
	void query(kr::Text16 text, kr::JsValue callback) throws(kr::JsException);
	void fetch(kr::JsValue callback) throws(kr::JsException);
	void closeResult() throws(kr::JsException);
	MariaDBStatement* createStatement(kr::Text16 text) noexcept;
	static void initMethods(kr::JsClassT<MariaDB>* cls) noexcept;
	static void clearMethods() noexcept;
	static void reset() noexcept;
private:
	MariaDBInternal* m_sql;
};
