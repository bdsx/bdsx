#include "jsctx.h"
#include "native.h"
#include "require.h"
#include <KR3/wl/windows.h>
#include <KR3/msg/pump.h>

using namespace kr;

Manual<JsContext> g_ctx;

namespace
{
	JsPersistent s_callbacks[0x100];

	bool s_ctxCreated = false;
	DWORD contextThreadId;
}

void createJsContext(kr::JsRawContext newContext) noexcept
{
	if (s_ctxCreated) g_ctx.remove();
	g_ctx.create(newContext);
	s_ctxCreated = true;
	contextThreadId = GetCurrentThreadId();

	g_ctx->enter();
	try
	{
		kr::JsRuntime::run(u"Promise.resolve('test').then(()=>{})");
	}
	catch (JsException&)
	{
		int a = 0;
	}

	g_native.create();

	g_ctx->exit();
}
void destroyJsContext() noexcept
{
	if (!s_ctxCreated) return;
	JsContext::_exit();
	g_ctx->enter();
	EventPump::getInstance()->waitAll();
	g_native.remove();
	Require::clear();
	g_ctx->exit();
	g_ctx.remove();
	s_ctxCreated = false;
}
bool isContextExisted() noexcept
{
	return s_ctxCreated;
}
void checkCurrentThread() noexcept
{
	_assert(isContextThread());
}
bool isContextThread() noexcept
{
	return GetCurrentThreadId() == contextThreadId;
}

