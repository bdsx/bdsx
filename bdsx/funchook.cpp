#include "funchook.h"
#include "console.h"
#include "pdb.h"

#include <KR3/data/map.h>
#include <KRWin/hook.h>

using namespace kr;
using namespace hook;

MinecraftFunctionTable g_mcf;

bool checkCode(void * code, Buffer originalCode, Text name) noexcept
{
	if (memcmp(code, originalCode.data(), originalCode.size()) != 0)
	{
		ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
		cerr << "chakraX: " << name << " - function hooking failed" << endl;
		return false;
	}
	return true;
}

class Code :public CodeWriter
{
private:
	void* m_codeptr;

public:
	Code(size_t size) noexcept
		:CodeWriter(ExecutableAllocator::getInstance()->alloc(size), size)
	{
		m_codeptr = end();
		memset(m_codeptr, 0xcc, 64);
	}
	void patchTo(void* junctionPoint, Buffer originalCode, kr::hook::Register tempregister, bool jump, Text name) noexcept
	{
		size_t size = originalCode.size();
		Unprotector unpro(junctionPoint, size);
		if (!checkCode(junctionPoint, originalCode, name)) return;

		CodeWriter writer((void*)unpro, size);
		if (jump) writer.jump(m_codeptr, tempregister);
		else writer.call(m_codeptr, tempregister);
		writer.fillNop();
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

void hookOnUpdate(void(*update)()) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x89, 0x45, 0xF8, // mov qword ptr[rbp - 8],rax
		0x48, 0x8B, 0xF1, // mov rsi,rcx
		0xB9, 0x04, 0x00, 0x00, 0x00, // mov ecx,4
	};
	Code junction(64);
	junction.write(ORIGINAL_CODE, 7);
	junction.sub(RSP, 0x28);
	junction.call(update, RAX);
	junction.add(RSP, 0x28);
	junction.write(ORIGINAL_CODE + 7, 5);
	junction.ret();
	junction.patchTo((byte*)g_mcf.ScriptEngine$_processSystemUpdate + 0x28
		, ORIGINAL_CODE, RDX, false, "internalUpdate");
}
void hookOnPacket(void(*onPacket)(byte* rbp)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0xE8, 0x87, 0xC5, 0x01, 0x00, // call MinecraftPackets::createPacket
		0x90, // nop
		0x48, 0x83, 0xBD, 0x90, 0x00, 0x00, 0x00, 0x00, // cmp qword ptr ss:[rbp+90],0
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.call(g_mcf.MinecraftPackets$createPacket, RAX);
	junction.mov(RCX, RBP); // rbp
	junction.call(onPacket, RAX);
	junction.add(RSP, 0x28);
	junction.write(ORIGINAL_CODE + 6, 8);
	junction.ret();
	junction.patchTo((byte*)g_mcf.NetworkHandler$_sortAndPacketizeEvents + 0x2b4,
		ORIGINAL_CODE, RAX, false, "onPacketCreate");
}
void hookOnPacketRead(PacketReadResult(*onPacketRead)(byte*, PacketReadResult, const NetworkIdentifier&)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
		0x48, 0x8D, 0x95, 0xA0, 0x00, 0x00, 0x00, // lea rdx,qword ptr ss:[rbp+A0]
		0xFF, 0x50, 0x20, // call qword ptr ds:[rax+20] (Packet::read)
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.mov(RDX, RAX); // PacketReadResult
	junction.mov(RCX, RBP); // rbp
	junction.mov(R8, R13); // NetworkIdentifier
	junction.call(onPacketRead, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchTo((byte*)g_mcf.NetworkHandler$_sortAndPacketizeEvents + 0x30e
		, ORIGINAL_CODE, RAX, false, "onPacketRead");
}
void hookOnPacketAfter(void(*onPacketAfter)(byte*, ServerNetworkHandler*, const NetworkIdentifier&)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x49, 0x8B, 0xD5, // mov rdx,r13
		0xFF, 0x50, 0x08, // call qword ptr ds:[rax+8]
		0x41, 0x80, 0xBD, 0xF0, 0x00, 0x00, 0x00, 0x00, // cmp byte ptr ds:[r13+F0],0
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.mov(RCX, RBP); // rbp
	junction.mov(RDX, RSI); // ServerNetworkHandler
	junction.mov(R8, R13); // NetworkIdentifier
	junction.call(onPacketAfter, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchTo((byte*)g_mcf.NetworkHandler$_sortAndPacketizeEvents + 0x405,
		ORIGINAL_CODE, RDX, false, "onPacketAfter");
}
void hookOnScriptLoading(void(*callback)()) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0xBF, 0x04, 0x00, 0x00, 0x00, // mov edi,4
		0x65, 0x48, 0x8B, 0x04, 0x25, 0x58, 0x00, 0x00, 0x00, // mov rax,qword ptr gs:[58]
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.call(callback, RAX);
	junction.add(RSP, 0x28);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.ret();
	junction.patchTo((byte*)g_mcf.ScriptEngine$startScriptLoading + 28,
		ORIGINAL_CODE, RAX, false, "scriptLoading");
}
int makeScriptId() noexcept
{
	return ++(g_serverInstance->scriptEngine->chakra->scriptCounter);
}
void removeScriptExperientalCheck() noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0xCE, // mov rcx,rsi
		0xE8, 0xAC, 0x44, 0x56, 0x00, // call < bedrock_server.public: bool __cde
		0x84, 0xC0, // test al,al
		0x0F, 0x84, 0x3C, 0x01, 0x00, 0x00, // je bedrock_server.7FF6FCB29198
	};
	Unprotector unpro((byte*)g_mcf.MinecraftServerScriptEngine$onServerThreadStarted + 0x4c, sizeof(ORIGINAL_CODE));
	if (!checkCode(unpro, ORIGINAL_CODE, "removeScriptExperientalCheck")) return;
	memset(unpro, 0x90, sizeof(ORIGINAL_CODE));
}
void hookOnConnectionClosed(void(*onclose)(const NetworkIdentifier&)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0xFA, // mov rdi,rdx
		0x48, 0x8B, 0xE9, // mov rbp,rcx
		0x48, 0x8B, 0x89, 0x50, 0x02, 0x00, 0x00, // mov rcx,qword ptr ds:[rcx+250]
	};
	Code junction(64);
	junction.mov(RDI, RDX);
	junction.mov(RBP, RCX);
	junction.mov(RCX, RDX);
	junction.sub(RSP, 0x28);
	junction.call(onclose, RAX);
	junction.add(RSP, 0x28);
	junction.mov(RDX, RDI);
	junction.mov(RCX, QwordPtr, RBP, 0x250);
	junction.ret();
	junction.patchTo((byte*)g_mcf.NetworkHandler$onConnectionClosed + 0x1D,
		ORIGINAL_CODE, RAX, false, "onConnectionClosed");
}
void hookOnLoopStart_1_13(void(*callback)(DedicatedServer* server, ServerInstance* instance)) noexcept
{
	void(*caller)(byte*, void(*callback)(DedicatedServer * server, ServerInstance * instance)) =
		[](byte* rbp, void(*callback)(DedicatedServer* server, ServerInstance* instance)) {
		callback(*(DedicatedServer**)(rbp + 0x98), (ServerInstance*)(rbp + 0x2170));
	};
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0x9D, 0xB8, 0x00, 0x00, 0x00, // mov rbx,qword ptr ss:[rbp+B8]
		0x0F, 0x1F, 0x80, 0x00, 0x00, 0x00, 0x00, // nop dword ptr ds:[rax],eax
	};
	Code junction(64);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.push(RCX);
	junction.sub(RSP, 0x20);
	junction.mov(RDX, (uintptr_t)callback);
	junction.mov(RCX, RBP);
	junction.call(caller, RAX);
	junction.add(RSP, 0x20);
	junction.pop(RCX);
	junction.ret();
	junction.patchTo((byte*)g_mcf.DedicatedServer$start + 0x23F2,
		ORIGINAL_CODE, RAX, false, "serverStart");
}
void hookOnLoopStart(void(*callback)(DedicatedServer* server, ServerInstance* instance)) noexcept
{
	void(*caller)(byte*, void(*callback)(DedicatedServer * server, ServerInstance * instance)) =
		[](byte* rbp, void(*callback)(DedicatedServer* server, ServerInstance* instance)) {
		callback(*(DedicatedServer**)(rbp + 0x98), (ServerInstance*)(rbp + 0x2170));
	};
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0x9D, 0xB8, 0x00, 0x00, 0x00, // mov rbx,qword ptr ss:[rbp+B8]
		0x0F, 0x1F, 0x80, 0x00, 0x00, 0x00, 0x00, // nop dword ptr ds:[rax],eax
	};
	Code junction(64);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.push(RCX);
	junction.sub(RSP, 0x20);
	junction.mov(RDX, (uintptr_t)callback);
	junction.mov(RCX, RBP);
	junction.call(caller, RAX);
	junction.add(RSP, 0x20);
	junction.pop(RCX);
	junction.ret();
	junction.patchTo((byte*)g_mcf.DedicatedServer$start + 0x23F2,
		ORIGINAL_CODE, RAX, false, "serverStart");
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
		{"RakNet::SystemAddress::ToString", &RakNet$SystemAddress$ToString},
		{"RakNet::RakPeer::GetConnectionList", &RakNet$RakPeer$GetConnectionList},
		{"ScriptEngine::_processSystemUpdate", &ScriptEngine$_processSystemUpdate},
		{"NetworkHandler::onConnectionClosed", {&NetworkHandler$onConnectionClosed, 1}},
		{"ServerInstance::ServerInstance", &ServerInstance$ServerInstance},
		{"DedicatedServer::start", &DedicatedServer$start},
		{"ScriptEngine::startScriptLoading", &ScriptEngine$startScriptLoading},
		{"MinecraftServerScriptEngine::onServerThreadStarted", &MinecraftServerScriptEngine$onServerThreadStarted},
		{"std::" STRING "::_Tidy_deallocate", &std$string$_Tidy_deallocate},
		{"std::" STRING "::assign", &std$string$assign},
		{"std::" STRING "::append", {&std$string$append, 1}},
		{"std::" STRING "::" STRING, {&std$string$string, 1}},
	};

	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::_Construct<unsigned char const * __ptr64>
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::_Tidy_init
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::basic_string<char,std::char_traits<char>,std::allocator<char> >
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::assign
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::append<unsigned char * __ptr64,void>
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::operator=

	static void (* const printFuncName)(Text) = [](Text name){
		TText temp;
		name.replace(&temp, STRING, "string");
		temp.replace(&kr::cout, "::", "$");
	};

	PdbReader reader;
	reader.showInfo();
	reader.search(nullptr, [&](Text name, void* address) {
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
			printFuncName(item.first.cast<char>());
			cout << " = ?;" << endl;
		}
	}
