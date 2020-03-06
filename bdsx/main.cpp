

#include <KR3/main.h>
#include <KR3/initializer.h>
#include <KR3/js/js.h>
#include <KR3/fs/file.h>
#include <KR3/util/path.h>
#include <KR3/util/parameter.h>
#include <KR3/parser/jsonparser.h>
#include <KR3/data/map.h>
#include <KR3/data/set.h>
#include <KR3/io/selfbufferedstream.h>
#include <KR3/net/ipaddr.h>
#include <KR3/net/socket.h>
#include <KR3/win/windows.h>
#include <KR3/msg/pump.h>
#include <KRWin/handle.h>
#include <KRWin/hook.h>

// #include "ChakraDebugService.h"

 #define USE_EDGEMODE_JSRT
 #include <jsrt.h>

#include <WinSock2.h>

#include "jsctx.h"
#include "nativepointer.h"
#include "reverse.h"
#include "console.h"
#include "fs.h"
#include "nethook.h"
#include "mcf.h"
#include "require.h"
#include "native.h"
#include "gen/buildtime.h"

#pragma comment(lib, "chakrart.lib")

using namespace kr;

namespace
{
	//JsDebugService s_debug;
	//JsDebugProtocolHandler s_debugHandler;
	win::Module* s_module = win::Module::current();
	hook::IATHookerList s_iatChakra(s_module, "chakra.dll");
	hook::IATHookerList s_iatWS2_32(s_module, "WS2_32.dll");
	hook::IATHookerList s_iatUcrtbase(s_module, "api-ms-win-crt-heap-l1-1-0.dll");
	Map<Text, AText> s_uuidToPackPath;
	// Text16 s_properties = nullptr;
}

Initializer<Socket> __init;

void catchException() noexcept
{
	JsValueRef exception;
	if (JsGetAndClearException(&exception) == JsNoError)
	{
		JsScope scope;
		g_native->fireError((JsRawData)exception);
	}
}

int WSAAPI closesocketHook(SOCKET s) noexcept
{
	NetFilter::removeBindList(s);
	return closesocket(s);
}

// It cannot use, minecraft trys to open with several ports
int CALLBACK bindHook(
	SOCKET s,
	const sockaddr* name,
	int namelen
) noexcept
{
	int res = bind(s, name, namelen);
	if (res == 0) NetFilter::addBindList(s);
	return res;
}
int CALLBACK sendtoHook(
	SOCKET s, const char FAR* buf, int len, int flags, 
	const struct sockaddr FAR* to, int tolen)
{
	bool ctxexists = isContextExisted();
	Ipv4Address& ip = (Ipv4Address&)((sockaddr_in*)to)->sin_addr;
	if (ctxexists)
	{
		if (NetFilter::isFilted(ip))
		{
			WSASetLastError(WSAECONNREFUSED);
			return SOCKET_ERROR;
		}
	}
	int res = sendto(s, buf, len, flags, to, tolen);
	if (res == SOCKET_ERROR) return SOCKET_ERROR;
	if (ctxexists) NetFilter::addTraffic(ip, res);
	return res;
}

int CALLBACK WSACleanupHook() noexcept
{
	return 0;
}

