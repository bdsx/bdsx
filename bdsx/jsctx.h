#pragma once

#include <KR3/js/js.h>

void createJsContext(kr::JsRawContext newContext) noexcept;
void destroyJsContext() noexcept;
bool isContextExisted() noexcept;
void checkCurrentThread() noexcept;
bool isContextThread() noexcept;
uint32_t getContextThreadId() noexcept;

extern kr::Manual<kr::JsContext> g_ctx;


