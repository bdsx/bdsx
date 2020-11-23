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
#include "watcher.h"
#include "mariadb.h"
#include "webserver.h"
#include "encoding.h"
#include "nodecall.h"

#include <KR3/util/process.h>
#include <KR3/util/StackWalker.h>
#include <KR3/util/envvar.h>
#include <KR3/util/pdb.h>
#include <KR3/win/windows.h>
#include <KR3/data/crypt.h>
#include <KR3/http/fetch.h>
#include <KR3/mt/criticalsection.h>
#include <KRWin/handle.h>

#include <conio.h>

using namespace kr;

Manual<Native> g_native;
SingleInstanceLimiter g_singleInstanceLimiter;
EventPump* g_mainPump;

namespace
{
	// NetFilter
	Set<SOCKET> s_binds;
	CriticalSection s_csBinds;
	Map<Ipv4Address, time_t> s_ipfilter;
	RWLock s_ipfilterLock;
	uint64_t s_trafficLimit = (uint64_t)-1;
	int s_trafficLimitPeriod = 0;
}

class TrafficLogger
{
	friend NetFilter;

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

	uint64_t addTraffic(Ipv4Address ip, uint64_t value) noexcept
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
						io::FOStream<char> file = File::openWrite(m_logPath.data());
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
						console.logA("traffic write failed\n");
					}
				}
				});
		}
		auto res = m_current.insert({ ip, uint64_t() });
		if (res.second)
		{
			return res.first->second = value;
		}
		return res.first->second += value;
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

SingleInstanceLimiter::SingleInstanceLimiter() noexcept
{
	m_mutex = nullptr;
}
SingleInstanceLimiter::~SingleInstanceLimiter() noexcept
{
	release();
}
void SingleInstanceLimiter::release() noexcept
{
	if (m_mutex == nullptr) return;
	ReleaseSemaphore(m_mutex, 1, nullptr);
	m_mutex = nullptr;
}
void SingleInstanceLimiter::create(pcstr16 name) noexcept
{
	m_mutex = CreateSemaphoreW(nullptr, 1, 1, wide(name));
	int err = GetLastError();
	if (ERROR_ALREADY_EXISTS == err)
	{
		console.log(TSZ16() << u"[BDSX] (id=" << (Text16)name << u") is Already executing\n");
		console.logA("[BDSX] Wait the process terminating...\n");
		WaitForSingleObject(m_mutex, INFINITE);
		console.logA("[BDSX] Previous process terminated\n");
	}
	else
	{
		WaitForSingleObject(m_mutex, INFINITE);
	}
}

void NetFilter::addTraffic(Ipv4Address ip, uint64_t value) noexcept
{
	TrafficLogger::s_trafficLock.enterWrite();
	TrafficLogger * logger = TrafficLogger::s_current;
	if (logger)
	{
		value = logger->addTraffic(ip, value);
	}
	TrafficLogger::s_trafficLock.leaveWrite();

	if (value >= s_trafficLimit)
	{
		if (addFilter(ip, s_trafficLimitPeriod == 0 ? 0 : time(nullptr) + s_trafficLimitPeriod))
		{
			console.logA(TSZ() << "traffic overed: " << ip << '\n');
		}
	}
}
void NetFilter::addBindList(SOCKET socket) noexcept
{
	CsLock _lock = s_csBinds;
	s_binds.insert(socket);
}
void NetFilter::removeBindList(SOCKET socket) noexcept
{
	CsLock _lock = s_csBinds;
	s_binds.erase(socket);
}

bool NetFilter::isFilted(Ipv4Address ip) noexcept
{
	s_ipfilterLock.enterRead();
	auto iter = s_ipfilter.find(ip);
	bool finded = (iter != s_ipfilter.end());
	time_t endtime;
	if (finded)
	{
		endtime = iter->second;
	}
	s_ipfilterLock.leaveRead();
	return finded && (endtime == 0 || endtime > time(nullptr));
}
bool NetFilter::addFilter(kr::Ipv4Address ip, time_t endTime) noexcept
{
	s_ipfilterLock.enterWrite();
	auto res = s_ipfilter.insert({ ip, endTime });
	s_ipfilterLock.leaveWrite();
	return res.second;
}
bool NetFilter::removeFilter(kr::Ipv4Address ip) noexcept
{
	s_ipfilterLock.enterWrite();
	bool erased = s_ipfilter.erase(ip) != 0;
	s_ipfilterLock.leaveWrite();
	return erased;
}
void NetFilter::clearFilter() noexcept
{
	s_ipfilterLock.enterWrite();
	s_ipfilter.clear();
	s_ipfilterLock.leaveWrite();
}
void NetFilter::setTrafficLimit(uint64_t bytes) noexcept
{
	s_trafficLimit = bytes;
}
void NetFilter::setTrafficLimitPeriod(int seconds) noexcept
{
	s_trafficLimitPeriod = seconds;
}

