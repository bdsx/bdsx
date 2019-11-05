

#include <KR3/main.h>
#include <KR3/data/crypt.h>
#include <KR3/js/js.h>
#include <KR3/fs/file.h>
#include <KR3/util/path.h>
#include <KR3/util/parameter.h>
#include <KR3/parser/jsonparser.h>
#include <KR3/data/map.h>
#include <KR3/data/set.h>
#include <KR3/io/selfbufferedstream.h>
#include <KR3/net/ipaddr.h>
#include <KR3/wl/windows.h>
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
#include "funchook.h"
#include "require.h"
#include "native.h"

#pragma comment(lib, "chakrart.lib")


using namespace kr;

namespace
{
	//JsDebugService s_debug;
	//JsDebugProtocolHandler s_debugHandler;
	win::Module* s_module = win::Module::getModule(nullptr);
	hook::IATHookerList s_iatChakra(s_module, "chakra.dll");
	hook::IATHookerList s_iatWS2_32(s_module, "WS2_32.dll");
	Map<Text, AText> s_uuidToPackPath;
}

struct ConnectionInfo
{
	void draw() noexcept
	{
		//const data = conninfo.data[this.address];
		//if (data)
		//{
		//	if (data.packetsPerSecMax < 10)
		//	{
		//		delete conninfo.data[this.address];
		//	}
		//	else
		//	{
		//		delete data.packetsPerSec;
		//	}
		//}
	}
};

void catchException() noexcept
{
	JsValueRef exception;
	if (JsGetAndClearException(&exception) == JsNoError)
	{
		JsScope scope;
		NativeModule::instance->fireError((JsRawData)exception);
		JsRelease(exception, nullptr);
	}
}

int CALLBACK recvfromHook(
	SOCKET s, char* buf, int len, int flags,
	sockaddr* from, int* fromlen
)
{
	int res = recvfrom(s, buf, len, flags, from, fromlen);

	if (NativeModule::instance->isBanned(((Ipv4Address&)((sockaddr_in*)from)->sin_addr)))
	{
		*fromlen = 0;
		WSASetLastError(WSAECONNREFUSED);
		return -1;
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
	NativeModule::instance.remove();
	Require::clear();
	destroyJsContext();
	return JsDisposeRuntime(runtime);
}
JsErrorCode CALLBACK JsCreateContextHook(JsRuntimeHandle runtime, JsContextRef* newContext) noexcept
{
	JsErrorCode err = JsCreateContext(runtime, newContext);
	if (err == JsNoError)
	{
		createJsContext(*newContext);
		g_ctx->enter();
		NativeModule::instance.create();
		g_ctx->exit();
		s_iatWS2_32.hooking(17, recvfromHook); // recvfrom
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

		cout << "BDSX: Attached" << endl;

		{
			ModuleName<char16> moduleName;
			BText<32> hash = (encoder::Hex)(TBuffer)encoder::Md5::hash(File::open(moduleName.c_str()));
			cout << "BDSX: bedrock_server.exe MD5 = " << hash << endl;

			if (hash == "221D0A275BE0BBBD3E50365799111742")
			{
				cout << "BDSX: Expected Version = 1.12.0.28" << endl;
				{
					ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
					cerr << "BDSX: Not Supported";
				}
				g_mcf.load_1_12_0_28();
			}
			else if (hash == "91B89F3745A2F64139FC6A955EFAD225")
			{
				cout << "BDSX: Expected Version = 1.12.1.1" << endl;
				{
					ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
					cerr << "BDSX: Not Supported";
				}
				g_mcf.load_1_12_0_28();
			}
			else if (hash == "BF16F04AD1783591BC80D1D3E54625E7")
			{
				cout << "BDSX: Expected Version = 1.13.0.34" << endl;
				g_mcf.load_1_13_0_34();
			}
			else
			{
				{
					ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
					cerr << "BDSX: Unexpected Version" << endl;
				}
				g_mcf.loadFromPdb();
			}
		}

		Text16 commandLine = (Text16)unwide(GetCommandLineW());
		while (!commandLine.empty())
		{
			Text16 option = readArgument(commandLine);
			if (option == u"-M")
			{
				Text16 modulePath = readArgument(commandLine);
				Require::init(modulePath);
			}
		}

		g_hookf->hookOnLoopStart([](DedicatedServer* server, ServerInstance * instance) {
			g_server = server;
			g_serverInstance = instance;
		});
		g_hookf->hookOnScriptLoading([]{
			// create require
			Require::start();
		});
		s_iatChakra.hooking("JsCreateContext", JsCreateContextHook);
		s_iatChakra.hooking("JsCreateRuntime", JsCreateRuntimeHook);
		s_iatChakra.hooking("JsDisposeRuntime", JsDisposeRuntimeHook);
		s_iatChakra.hooking("JsRunScript", JsRunScriptHook);
		s_iatChakra.hooking("JsCallFunction", JsCallFunctionHook);
	}
	return true;
}