int CALLBACK recvfromHook(
	SOCKET s, char* buf, int len, int flags,
	sockaddr* from, int* fromlen
) noexcept
{
	int res = recvfrom(s, buf, len, flags, from, fromlen);
	if (res == SOCKET_ERROR) return SOCKET_ERROR;
	uint32_t ip32 = ((sockaddr_in*)from)->sin_addr.s_addr;
	NetHookModule::s_lastSender = ip32;
	if (!isContextExisted()) return res;

	Ipv4Address& ip = (Ipv4Address&)ip32;
	NetFilter::addTraffic(ip, res);
	if (NetFilter::isFilted(ip))
	{
		*fromlen = 0;
		WSASetLastError(WSAECONNREFUSED);
		return SOCKET_ERROR;
	}
	return res;
}
JsErrorCode CALLBACK JsCreateRuntimeHook(
	JsRuntimeAttributes attributes,
	JsThreadServiceCallback threadService,
	JsRuntimeHandle* runtime) noexcept
{
	JsErrorCode err = JsCreateRuntime(attributes, threadService, runtime);
	if (err == JsNoError)
	{
		JsRuntime::setRuntime(*runtime);
		g_mainPump = EventPump::getInstance();

		g_mcf.hookOnUpdate([](Minecraft* mc){
			SEHCatcher _catcher;
			try
			{
				g_mcf.Minecraft$update(mc);
				JsScope scope;
				g_mainPump->processOnce();
			}
			catch (QuitException&)
			{
				g_mcf.stopServer();
			}
			catch (SEHException& e)
			{
				g_native->onRuntimeError(e.exception);
			}
			});

		JsonParser parser(File::open(u"valid_known_packs.json"));
		parser.array([&](size_t idx){
			AText uuid;
			AText path;
			parser.fields([&](JsonField&field){
				field("uuid", &uuid);
				field("path", &path);
			});
			if (path == nullptr) return;
			if (uuid == nullptr) return;

			s_uuidToPackPath[uuid] = move(path);
		});
		
		//JsDebugServiceCreate(&s_debug);
		//JsDebugProtocolHandlerCreate(*runtime, &s_debugHandler);
		//JsDebugServiceRegisterHandler(s_debug, "minecraft", s_debugHandler, false);
		//JsDebugServiceListen(s_debug, 9229);
		//JsDebugProtocolHandlerWaitForDebugger(s_debugHandler);
	}
	return err;
}
JsErrorCode CALLBACK JsDisposeRuntimeHook(JsRuntimeHandle runtime) noexcept
{
	destroyJsContext();
	return JsDisposeRuntime(runtime);
}
JsErrorCode CALLBACK JsCreateContextHook(JsRuntimeHandle runtime, JsContextRef* newContext) noexcept
{
	JsErrorCode err = JsCreateContext(runtime, newContext);
	if (err == JsNoError)
	{
		createJsContext(*newContext);
	}
	return err;
}
JsErrorCode CALLBACK JsRunScriptHook(
	const wchar_t* script,
	JsSourceContext sourceContext,
	const wchar_t* sourceUrl,
	JsValueRef* result) noexcept
{
	constexpr size_t UUID_LEN = 36;
	auto path = (Text16)unwide(sourceUrl);
	if (path.size() >= UUID_LEN)
	{
		TText uuid = TText::concat(toUtf8(path.cut(UUID_LEN)));
		auto iter = s_uuidToPackPath.find(uuid);
		if (iter != s_uuidToPackPath.end())
		{
			path.subarr_self(UUID_LEN);
			Text16 rpath = path.subarr(path.find_e(u'/'));
			pcstr16 remove_end = rpath.find_r(u'_');
			if (remove_end != nullptr) rpath.cut_self(remove_end);

			TText16 newpath = TText16::concat(utf8ToUtf16(iter->second), rpath, nullterm);
			JsErrorCode err = JsRunScript(script, sourceContext, wide(newpath.data()), result);
			if (err != JsNoError) catchException();
			return err;
		}
	}
	JsErrorCode err = JsRunScript(script, sourceContext, sourceUrl, result);
	if (err != JsNoError) catchException();
	return err;
}
JsErrorCode CALLBACK JsCallFunctionHook(
	JsValueRef function,
	JsValueRef* arguments,
	unsigned short argumentCount,
	JsValueRef* result) noexcept
{
	JsErrorCode err = JsCallFunction(function, arguments, argumentCount, result);
	if (err != JsNoError) catchException();
	return err;
}