#undef STRING
}
void MinecraftFunctionTable::load_1_13_0_34() noexcept
{
	HANDLE currentModule = GetModuleHandleW(nullptr);
	auto ptr = [&](intptr_t offset)->autoptr {
		return (byte*)currentModule + offset;
	};

	RakNet$RakPeer$GetConnectionList = ptr(0xA34E0);
	MinecraftServerScriptEngine$onServerThreadStarted = ptr(0x409000);
	NetworkHandler$_getConnectionFromId = ptr(0x289EA0);
	std$string$assign = ptr(0x4E590);
	ServerNetworkHandler$_getServerPlayer = ptr(0x2F5CE0);
	NetworkHandler$onConnectionClosed = ptr(0x28A7A0);
	ExtendedCertificate$getXuid = ptr(0x600B0);
	NetworkHandler$_sortAndPacketizeEvents = ptr(0x28A140);
	ServerInstance$ServerInstance = ptr(0x41F640);
	ExtendedCertificate$getIdentityName = ptr(0x2E6970);
	NetworkHandler$getEncryptedPeerForUser = ptr(0x28B1A0);
	ScriptEngine$startScriptLoading = ptr(0x352270);
	std$string$string = ptr(0x542A0);
	std$string$append = ptr(0x5C9D0);
	DedicatedServer$start = ptr(0x561E0);
	RakNet$SystemAddress$ToString = ptr(0xA0000);
	std$string$_Tidy_deallocate = ptr(0x4E3F0);
	MinecraftPackets$createPacket = ptr(0x28F840);
	ScriptEngine$_processSystemUpdate = ptr(0x34FF20);

#ifndef NDEBUG
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
#endif

	removeScriptExperientalCheck();
}
