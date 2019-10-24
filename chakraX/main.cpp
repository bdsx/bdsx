

#include <KR3/main.h>
#include <KR3/wl/windows.h>
#include <KR3/js/js.h>
#include <KR3/fs/file.h>
#include <KR3/parser/jsonparser.h>
#include <KR3/data/map.h>
#include <KR3/io/selfbufferedstream.h>
#include <KR3/data/crypt.h>
#include <KRWin/handle.h>

// #include "ChakraDebugService.h"

 #define USE_EDGEMODE_JSRT
 #include <jsrt.h>

#include "jsctx.h"
#include "nativepointer.h"
#include "reverse.h"
#include "console.h"
#include "fs.h"
#include "nethook.h"

#pragma comment(lib, "chakrart.lib")


using namespace kr;


namespace
{
	//JsDebugService s_debug;
	//JsDebugProtocolHandler s_debugHandler;
	win::Module* s_module = win::Module::getModule(nullptr);
	hook::IATHookerList s_iatChakra(s_module, "chakra.dll");
	JsPersistent s_onError;
	Map<Text, AText> s_uuidToPackPath;

}

void catchException() noexcept
{
	JsValueRef exception;
	if (JsGetAndClearException(&exception) == JsNoError)
	{
		JsScope scope;

		JsRawData exceptionobj = (JsRawData)exception;
		JsValue onError = s_onError;
		if (onError.isEmpty() || onError.call(undefined, { exceptionobj }) != false)
		{
			TText16 message = exceptionobj.getProperty(u"stack").as<Text16>();
			JsRelease(exception, nullptr);
			
			ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			cerr << toAcp(message) << endl;
		}
	}
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
	destroyNetHookModule();
	s_onError = JsPersistent();
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

		JsValue chakraX = JsNewObject;
		chakraX.set(u"console", createConsoleModule());
		chakraX.setMethod(u"setOnErrorListener", [](JsValue listener){
			if (listener.getType() != JsType::Function) throw JsException(u"argument must be function");
			s_onError = listener;
		});
		chakraX.setMethod(u"debug", [] {
			requestDebugger();
			debug();
		});
		chakraX.set(u"fs", createFsModule());
		chakraX.set(u"NativePointer", NativePointer::classObject);
		chakraX.set(u"NativeFile", NativeFile::classObject);
		chakraX.set(u"nethook", createNetHookModule());

		JsRuntime::global().set(u"chakraX", chakraX);

		g_ctx->exit();
	}
	return err;
}
JsErrorCode CALLBACK JsRunScriptHook(
	const wchar_t* script,
	JsSourceContext sourceContext,
	const wchar_t* sourceUrl,
	JsValueRef* result) noexcept
{
	// 13943bf2-ad24-4416-ac14-575ae24d85ea_0.0.1_scripts/server/script.dist.js_2360fd92ebe1e173

	constexpr size_t UUID_LEN = 36;
	auto path = (Text16)unwide(sourceUrl);
	if (path.size() >= UUID_LEN)
	{
		TText uuid = TText::concat(toUtf8(path.cut(UUID_LEN)));
		auto iter = s_uuidToPackPath.find(uuid);
		if (iter != s_uuidToPackPath.end())
		{
			Text16 rpath = path.subarr(UUID_LEN).find_e(u'/');
			Text16 remove_end = rpath.find_r(u'_');
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
		
		cout << "ChakraX: Attached" << endl;

		{
			ModuleName<char16> moduleName;
			BText<32> hash = (encoder::Hex)(TBuffer)encoder::Md5::hash(File::open(moduleName.c_str()));
			cout << "ChakraX: bedrock_server.exe MD5 = " << hash << endl;

			if (hash == "221D0A275BE0BBBD3E50365799111742")
			{
				cout << "ChakraX: Expected Version = 1.12.0.28" << endl;
				g_minecraftFunctionTable.load_1_12_0_28();
			}
			else if (hash == "91B89F3745A2F64139FC6A955EFAD225")
			{
				cout << "ChakraX: Expected Version = 1.12.1.1" << endl;
				g_minecraftFunctionTable.load_1_12_0_28();
			}
			else
			{
				{
					ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
					cerr << "Unsupported Version" << endl;
				}
				g_minecraftFunctionTable.loadFromPdb();
			}

		}

		hookOnLoopStart([](byte* rbp) {
		});
		s_iatChakra.hooking("JsCreateContext", JsCreateContextHook);
		s_iatChakra.hooking("JsCreateRuntime", JsCreateRuntimeHook);
		s_iatChakra.hooking("JsDisposeRuntime", JsDisposeRuntimeHook);
		s_iatChakra.hooking("JsRunScript", JsRunScriptHook);
		s_iatChakra.hooking("JsCallFunction", JsCallFunctionHook);
	}
	return true;
}

