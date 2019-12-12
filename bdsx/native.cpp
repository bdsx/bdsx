#include "native.h"
#include "console.h"
#include "fs.h"
#include "nativepointer.h"
#include "nethook.h"
#include "reverse.h"
#include "mcf.h"
#include "jsctx.h"
#include "networkidentifier.h"
#include "nativemodule.h"
#include "nativetype.h"
#include "sharedptr.h"
#include "require.h"
#include "watcher.h"
#include "mariadb.h"

#include <KR3/util/process.h>
#include <KR3/util/StackWalker.h>
#include <KR3/util/envvar.h>
#include <KR3/wl/windows.h>
#include <KR3/data/crypt.h>
#include <KR3/http/fetch.h>
#include <KR3/mt/criticalsection.h>
#include <KRWin/handle.h>

#include "pdb.h"
#include <conio.h>

using namespace kr;

Manual<Native> g_native;
namespace
{
	Set<SOCKET> s_binds;
	CriticalSection s_csBinds;
	Set<Ipv4Address> s_ipfilter;
	RWLock s_ipfilterLock;
}

class TrafficLogger
{
	friend void addTraffic(Ipv4Address ip, uint64_t value) noexcept;

private:
	static inline RWLock s_trafficLock;
	static inline atomic<size_t> s_trafficCount = 0;
	static inline Cond s_trafficDeleting;
	static inline TrafficLogger* s_current = nullptr;

	AText16 m_logPath;
	timepoint m_trafficTime = timepoint::now();
	Map<Ipv4Address, uint64_t> m_back;
	Map<Ipv4Address, uint64_t> m_current;
	atomic<size_t> m_ref;

	~TrafficLogger() noexcept
	{
	}

public:
	TrafficLogger(AText16 path) noexcept
		:m_logPath(move(path)), m_ref(1)
	{
		m_logPath.c_str();
		s_trafficCount++;
	}

	void addRef() noexcept
	{
		m_ref++;
	}

	void release() noexcept
	{
		if (m_ref-- == 1)
		{
			delete this;
			s_trafficCount--;
			s_trafficDeleting.set();
		}
	}

	void addTraffic(Ipv4Address ip, uint64_t value) noexcept
	{
		timepoint now = timepoint::now();
		if (now - m_trafficTime >= 1_s)
		{
			m_trafficTime = now;
			Map<Ipv4Address, uint64_t> back = move(m_back);
			m_back = move(m_current);
			m_current = move(back);
			m_current.clear();
			m_ref++;
			threadingVoid([this] {
				for (;;)
				{
					try
					{
						io::FOStream<char> file = File::openAndWrite(m_logPath.data());
						file.base()->toEnd();

						{
							s_trafficLock.enterRead();
							finally {
								s_trafficLock.leaveRead();
							};

							for (auto [key, value] : m_back)
							{
								file << key << ": " << value << "\r\n";
							}
							file << "\r\n";
						}

						release();
						s_trafficDeleting.set();
						return;
					}
					catch (...)
					{
						cerr << "traffic write failed" << endl;
						Sleep(500);
					}
				}
				});
		}
		auto res = m_current.insert({ ip, uint64_t() });
		if (res.second)
		{
			res.first->second = value;
			return;
		}
		res.first->second += value;
	}

	static void newInstance(AText16 path) noexcept
	{
		TrafficLogger* trafficLogger = _new TrafficLogger(move(path));
		s_trafficLock.enterWrite();
		TrafficLogger* old = s_current;
		s_current = trafficLogger;
		s_trafficLock.leaveWrite();

		if (old) old->release();
	}
	static void clear() noexcept
	{
		s_trafficLock.enterWrite();
		TrafficLogger* old = s_current;
		s_current = nullptr;
		s_trafficLock.leaveWrite();
		if (old) old->release();
	}
	static void clearWait() noexcept
	{
		clear();
		while (s_trafficCount != 0)
		{
			s_trafficDeleting.wait();
		}
	}
};

