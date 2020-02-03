#pragma once

#include <KR3/main.h>
#include <KR3/js/js.h>
#include <KR3/data/map.h>
#include "reverse.h"

class NetHookModule
{
public:
	NetHookModule() noexcept;
	~NetHookModule() noexcept;

	kr::JsValue create() noexcept;
	void reset() noexcept;
	void hook() noexcept;

	std::atomic<uint32_t> lastSender;
	kr::JsPersistent lastSenderNi;

private:
	enum class EventType
	{
		Raw,
		Before,
		After,
		Send
	};

	static kr::uint getPacketId(EventType type, MinecraftPacketIds id) noexcept;
	void setCallback(EventType type, MinecraftPacketIds packetId, kr::JsValue func) throws(kr::JsException);

	kr::Map<kr::uint, kr::JsPersistent> m_callbacks;
	kr::JsPersistent m_onConnectionClosed;
};
