#include "nethook.h"
#include "console.h"

#include <KR3/data/binarray.h>
#include <KR3/data/map.h>
#include <KR3/wl/windows.h>

#include "jsctx.h"
#include "reverse.h"
#include "mcf.h"
#include "nativepointer.h"
#include "networkidentifier.h"
#include "sharedptr.h"
#include "native.h"

using namespace kr;

namespace
{

	constexpr uint MAX_PACKET_ID = 0x100;
}


uint NetHookModule::getPacketId(EventType type, MinecraftPacketIds id) noexcept
{
	return (int)type * (int)MAX_PACKET_ID + (uint)id;
}
void NetHookModule::setCallback(EventType type, MinecraftPacketIds packetId, JsValue func) throws(JsException)
{
	if ((uint)packetId >= MAX_PACKET_ID) throw JsException(TSZ16() << u"Out of range: packetId < 0x100 (packetId=" << (int)packetId << u")");
	uint id = getPacketId(type, packetId);
	switch (func.getType())
	{
	case JsType::Null:
		m_callbacks.erase(id);
		break;
	case JsType::Function:
		m_callbacks[id] = func;
		break;
	default:
		throw JsException(u"2nd argument must be function or null");
	}
}

NetHookModule::NetHookModule() noexcept
{

}
NetHookModule::~NetHookModule() noexcept
{
}

kr::JsValue NetHookModule::create() noexcept
{
	JsValue nethook = JsNewObject;
	nethook.setMethod(u"setOnPacketRawListener", [](int id, JsValue func) {
		g_native->nethook.setCallback(EventType::Raw, (MinecraftPacketIds)id, func);
		});
	nethook.setMethod(u"setOnPacketBeforeListener", [](int id, JsValue func) {
		g_native->nethook.setCallback(EventType::Before, (MinecraftPacketIds)id, func);
		});
	nethook.setMethod(u"setOnPacketAfterListener", [](int id, JsValue func) {
		g_native->nethook.setCallback(EventType::After, (MinecraftPacketIds)id, func);
		});
	nethook.setMethod(u"setOnPacketSendListener", [](int id, JsValue func) {
		g_native->nethook.setCallback(EventType::Send, (MinecraftPacketIds)id, func);
		});
	nethook.setMethod(u"setOnConnectionClosedListener", [](JsValue func) {
		NetHookModule * _this = &g_native->nethook;
		storeListener(&_this->m_onConnectionClosed, func);
		});
	nethook.setMethod(u"createPacket", [](int packetId) {
		JsValue p = SharedPointer::newInstanceRaw({});
		SharedPtr<Packet> packet = Dirty;
		g_mcf.MinecraftPackets$createPacket(&packet, (MinecraftPacketIds)packetId);
		p.getNativeObject<SharedPointer>()->setRaw(move(packet));
		return p;
		});
	nethook.setMethod(u"sendPacket", [](JsNetworkIdentifier* ni, StaticPointer* packet, int whatIsThis) {
		if (ni == nullptr) throw JsException(u"1st argument must be NetworkIdentifier");
		if (packet == nullptr) throw JsException(u"2nd argument must be *Pointer");
		g_server->networkHandler->send(ni->identifier, (Packet*)packet->getAddressRaw(), whatIsThis);
		});
	return nethook;
}
void NetHookModule::reset() noexcept
{
	lastSender = nullptr;
	m_callbacks.clear();
	m_onConnectionClosed = nullptr;
}

