#pragma once

#include <KR3/main.h>
#include <KR3/js/js.h>
#include <KR3/data/set.h>
#include <KR3/net/ipaddr.h>

class NativeModule
{
public:
	NativeModule() noexcept;
	~NativeModule() noexcept;
	kr::JsValue getModule() noexcept;
	void load() noexcept;
	bool isBanned(kr::Ipv4Address ip) noexcept;
	bool fireError(const kr::JsRawData &err) noexcept;

	static kr::Manual<NativeModule> instance;

private:
	kr::JsPersistent m_module;
	kr::JsPersistent m_onError;
	kr::Set<kr::Ipv4Address> m_banlist;
};
