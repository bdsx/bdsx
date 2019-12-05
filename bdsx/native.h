#pragma once

#include <KR3/main.h>
#include <KR3/js/js.h>
#include <KR3/data/set.h>
#include <KR3/net/ipaddr.h>

#include "nethook.h"
#include "actor.h"

class Native
{
public:
	Native() noexcept;
	~Native() noexcept;
	kr::JsValue getModule() noexcept;
	bool isFilted(kr::Ipv4Address ip) noexcept;
	bool fireError(const kr::JsRawData &err) noexcept;
	void reset() noexcept;

	NetHookModule nethook;

private:
	void _hook() noexcept;
	void _createNativeModule() noexcept;

	kr::JsPersistent m_module;
	kr::JsPersistent m_onError;
	kr::JsPersistent m_onCommand;
	kr::JsPersistent m_onRuntimeError;
	kr::Set<kr::Ipv4Address> m_ipfilter;
};

void storeListener(kr::JsPersistent * persistent, const kr::JsValue & move) throws(kr::JsException);

extern kr::Manual<Native> g_native;