void addTraffic(Ipv4Address ip, uint64_t value) noexcept
{
	TrafficLogger::s_trafficLock.enterWrite();
	TrafficLogger * logger = TrafficLogger::s_current;
	if (logger) logger->addTraffic(ip, value);
	TrafficLogger::s_trafficLock.leaveWrite();
}
void addBindList(SOCKET socket) noexcept
{
	CsLock _lock = s_csBinds;
	s_binds.insert(socket);
}
void removeBindList(SOCKET socket) noexcept
{
	CsLock _lock = s_csBinds;
	s_binds.erase(socket);
}

void cleanAllResource() noexcept
{
	{
		CsLock _lock = s_csBinds;
		for (SOCKET sock : s_binds)
		{
			closesocket(sock);
		}
		s_binds.clear();
	}
	destroyJsContext();
	JsContext::_cleanForce();
	JsRuntime::dispose();
	StackAllocator::getInstance()->terminate();
}
void fork() throws(JsException)
{
	TText16 cwd = currentDirectory;
	cwd << nullterm;

	TText16 bdsxPath = ModuleName(u"bdsx.dll");

	TText16 cmdline;
	cmdline << u'\"';
	cmdline << bdsxPath.cut(bdsxPath.find_r('\\') + 1);
	cmdline << u"injector.exe\" \"";
	cmdline << bdsxPath;
	cmdline << u"\" ";
	cmdline << (Text16)unwide(GetCommandLineW());
	cmdline << nullterm;

	auto [process, thread] = win::Process::execute(cmdline.data(), cwd.data(),
		win::ProcessOptions().console(true));
	if (process == nullptr)
	{
		throw JsException(TSZ16() << u"Cannot run injector.exe");
	}
	delete process;
	thread->detach();
}
JsValue createServerControlModule() noexcept
{
	JsValue module = JsNewObject;
	module.setMethod(u"stop", [] { 
		EventPump::getInstance()->post([] { throw QuitException(0); });
		});
	module.setMethod(u"reset", []() { g_native->reset(); });
	module.setMethod(u"debug", [] {
		requestDebugger();
		debug();
		});
	module.setMethod(u"fork", fork);
	module.setMethod(u"restart", [] {
		EventPump::getInstance()->post([] {
			fork();
			throw QuitException(0); 
			});
		});
	return module;
}

Native::Native() noexcept
{
	_hook();
	_createNativeModule();
}
Native::~Native() noexcept
{
	TrafficLogger::clearWait();
	Require::clear();
}
JsValue Native::getModule() noexcept
{
	return m_module;
}
bool Native::isFilted(Ipv4Address ip) noexcept
{
	s_ipfilterLock.enterRead();
	bool res = s_ipfilter.has(ip);
	s_ipfilterLock.leaveRead();
	return res;
}
void Native::addFilter(kr::Ipv4Address ip) noexcept
{
	s_ipfilterLock.enterWrite();
	s_ipfilter.insert(ip);
	s_ipfilterLock.leaveWrite();
}
void Native::removeFilter(kr::Ipv4Address ip) noexcept
{
	s_ipfilterLock.enterWrite();
	s_ipfilter.erase(ip);
	s_ipfilterLock.leaveWrite();
}
bool Native::fireError(const JsRawData& err) noexcept
{
	JsValue onError = m_onError;
	if (!onError.isEmpty())
	{
		if (onError(err) == false)
		{
			return true;
		}
	}

	ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
	
	JsValue stack = err.getByProperty(u"stack");
	if (stack == undefined) stack = err.toString();
	cerr << toAnsi(stack.cast<Text16>()) << endl;
	return false;
}
void Native::reset() noexcept
{
	nethook.reset();
	NativeActor::reset();
	JsNetworkIdentifier::reset();
	Watcher::reset();
	MariaDB::reset();

	TrafficLogger::clearWait();
	m_module = nullptr;
	m_onError = nullptr;
	m_onCommand = nullptr;
	m_onRuntimeError = nullptr;
	s_ipfilter.clear();

	Require::clear();
	_createNativeModule();
	Require::start();
}

