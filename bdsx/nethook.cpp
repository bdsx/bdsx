#include "nethook.h"
#include "console.h"

#include <KR3/data/binarray.h>
#include <KR3/wl/windows.h>

#include "jsctx.h"
#include "reverse.h"
#include "funchook.h"
#include "nativepointer.h"
#include "native.h"

//LoopbackPacketSender::sendToClient(NetworkIdentifier&, Packet&, byte)
//LoopbackPacketSender::flush(NetworkIdentifier&)
//Certificate* : LoginPacket + 0x28


using namespace kr;

namespace
{
	JsPersistent s_onPacketRead[0x100];
	JsPersistent s_onPacketAfter[0x100];
	JsPersistent s_onConnectionClosed;
}

JsValue createNetHookModule() noexcept
{
	JsValue nethook = JsNewObject;
	nethook.setMethod(u"setOnPacketReadListener", [](int id, JsValue func){
		checkCurrentThread();
		if (func.getType() != JsType::Function) throw JsException(u"2nd argument must be function");
		s_onPacketRead[id] = func;
	});
	nethook.setMethod(u"setOnPacketAfterListener", [](int id, JsValue func) {
		if (func.getType() != JsType::Function) throw JsException(u"2nd argument must be function");
		s_onPacketAfter[id] = func;
	});
	nethook.setMethod(u"setOnConnectionClosedListener", [](JsValue func) {
		if (func.getType() != JsType::Function) throw JsException(u"argument must be function");
		s_onConnectionClosed = func;
	});
		
	g_hookf->hookOnUpdate([] {
		JsScope scope;
		while (SleepEx(0, true) == WAIT_IO_COMPLETION) {}
	});
	g_hookf->hookOnPacketRead([](byte* rbp, PacketReadResult res, const NetworkIdentifier& ni) {
		checkCurrentThread();
		if (res == PacketReadError) return res;

		MinecraftPacketIds packetId = (MinecraftPacketIds)*(dword*)(rbp + 0x8C);

		JsPersistent& listener = s_onPacketRead[packetId];
		if (listener.isEmpty()) return res;

		Packet* packet = *(Packet**)(rbp + 0x90);
		NetworkHandler* handler = *(NetworkHandler**)(rbp - 0xC0);

		JsScope scope;
		NativePointer* packetptr = NativePointer::newInstance();
		packetptr->setAddressRaw(packet);

		try
		{
			JsValue ret = ((JsValue)listener).call(undefined, { packetptr, ni.toString(), packetId });
			return ret == false ? PacketReadError : res;
		}
		catch (JsException& err)
		{
			NativeModule::instance->fireError(err.getValue());
			return PacketReadError;
		}
	});
	g_hookf->hookOnPacketAfter([](byte * rbp, ServerNetworkHandler * server, const NetworkIdentifier& ni){
		MinecraftPacketIds packetId = (MinecraftPacketIds)*(dword*)(rbp + 0x8C);

		JsPersistent& listener = s_onPacketAfter[packetId];
		if (listener.isEmpty()) return;

		NetworkHandler* handler = *(NetworkHandler**)(rbp - 0xC0);
		Packet* packet = *(Packet**)(rbp + 0x90);

		JsScope scope;
		NativePointer* packetptr = NativePointer::newInstance();
		packetptr->setAddressRaw(packet);

		try
		{
			if (packetId == 1)
			{
				JsValue logininfo = JsNewObject;

				try
				{
					LoginPacket* login = static_cast<LoginPacket*>(packet);
					Certificate* cert = login->connreq->cert;
					if (cert)
					{
						String xuid = cert->getXuid();
						logininfo.set(u"xuid", xuid.text());
						xuid.deallocate();

						String id = cert->getId();
						logininfo.set(u"id", id.text());
						id.deallocate();
					}
					Connection* conn = handler->getConnectionFromId(ni);
					EncryptedNetworkPeer* epeer = conn->epeer;
					RaknetNetworkPeer* rpeer = epeer->peer;
					RakPeer* peer = rpeer->peer;
					TmpArray<SystemAddress> connections = peer->getConnections();
					for (SystemAddress& addr : connections)
					{
						logininfo.set(u"ip", addr.toString());
						break;
					}
				}
				catch (...)
				{
				}
				((JsValue)listener).call(undefined, { packetptr, ni.toString(), packetId, logininfo });
			}
			else
			{
				((JsValue)listener).call(undefined, { packetptr, ni.toString(), packetId });
			}
		}
		catch (JsException& err)
		{
			NativeModule::instance->fireError(err.getValue());
		}
	});
	g_hookf->hookOnConnectionClosed([](const NetworkIdentifier& ni) {
		if (s_onConnectionClosed.isEmpty()) return;
		JsScope scope;
		JsValue onClosed = s_onConnectionClosed;
		onClosed.call(undefined, { ni.toString() });
	});

	return nethook;
}
void destroyNetHookModule() noexcept
{
	for (auto& persistent : s_onPacketRead)
	{
		persistent = JsPersistent();
	}
	for (auto& persistent : s_onPacketAfter)
	{
		persistent = JsPersistent();
	}
	s_onConnectionClosed = JsPersistent();
}
