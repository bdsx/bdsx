

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
#include <shellapi.h>

#include "jsctx.h"
#include "nativepointer.h"
#include "reverse.h"
#include "console.h"
#include "fs.h"
#include "nethook.h"
#include "mcf.h"
#include "native.h"
#include "gen/buildtime.h"

#include "nodegate.h"
#include "nodecall.h"

#pragma comment(lib, "chakrart.lib")

using namespace kr;

namespace
{
	//JsDebugService s_debug;
	//JsDebugProtocolHandler s_debugHandler;

	kr::AText s_cmdline_buffer;
	win::Module* s_module = win::Module::current();
	hook::IATHookerList s_iatChakra(s_module, "chakra.dll");
	hook::IATHookerList s_iatWS2_32(s_module, "WS2_32.dll");
	hook::IATHookerList s_iatUcrtbase(s_module, "api-ms-win-crt-heap-l1-1-0.dll");
	Map<Text, AText> s_uuidToPackPath;
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
	if (g_nodecall.runtime == nullptr) return JsErrorOutOfMemory;
	*runtime = g_nodecall.runtime;
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
	return JsNoError;
}
JsErrorCode CALLBACK JsDisposeRuntimeHook(JsRuntimeHandle runtime) noexcept
{
	return JsNoError;
}
JsErrorCode CALLBACK JsCreateContextHook(JsRuntimeHandle runtime, JsContextRef* newContext) noexcept
{
	if (g_nodecall.context == nullptr) return JsErrorOutOfMemory;
	*newContext = g_nodecall.context;
	return JsNoError;
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

			TText16 newpath = TText16::concat(u"./", utf8ToUtf16(iter->second), u"/scripts", rpath, nullterm);
			
			{
				JsScope _scope;
				try
				{
					JsExceptionCatcher catcher;
					g_call->require((Text16)newpath);
				}
				catch (JsException& e)
				{
					g_native->fireError(e.getValue());
				}
			}
			// JsErrorCode err = JsRunScript(script, sourceContext, wide(newpath.data()), result);
			// if (err != JsNoError) catchException();
			return JsNoError;
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
JsErrorCode CALLBACK JsStartDebuggingHook() noexcept
{
	return JsNoError;
}

JsErrorCode CALLBACK JsSetPropertyHook(
	JsValueRef object,
	JsPropertyIdRef propertyId,
	JsValueRef value,
	bool useStrictRules)
{
	const wchar_t* name;
	JsGetPropertyNameFromId(propertyId, &name);
	_assert((Text16)unwide(name) != u"console");
	return JsSetProperty(object, propertyId, value, useStrictRules);
}

// unused
JsErrorCode CALLBACK JsSetIndexedPropertyHook(
	JsValueRef object,
	JsValueRef index,
	JsValueRef value)
{
	return JsSetIndexedProperty(object, index, value);
}

BOOL WINAPI DllMain(
	_In_ HINSTANCE hinstDLL,
	_In_ DWORD     fdwReason,
	_In_ LPVOID    lpvReserved
)
{
	if (fdwReason == DLL_PROCESS_ATTACH)
	{
		AText16 mutex;

		{
			Array<size_t> positions;
			Text16 scriptDir = nullptr;
			wchar_t* commandLine = GetCommandLineW();
			int argc;
			char16_t** argv_16_start = kr::unwide(CommandLineToArgvW(commandLine, &argc));
			positions.reserve(argc);
			s_cmdline_buffer.reserve(1024);


			char16_t** argv_16 = argv_16_start;
			s_cmdline_buffer << (kr::Utf16ToUtf8)(kr::Text16)(*argv_16++) << '\0';
			positions.push(0);

			while (*argv_16 != nullptr)
			{
				Text16 arg = (Text16)*argv_16++;
				if (arg == u"--mutex")
				{
					pcstr16 arg2 = *argv_16++;
					if (arg2 == nullptr) continue;
					mutex = (Text16)arg2;
					g_singleInstanceLimiter.create(TSZ16() << u"BDSX_" << mutex);
				}
				else if (arg == u"--pipe-socket")
				{
					pcstr16 arg2 = *argv_16++;
					if (arg2 == nullptr) continue;
					pcstr16 arg3 = *argv_16++;
					if (arg3 == nullptr) continue;
					pcstr16 arg4 = *argv_16++;
					if (arg4 == nullptr) continue;
					Text16 host = (Text16)arg2;
					uint port = ((Text16)arg3).to_uint();
					AText key;
					key << (Utf16ToUtf8)(Text16)arg4;
					console.connect(host, (word)port, key);
				}
				else if (arg == u"--dir")
				{
					pcstr16 arg2 = *argv_16++;
					if (scriptDir != nullptr)
					{
						console.logA("[BDSX] Cannot define multiple --dir", true);
						continue;
					}
					if (arg2 == nullptr) continue;
					scriptDir = (Text16)arg2;
				}
				else
				{
					if (arg.size() <= 1 || *arg != '-')
					{
						// pass through after entry path
						TText arg8 = (kr::Utf16ToUtf8)arg;
						positions.push(s_cmdline_buffer.size());
						if (scriptDir != nullptr)
						{
							TText scriptDir8 = (kr::Utf16ToUtf8)scriptDir;
							path.joinEx(&s_cmdline_buffer, { scriptDir8, arg8 }, true);
						}
						else
						{
							path.joinEx(&s_cmdline_buffer, { arg8 }, true);
						}
						s_cmdline_buffer << '\0';

						while (*argv_16 != nullptr)
						{
							Text16 arg = (Text16)*argv_16++;
							positions.push(s_cmdline_buffer.size());
							s_cmdline_buffer << (kr::Utf16ToUtf8)arg << '\0';
						}
						break;
					}
					else
					{
						positions.push(s_cmdline_buffer.size());
						s_cmdline_buffer << (kr::Utf16ToUtf8)arg << '\0';
					}
				}
			}

			// utf8 argv
			{
				size_t argv_pos = s_cmdline_buffer.size();
				s_cmdline_buffer.prepare(positions.bytes() + sizeof(char*));
				s_cmdline_buffer.shrink();

				char** argptr = (char**)(s_cmdline_buffer.begin() + argv_pos);
				g_nodecall.argv = argptr;
				g_nodecall.argc = intact<int>(positions.size());

				char* bufptr = s_cmdline_buffer.begin();
				for (size_t& pos : positions)
				{
					*argptr++ = bufptr + pos;
				}
				*argptr++ = nullptr;
			}

			LocalFree(argv_16_start);
		}

		if (!console.isConnectedWithSocket())
		{
			console.startStdin();
		}
		console.logA("[BDSX] Attached\n");
		console.logA("[BDSX] Build Time = " BUILD_TIME "\n");

		g_mcf.free = (void(*)(void*)) * s_iatUcrtbase.getFunctionStore("free");
		g_mcf.malloc = (void* (*)(size_t)) * s_iatUcrtbase.getFunctionStore("malloc");
		g_mcf.load();

		{
			McftRenamer renamer;

			// skipChangeCurDir
			/*
			lea rcx,qword ptr ss:[rbp+50]
			call <bedrock_server.getExecutableDir>
			cmp qword ptr ds:[rax+18],10
			jb bedrock_server.7FF6A8F741FD
			mov rax,qword ptr ds:[rax]
			mov rcx,rax
			call qword ptr ds:[<&SetCurrentDirectoryA>]
			mov rdx,qword ptr ss:[rbp+68]
			cmp rdx,10
			jb bedrock_server.7FF6A8F74244
			inc rdx
			mov rcx,qword ptr ss:[rbp+50]
			mov rax,rcx
			cmp rdx,1000
			jb bedrock_server.7FF6A8F7423F
			add rdx,27
			mov rcx,qword ptr ds:[rcx-8]
			sub rax,rcx
			add rax,FFFFFFFFFFFFFFF8
			cmp rax,1F
			jbe bedrock_server.7FF6A8F7423F
			call qword ptr ds:[<&_invalid_parameter_noinfo_noreturn>]
			int3
			call <bedrock_server.void __cdecl operator delete[](void * __ptr64,unsigned __int64)>
			*/
			MCF_NOP(main, 0x43a, {
				0x48, 0x8D, 0x4D, 0x50, 0xE8, 0x9D, 0x56, 0xCB,
				0x00, 0x48, 0x83, 0x78, 0x18, 0x10, 0x72, 0x03,
				0x48, 0x8B, 0x00, 0x48, 0x8B, 0xC8, 0xFF, 0x15,
				0xCA, 0xCE, 0x1C, 0x01, 0x48, 0x8B, 0x55, 0x68,
				0x48, 0x83, 0xFA, 0x10, 0x72, 0x34, 0x48, 0xFF,
				0xC2, 0x48, 0x8B, 0x4D, 0x50, 0x48, 0x8B, 0xC1,
				0x48, 0x81, 0xFA, 0x00, 0x10, 0x00, 0x00, 0x72,
				0x1C, 0x48, 0x83, 0xC2, 0x27, 0x48, 0x8B, 0x49,
				0xF8, 0x48, 0x2B, 0xC1, 0x48, 0x83, 0xC0, 0xF8,
				0x48, 0x83, 0xF8, 0x1F, 0x76, 0x07, 0xFF, 0x15,
				0x3A, 0xDA, 0x1C, 0x01, 0xCC, 0xE8, 0x80, 0x55,
				0x01, 0x01
			});

			// skipCommandListDestruction
			MCF_NOP(ScriptEngine$dtor$ScriptEngine, 435, {
				0x48, 0x8D, 0x4B, 0x78,			// lea         rcx,[rbx+78h]  
				0xE8, 0x00, 0x00, 0x00, 0x00,	// call        std::deque<ScriptCommand,std::allocator<ScriptCommand> >::_Tidy (07FF7ED6A00E0h)  
			}, { {5, 9} });

			// force enable script
			MCF_NOP(MinecraftServerScriptEngine$onServerThreadStarted, 0x42, { 
				0xE8, 0xE9, 0x9F, 0xF3, 0xFF, 0x84, 0xC0, 0x0F, 
				0x84, 0x6A, 0x01, 0x00, 0x00, 0x48, 0x8B, 0x86, 
				0x28, 0x02, 0x00, 0x00, 0x48, 0x85, 0xC0, 0x75, 
				0x07, 0x48, 0x8D, 0x86, 0x30, 0x02, 0x00, 0x00,
				0x48, 0x8B, 0x80, 0x38, 0x01, 0x00, 0x00, 0xF6, 
				0x00, 0x04, 0x0F, 0x84, 0x47, 0x01, 0x00, 0x00
			});
		}

		g_mcf.hookOnProgramMainCall([](int _argc, char** _argv){
#undef main
			return g_mcf.main(g_nodecall.argc, g_nodecall.argv);
			});
		g_mcf.hookOnLog([](int color, const char* log, size_t size) {
			if (color == 1)
			{
				Console::ColorScope __color = FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE;
				console.log({ log, size });
			}
			else if (color == 2)
			{
				Console::ColorScope __color = FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE | FOREGROUND_INTENSITY;
				console.log({ log, size });
			}
			else if (color == 4)
			{
				Console::ColorScope __color = FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_INTENSITY;
				console.log({ log, size }, true);
			}
			else
			{
				Console::ColorScope __color = FOREGROUND_RED | FOREGROUND_INTENSITY;
				console.log({ log, size }, true);
			}
			});
		g_mcf.hookOnCommandPrint([](const char * log, size_t size) {
			console.logLine({ log, size });
			});
		g_mcf.hookOnCommandIn([](String* dest) {
			TText text = console.getLine();
			dest->assign(text.data(), text.size());
			});
		g_mcf.hookOnGameThreadCall([](void* pad, void* lambda) {
			g_mcf.std$_Pad$_Release(pad);

			 g_nodecall.lambda = lambda;
			 nodegate::start(&g_nodecall);
			});

		{
			McftRenamer renamer;

			// hook on start server
			MCF_HOOK(ServerInstance$startServerThread, 
				{ 0x48, 0x8B, 0xC4, 0x55, 0x57, 0x41, 0x56, 0x48, 0x8D, 0x68, 0xA1, 0x48, 0x81, 0xEC, 0xD0, 0x00, 0x00, 0x00 }
			)(ServerInstance* instance) {
				g_server = instance;
				SetConsoleCtrlHandler([](DWORD CtrlType)->BOOL {
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
			};

			// hook on script loading
			MCF_HOOK(ScriptEngine$startScriptLoading, 
				{ 0x40, 0x57, 0x48, 0x83, 0xEC, 0x30, 0x48, 0xC7, 0x44, 0x24, 0x20, 0xFE, 0xFF, 0xFF, 0xFF })
			{
				{
					JsScope _scope;
					try
					{
						JsExceptionCatcher catcher;
						g_call->callMain();
					}
					catch (JsException& e)
					{
						g_native->fireError(e.getValue());
					}
				}
			};

			// skipMakeConsoleObject
			/*
			lea r9,qword ptr ss:[rbp-28]
			lea r8,qword ptr ds:[7FF76658D9E0]
			lea rdx,qword ptr ss:[rbp-18]
			*/
			MCF_NOP(ScriptEngine$initialize, 0x287, {
				0x4C, 0x8D, 0x4D, 0xD8, 0x4C, 0x8D, 0x05, 0x36,
				0x75, 0x19, 0x01, 0x48, 0x8D, 0x55, 0xE8, 0x41,
				0xFF, 0xD2, 0x84, 0xC0, 0x74, 0xA6
			}, { {7, 11}, });
		}

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
		s_iatChakra.hooking("JsStartDebugging", JsStartDebuggingHook);
		s_iatChakra.hooking("JsSetProperty", JsSetPropertyHook);
		// s_iatChakra.hooking("JsSetIndexedProperty", JsSetIndexedPropertyHook);
	}
	return true;
}