void NetHookModule::hook() noexcept
{
	g_mcf.hookOnPacketRaw([](byte* rbp, MinecraftPacketIds packetId, Connection* conn)->SharedPtr<Packet>*{

		NetHookModule* _this = &g_native->nethook;

		JsScope scope;
		JsValue jsni = JsNetworkIdentifier::fromRaw(conn->ni);
		_this->lastSender = jsni;

		SharedPtr<Packet>* packet_dest = (SharedPtr<Packet>*)(rbp + 0x90);

		auto iter = _this->m_callbacks.find(getPacketId(EventType::Before, packetId));
		if (iter != _this->m_callbacks.end())
		{
			ReadOnlyBinaryStream* s = (ReadOnlyBinaryStream*)(rbp + 0xA0);
			Text data = s->getData();

			NativePointer * rawpacketptr = NativePointer::newInstance();
			rawpacketptr->setAddressRaw(data.data());

			try
			{
				JsValue ret = ((JsValue)iter->second)(rawpacketptr, (int)data.size(), jsni, (int)packetId);
				if (ret == false) return nullptr;
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
		}
		return g_mcf.MinecraftPackets$createPacket(packet_dest, packetId);
		});
	g_mcf.hookOnPacketBefore([](byte* rbp, PacketReadResult res, Connection* conn) {
		checkCurrentThread();

		if (res == PacketReadError) return res;

		NetHookModule* _this = &g_native->nethook;

		dword packetIdCombined = *(dword*)(rbp + 0x8C);
		MinecraftPacketIds packetId = (MinecraftPacketIds)(packetIdCombined & 0x3ff);
		//dword serverIndex = ((packetIdCombined >> 10) & 3);
		//NetworkHandler* handler = *(NetworkHandler**)(rbp - 0xC0);
		//ServerNetworkHandler** shandler = handler->getServer(serverIndex);

		auto iter = _this->m_callbacks.find(getPacketId(EventType::Before, packetId));
		if (iter == _this->m_callbacks.end()) return res;

		JsScope scope;
		SharedPtr<Packet>* packet = (SharedPtr<Packet>*)(rbp + 0x90);
		NativePointer* packetptr = NativePointer::newInstance();
		packetptr->setAddressRaw(packet->pointer());

		try
		{
			JsValue ret = ((JsValue)iter->second)(packetptr, (JsValue)_this->lastSender, (int)packetId);
			return ret == false ? PacketReadError : res;
		}
		catch (JsException & err)
		{
			g_native->fireError(err.getValue());
			return PacketReadError;
		}
		});
	g_mcf.hookOnPacketAfter([](byte* rbp, ServerNetworkHandler* server, Connection* conn) {
		MinecraftPacketIds packetId = (MinecraftPacketIds)(*(dword*)(rbp + 0x8C) & 0x3ff);

		NetHookModule* _this = &g_native->nethook;
		auto iter = _this->m_callbacks.find(_this->getPacketId(EventType::After, packetId));
		if (iter == _this->m_callbacks.end()) return;

		NetworkHandler* handler = *(NetworkHandler**)(rbp - 0xC0);
		Packet* packet = *(Packet**)(rbp + 0x90);

		JsScope scope;
		NativePointer* packetptr = NativePointer::newInstance();
		packetptr->setAddressRaw(packet);

		try
		{

			if (packetId == MinecraftPacketIds::Login)
			{
				JsValue logininfo = JsNewObject;
				LoginPacket* login = static_cast<LoginPacket*>(packet);
				Certificate* cert = login->connreq->cert;
				if (cert)
				{
					logininfo.set(u"xuid", cert->getXuid().text());
					logininfo.set(u"id", cert->getId().text());
				}
				((JsValue)iter->second)(packetptr, (JsValue)_this->lastSender, (int)packetId, logininfo);
			}
			else
			{
				((JsValue)iter->second)(packetptr, (JsValue)_this->lastSender, (int)packetId);
			}
		}
		catch (JsException & err)
		{
			g_native->fireError(err.getValue());
		}
		});
	g_mcf.hookOnPacketSendInternal([](NetworkHandler* handler, const NetworkIdentifier& ni, Packet* packet, String* data)->Connection* {

		MinecraftPacketIds packetId = packet->getId();

		NetHookModule* _this = &g_native->nethook;
		auto iter = _this->m_callbacks.find(_this->getPacketId(EventType::Send, packetId));
		if (iter != _this->m_callbacks.end())
		{
			JsScope scope;
			NativePointer* packetptr = NativePointer::newInstance();
			packetptr->setAddressRaw(packet);

			JsValue jsni = JsNetworkIdentifier::fromRaw(ni);

			try
			{
				if (((JsValue)iter->second)(packetptr, jsni, (int)packetId, data->text()) == false)
				{
					return nullptr;
				}
			}
			catch (JsException & err)
			{
				g_native->fireError(err.getValue());
			}
		}
		return handler->getConnectionFromId(ni);
		});

	g_mcf.hookOnConnectionClosed([](const NetworkIdentifier& ni) {
		NetHookModule* _this = &g_native->nethook;
		if (_this->m_onConnectionClosed.isEmpty()) return;
		JsScope scope;
		JsValue onClosed = _this->m_onConnectionClosed;
		onClosed(JsNetworkIdentifier::fromRaw(ni));
		JsNetworkIdentifier::dispose(ni);
		});
}
