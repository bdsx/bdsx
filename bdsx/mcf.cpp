
#include "mcf.h"
#include "console.h"
#include "pdb.h"
#include "codewrite.h"

#include <KR3/data/map.h>
#include <KR3/data/crypt.h>
#include <KRWin/hook.h>

using namespace kr;
using namespace hook;

MinecraftFunctionTable g_mcf;
ServerInstance* g_server;

bool checkCode(void* code, Buffer originalCode, Text name, View<pair<size_t, size_t>> skip) noexcept
{
	if (skip == nullptr)
	{
		if (memcmp(code, originalCode.data(), originalCode.size()) != 0) goto _fail;
	}
	else
	{
		size_t prev = 0;
		for (const pair<size_t, size_t>& sz : skip)
		{
			if (memcmp((byte*)code + prev, (byte*)originalCode.data() + prev, sz.first - prev) != 0) goto _fail;
			prev = sz.second;
		}
		if (memcmp((byte*)code + prev, (byte*)originalCode.data() + prev, originalCode.size() - prev) != 0) goto _fail;
	}
	return true;
_fail:
	ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
	cerr << "BDSX: " << name << " - function hooking failed" << endl;
	return false;
}



class Anchor
{
private:
	static constexpr size_t SIZE = 32;
	byte m_backup[SIZE];
	size_t m_size;
	Unprotector m_unpro;

public:
	Anchor(void* junctionPoint) noexcept
		:m_unpro(junctionPoint, SIZE)
	{
		memcpy(m_backup, junctionPoint, SIZE);
		CodeWriter writer(junctionPoint, SIZE);
		static void (*anchor)(Anchor * _this) = [](Anchor * _this){
			memcpy(_this->m_unpro, _this->m_backup, _this->SIZE);
			requestDebugger();
			debug();
		};
		writer.mov(RCX, (uintptr_t)this);
		writer.sub(RSP, 0x28);
		writer.call(anchor, RAX);
		writer.add(RSP, 0x28);
		m_size = (byte*)writer.end() - (byte*)junctionPoint;
	}
};

struct FunctionTarget
{
	void** dest;
	int skipCount;

	template <typename T>
	FunctionTarget(T* ptr, int skipCount = 0) noexcept
		:dest((void**)ptr), skipCount(skipCount)
	{
	}

};


