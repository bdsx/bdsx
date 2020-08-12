#pragma once

#include "reverse.h"

#include <KR3/main.h>
#include <KR3/util/dump.h>
#include <KR3/data/map.h>
#include <chrono>

struct OnPacketRBP;

struct MinecraftFunctionTable
{
	void load() noexcept;
	bool isNotFullLoaded() noexcept;

	void stopServer() noexcept;

	// skip when return true
	void hookOnGameThreadCall(void(*thread)(void* pad, void* lambda)) noexcept;
	void hookOnProgramMainCall(int(*main)(int argn, char** argv)) noexcept;
	void hookOnUpdate(void(*update)(Minecraft* mc)) noexcept;
	void hookOnPacketRaw(SharedPtr<Packet>* (*onPacket)(OnPacketRBP*, MinecraftPacketIds, NetworkHandler::Connection*)) noexcept;
	void hookOnPacketBefore(ExtendedStreamReadResult*(*onPacketRead)(OnPacketRBP*, ExtendedStreamReadResult*, MinecraftPacketIds, NetworkHandler::Connection*)) noexcept;
	void hookOnPacketAfter(void(*onPacketAfter)(OnPacketRBP*, MinecraftPacketIds, NetworkHandler::Connection*)) noexcept;
	void hookOnPacketSend(void(*callback)(NetworkHandler*, const NetworkIdentifier&, Packet*, unsigned char)) noexcept;
	void hookOnPacketSendInternal(NetworkHandler::Connection* (*callback)(NetworkHandler*, const NetworkIdentifier&, Packet*, String*)) noexcept;
	void hookOnScriptLoading(void(*callback)()) noexcept;
	void hookOnConnectionClosed(void(*onclose)(NetworkHandler*, const NetworkIdentifier&, String*)) noexcept;
	void hookOnConnectionClosedAfter(void(*onclose)(const NetworkIdentifier&)) noexcept;
	void hookOnLoopStart(void(*callback)(ServerInstance* instance)) noexcept;
	void hookOnRuntimeError(void(*callback)(EXCEPTION_POINTERS* ptr)) noexcept;
	// return error code
	void hookOnCommand(intptr_t(*callback)(MCRESULT* res, CommandContext* ctx)) noexcept;
	void hookOnActorRelease(void(*callback)(Level* level, Actor* actor, bool b)) noexcept;
	void hookOnActorDestructor(void(*callback)(Actor* actor)) noexcept;
	void hookOnLog(void(*callback)(int color, const char * log, size_t size)) noexcept;
	void hookOnCommandPrint(void(*callback)(const char* log, size_t size)) noexcept;
	void hookOnCommandIn(void (*callback)(String* dest)) noexcept;
	void skipChangeCurDir() noexcept;
	void skipMakeConsoleObject() noexcept;
	void skipCommandListDestruction() noexcept;
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
	bool (*NetworkIdentifier$$_equals_)(const NetworkIdentifier* a, const NetworkIdentifier* b);
	mce::UUID* (*Crypto$Random$generateUUID)(mce::UUID* dest);
	void (*Actor$dtor$Actor)(Actor*);
	SharedPtr<Packet>* (*MinecraftPackets$createPacket)(SharedPtr<Packet>* dest, MinecraftPacketIds);
	AttributeInstance*(*BaseAttributeMap$getMutableInstance)(BaseAttributeMap* map, uint32_t);
	Dimension* (*Level$createDimension)(Level*, DimensionId);
	Actor* (*Level$fetchEntity)(Level* level, ActorUniqueID, bool);
	void (*LoopbackPacketSender$sendToClients)(LoopbackPacketSender*, const Vector<NetworkIdentifierWithSubId> *, Packet*);
	void (*ServerPlayer$sendNetworkPacket)(ServerPlayer*, Packet*);
	void (*Level$removeEntityReferences)(Actor*, bool);
	void (*BedrockLogOut)(unsigned int, char const*, ...);
	void (*CommandOutputSender$send)(CommandOutputSender* _this, const CommandOrigin* origin, const CommandOutput* output);
	void (*ScriptEngine$dtor$ScriptEngine)(ScriptEngine*);
	ActorUniqueID*(*Actor$getUniqueID)(Actor* actor);

	void (*$_game_thread_lambda_$$_call_)(void* _this);
	void (*$_game_thread_start_t_)(void* _this);

	void (*std$_LaunchPad$_stdin_t_$_Execute$_0_)();
	void (*std$_Pad$_Release)(void* _this);
	void (*google_breakpad$ExceptionHandler$HandleException)();

	void* (*std$_Allocate$_alloc16_)(size_t size);
	void (*std$string$_Tidy_deallocate)(String* str);
	String* (*std$string$assign)(String* _this, const char* str, size_t size);
	String* (*std$string$append)(String* _this, const char* str, size_t size);
	void (*std$string$resize)(String* _this, size_t size, char init);

	void (*free)(void*);
	void* (*malloc)(size_t size);
	int (*main)(int argc, char** argv);
	void* ScriptEngine$initialize;
	int (*__scrt_common_main_seh)();

	DedicatedServer** StopCommand$mServer;
	const Actor$VFTable* ServerPlayer$$_vftable_;
};

extern MinecraftFunctionTable g_mcf;
extern ServerInstance* g_server;

