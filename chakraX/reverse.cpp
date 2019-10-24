#include "reverse.h"
#include "pdb.h"
#include "console.h"

#include <KR3/wl/windows.h>
#include <KR3/data/map.h>
#include <KRWin/hook.h>

using namespace kr;
using namespace hook;

ServerInstance* g_server;
MinecraftFunctionTable g_minecraftFunctionTable;


void* DataBuffer::getData() noexcept
{
	return type < 10 ? this : data;
}

Text ReadOnlyBinaryStream::getData() noexcept
{
	void* p = data->getData();
	return Text((char*)p + pointer, (char*)p + data->size);
}

String Certificate::getXuid() const noexcept
{
	String out;
	g_minecraftFunctionTable.ExtendedCertificate$getXuid(&out, *this);
	return out;
}
String Certificate::getId() const noexcept
{
	String out;
	g_minecraftFunctionTable.ExtendedCertificate$getIdentityName(&out, *this);
	return out;
}

ServerPlayer* ServerNetworkHandler::_getServerPlayer(NetworkIdentifier& ni, byte data) noexcept
{
	return g_minecraftFunctionTable.ServerNetworkHandler$_getServerPlayer(this, ni, data);
}

TText16 NetworkIdentifier::toString() const noexcept
{
	TText16 out(0_sz, sizeof(value));
	byte* p = (byte*)&value;
	byte* p_end = p + sizeof(value);
	do
	{
		out.push(*p++);
	} while (p != p_end);
	return out;
}

ServerNetworkHandler** NetworkHandler::getServer(uint32_t packetId) noexcept
{
	uint32_t serverIdx = (packetId >> 10) & 3;
	return servers[serverIdx];
}
Connection* NetworkHandler::getConnectionFromId(const NetworkIdentifier& ni) noexcept
{
	return g_minecraftFunctionTable.NetworkHandler$_getConnectionFromId(this, ni);
}
EncryptedNetworkPeer * NetworkHandler::getEncryptedPeerForUser(const NetworkIdentifier& ni) noexcept
{
	return g_minecraftFunctionTable.NetworkHandler$getEncryptedPeerForUser(this, ni);
}
TText SystemAddress::toString(bool writePort, char portDelineator) noexcept
{
	TText out(46_sz);
	g_minecraftFunctionTable.RakNet$SystemAddress$ToString(this, writePort, out.data(), portDelineator);
	out.resize(strlen(out.data()));
	return out;
}
TmpArray<SystemAddress> RakPeer::getConnections() noexcept
{
	TmpArray<SystemAddress> list;
	uint16_t size;
	g_minecraftFunctionTable.RakNet$RakPeer$GetConnectionList(this, nullptr, &size);
	if (size == 0) return list;
	list.resize(size);
	g_minecraftFunctionTable.RakNet$RakPeer$GetConnectionList(this, list.data(), &size);
	return list;
}

const char* String::data() noexcept
{
	return capacity >= 16 ? pointer : buffer;
}
Text String::text() noexcept
{
	const char * d = data();
	return Text(d, size);
}
void String::deallocate() noexcept
{
	g_minecraftFunctionTable.string$_Tidy_deallocate(this);
}
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

void MinecraftFunctionTable::loadFromPdb() noexcept
{
#define STRING "std::basic_string<char,std::char_traits<char>,std::allocator<char> >"

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
		{STRING "::_Tidy_deallocate", &string$_Tidy_deallocate},
	};

	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::_Construct<unsigned char const * __ptr64>
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::_Tidy_init
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::basic_string<char,std::char_traits<char>,std::allocator<char> >
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::assign
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::append<unsigned char * __ptr64,void>
	// std::basic_string<char,std::char_traits<char>,std::allocator<char> >::operator=

	PdbReader reader;
	reader.showInfo();
	reader.search(nullptr, [&](Text name, void* address) {
		switch (*name)
		{
		case 'N':
		case 'M':
		case 'S':
		case 'E':
		case 's':
		case 'R':
		case 'D':
			break;
		default:
			return true;
		}
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
		TText temp;
		name.replace(&temp, STRING, "string");
		temp.replace(&cout, "::", "$");
		cout << " = ptr(0x" << hexf((byte*)address - (byte*)reader.base()) << ");" << endl;
		if (dests.empty()) return false;
		return true;
	});

	if (!dests.empty())
	{
		ConsoleColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
		for (auto& item : dests)
		{
			cerr << item.first.cast<char>() << " = ?;" << endl;
		}
	}