void MinecraftFunctionTable::load() noexcept
{
#define MC_VERSION "1.14.1.4"
	TText16 moduleName = CurrentApplicationPath();
	BText<32> hash = (encoder::Hex)(TBuffer)encoder::Md5::hash(File::open(moduleName.data()));
	cout << "BDSX: bedrock_server.exe MD5 = " << hash << endl;

	if (hash == "B620DAF51666A7DD19CF3982752B2BE1")
	{
		cout << "BDSX: MD5 Hash Matched(Version == " MC_VERSION ")" << endl;
		loadFromPredefined();
#ifndef NDEBUG
		checkUnloaded();
#endif
	}
	else
	{
		{
			ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			cerr << "BDSX: MD5 Hash Not Matched(Version != " MC_VERSION ")" << endl;
		}
		loadFromPdb();
	}
	removeScriptExperientalCheck();
}
void MinecraftFunctionTable::loadFromPredefined() noexcept
{
	ModuleInfo ptr; MinecraftServerScriptEngine$onServerThreadStarted = ptr(0x417BE0);
	Level$fetchEntity = ptr(0x98C9A0);
	NetworkHandler$_getConnectionFromId = ptr(0x295C40);
	std$string$assign = ptr(0x4DCE0);
	ServerInstance$_update = ptr(0x430750);
	ServerNetworkHandler$_getServerPlayer = ptr(0x301570);
	NetworkHandler$onConnectionClosed = ptr(0x296570);
	ExtendedCertificate$getXuid = ptr(0x5FB80);
	NetworkHandler$_sortAndPacketizeEvents = ptr(0x295F10);
	MinecraftCommands$executeCommand = ptr(0x3A80D0);
	NetworkIdentifier$getHash = ptr(0x298E20);
	ServerPlayer$sendNetworkPacket = ptr(0x437850);
	ServerInstance$ServerInstance = ptr(0x42E230);
	ExtendedCertificate$getIdentityName = ptr(0x2F2460);
	NetworkHandler$getEncryptedPeerForUser = ptr(0x296F20);
	Actor$_Actor = ptr(0x48FF50);
	ScriptEngine$startScriptLoading = ptr(0x360AE0);
	ServerPlayer$_vftable_ = ptr(0xD64AB0);
	std$string$append = ptr(0x5C530);
	std$_Allocate$16 = ptr(0x4DBF0);
	Level$removeEntityReferences = ptr(0x98CCB0);
	DedicatedServer$start = ptr(0x55980);
	Crypto$Random$generateUUID = ptr(0x12BFC0);
	BaseAttributeMap$getMutableInstance = ptr(0x6AA8B0);
	NetworkHandler$_sendInternal = ptr(0x2971C0);
	Minecraft$update = ptr(0xA9C440);
	NetworkIdentifier$equals = ptr(0x5FB10);
	NetworkHandler$send = ptr(0x297100);
	std$string$_Tidy_deallocate = ptr(0x4DB40);
	StopCommand$mServer = ptr(0x13CEEB0);
	MinecraftPackets$createPacket = ptr(0x29B3B0);
	Level$createDimension = ptr(0x9871C0);
	DedicatedServer$stop = ptr(0x55330);
	LoopbackPacketSender$sendToClients = ptr(0x2939A0);
	google_breakpad$ExceptionHandler$HandleException = ptr(0xBD3DA0);
}
void MinecraftFunctionTable::loadFromPdb() noexcept
{
#define STRING "basic_string<char,std::char_traits<char>,std::allocator<char> >"

	Map<Text, FunctionTarget> dests = {
		{"NetworkHandler::_sortAndPacketizeEvents", &NetworkHandler$_sortAndPacketizeEvents},
		{"MinecraftPackets::createPacket", &MinecraftPackets$createPacket},
		{"ServerNetworkHandler::_getServerPlayer", &ServerNetworkHandler$_getServerPlayer},
		{"NetworkHandler::getEncryptedPeerForUser", &NetworkHandler$getEncryptedPeerForUser},
		{"NetworkHandler::_getConnectionFromId", &NetworkHandler$_getConnectionFromId},
		{"ExtendedCertificate::getXuid", &ExtendedCertificate$getXuid},
		{"ExtendedCertificate::getIdentityName", &ExtendedCertificate$getIdentityName},
		// {"ScriptEngine::_processSystemUpdate", &ScriptEngine$_processSystemUpdate},
		{"ServerInstance::_update", &ServerInstance$_update},
		{"Minecraft::update", &Minecraft$update},
		{"NetworkHandler::onConnectionClosed", {&NetworkHandler$onConnectionClosed, 1}},
		{"ServerInstance::ServerInstance", &ServerInstance$ServerInstance},
		{"DedicatedServer::start", &DedicatedServer$start},
		{"ScriptEngine::startScriptLoading", &ScriptEngine$startScriptLoading},
		{"MinecraftServerScriptEngine::onServerThreadStarted", &MinecraftServerScriptEngine$onServerThreadStarted},
		{"std::" STRING "::_Tidy_deallocate", &std$string$_Tidy_deallocate},
		{"std::" STRING "::assign", &std$string$assign},
		{"std::" STRING "::append", {&std$string$append, 1}},
		{"MinecraftCommands::executeCommand", &MinecraftCommands$executeCommand},
		{"DedicatedServer::stop", &DedicatedServer$stop},
		{"StopCommand::mServer", &StopCommand$mServer},
		{"NetworkHandler::send", &NetworkHandler$send},
		{"NetworkIdentifier::getHash", &NetworkIdentifier$getHash},
		{"NetworkIdentifier::operator==", &NetworkIdentifier$equals},
		{"Crypto::Random::generateUUID", &Crypto$Random$generateUUID},
		{"BaseAttributeMap::getMutableInstance", &BaseAttributeMap$getMutableInstance},
		{"Level::createDimension", &Level$createDimension},
		{"Actor::~Actor", &Actor$_Actor},
		{"Level::fetchEntity", &Level$fetchEntity},
		{"NetworkHandler::_sendInternal", &NetworkHandler$_sendInternal},
		{"std::_Allocate<16,std::_Default_allocate_traits,0>", &std$_Allocate$16},
		{"ServerPlayer::`vftable'", &ServerPlayer$_vftable_},
		{"ServerPlayer::sendNetworkPacket", &ServerPlayer$sendNetworkPacket},
		{"LoopbackPacketSender::sendToClients", &LoopbackPacketSender$sendToClients},
		{"Level::removeEntityReferences", &Level$removeEntityReferences},
		{"google_breakpad::ExceptionHandler::HandleException", &google_breakpad$ExceptionHandler$HandleException},
	};
	
	static void (* const printFuncName)(Text) = [](Text name){
		TText temp;
		name.replace(&temp, STRING, "string");
		TText temp2;
		temp.replace(&temp2, "operator==", "equals");

		temp2.change('~', '_');
		temp2.change('`', '_');
		temp2.change('\'', '_');
		temp2.change(' ', '_');
		temp2.replace(&kr::cout, "::", "$");
	};

	{
		auto iter = dests.begin();
		auto end = dests.end();
		while (iter != end)
		{
			if (*iter->second.dest != nullptr)
			{
				iter = dests.erase(iter);
			}
			else
			{
				iter++;
			}
		}
	}

	PdbReader reader;
	reader.showInfo();
	reader.search(nullptr, [&](Text name, void* address, uint32_t typeId) {
		auto iter = dests.find(name);
		if (iter == dests.end())
		{
			return true;
		}
		if (iter->second.skipCount)
		{
			iter->second.skipCount--;
			return true;
		}
		*iter->second.dest = address;

		dests.erase(iter);
		printFuncName(name);
		cout << " = ptr(0x" << hexf((byte*)address - (byte*)reader.base()) << ");" << endl;
		if (dests.empty()) return false;
		return true;
		});

	if (!dests.empty())
	{
		ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
		for (auto& item : dests)
		{
			printFuncName((Text)item.first);
			cout << " = ?;" << endl;
		}
	}
#undef STRING
}
void MinecraftFunctionTable::checkUnloaded() noexcept
{
	void** iter = (void**)(this);
	void** end = (void**)(this + 1);
	for (; iter != end; iter++)
	{
		if (*iter == nullptr)
		{
			loadFromPdb();
			break;
		}
	}
}
void MinecraftFunctionTable::stopServer() noexcept
{
	g_mcf.DedicatedServer$stop((byte*)g_server->server + 8);
}

