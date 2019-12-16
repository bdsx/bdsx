#pragma once

#include "reverse.h"

#include <KR3/main.h>
#include <KR3/util/dump.h>
#include <chrono>

struct MinecraftFunctionTable
{
	void load() noexcept;
	void loadFromPredefined() noexcept;
	void loadFromPdb() noexcept;
	void checkUnloaded() noexcept;

	void stopServer() noexcept;

	// skip when return true
	void hookOnUpdate(void(*update)()) noexcept;
	void hookOnPacketRaw(SharedPtr<Packet>* (*onPacket)(byte* rbp, MinecraftPacketIds id, NetworkHandler::Connection* conn)) noexcept;
	void hookOnPacketBefore(PacketReadResult(*onPacketRead)(byte*, PacketReadResult, NetworkHandler::Connection* conn)) noexcept;
	void hookOnPacketAfter(void(*onPacketAfter)(byte*, ServerNetworkHandler*, NetworkHandler::Connection* conn)) noexcept;
	void hookOnPacketSend(void(*callback)(NetworkHandler*, const NetworkIdentifier&, Packet*, unsigned char)) noexcept;
	void hookOnPacketSendInternal(NetworkHandler::Connection* (*callback)(NetworkHandler*, const NetworkIdentifier&, Packet*, String*)) noexcept;
	void hookOnScriptLoading(void(*callback)()) noexcept;
	void hookOnConnectionClosed(void(*onclose)(const NetworkIdentifier&)) noexcept;
	void hookOnConnectionClosedAfter(void(*onclose)(const NetworkIdentifier&)) noexcept;
	void hookOnLoopStart(void(*callback)(DedicatedServer* server, ServerInstance* instance)) noexcept;
	void hookOnRuntimeError(void(*callback)(void* google_breakpad$ExceptionHandler, EXCEPTION_POINTERS* ptr)) noexcept;
	// return error code
	void hookOnCommand(intptr_t(*callback)(MCRESULT* res, CommandContext* ctx)) noexcept;
	void hookOnActorRelease(void(*callback)(Actor* actor)) noexcept;
	void hookOnActorDestructor(void(*callback)(Actor* actor)) noexcept;
	void removeScriptExperientalCheck() noexcept;

	bool (*NetworkHandler$_sortAndPacketizeEvents)(NetworkHandler* _this, NetworkHandler::Connection&, std::chrono::nanoseconds);
	ServerPlayer* (*ServerNetworkHandler$_getServerPlayer)(ServerNetworkHandler* _this, const NetworkIdentifier&, byte data);
	EncryptedNetworkPeer* (*NetworkHandler$getEncryptedPeerForUser)(NetworkHandler* _this, const NetworkIdentifier&);
	NetworkHandler::Connection* (*NetworkHandler$_getConnectionFromId)(NetworkHandler* handler, const NetworkIdentifier&);
	String* (*ExtendedCertificate$getXuid)(String* out, const Certificate&);
	String* (*ExtendedCertificate$getIdentityName)(String* out, const Certificate&);
	void (*ServerInstance$_update)(ServerInstance*);
	void (*Minecraft$update)(Minecraft*);
	void (*NetworkHandler$onConnectionClosed)(NetworkHandler*, const NetworkIdentifier&, bool);
	void (*ServerInstance$ServerInstance)(ServerInstance* server, IMinecraftApp*, ServerInstanceEventCoordinator&);
	void (*DedicatedServer$start)(String* str);
	void (*ScriptEngine$startScriptLoading)(ScriptEngine*);
	void (*MinecraftServerScriptEngine$onServerThreadStarted)(MinecraftServerScriptEngine*);
	MCRESULT* (*MinecraftCommands$executeCommand)(MinecraftCommands * _this, MCRESULT* out, SharedPtr<CommandContext>, bool);
	void (*DedicatedServer$stop)(void* DedicatedServer_add_8);
	void (*NetworkHandler$send)(NetworkHandler*, const NetworkIdentifier*, Packet*, unsigned char);
	void (*NetworkHandler$_sendInternal)(const NetworkIdentifier*, Packet*, const String*);
	size_t (*NetworkIdentifier$getHash)(const NetworkIdentifier*);
	bool (*NetworkIdentifier$equals)(const NetworkIdentifier* a, const NetworkIdentifier* b);
	mce::UUID* (*Crypto$Random$generateUUID)(mce::UUID* dest);
	void (*Actor$_Actor)(Actor*);
	SharedPtr<Packet>* (*MinecraftPackets$createPacket)(SharedPtr<Packet>* dest, MinecraftPacketIds);
	AttributeInstance*(*BaseAttributeMap$getMutableInstance)(BaseAttributeMap* map, uint32_t);
	Dimension* (*Level$createDimension)(Level*, DimensionId);
	Actor* (*Level$fetchEntity)(Level* level, ActorUniqueID, bool);
	void* (*std$_Allocate$16)(size_t size);
	void (*LoopbackPacketSender$sendToClients)(LoopbackPacketSender*, const Vector<NetworkIdentifierWithSubId> *, Packet*);
	void (*ServerPlayer$sendNetworkPacket)(ServerPlayer*, Packet*);
	void (*Level$removeEntityReferences)(Actor*, bool);

	void (*std$string$_Tidy_deallocate)(String* str);
	String* (*std$string$assign)(String* _this, const char* str, size_t size);
	String* (*std$string$append)(String* _this, const char* str, size_t size);
	void (*free)(void*);
	void* (*malloc)(size_t size);

	void* google_breakpad$ExceptionHandler$WriteMinidumpOnHandlerThread;
	DedicatedServer** StopCommand$mServer;
	const Actor$VFTable* ServerPlayer$_vftable_;
};

extern MinecraftFunctionTable g_mcf;
extern ServerInstance* g_server;

