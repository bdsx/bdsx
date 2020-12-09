#pragma once

#include "reverse.h"
#include "codewrite.h"

#include <KR3/main.h>
#include <KR3/util/dump.h>
#include <KR3/data/map.h>
#include <KR3/meta/function.h>
#include <KRWin/hook.h>

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
	void hookOnPacketBefore(ExtendedStreamReadResult*(*onPacketRead)(ExtendedStreamReadResult*, OnPacketRBP*, MinecraftPacketIds)) noexcept;
	void hookOnPacketAfter(void(*onPacketAfter)(OnPacketRBP*, MinecraftPacketIds)) noexcept;
	void hookOnPacketSend(void(*callback)(NetworkHandler*, const NetworkIdentifier&, Packet*, unsigned char)) noexcept;
	void hookOnPacketSendInternal(NetworkHandler::Connection* (*callback)(NetworkHandler*, const NetworkIdentifier&, Packet*, String*)) noexcept;
	void hookOnConnectionClosedAfter(void(*onclose)(const NetworkIdentifier&)) noexcept;
	void hookOnRuntimeError(void(*callback)(EXCEPTION_POINTERS* ptr)) noexcept;
	// return error code
	void hookOnCommand(intptr_t(*callback)(MinecraftCommands* commands, MCRESULT* res, SharedPtr<CommandContext>* ctx, bool)) noexcept;
	void hookOnLog(void(*callback)(int color, const char * log, size_t size)) noexcept;
	void hookOnCommandPrint(void(*callback)(const char* log, size_t size)) noexcept;
	void hookOnCommandIn(void (*callback)(String* dest)) noexcept;
	void skipPacketViolationWhen7f() noexcept;
	void forceEnableScript() noexcept;

	bool (*NetworkHandler$_sortAndPacketizeEvents)(NetworkHandler* _this, NetworkHandler::Connection&, std::chrono::nanoseconds);
	ServerPlayer* (*ServerNetworkHandler$_getServerPlayer)(ServerNetworkHandler* _this, const NetworkIdentifier&, byte data);
	EncryptedNetworkPeer* (*NetworkHandler$getEncryptedPeerForUser)(NetworkHandler* _this, const NetworkIdentifier&);
	NetworkHandler::Connection* (*NetworkHandler$_getConnectionFromId)(NetworkHandler* handler, const NetworkIdentifier&);
	String* (*ExtendedCertificate$getXuid)(String* out, const Certificate&);
	String* (*ExtendedCertificate$getIdentityName)(String* out, const Certificate&);
	void (*ServerInstance$_update)(ServerInstance*);
	bool (*Minecraft$update)(Minecraft*);
	void (*NetworkHandler$onConnectionClosed)(NetworkHandler*, const NetworkIdentifier&, bool);
	void (*ServerInstance$ServerInstance)(ServerInstance* server, IMinecraftApp*, ServerInstanceEventCoordinator&);
	void (*DedicatedServer$start)(String* str);
	void (*ScriptEngine$startScriptLoading)(ScriptEngine*);
	bool (*ScriptEngine$isScriptingEnabled)(ScriptEngine*);
	MCRESULT* (*MinecraftCommands$executeCommand)(MinecraftCommands * _this, MCRESULT* out, SharedPtr<CommandContext>, bool);
	void (*DedicatedServer$stop)(void* DedicatedServer_8);
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
	void (*ServerInstance$startServerThread)(ServerInstance* inst);
	void (*MinecraftServerScriptEngine$onServerThreadStarted)(MinecraftServerScriptEngine*, ServerInstance*);
	PacketViolationResponse (*PacketViolationHandler$_handleViolation)(PacketViolationHandler*, MinecraftPacketIds, StreamReadResult, const NetworkIdentifier*, bool* out);
	ActorUniqueID*(*Actor$getUniqueID)(Actor* actor);

	void (*$_game_thread_lambda_$$_call_)(void* _this);
	void (*$_game_thread_start_t_)(void* _this);

	void (*std$_LaunchPad$_stdin_t_$_Execute$_0_)();
	void (*std$_Pad$_Release)(void* _this);
	void (*google_breakpad$ExceptionHandler$HandleException)();
	void (*google_breakpad$ExceptionHandler$HandleInvalidParameter)();

	void* (*std$_Allocate$_alloc16_)(size_t size);
	void (*std$string$_Tidy_deallocate)(String* str);
	String* (*std$string$assign)(String* _this, const char* str, size_t size);
	String* (*std$string$append)(String* _this, const char* str, size_t size);
	void (*std$string$resize)(String* _this, size_t size, char init);

	void (*free)(void*);
	void* (*malloc)(size_t size);
	void (*_Cnd_do_broadcast_at_thread_exit)();
	int (*main)(int argc, char** argv);
	void* ScriptEngine$initialize;
	int (*__scrt_common_main_seh)();

	DedicatedServer** StopCommand$mServer;
	const Actor$VFTable* ServerPlayer$$_vftable_;
};

class McftRenamer
{
private:
	kr::AText m_str2;
	kr::AText m_str1;

public:
	struct Entry {
		kr::Text name;
		void* (MinecraftFunctionTable::* target);
		size_t idx;
	};
	McftRenamer() noexcept;

	static kr::View<Entry> getEntires() noexcept;
	static kr::View<kr::Text> getReplaceMap() noexcept;
	kr::Text cppNameToVarName(kr::Text text) noexcept;
	kr::Text varNameToCppName(kr::Text text) noexcept;
};

extern MinecraftFunctionTable g_mcf;
extern ServerInstance* g_server;

namespace _bdsx_pri_
{
	struct CodeHookHelper
	{
		const kr::Text name;
		void* const fnptr;
		const kr::View<byte> originalCode;
		inline CodeHookHelper(kr::Text name, void* fnptr, kr::View<byte> originalCode) noexcept
			:name(name), fnptr(fnptr), originalCode(originalCode)
		{
		}

		template <typename LAMBDA>
		void operator =(LAMBDA lambda) const noexcept
		{
			using func_t = typename kr::meta::function<LAMBDA>::function_t;
			Code::hook(name, fnptr, (func_t)lambda, originalCode);
		}
	};
}

#define MCF_NOP(fname, offset, ...) Code::nopping(renamer.varNameToCppName(#fname), g_mcf.fname, offset, __VA_ARGS__);
#define MCF_HOOK(fname, paramCount, ...) _bdsx_pri_::CodeHookHelper(renamer.varNameToCppName(#fname), g_mcf.fname, paramCount,__VA_ARGS__) = []