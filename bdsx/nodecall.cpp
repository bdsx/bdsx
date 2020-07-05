
#include "nodecall.h"
#include "mcf.h"
#include "console.h"
#include "jsctx.h"
#include "native.h"

#include <KR3/js/js.h>

NodeCall g_nodecall;

void NodeCall::main_call(nodegate::JsCall* jscall) noexcept
{
	g_call = jscall;

	JsGetCurrentContext(&context);
	JsGetRuntime(context, &runtime);

	kr::JsRuntime::setRuntime(runtime);
	g_mainPump = kr::EventPump::getInstance();

	JsSetCurrentContext(nullptr);
	createJsContext(context);
	
	g_mcf.hookOnUpdate([](Minecraft* mc) {
		kr::SEHCatcher _catcher;
		try
		{
			g_mcf.Minecraft$update(mc);

			kr::JsScope scope;
			g_mainPump->processOnce();

			nodegate::nodeProcessTimer();
		}
		catch (kr::QuitException&)
		{
			g_mcf.stopServer();
		}
		catch (kr::SEHException& e)
		{
			g_native->onRuntimeError(e.exception);
		}
	});

	g_mcf.$_game_thread_lambda_$$_call_(lambda);

	destroyJsContext();
	JsSetCurrentContext(context);
}

void NodeCall::stdout_call(const char* str, size_t len) noexcept
{
	console.netlog(kr::Text(str, len));
}

void NodeCall::stderr_call(const char* str, size_t len) noexcept
{
	console.netlog(kr::Text(str, len));
}