BOOL WINAPI DllMain(
	_In_ HINSTANCE hinstDLL,
	_In_ DWORD     fdwReason,
	_In_ LPVOID    lpvReserved
)
{
	if (fdwReason == DLL_PROCESS_ATTACH)
	{
		ondebug(requestDebugger());
				
		console.log("BDSX: Attached\n");
		console.log("BDSX: Build Time = " BUILD_TIME "\n");

		g_mcf.free = (void(*)(void*)) * s_iatUcrtbase.getFunctionStore("free");
		g_mcf.malloc = (void* (*)(size_t)) * s_iatUcrtbase.getFunctionStore("malloc");
		g_mcf.load();

		Text16 commandLine = (Text16)unwide(GetCommandLineW());
		Text16 cmdread = commandLine;
		AText16 mutex;
		AText16 host;
		int port;

		readArgument(&cmdread); // exepath
		bool modulePathSetted = false;
		while (!cmdread.empty())
		{
			TText16 option = readArgument(&cmdread);
			if (option == u"-M")
			{
				TText16 modulePath = readArgument(&cmdread);

				if (modulePathSetted)
				{
					Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
					console.log("BDSX: multiple modules are not supported\n");
					continue;
				}
				modulePathSetted = true;

				Require::init(modulePath);
			}
			else if (option == u"--mutex")
			{
				mutex = readArgument(&cmdread);
				g_singleInstanceLimiter.create(TSZ16() << u"BDSX_" << mutex);
			}
			else if (option == u"--pipe-socket")
			{
				host = readArgument(&cmdread);
				port = readArgument(&cmdread).to_uint();
			}
			//else if (option == u"--properties")
			//{
			//	s_properties = readArgument(&commandLine);
			//}
		}

		if (host != nullptr)
		{
			console.connect(move(host), (word)port, mutex == nullptr ? 
				(AText)nullptr : 
				move(AText() << toUtf8(mutex))
			);
		}

		if (!modulePathSetted)
		{
			Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			console.log("BDSX: Module is not defined // -M [module path]\n");
		}

		//g_mcf.hookOnPropertyPath([](String* dest) {
		//	if (s_properties == nullptr)
		//	{
		//		ToUtf8<char16> toUtf8 = s_properties;
		//		dest->resize(toUtf8.size());
		//		toUtf8.copyTo(dest->data());
		//	}
		//	else
		//	{
		//		Text path = "server.properties";
		//		dest->assign(path.data(), path.size());
		//	}
		//	});
		g_mcf.hookOnLog([](int color, const char* log, size_t size) {
			int ncolor;
			if (color == 1)
			{
				ncolor = FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE;
			}
			else if (color == 2)
			{
				ncolor = FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE | FOREGROUND_INTENSITY;
			}
			else if (color == 4)
			{
				ncolor = FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_INTENSITY;
			}
			else
			{
				ncolor = FOREGROUND_RED | FOREGROUND_INTENSITY;
			}
			Console::ColorScope __color = ncolor;
			console.log({log, size});
			});
		g_mcf.hookOnCommandPrint([](const char * log, size_t size) {
			console.logLine({ log, size });
			});
		g_mcf.hookOnLoopStart([](ServerInstance * instance) {
			SetConsoleCtrlHandler([](DWORD CtrlType)->BOOL{
				switch (CtrlType)
				{
				case CTRL_CLOSE_EVENT:
				case CTRL_LOGOFF_EVENT:
				case CTRL_SHUTDOWN_EVENT:
					g_mainPump->post([] {
						throw QuitException(0);
						});
					ThreadHandle::getCurrent()->terminate();
					return true;
				}
				return false;
				}, true);
		});
		g_mcf.hookOnScriptLoading([]{
			// create require
			Require::start();
		});
		s_iatWS2_32.hooking(2, bindHook);
		s_iatWS2_32.hooking(3, closesocketHook);
		s_iatWS2_32.hooking(17, recvfromHook);
		s_iatWS2_32.hooking(20, sendtoHook);
		s_iatWS2_32.hooking(116, WSACleanupHook);
		s_iatChakra.hooking("JsCreateContext", JsCreateContextHook);
		s_iatChakra.hooking("JsCreateRuntime", JsCreateRuntimeHook);
		s_iatChakra.hooking("JsDisposeRuntime", JsDisposeRuntimeHook);
		s_iatChakra.hooking("JsRunScript", JsRunScriptHook);
		s_iatChakra.hooking("JsCallFunction", JsCallFunctionHook);
	}
	return true;
}

