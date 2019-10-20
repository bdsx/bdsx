

#include <KR3/main.h>
#include <KR3/wl/windows.h>
#include <KR3/js/js.h>
#include <KRWin/hook.h>
#include <KRWin/handle.h>

// #include "ChakraDebugService.h"

 #define USE_EDGEMODE_JSRT
 #include <jsrt.h>

#include "jsctx.h"
#include "nativepointer.h"
#include "reversed.h"
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
		chakraX.setMethod(u"update", [] {
			while (SleepEx(0, true) == WAIT_IO_COMPLETION) {}
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


BOOL WINAPI DllMain(
	_In_ HINSTANCE hinstDLL,
	_In_ DWORD     fdwReason,
	_In_ LPVOID    lpvReserved
)
{
	if (fdwReason == DLL_PROCESS_ATTACH)
	{
		ondebug(requestDebugger());
		ucout << u"ChakraX Attached" << endl;
		
		s_iatChakra.hooking("JsCreateContext", JsCreateContextHook);
		s_iatChakra.hooking("JsCreateRuntime", JsCreateRuntimeHook);
		s_iatChakra.hooking("JsDisposeRuntime", JsDisposeRuntimeHook);
	}
	return true;
}

