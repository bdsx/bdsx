#include "jsctx.h"

using namespace kr;

Manual<JsContext> g_ctx;

namespace
{
	JsPersistent s_callbacks[0x100];

	bool s_ctxCreated = false;
}

void createJsContext(kr::JsRawContext newContext) noexcept
{
	if (s_ctxCreated) g_ctx.remove();
	g_ctx.create(newContext);
	s_ctxCreated = true;
}
void destroyJsContext() noexcept
{
	if (s_ctxCreated)
	{
		g_ctx.remove();
		s_ctxCreated = false;
	}
}
