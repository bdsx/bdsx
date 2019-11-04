#pragma once

#include <KR3/main.h>
#include <KR3/js/js.h>

kr::JsValue createNetHookModule() noexcept;
void destroyNetHookModule() noexcept;