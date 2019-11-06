#pragma once

#include "reverse.h"

struct MinecraftFunctionTable
{
	void loadFromPdb() noexcept;
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
	void (*NetworkHandler$onConnectionClosed)(NetworkHandler*, const NetworkIdentifier&, bool);
	void (*ServerInstance$ServerInstance)(ServerInstance* server, IMinecraftApp*, ServerInstanceEventCoordinator&);
	void (*DedicatedServer$start)(String* str);
	void (*ScriptEngine$startScriptLoading)(ScriptEngine*);
	void (*MinecraftServerScriptEngine$onServerThreadStarted)(MinecraftServerScriptEngine*);

	void (*std$string$string)(String* _this);
	void (*std$string$_Tidy_deallocate)(String* str);
	String* (*std$string$assign)(String* _this, const char* str, size_t size);
	String* (*std$string$append)(String* _this, const char* str, size_t size);
};

extern MinecraftFunctionTable g_mcf;

void hookOnUpdate(void(*update)()) noexcept;
void hookOnPacket(void(*onPacket)(byte* rbp)) noexcept;
void hookOnPacketRead(PacketReadResult(*onPacketRead)(byte*, PacketReadResult, const NetworkIdentifier&)) noexcept;
void hookOnPacketAfter(void(*onPacketAfter)(byte*, ServerNetworkHandler*, const NetworkIdentifier&)) noexcept;
void hookOnScriptLoading(void(*callback)()) noexcept;
int makeScriptId() noexcept;
void removeScriptExperientalCheck() noexcept;
void hookOnConnectionClosed(void(*onclose)(const NetworkIdentifier&)) noexcept;
void hookOnLoopStart_1_13(void(*callback)(DedicatedServer* server, ServerInstance* instance)) noexcept;
void hookOnLoopStart(void(*callback)(DedicatedServer* server, ServerInstance* instance)) noexcept;