void MinecraftFunctionTable::hookOnUpdate(void(*update)(Minecraft* mc)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0xE8, 0xFF, 0xFF, 0xFF, 0xFF,				// call Minecraft::update
		0x41, 0x8B, 0x87, 0x88, 0x00, 0x00, 0x00,   // mov eax,dword ptr ds:[r15+88]
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.call(update, RAX);
	junction.add(RSP, 0x28);
	junction.write(ORIGINAL_CODE + 5, 7);
	junction.ret();
	junction.patchTo((byte*)ServerInstance$_update + 0x16E
		, ORIGINAL_CODE, RAX, false, "internalUpdate", { {1, 5} });
};
void MinecraftFunctionTable::hookOnPacketRaw(SharedPtr<Packet>* (*onPacket)(byte* rbp, MinecraftPacketIds id, NetworkHandler::Connection* conn)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x8B, 0xD7, // mov edx,edi
		0x48, 0x8D, 0x8D, 0x90, 0x00, 0x00, 0x00, // lea rcx,qword ptr ss:[rbp+90]
		0xE8, 0xFF, 0xFF, 0xFF, 0xFF, // call MinecraftPackets::createPacket
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.mov(RCX, RBP); // rbp
	junction.mov(RDX, RDI); // packetId
	junction.mov(R8, R13); // Connection
	junction.call(onPacket, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchTo((byte*)NetworkHandler$_sortAndPacketizeEvents + 0x2ab,
		ORIGINAL_CODE, RAX, false, "onPacketRaw", { {10, 14} });
};
void MinecraftFunctionTable::hookOnPacketBefore(PacketReadResult(*onPacketRead)(byte*, PacketReadResult, NetworkHandler::Connection* conn)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
		0x48, 0x8D, 0x95, 0xA0, 0x00, 0x00, 0x00, // lea rdx,qword ptr ss:[rbp+A0]
		0xFF, 0x50, 0x20, // call qword ptr ds:[rax+20] (Packet::read)
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.write(ORIGINAL_CODE);
	junction.mov(RDX, RAX); // PacketReadResult
	junction.mov(RCX, RBP); // rbp
	junction.mov(R8, R13); // Connection
	junction.call(onPacketRead, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchTo((byte*)NetworkHandler$_sortAndPacketizeEvents + 0x30e
		, ORIGINAL_CODE, RAX, false, "onPacketBefore");
};
void MinecraftFunctionTable::hookOnPacketAfter(void(*onPacketAfter)(byte*, ServerNetworkHandler*, NetworkHandler::Connection* conn)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x49, 0x8B, 0xD5, // mov rdx,r13
		0xFF, 0x50, 0x08, // call qword ptr ds:[rax+8]
		0x41, 0x80, 0xBD, 0xF0, 0x00, 0x00, 0x00, 0x00, // cmp byte ptr ds:[r13+F0],0
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.write(ORIGINAL_CODE);
	junction.mov(RCX, RBP); // rbp
	junction.mov(RDX, RSI); // ServerNetworkHandler
	junction.mov(R8, R13); // Connection
	junction.call(onPacketAfter, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchTo((byte*)NetworkHandler$_sortAndPacketizeEvents + 0x405,
		ORIGINAL_CODE, RDX, false, "onPacketAfter");
};
void MinecraftFunctionTable::hookOnPacketSend(void(*callback)(NetworkHandler*, const NetworkIdentifier&, Packet*, unsigned char)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0x81, 0x48, 0x02, 0x00, 0x00, // mov rax,qword ptr ds:[rcx+248]
		0x48, 0x8B, 0xD9, // mov rbx,rcx
		0x41, 0x0F, 0xB6, 0xE9, // movzx ebp,r9b
		0x49, 0x8B, 0xF8, // mov rdi,r8
		0x4C, 0x8B, 0xF2, // mov r14,rdx
	};
	Code junction(64);
	junction.write(ORIGINAL_CODE + 7, 13);
	junction.sub(RSP, 0x28);
	junction.call(callback, RAX);
	junction.add(RSP, 0x28);
	junction.mov(RAX, QwordPtr, RBX, 0x248);
	junction.mov(R8, RDI);
	junction.ret();
	junction.patchTo((byte*)NetworkHandler$send + 0x1A,
		ORIGINAL_CODE, RAX, false, "sendPacket");
};
void MinecraftFunctionTable::hookOnPacketSendInternal(NetworkHandler::Connection* (*callback)(NetworkHandler*, const NetworkIdentifier&, Packet*, String*)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x49, 0x8B, 0xF8, // mov rdi,r8
		0x4C, 0x8B, 0xF2, // mov r14,rdx
		0x48, 0x8B, 0xF1, // mov rsi,rcx
		0xE8, 0xFF, 0xFF, 0xFF, 0xFF, // call NetworkHandler$_getConnectionFromId
	};
	Code junction(64);
	junction.mov(RDI, R8);
	junction.mov(R14, RDX);
	junction.mov(RSI, RCX);
	junction.sub(RSP, 0x28);
	junction.call(callback, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchTo((byte*)NetworkHandler$_sendInternal + 13,
		ORIGINAL_CODE, RAX, false, "sendPacketInternal", { {10, 14} });
};
void MinecraftFunctionTable::hookOnScriptLoading(void(*callback)()) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0xBF, 0x04, 0x00, 0x00, 0x00, // mov edi,4
		0x65, 0x48, 0x8B, 0x04, 0x25, 0x58, 0x00, 0x00, 0x00, // mov rax,qword ptr gs:[58]
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.call(callback, RAX);
	junction.add(RSP, 0x28);
	junction.write(ORIGINAL_CODE);
	junction.ret();
	junction.patchTo((byte*)ScriptEngine$startScriptLoading + 28,
		ORIGINAL_CODE, RAX, false, "scriptLoading");
};
void MinecraftFunctionTable::hookOnConnectionClosed(void(*onclose)(const NetworkIdentifier&)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x45, 0x0F, 0xB6, 0xF9, // movzx r15d,r9b
		0x49, 0x8B, 0xF8, // mov rdi,r8
		0x48, 0x8B, 0xEA, // mov rbp,rdx
		0x48, 0x8B, 0xF1, // mov rsi,rcx
	};
	Code junction(64);
	junction.write(ORIGINAL_CODE);
	junction.push(RCX);
	junction.sub(RSP, 0x20);
	junction.mov(RCX, RDX);
	junction.call(onclose, RAX);
	junction.add(RSP, 0x20);
	junction.pop(RCX);
	junction.ret();
	junction.patchTo((byte*)NetworkHandler$onConnectionClosed + 0x16,
		ORIGINAL_CODE, RAX, false, "onConnectionClosed");
};
void MinecraftFunctionTable::hookOnConnectionClosedAfter(void(*onclose)(const NetworkIdentifier&)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x5D, // pop rbp
		0x5B, // pop rbx
		0xc3, // ret
		0xCC, // int 3
		0xCC, // int 3
		0xCC, // int 3
		0xCC, // int 3
		0xCC, // int 3
		0xCC, // int 3
		0xCC, // int 3
		0xCC, // int 3
		0xCC, // int 3
		0xCC, // int 3
	};
	Code junction(64);
	junction.mov(RCX, RBP);
	junction.pop(RBP);
	junction.pop(RBX);
	junction.jump(onclose, RAX);
	junction.patchTo((byte*)NetworkHandler$onConnectionClosed + 0xE3,
		ORIGINAL_CODE, RAX, true, "onConnectionClosedAfter");
}
void MinecraftFunctionTable::hookOnLoopStart(void(*callback)(ServerInstance* instance)) noexcept
{
	void(*caller)(byte*, void(*callback)(ServerInstance * instance)) =
		[](byte* rbp, void(*callback)(ServerInstance* instance)) {
		callback((ServerInstance*)(rbp + 0x2100));
	};
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x89, 0x45, 0x00, // mov qword ptr ss:[rbp],rax
		0x4C, 0x8B, 0x6D, 0xF0, // mov r13,qword ptr ss:[rbp-10]
		0x4D, 0x85, 0xED, // test r13,r13
		0x0F, 0x95, 0x45, 0x82, // setne byte ptr ss:[rbp-7E]
	};
	Code junction(64);
	junction.write(ORIGINAL_CODE);
	junction.push(RAX);
	junction.push(RCX);
	junction.sub(RSP, 0x28);
	junction.mov(RDX, (uintptr_t)callback);
	junction.mov(RCX, RBP);
	junction.call(caller, RAX);
	junction.add(RSP, 0x28);
	junction.pop(RCX);
	junction.pop(RAX);
	junction.ret();
	junction.patchTo((byte*)DedicatedServer$start + 0x22c6,
		ORIGINAL_CODE, RDX, false, "serverStart");
};
void MinecraftFunctionTable::hookOnRuntimeError(void(*callback)(EXCEPTION_POINTERS* ptr)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x41, 0xFF, 0xD2,	// call r10
		0x48, 0x8B, 0x8B, 0x20, 0x01, 0x00, 0x00, // mov rcx,qword ptr[rbx + 120h]
		0x45, 0x33, 0xC0,	// xor r8d,r8d
	};
	void* target = (byte*)google_breakpad$ExceptionHandler$HandleException;
	Unprotector unpro(target, 12); 
	CodeWriter code(target, 12);
	code.jump(callback, RAX);
};
void MinecraftFunctionTable::hookOnCommand(intptr_t(*callback)(MCRESULT* res, CommandContext* ctx)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		// 0x4C, 0x8B, 0xF2, // mov r14,rdx
		// 0x4C, 0x8B, 0xF9, // mov r15,rcx
		0x4C, 0x89, 0x45, 0xB0, // mov qword ptr ss:[rbp-50],r8
		0x49, 0x8B, 0x00, // mov rax,qword ptr ds:[r8]
		0x48, 0x8B, 0x48, 0x20, // mov rcx,qword ptr ds:[rax+20]
		0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
		0xFF, 0x90, 0xA0, 0x00, 0x00, 0x00, // call qword ptr ds:[rax+A0]
		0x48, 0x8B, 0xF8, // mov rdi,rax
	};

	Code junction(96);
	junction.sub(RSP, 0x28);
	junction.write(ORIGINAL_CODE);
	junction.mov(RCX, R14);
	junction.mov(RAX, QwordPtr, RBP, -0x50);
	junction.mov(RDX, QwordPtr, RAX);
	junction.call(callback, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchToBoolean(
		(byte*)MinecraftCommands$executeCommand + 0x40,
		RAX, (byte*)MinecraftCommands$executeCommand + 0x76d,
		ORIGINAL_CODE, RAX, "command");
};
void MinecraftFunctionTable::hookOnActorRelease(void(*callback)(Actor* actor)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x80, 0xB9, 0x60, 0x1E, 0x00, 0x00, 0x00, // cmp byte ptr ds:[rcx+1E60],0
		0x45, 0x0F, 0xB6, 0xF8, // movzx r15d,r8b
		0x48, 0x8B, 0xDA, // mov rbx,rdx
		0x4C, 0x8B, 0xF1, // mov r14,rcx
	};

	Code junction(64);
	junction.write(ORIGINAL_CODE+7, sizeof(ORIGINAL_CODE)-7);
	junction.sub(RSP, 0x28);
	junction.mov(RCX, RDX);
	junction.call(callback, RAX);
	junction.mov(RCX, R14);
	junction.add(RSP, 0x28);
	junction.lea(R11, RSP, 0xb0);
	junction.write(ORIGINAL_CODE, 7);
	junction.ret();
	junction.patchTo(
		(byte*)Level$removeEntityReferences + 0x1E,
		ORIGINAL_CODE, RAX, false, "ActorRelease");
}
void MinecraftFunctionTable::hookOnActorDestructor(void(*callback)(Actor* actor)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x89, 0x5C, 0x24, 0x48, // mov qword ptr ss:[rsp+48],rbx
		0x48, 0x89, 0x74, 0x24, 0x50, // mov qword ptr ss:[rsp+50],rsi
		0x48, 0x8B, 0xF9, // mov rdi,rcx      
	};

	Code junction(64);
	junction.mov(QwordPtr, RSP, 0x50, RBX);
	junction.mov(QwordPtr, RSP, 0x58, RSI);
	junction.mov(RDI, RCX);
	junction.sub(RSP, 0x28);
	junction.call(callback, RAX);
	junction.add(RSP, 0x28);
	junction.mov(RCX, RDI);
	junction.ret();
	junction.patchTo(
		(byte*)Actor$_Actor + 0xF,
		ORIGINAL_CODE, RAX, false, "ActorDestructor");
}

void MinecraftFunctionTable::removeScriptExperientalCheck() noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0xCE, // mov rcx,rsi
		0xE8, 0xFF, 0xFF, 0xFF, 0xFF, // Level::hasExperimentalGameplayEnabled
		0x84, 0xC0, // test al,al
		0x0F, 0x84, 0x3C, 0x01, 0x00, 0x00, // je bedrock_server.7FF6FCB29198
	};
	Unprotector unpro((byte*)MinecraftServerScriptEngine$onServerThreadStarted + 0x4c, sizeof(ORIGINAL_CODE));
	if (!checkCode(unpro, ORIGINAL_CODE, "removeScriptExperientalCheck", { {4, 8} })) return;
	memset(unpro, 0x90, sizeof(ORIGINAL_CODE));
};