void Native::_hook() noexcept
{
	g_mcf.hookOnCommand([](MCRESULT* res, CommandContext* ctx)->intptr_t {
		if (g_native->m_onCommand.isEmpty()) return 1;
		JsScope _scope;
		JsValue oncmd = g_native->m_onCommand;

		String name = ctx->origin->getName();
		JsValue jsres = oncmd(ctx->command.text(), name.text());
		switch (jsres.getType())
		{
		case JsType::Integer:
		case JsType::Float:
			res->result = jsres.cast<int>();
			return 0;
		}
		return 1;
		});
	g_mcf.hookOnRuntimeError([](void* google_breakpad$ExceptionHandler, EXCEPTION_POINTERS* ptr) {
		if (!isContextExisted())
		{
			cerr << "[ Native Stack ]" << endl;

			StackWriter writer(ptr->ContextRecord);
			AText16 nativestack;
			nativestack << writer;
			cerr << toAnsi(nativestack) << endl;

			cleanAllResource();
			_getch();
			terminate(-1);
			return;
		}
		{
			JsScope _scope;
			Text16 stack;
			AText16 nativestack;
			try
			{
				JsRuntime::run(u"[error]", u"throw Error('Runtime Error')");
			}
			catch (JsException & err)
			{
				stack = err.getValue().get(u"stack").toString().as<Text16>();
				stack.readwith_e('\n');
				stack.readwith_e('\n');
			}

			{
				StackWriter writer(ptr->ContextRecord);
				nativestack << writer;
			}

			JsValue lastsender = g_native->nethook.lastSender;

			if (!g_native->m_onRuntimeError.isEmpty())
			{
				JsValue onError = g_native->m_onRuntimeError;
				if (onError(stack, nativestack, lastsender) == false) return;
			}
			{
				ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
				cerr << "[ Runtime Error ]" << endl;
			}
			JsNetworkIdentifier* lastni = lastsender.getNativeObject<JsNetworkIdentifier>();
			if (lastni)
			{
				cerr << "Last Sender IP: ";
				cerr << lastni->identifier.getAddress().text();
			}
			cerr << endl;
			cerr << "[ JS Stack ]" << endl;
			cerr << toAnsi(stack) << endl;
			cerr << "[ Native Stack ]" << endl;
			cerr << toAnsi(nativestack) << endl;
		}

		cleanAllResource();
		_getch();
		terminate(-1);
		});

	nethook.hook();
}
void Native::_createNativeModule() noexcept
{
	JsValue native = JsNewObject;
	native.set(u"serverControl", createServerControlModule());
	native.set(u"console", createConsoleModule());

	native.setMethod(u"loadPdb", [](Text16 path){
		PdbReader reader;
		reader.showInfo();
		cout << "PdbReader: processing... ";

		struct Local
		{
			JsValue out = JsNewObject;
			timepoint now = timepoint::now();
			size_t chrcount = 0;
			size_t totalcount = 0;
		} local;

		reader.getAll([&local](Text name, autoptr address) {
			++local.totalcount;

			timepoint newnow = timepoint::now();
			if (newnow - local.now > 200_ms)
			{
				local.now = newnow;
				for (size_t i = 0; i < local.chrcount; i++) cout << '\b';
				TText count;
				count << local.totalcount;
				cout << '(';
				cout << count;
				cout << ')';
				local.chrcount = count.size() + 2;
			}

			NativePointer * ptr = NativePointer::newInstance();
			ptr->setAddressRaw(address);
			local.out.set(name, ptr);
			return true;
			});

		for (int i = 0; i < local.chrcount; i++) cout << '\b';
		cout << "done   " << endl;
		return local.out;
		});

	native.setMethod(u"std$_Allocate$16", [](int size) {
		NativePointer* ptr = NativePointer::newInstance();
		ptr->setAddressRaw(g_mcf.std$_Allocate$16(size));
		return ptr;
		});
	native.setMethod(u"malloc", [](int size) {
		NativePointer* ptr = NativePointer::newInstance();
		ptr->setAddressRaw(g_mcf.malloc(size));
		g_mcf.free(ptr->getAddressRaw());
		});
	native.setMethod(u"free", [](StaticPointer* ptr) {
		if (ptr == nullptr) return;
		g_mcf.free(ptr->getAddressRaw());
		});
	native.setMethod(u"setOnCommandListener", [](JsValue listener) {
		storeListener(&g_native->m_onCommand, listener);
		});
	native.setMethod(u"setOnErrorListener", [](JsValue listener) {
		storeListener(&g_native->m_onError, listener);
		});
	native.setMethod(u"setOnRuntimeErrorListener", [](JsValue listener) {
		storeListener(&g_native->m_onRuntimeError, listener);
		});
	native.setMethod(u"execSync", [](Text16 path, JsValue curdir) {
		return (AText)shell(path, curdir != undefined ? curdir.cast<Text16>().data() : nullptr);
		});
	native.setMethod(u"exec", [](Text16 path, JsValue curdir, JsValue cb) {
		if (cb == undefined)
		{
			Process process;
			process.shell(path, curdir == undefined ? nullptr : curdir.cast<Text16>().data());
			return;
		}
		if (cb.getType() != JsType::Function) throw JsException(u"argument must be function");
		
		AText16 curdir_a;
		if (curdir != undefined)
		{
			curdir_a = curdir.cast<Text16>();
			curdir_a.c_str();
		}
		
		AText16 path_a = AText16::concat(u"/c ", path);

		threading([path = move(path_a), curdir = move(curdir_a)]{
			Process process;
			process.shell(path, curdir == nullptr ? nullptr : curdir.data());
			process.wait();
			TText res = StreamBuffer<char, Process>(move(process));
			AText16 out;
			out << (AnsiToUtf16)res;
			return out;
			})->then([cb = (JsPersistent)cb](Text16 data){
			((JsValue)cb)(data);
			});
		});
	native.setMethod(u"spawn", [](Text16 path, Text16 param, JsValue curdir) {
		Process proc;
		proc.exec(path.data(), TSZ16() << param, curdir != undefined ? curdir.cast<Text16>().data() : nullptr);
		});
	native.setMethod(u"wget", [](Text16 url, JsValue callback){
		if (callback.getType() != JsType::Function) throw JsException(u"argument must be function");

		fetchAsTextFromWeb(TSZ() << toUtf8(url))->then([callback = (JsPersistent)callback](AText& text) {
			JsScope _scope;
			TText16 out = (Utf8ToUtf16)text;
			text = nullptr;
			JsValue cb = callback;
			cb(out);
			});
		});
	native.set(u"NativeModule", NativeModule::classObject);
	native.set(u"Primitive", Primitive::classObject);
	native.set(u"Actor", NativeActor::classObject);
	native.set(u"MariaDB", MariaDB::classObject);
	native.set(u"fs", createFsModule());
	native.set(u"StaticPointer", StaticPointer::classObject);
	native.set(u"NativePointer", NativePointer::classObject);
	native.set(u"NetworkIdentifier", JsNetworkIdentifier::classObject);
	native.set(u"SharedPointer", SharedPointer::classObject);
	native.set(u"nethook", g_native->nethook.create());
	native.setMethod(u"getHashFromCxxString", [](StaticPointer* ptr) {
		String* str = (String*)ptr->getAddressRaw();
		NativePointer * hash = NativePointer::newInstance();
		hash->setAddressRaw((void*)HashedString::getHash(str->text()));
		return hash;
		});

	{
		JsValue ipfilter = JsNewObject;
		ipfilter.setMethod(u"add", [](Text16 ipport) {
			Text16 iptext = ipport.readwith_e('|');
			if (iptext.empty()) return;
			g_native->addFilter(Ipv4Address(TSZ() << toNone(iptext)));
			});
		ipfilter.setMethod(u"remove", [](Text16 ipport) {
			Text16 iptext = ipport.readwith_e('|');
			if (iptext.empty()) return;
			g_native->removeFilter(Ipv4Address(TSZ() << toNone(iptext)));
			});
		ipfilter.setMethod(u"logTraffic", [](JsValue path){
			if (path.cast<bool>())
			{
				TrafficLogger::newInstance(path.cast<AText16>());
			}
			else
			{
				TrafficLogger::clear();
			}
			});
		native.set(u"ipfilter", ipfilter);
	}
	m_module = native;
}

void storeListener(JsPersistent* persistent, const JsValue& listener) throws(JsException)
{
	switch (listener.getType())
	{
	case JsType::Null:
		*persistent = nullptr;
		break;
	case JsType::Function:
		*persistent = listener;
		break;
	default:
		throw JsException(u"argument must be function or null");
	}
}