void cleanAllResource() noexcept
{
	try
	{
		destroyJsContext();
		JsRuntime::dispose();
	}
	catch (...)
	{
	}
	try
	{
		CsLock _lock = s_csBinds;
		for (SOCKET sock : s_binds)
		{
			closesocket(sock);
		}
		s_binds.clear();
	}
	catch (...)
	{
	}
	g_singleInstanceLimiter.release();
	StackAllocator::getInstance()->terminate();
}
void fork() throws(JsException)
{
	TText16 cwd = currentDirectory;
	cwd << nullterm;

	TText16 cmdline;
	cmdline << (Text16)unwide(GetCommandLineW());
	cmdline << nullterm;

	auto [process, thread] = win::Process::execute(cmdline.data(), cwd.data(),
		win::ProcessOptions().console(true));
	if (process == nullptr)
	{
		throw JsException(u"Re-run bedrock_server.exe failed");
	}
	delete process;
	thread->detach();
}
JsValue createServerControlModule() noexcept
{
	JsValue winmodule = JsNewObject;
	winmodule.setMethod(u"stop", [] {
		EventPump::getInstance()->post([] { 
			throw QuitException(0);
			});
		});
	winmodule.setMethod(u"reset", []() { g_native->reset(); });
	winmodule.setMethod(u"debug", [] {
		requestDebugger();
		debug();
		});
	winmodule.setMethod(u"restart", [](bool force){
		if (force)
		{
			fork();
			cleanAllResource();
			terminate(-1);
		}
		EventPump::getInstance()->post([] {
			fork();
			throw QuitException(0);
			});
		});
	return winmodule;
}

Native::Native() noexcept
{
	_hook();
	_createNativeModule();
}
Native::~Native() noexcept
{
	TrafficLogger::clearWait();
}
bool Native::fireError(JsRawData err) noexcept
{
	JsValue onError = m_onError;
	if (!onError.isEmpty())
	{
		if (onError(err) == false)
		{
			return true;
		}
	}

	Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
	
	JsValue stack = err.getByProperty(u"stack");
	if (stack == undefined) stack = err.toString();
	g_call->error(stack.cast<Text16>());
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
	m_props.clear();
	m_onError = nullptr;
	m_onCommand = nullptr;
	m_onRuntimeError = nullptr;
	s_ipfilter.clear();

	_createNativeModule();
}

