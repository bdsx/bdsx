#pragma once

#include <KR3/main.h>
#include <KR3/js/js.h>
#include <KR3/data/set.h>
#include <KR3/net/ipaddr.h>
#include <KR3/msg/pump.h>

#include "nethook.h"
#include "actor.h"

class NetFilter
{
public:
	static void addTraffic(kr::Ipv4Address ip, uint64_t value) noexcept;
	static void addBindList(SOCKET socket) noexcept;
	static void removeBindList(SOCKET socket) noexcept;
	static bool isFilted(kr::Ipv4Address ip) noexcept;
	static bool addFilter(kr::Ipv4Address ip, time_t endTime) noexcept;
	static bool removeFilter(kr::Ipv4Address ip) noexcept;
	static void clearFilter() noexcept;
	static void setTrafficLimit(uint64_t bytes) noexcept;
	static void setTrafficLimitPeriod(int seconds) noexcept;
};

class Native
{
public:
	Native() noexcept;
	~Native() noexcept;
	bool fireError(kr::JsRawData err) noexcept;

	NetHookModule nethook;
	void onRuntimeError(EXCEPTION_POINTERS* ptr) noexcept;

	kr::Map<kr::Text16, kr::JsPersistent, true> m_props;

private:
	void _hook() noexcept;
	void _createNativeModule() noexcept;

	kr::JsPersistent m_onError;
	kr::JsPersistent m_onCommand;
	kr::JsPersistent m_onRuntimeError;
};


class SingleInstanceLimiter
{
public:
	SingleInstanceLimiter() noexcept;
	~SingleInstanceLimiter() noexcept;
	void release() noexcept;
	void create(kr::pcstr16 name) noexcept;

private:
	void* m_mutex;

};
void storeListener(kr::JsPersistent * persistent, const kr::JsValue & move) throws(kr::JsException);
void cleanAllResource() noexcept;

extern kr::Manual<Native> g_native;
extern SingleInstanceLimiter g_singleInstanceLimiter;
extern kr::EventPump* g_mainPump;