#pragma once

#include "nodegate.h"

#include <KR3/main.h>
#include <KR3/win/windows.h>

#define USE_EDGEMODE_JSRT
#include <jsrt.h>

class NodeCall : public nodegate::NodeGateConfig
{
public:
	void* lambda;
	JsRuntimeHandle runtime;
	JsContextRef context;

	void main_call(nodegate::JsCall* jscall) noexcept override;
	void stdout_call(const char* str, size_t len) noexcept override;
	void stderr_call(const char* str, size_t len) noexcept override;
};

extern NodeCall g_nodecall;