void Native::_hook() noexcept
{
	g_mcf.hookOnCommand([](MinecraftCommands* commands, MCRESULT* res, SharedPtr<CommandContext>* ctxptr, bool)->intptr_t {
		if (g_native->m_onCommand.isEmpty()) return 0;

		JsScope _scope;
		JsValue oncmd = g_native->m_onCommand;

		CommandContext* ctx = ctxptr->pointer();
		String name = ctx->origin->getName();
		JsValue jsres = oncmd(TText16() << utf8ToUtf16(ctx->command.text()), name.text());
		switch (jsres.getType())
		{
		case JsType::Integer:
		case JsType::Float:
			res->result = jsres.cast<int>();
			return 1;
		}
		return 0;
		});
	// get_thread_local_invalid_parameter_handler

	g_mcf.hookOnRuntimeError([](EXCEPTION_POINTERS* ptr) {
		if (ptr->ExceptionRecord->ExceptionCode == EXCEPTION_BREAKPOINT) return;

		if (!isContextExisted())
		{
			ondebug(requestDebugger());
			debug();
			g_call->error((Text16)u"[ Runtime Error ]\n");

			StackWriter writer(ptr->ContextRecord);
			AText16 nativestack;
			nativestack << writer;
			g_call->error((Text16)nativestack);

			terminate(-1);
			return;
		}
		uint32_t threadId = GetCurrentThreadId();
		if (threadId != getContextThreadId())
		{
			g_mainPump->post([ptr, threadId] {
				g_native->onRuntimeError(ptr);
				});
			Sleep(INFINITE);
		}
		else
		{
			g_native->onRuntimeError(ptr);
		}
		});

	nethook.hook();
}
void Native::_createNativeModule() noexcept
{
	m_props.insert(u"serverControl", createServerControlModule());
	m_props.insert(u"console", console.createModule());
	m_props.insert(u"loadPdb", JsFunction::makeT([](Text16 path){
		console.logA("PdbReader: Load Symbols...\n");
		try
		{
			PdbReader reader;
			console.logA("PdbReader: processing... \n");

			struct Local
			{
				JsValue out = JsNewObject;
				timepoint now = timepoint::now();
				size_t totalcount = 0;
			} local;

			reader.getAll([&local](Text name, autoptr address) {
				++local.totalcount;

				timepoint newnow = timepoint::now();
				if (newnow - local.now > 200_ms)
				{
					local.now = newnow;
					console.logA(TSZ() << '(' << local.totalcount << ")\n");
				}

				NativePointer* ptr = NativePointer::newInstance();
				ptr->setAddressRaw(address);
				local.out.set(name, ptr);
				return true;
				});

			console.logA("done\n");
			return local.out;
		}
		catch (FunctionError& err)
		{
			TSZ tsz;
			tsz << err.getFunctionName() << ": failed, err=";
			err.getMessageTo(&tsz);
			tsz << '\n';
			console.logAnsi(tsz);
			throw JsException(u"Internal error");
		}
		}));

	m_props.insert(u"std$_Allocate$16", JsFunction::makeT([](int size) {
		NativePointer* ptr = NativePointer::newInstance();
		ptr->setAddressRaw(g_mcf.std$_Allocate$_alloc16_(size));
		return ptr;
		}));
	m_props.insert(u"malloc", JsFunction::makeT([](int size) {
		NativePointer* ptr = NativePointer::newInstance();
		ptr->setAddressRaw(g_mcf.malloc(size));
		return ptr;
		}));
	m_props.insert(u"free", JsFunction::makeT([](StaticPointer* ptr) {
		if (ptr == nullptr) return;
		g_mcf.free(ptr->getAddressRaw());
		}));
	m_props.insert(u"setOnCommandListener", JsFunction::makeT([](JsValue listener) {
		storeListener(&g_native->m_onCommand, listener);
		}));
	m_props.insert(u"setOnErrorListener", JsFunction::makeT([](JsValue listener) {
		storeListener(&g_native->m_onError, listener);
		}));
	m_props.insert(u"setOnRuntimeErrorListener", JsFunction::makeT([](JsValue listener) {
		storeListener(&g_native->m_onRuntimeError, listener);
		}));
	m_props.insert(u"execSync", JsFunction::makeT([](Text16 path, JsValue curdir) {
		return (AText)shell(path, curdir != undefined ? curdir.cast<Text16>().data() : nullptr);
		}));
	m_props.insert(u"exec", JsFunction::makeT([](Text16 path, JsValue curdir, JsValue cb) {
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
			TText res = shell(path, curdir == nullptr ? nullptr : curdir.data());
			AText16 out;
			out << (AnsiToUtf16)res;
			return out;
		})->then([cb = (JsPersistent)cb](Text16 data){
			((JsValue)cb)(data);
		});
		}));
	m_props.insert(u"spawn", JsFunction::makeT([](Text16 path, Text16 param, JsValue curdir) {
		Process proc;
		proc.exec(path.data(), TSZ16() << param, curdir != undefined ? curdir.cast<Text16>().data() : nullptr);
		}));
	m_props.insert(u"wget", JsFunction::makeT([](Text16 url, JsValue callback){
		if (callback.getType() != JsType::Function) throw JsException(u"argument must be function");

		fetchAsTextFromWeb(TSZ() << toUtf8(url))->then([callback = (JsPersistent)callback](AText& text) {
			JsScope _scope;
			TText16 out = (Utf8ToUtf16)text;
			text = nullptr;
			JsValue cb = callback;
			cb(out);
			});
		}));
	m_props.insert(u"encode", JsFunction::makeT(ExEncoding::jsencode));
	m_props.insert(u"decode", JsFunction::makeT(ExEncoding::jsdecode));
	m_props.insert(u"NativeModule", NativeModule::classObject);
	m_props.insert(u"Primitive", Primitive::classObject);
	m_props.insert(u"Actor", NativeActor::classObject);
	m_props.insert(u"MariaDB", MariaDB::classObject);
	m_props.insert(u"fs", createFsModule());
	m_props.insert(u"StaticPointer", StaticPointer::classObject);
	m_props.insert(u"NativePointer", NativePointer::classObject);
	m_props.insert(u"NetworkIdentifier", JsNetworkIdentifier::classObject);
	m_props.insert(u"SharedPointer", SharedPointer::classObject);
	m_props.insert(u"nethook", g_native->nethook.create());
	m_props.insert(u"WebServer", WebServer::classObject);
	m_props.insert(u"Response", Request::classObject);
	m_props.insert(u"getHashFromCxxString", JsFunction::makeT([](StaticPointer* ptr) {
		String* str = (String*)ptr->getAddressRaw();
		NativePointer * hash = NativePointer::newInstance();
		hash->setAddressRaw((void*)HashedString::getHash(str->text()));
		return hash;
		}));

	{
		JsValue ipfilter = JsNewObject;
		ipfilter.setMethod(u"add", [](Text16 ipport, int period) {
			Text16 iptext = ipport.readwith_e('|');
			if (iptext.empty()) return;
			NetFilter::addFilter(Ipv4Address(TSZ() << toNone(iptext)), period == 0 ? 0 : time(nullptr)+period);
			});
		ipfilter.setMethod(u"remove", [](Text16 ipport) {
			Text16 iptext = ipport.readwith_e('|');
			if (iptext.empty()) return false;
			return NetFilter::removeFilter(Ipv4Address(TSZ() << toNone(iptext)));
			});
		ipfilter.setMethod(u"clear", []() {
			NetFilter::clearFilter();
			});
		ipfilter.setMethod(u"has", [](Text16 ipport) {
			Text16 iptext = ipport.readwith_e('|');
			if (iptext.empty()) return false;
			return NetFilter::isFilted(Ipv4Address(TSZ() << toNone(iptext)));
			});
		ipfilter.setMethod(u"setTrafficLimit", [](double bytes) {
			return NetFilter::setTrafficLimit((uint64_t)bytes);
			});
		ipfilter.setMethod(u"setTrafficLimitPeriod", [](int seconds) {
			return NetFilter::setTrafficLimitPeriod(seconds);
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
		m_props.insert(u"ipfilter", ipfilter);
	}
}
void Native::onRuntimeError(EXCEPTION_POINTERS* ptr) noexcept
{
	ondebug(requestDebugger());
	debug();
	{
		JsScope _scope;
		Text16 stack;
		AText16 nativestack;
		try
		{
			JsRuntime::run(u"[error]", u"throw Error('Runtime Error')");
			unreachable();
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

		uint32_t lastsender = NetHookModule::s_lastSender;

		if (!m_onRuntimeError.isEmpty())
		{
			JsValue onError = m_onRuntimeError;
			try
			{
				if (onError(stack, nativestack, TText16() << (Ipv4Address&)lastsender) == false)
				{
					cleanAllResource();
					terminate(-1);
					return;
				}
			}
			catch (JsException & err)
			{
				JsValue stack = err.getValue().get(u"stack").toString();
				Text16 errstr = stack.as<Text16>();

				Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
				g_call->log((Text16)u"[onRuntimeError callback has error]");
				g_call->log((Text16)errstr);
			}
		}
		{
			Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			g_call->log((Text16)u"[ Runtime Error ]\n");
			g_call->log((Text16)(TSZ16() << u"Last Sender IP: " << (Ipv4Address&)lastsender));
			g_call->log((Text16)u"[ JS Stack ]");
			g_call->log(stack);
			g_call->log((Text16)u"[ Native Stack ]\n");
			g_call->log((Text16)nativestack);
		}
	}

	cleanAllResource();
	_getch();
	terminate(-1);
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

#include "nodegate.h"

void nodegate::initNativeModule(void* exports_raw)
{
	kr::JsScope _scope;
	kr::JsValue exports = (JsRawData)(JsValueRef)exports_raw;
	for (auto& pair : g_native->m_props)
	{
		exports.set((JsPropertyId)((Text16)pair.first).data(), (JsValue)pair.second);
	}
}