#undef STRING
}
void MinecraftFunctionTable::load_1_12_0_28() noexcept
{
	HANDLE currentModule = GetModuleHandleW(nullptr);
	auto ptr = [&](intptr_t offset)->autoptr{
		return (byte*)currentModule + offset;
	};
	RakNet$RakPeer$GetConnectionList = ptr(0x9F810);
	NetworkHandler$_getConnectionFromId = ptr(0x1ED870);
	ServerNetworkHandler$_getServerPlayer = ptr(0x251DF0);
	NetworkHandler$onConnectionClosed = ptr(0x1EE220);
	ExtendedCertificate$getXuid = ptr(0x48FC0);
	NetworkHandler$_sortAndPacketizeEvents = ptr(0x1EDBC0);
	NetworkHandler$getEncryptedPeerForUser = ptr(0x1EEAF0);
	ServerInstance$ServerInstance = ptr(0x372590);
	ExtendedCertificate$getIdentityName = ptr(0x244360);
	DedicatedServer$start = ptr(0x502E0);
	RakNet$SystemAddress$ToString = ptr(0x9BEA0);
	string$_Tidy_deallocate = ptr(0x47D00);
	MinecraftPackets$createPacket = ptr(0x20A400);
	ScriptEngine$_processSystemUpdate = ptr(0x2AE740);
}

