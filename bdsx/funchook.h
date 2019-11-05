#pragma once

#include "reverse.h"

struct MinecraftFunctionTable
{
	void loadFromPdb() noexcept;
	void load_1_12_0_28() noexcept;
	void load_1_13_0_34() noexcept;

	bool (*NetworkHandler$_sortAndPacketizeEvents)(NetworkHandler* _this, Connection&, std::chrono::nanoseconds);
	std::shared_ptr<Packet>(*MinecraftPackets$createPacket)(MinecraftPacketIds);
	ServerPlayer* (*ServerNetworkHandler$_getServerPlayer)(ServerNetworkHandler* _this, const NetworkIdentifier&, byte data);
	EncryptedNetworkPeer* (*NetworkHandler$getEncryptedPeerForUser)(NetworkHandler* _this, const NetworkIdentifier&);
	Connection* (*NetworkHandler$_getConnectionFromId)(NetworkHandler* handler, const NetworkIdentifier&);
	void (*ExtendedCertificate$getXuid)(String* out, const Certificate&);
	void (*ExtendedCertificate$getIdentityName)(String* out, const Certificate&);
	void (*RakNet$SystemAddress$ToString)(SystemAddress* addr, bool writePort, char* dest, char portDelineator);
	void (*RakNet$RakPeer$GetConnectionList)(RakPeer* peer, SystemAddress* dest, uint16_t* size);
	void (*ScriptEngine$_processSystemUpdate)(ScriptEngine*);
	void (*string$_Tidy_deallocate)(String* str);
	void (*NetworkHandler$onConnectionClosed)(NetworkHandler*, const NetworkIdentifier&, bool);
	void (*ServerInstance$ServerInstance)(ServerInstance* server, IMinecraftApp*, ServerInstanceEventCoordinator&);
	void (*DedicatedServer$start)(String* str);
	void (*ScriptEngine$startScriptLoading)(ScriptEngine*);
	void (*MinecraftServerScriptEngine$onServerThreadStarted)(MinecraftServerScriptEngine*);

	// ?lower_bound@?$_Hash@V?$_Umap_traits@VNetworkIdentifier@@V?$unique_ptr@VClient@ServerNetworkHandler@@U?$default_delete@VClient@ServerNetworkHandler@@@std@@@std@@V?$_Uhash_compare@VNetworkIdentifier@@U?$hash@VNetworkIdentifier@@@std@@U?$equal_to@VNetworkIdentifier@@@3@@3@V?$allocator@U?$pair@$$CBVNetworkIdentifier@@V?$unique_ptr@VClient@ServerNetworkHandler@@U?$default_delete@VClient@ServerNetworkHandler@@@std@@@std@@@std@@@3@$0A@@std@@@std@@QEAA?AV?$_List_iterator@V?$_List_val@U?$_List_simple_types@U?$pair@$$CBVNetworkIdentifier@@V?$unique_ptr@VClient@ServerNetworkHandler@@U?$default_delete@VClient@ServerNetworkHandler@@@std@@@std@@@std@@@std@@@std@@@2@AEBVNetworkIdentifier@@@Z
	// class std::_List_iterator<class std::_List_val<struct std::_List_simple_types<struct std::pair<class NetworkIdentifier const ,class std::unique_ptr<class ServerNetworkHandler::Client,struct std::default_delete<class ServerNetworkHandler::Client> 
	// 
};

struct HookFunctionTable
{
	void (*hookOnUpdate)(void (*update)()) noexcept;
	void (*hookOnPacket)(void(*onPacket)(byte* rbp)) noexcept;
	void (*hookOnPacketRead)(PacketReadResult(*onPacketRead)(byte*, PacketReadResult, const NetworkIdentifier&)) noexcept;
	void (*hookOnPacketAfter)(void(*onPacketAfter)(byte*, ServerNetworkHandler*, const NetworkIdentifier&)) noexcept;
	void (*hookOnConnectionClosed)(void(*onclose)(const NetworkIdentifier&)) noexcept;
	void (*hookOnLoopStart)(void(*callback)(DedicatedServer *server, ServerInstance * instance)) noexcept;
	void (*hookOnScriptLoading)(void(*callback)()) noexcept;
	int (*makeScriptId)() noexcept;
};

extern MinecraftFunctionTable g_mcf;
extern const HookFunctionTable* g_hookf;