void binpatch(void * junctionPoint, Buffer originalCode, void* injectfn, kr::hook::Register tempregister, bool jump) noexcept
{
	size_t size = originalCode.size();
	Unprotector unpro(junctionPoint, size);
	if (memcmp(junctionPoint, originalCode.data(), size) != 0)
	{
		cerr << "chakraX: junction point code unmatch" << endl;
		debug();
		return;
	}

	CodeWriter writer((void*)unpro, size);
	if (jump) writer.jump(injectfn, tempregister);
	else writer.call(injectfn, tempregister);
	writer.fillNop();
}
void hookOnUpdate(void (*update)()) noexcept
{
	byte* junctionPoint = (byte*)g_minecraftFunctionTable.ScriptEngine$_processSystemUpdate + 0x28;
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x89, 0x45, 0xF8, // mov qword ptr[rbp - 8],rax
		0x48, 0x8B, 0xF1, // mov rsi,rcx
		0xB9, 0x04, 0x00, 0x00, 0x00, // mov ecx,4
	};
	void* fncode = ExecutableAllocator::getInstance()->alloc(64);
	memset(fncode, 0xcc, 64);
	CodeWriter junction(fncode, 64);
	junction.write(ORIGINAL_CODE, 7);
	junction.sub(RSP, 0x28);
	junction.call(update, RAX);
	junction.add(RSP, 0x28);
	junction.write(ORIGINAL_CODE+7, 5);
	junction.ret();

	binpatch(junctionPoint, ORIGINAL_CODE, fncode, RDX, false);
}
void hookOnPacket(void(*onPacket)(byte* rbp)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0xE8, 0x87, 0xC5, 0x01, 0x00, // call MinecraftPackets::createPacket
		0x90, // nop
		0x48, 0x83, 0xBD, 0x90, 0x00, 0x00, 0x00, 0x00, // cmp qword ptr ss:[rbp+90],0
	};
	void* fncode = ExecutableAllocator::getInstance()->alloc(64);
	memset(fncode, 0xcc, 64);
	CodeWriter junction(fncode, 64);
	junction.sub(RSP, 0x28);
	junction.call(g_minecraftFunctionTable.MinecraftPackets$createPacket, RAX);
	junction.mov(RCX, RBP); // rbp
	junction.call(onPacket, RAX);
	junction.add(RSP, 0x28);
	junction.write(ORIGINAL_CODE + 6, 8);
	junction.ret();

	binpatch((byte*)g_minecraftFunctionTable.NetworkHandler$_sortAndPacketizeEvents + 0x2b4, 
		ORIGINAL_CODE, fncode, RAX, false);
}
void hookOnPacketRead(PacketReadResult(*onPacketRead)(byte*, PacketReadResult, const NetworkIdentifier&)) noexcept
{
	byte* junctionPoint = (byte*)g_minecraftFunctionTable.NetworkHandler$_sortAndPacketizeEvents + 0x30e;
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
		0x48, 0x8D, 0x95, 0xA0, 0x00, 0x00, 0x00, // lea rdx,qword ptr ss:[rbp+A0]
		0xFF, 0x50, 0x20, // call qword ptr ds:[rax+20] (Packet::read)
	};
	void* fncode = ExecutableAllocator::getInstance()->alloc(64);
	memset(fncode, 0xcc, 64);
	CodeWriter junction(fncode, 64);
	junction.sub(RSP, 0x28);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.mov(RDX, RAX); // PacketReadResult
	junction.mov(RCX, RBP); // rbp
	junction.mov(R8, R13); // NetworkIdentifier
	junction.call(onPacketRead, RAX);
	junction.add(RSP, 0x28);
	junction.ret();

	binpatch(junctionPoint, ORIGINAL_CODE, fncode, RAX, false);
}
void hookOnPacketAfter(void(*onPacketAfter)(byte*, ServerNetworkHandler*, const NetworkIdentifier&)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x49, 0x8B, 0xD5, // mov rdx,r13
		0xFF, 0x50, 0x08, // call qword ptr ds:[rax+8]
		0x41, 0x80, 0xBD, 0xE0, 0x00, 0x00, 0x00, 0x00, // cmp byte ptr ds:[r13+E0],0
	};
	void* fncode = ExecutableAllocator::getInstance()->alloc(64);
	memset(fncode, 0xcc, 64);
	CodeWriter junction(fncode, 64);
	junction.sub(RSP, 0x28);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.mov(RCX, RBP); // rbp
	junction.mov(RDX, RSI); // ServerNetworkHandler
	junction.mov(R8, R13); // NetworkIdentifier
	junction.call(onPacketAfter, RAX);
	junction.add(RSP, 0x28);
	junction.ret();

	binpatch((byte*)g_minecraftFunctionTable.NetworkHandler$_sortAndPacketizeEvents + 0x405, 
		ORIGINAL_CODE, fncode, RDX, false);
}
void hookOnConnectionClosed(void(*onclose)(const NetworkIdentifier&)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0x89, 0x00, 0x02, 0x00, 0x00, // mov rcx,qword ptr ds:[rcx+200]
		0x4D, 0x8B, 0xF8, // mov r15,r8
		0x4C, 0x8B, 0xF2, // mov r14,rdx
	};
	void* fncode = ExecutableAllocator::getInstance()->alloc(64);
	memset(fncode, 0xcc, 64);
	CodeWriter junction(fncode, 64);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.push(RCX);
	junction.sub(RSP, 0x20);
	junction.mov(RCX, RDX);
	junction.call(onclose, RAX);
	junction.add(RSP, 0x20);
	junction.pop(RCX);
	junction.mov(RDX, R14);
	junction.ret();

	binpatch((byte*)g_minecraftFunctionTable.NetworkHandler$onConnectionClosed + 0x24, 
		ORIGINAL_CODE, fncode, RAX, false);
}
void hookOnStart(void(*callback)(ServerInstance * server)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x4C, 0x89, 0xBE, 0x10, 0x02, 0x00, 0x00, // mov qword ptr ds:[rsi+210],r15
		0x48, 0x81, 0xC4, 0x80, 0x00, 0x00, 0x00, // add rsp,80
		0x41, 0x5F, // pop r15
		0x5F, // pop rdi
		0x5E, // pop rsi
		0xC3, // ret
	};
	void* fncode = ExecutableAllocator::getInstance()->alloc(64);
	memset(fncode, 0xcc, 64);
	CodeWriter junction(fncode, 64);
	junction.push(RAX);
	junction.mov(RCX, RSI);
	junction.call(callback, RDX);
	junction.pop(RAX);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));

	binpatch((byte*)g_minecraftFunctionTable.ServerInstance$ServerInstance + 0x2B1,
		ORIGINAL_CODE, fncode, RAX, true);
}
void hookOnLoopStart(void(*callback)(byte* rbp)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0x7D, 0x28, // mov rdi,qword ptr ss:[rbp+28]
		0x66, 0x0F, 0x1F, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00, // nop word ptr ds:[rax+rax],ax
	};
	void* fncode = ExecutableAllocator::getInstance()->alloc(64);
	memset(fncode, 0xcc, 64);
	CodeWriter junction(fncode, 64);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.push(RCX);
	junction.sub(RSP, 0x20);
	junction.mov(RCX, RBP);
	junction.call(callback, RDX);
	junction.add(RSP, 0x20);
	junction.pop(RCX);
	junction.ret();
	binpatch((byte*)g_minecraftFunctionTable.DedicatedServer$start + 0x1F13,
		ORIGINAL_CODE, fncode, RAX, false);
}