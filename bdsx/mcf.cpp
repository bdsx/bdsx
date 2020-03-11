
#include "mcf.h"
#include "console.h"
#include "codewrite.h"
#include "gen/version.h"

#include <KR3/data/map.h>
#include <KR3/data/crypt.h>
#include <KR3/io/selfbufferedstream.h>
#include <KR3/util/pdb.h>
#include <KRWin/hook.h>
#include <KRWin/handle.h>

/*
BedrockLog::log
common::getServerVersionString()
PermissionsFile
WhitelistFile

permissions.json
server.properties
whitelist.json
*/

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
	Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
	console.log(TSZ() << "BDSX: " << name << " - function hooking failed\n");
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

class Renamer
{
private:
	AText m_str2;
	AText m_str1;

public:
	struct Entry {
		Text name;
		void* (MinecraftFunctionTable::*target);
		size_t idx;
	};
	Renamer() noexcept
	{
		m_str2.reserve(32);
		m_str1.reserve(32);
	}

	static View<Entry> getEntires() noexcept
	{
#define ENTRY(x) {#x, (void* (MinecraftFunctionTable::*))&MinecraftFunctionTable::x, 0}
#define ENTRY_IDX(x, n) {#x, (void* (MinecraftFunctionTable::*))&MinecraftFunctionTable::x, n}
		static const Entry entries[] = {
			ENTRY(NetworkHandler$_sortAndPacketizeEvents),
			ENTRY(MinecraftPackets$createPacket),
			ENTRY(ServerNetworkHandler$_getServerPlayer),
			ENTRY(NetworkHandler$getEncryptedPeerForUser),
			ENTRY(NetworkHandler$_getConnectionFromId),
			ENTRY(ExtendedCertificate$getXuid),
			ENTRY(ExtendedCertificate$getIdentityName),
			ENTRY(ServerInstance$_update),
			ENTRY(Minecraft$update),
			ENTRY_IDX(NetworkHandler$onConnectionClosed, 1),
			ENTRY(ServerInstance$ServerInstance),
			ENTRY(DedicatedServer$start),
			ENTRY(ScriptEngine$startScriptLoading),
			ENTRY(MinecraftServerScriptEngine$onServerThreadStarted),
			ENTRY(std$string$_Tidy_deallocate),
			ENTRY(std$string$assign),
			ENTRY_IDX(std$string$append, 1),
			ENTRY(std$string$resize),
			ENTRY(MinecraftCommands$executeCommand),
			ENTRY(DedicatedServer$stop),
			ENTRY(StopCommand$mServer),
			ENTRY(NetworkHandler$send),
			ENTRY(NetworkIdentifier$getHash),
			ENTRY(NetworkIdentifier$$_equals_),
			ENTRY(Crypto$Random$generateUUID),
			ENTRY(BaseAttributeMap$getMutableInstance),
			ENTRY(Level$createDimension),
			ENTRY(Actor$dtor$Actor),
			ENTRY(Level$fetchEntity),
			ENTRY(NetworkHandler$_sendInternal),
			ENTRY(std$_Allocate$_alloc16_),
			ENTRY(ServerPlayer$$_vftable_),
			ENTRY(ServerPlayer$sendNetworkPacket),
			ENTRY(LoopbackPacketSender$sendToClients),
			ENTRY(Level$removeEntityReferences),
			ENTRY(google_breakpad$ExceptionHandler$HandleException),
			ENTRY(BedrockLogOut),
			ENTRY(CommandOutputSender$send),
			ENTRY(ScriptEngine$dtor$ScriptEngine),
		};
#undef ENTRY

		return entries;
	}
	static View<Text> getReplaceMap() noexcept
	{
		static const Text list[] = {
			"basic_string<char,std::char_traits<char>,std::allocator<char> >", "string",
			"::", "$",
			"operator==", "$_equals_",
			"<16,std$_Default_allocate_traits,0>", "$_alloc16_",
			"`vftable'", "$_vftable_",
			"~", "dtor$",
		};
		return list;
	}

	Text cppNameToVarName(Text text) noexcept
	{
		AText *dst = &m_str2, *src = &m_str1;

		View<Text> rmap = getReplaceMap();
		{
			Text from = *rmap++;
			Text to = *rmap++;
			text.replace(src, from, to);
		}
		while (!rmap.empty())
		{
			Text from = *rmap++;
			Text to = *rmap++;
			src->replace(dst, from, to);

			AText* t = dst;
			dst = src;
			src = t;
		}
		return *src;
	}
	Text varNameToCppName(Text text) noexcept
	{
		AText* dst = &m_str2, * src = &m_str1;

		View<Text> rmap = getReplaceMap();
		{
			Text from = rmap.readBack();
			Text to = rmap.readBack();
			src->clear();
			text.replace(src, from, to);
		}
		while (!rmap.empty())
		{
			Text from = rmap.readBack();
			Text to = rmap.readBack();
			dst->clear();
			src->replace(dst, from, to);

			AText* t = dst;
			dst = src;
			src = t;
		}
		return *src;
	}

};

namespace
{
	File* openPredefinedFile(Text hash) throws(Error)
	{
		TText16 bdsxPath = win::Module::byName(u"bdsx.dll")->fileName();
		bdsxPath.cut_self(bdsxPath.find_r('\\') + 1);
		bdsxPath << u"predefined";
		File::createDirectory(bdsxPath.c_str());
		bdsxPath << u'\\' << (Utf8ToUtf16)hash << u".ini";
		return File::openRW(bdsxPath.c_str());
	}
}

struct AddressReader
{
	struct FunctionTarget
	{
		Text varName;
		void** dest;
		size_t skipCount;

		FunctionTarget() = default;

		template <typename T>
		FunctionTarget(Text varName, T* ptr, size_t skipCount = 0) noexcept
			:varName(varName), dest((void**)ptr), skipCount(skipCount)
		{
		}
	};

	Must<File> m_predefinedFile;
	Map<Text, FunctionTarget> m_targets;
	MinecraftFunctionTable* const m_table;

public:

	AddressReader(File* file, MinecraftFunctionTable* table, Text hash) noexcept
		:m_table(table), m_predefinedFile(file)
	{
		Renamer renamer;
		for (const Renamer::Entry& entry : Renamer::getEntires())
		{
			m_targets[renamer.varNameToCppName(entry.name)] = { entry.name, &(table->*entry.target), entry.idx };
		}
	}

	void loadFromPredefined() noexcept
	{
		ModuleInfo ptr;
		try
		{
			io::FIStream<char, false> fis = (File*)m_predefinedFile;
			for (;;)
			{
				Text line = fis.readLine();
				
				pcstr equal = line.find_r('=');
				if (equal == nullptr) continue;

				Text name = line.cut(equal).trim();
				Text value = line.subarr(equal+1).trim();

				uintptr_t offset;
				if (value.startsWith("0x"))
				{
					offset = value.subarr(2).to_uintp(16);
				}
				else
				{
					offset = value.to_uintp();
				}

				auto iter = m_targets.find(name);
				if (iter == m_targets.end())
				{
					console.log(TSZ() << "Unknown function: " << name << '\n');
				}
				else
				{
					*iter->second.dest = ptr(offset);
					m_targets.erase(iter);
				}
			}
		}
		catch (EofException&)
		{
		}
	}
	void loadFromPdb() noexcept
	{
		io::FOStream<char, true, false> fos = (File*)m_predefinedFile;
		
		// remove already existed
		{
			auto iter = m_targets.begin();
			auto end = m_targets.end();
			while (iter != end)
			{
				if (*iter->second.dest != nullptr)
				{
					iter = m_targets.erase(iter);
				}
				else
				{
					iter++;
				}
			}
		}

		console.log("PdbReader: Load Symbols...\n");
		PdbReader reader;
		reader.showInfo([](Text text) {console.log(text); });
		console.log("PdbReader: processing... \n");
		reader.search(nullptr, [&](Text name, void* address, uint32_t typeId) {
			auto iter = m_targets.find(name);
			if (iter == m_targets.end())
			{
				return true;
			}
			if (iter->second.skipCount)
			{
				iter->second.skipCount--;
				return true;
			}
			*iter->second.dest = address;

			TText line = TText::concat(name, " = 0x", hexf((byte*)address - (byte*)reader.base()));
			fos << line << endl;
			line << '\n';
			console.log(line);
			m_targets.erase(iter);
			return !m_targets.empty();
			});

		if (!m_targets.empty())
		{
			Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			for (auto& item : m_targets)
			{
				Text name = item.first;

				console.log(TSZ() << name << "not found\n");
			}
		}
	}
};

void MinecraftFunctionTable::load() noexcept
{
	BText<32> hash;
	try
	{
		TText16 moduleName = CurrentApplicationPath();
		hash = (encoder::Hex)(TBuffer)encoder::Md5::hash(File::open(moduleName.data()));
		console.log(TSZ() << "BDSX: bedrock_server.exe MD5 = " << hash << '\n');
	}
	catch (Error&)
	{
		console.log("Cannot open bedrock_server.exe\n");
	}

	try
	{
		File* file = openPredefinedFile(hash);
		int openerr = GetLastError();
		AddressReader reader(file, this, hash);
		if (openerr == ERROR_ALREADY_EXISTS)
		{
			reader.loadFromPredefined();
		}
		else
		{
			console.log("BDSX: Predefined not founded\n");
		}

		if (hash == "0DCADDC25415D6818790D1FB09BCB4E9")
		{
			console.log("BDSX: MD5 Hash Matched(Version == " BDS_VERSION ")\n");
		}
		else
		{
			Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
			console.log("BDSX: MD5 Hash Not Matched(Version != " BDS_VERSION ")\n");
		}
		if (isNotFullLoaded())
		{
			reader.loadFromPdb();
		}
		skipCommandListDestruction();
		removeScriptExperientalCheck();
	}
	catch (Error&)
	{
		console.log("Cannot open predefined file\n");
	}
}
bool MinecraftFunctionTable::isNotFullLoaded() noexcept
{
	void** iter = (void**)(this);
	void** end = (void**)(this + 1);
	for (; iter != end; iter++)
	{
		if (*iter == nullptr)
		{
			return true;
		}
	}
	return false;
}
void MinecraftFunctionTable::stopServer() noexcept
{
	g_mcf.DedicatedServer$stop((byte*)g_server->server + 8);
}

void MinecraftFunctionTable::hookOnPropertyPath(void(*getPropertyPath)(String* str)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8D, 0x15, 0xff, 0xff, 0xff, 0xff,   // | lea rdx,qword ptr ds:[7FF74E1D7A90]
		0x48, 0x8D, 0x4D, 0x38,						// | lea rcx,qword ptr ss:[rbp+38]
		0xE8, 0xff, 0xff, 0xFF, 0xFF,				// | call string.assign
		0x90,										// | nop
	};
	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.lea(RCX, RBP, 0x38);
	junction.call(getPropertyPath, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchTo((byte*)DedicatedServer$start + 0x31c
		, ORIGINAL_CODE, RAX, false, "getPropertyPath", { {3, 7}, {12, 16} });
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
		(byte*)Actor$dtor$Actor + 0xF,
		ORIGINAL_CODE, RAX, false, "ActorDestructor");
}
void MinecraftFunctionTable::hookOnLog(void(*callback)(int color, const char* log, size_t size)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0xB9, 0xF5, 0xFF, 0xFF, 0xFF,       // mov ecx,FFFFFFF5                        
		0xFF, 0x15, 0x7D, 0x27, 0xB9, 0x00, // call qword ptr ds:[<&GetStdHandle>]     
		0x83, 0xFE, 0x01,					// cmp esi,1                               
		0x75, 0x05,							// jne bedrock_server.7FF6C6905B2D         
		0x8D, 0x56, 0x06,					// lea edx,qword ptr ds:[rsi+6]            
		0xEB, 0x19,							// jmp bedrock_server.7FF6C6905B46         
		0x83, 0xFE, 0x02,					// cmp esi,2                               
		0x75, 0x05,							// jne bedrock_server.7FF6C6905B37         
		0x8D, 0x56, 0x0D,					// lea edx,qword ptr ds:[rsi+D]            
		0xEB, 0x0F,							// jmp bedrock_server.7FF6C6905B46         
		0x83, 0xFE, 0x04,					// cmp esi,4                               
		0xBA, 0x0E, 0x00, 0x00, 0x00,       // mov edx,E                               
		0x74, 0x05,							// je bedrock_server.7FF6C6905B46          
		0xBA, 0x0C, 0x00, 0x00, 0x00,       // mov edx,C                               
		0x48, 0x8B, 0xC8,                   // mov rcx,rax                             
		0xFF, 0x15, 0x59, 0x27, 0xB9, 0x00, // call SetConsoleTextAttribute 
		0x48, 0x8D, 0x54, 0x24, 0x60,       // lea rdx,qword ptr ss:[rsp+60]           
		0x48, 0x8D, 0x0D, 0x29, 0xF9, 0xC4, 0x00, // lea rcx,qword ptr ds:[7FF6C7555484]
		0xE8, 0x30, 0x87, 0xFC, 0xFF,		// call <bedrock_server.printf>            
		0x48, 0x8D, 0x4C, 0x24, 0x60,		// lea rcx,qword ptr ss:[rsp+60]           
		0xFF, 0x15, 0xCD, 0x26, 0xB9, 0x00, // call OutputDebugStringA 
	};

	Code junction(64);
	junction.lea(RDX, RSP, 0x68);
	junction.sub(RSP, 0x28);
	junction.mov(RCX, RSI);
	junction.mov(R8, RAX);
	junction.call(callback, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchTo(
		(byte*)BedrockLogOut + 0x88,
		ORIGINAL_CODE, RDX, false, "logging");
}
void MinecraftFunctionTable::hookOnCommandPrint(void(*callback)(const char* log, size_t size)) noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0xE8, 0x1E, 0x00, 0xCE, 0xFF,			// call <bedrock_server.class std::basic_o
		0x48, 0x8B, 0xC8,						// mov rcx,rax
		0x48, 0x8D, 0x15, 0x54, 0x20, 0x9B, 0x00, // lea rdx,qword ptr ds:[7FF75F803A60]
		0xE8, 0x3F, 0xF9, 0xCD, 0xFF,			// call <bedrock_server.class std::basic_o
	};

	Code junction(64);
	junction.sub(RSP, 0x28);
	junction.mov(RCX, RDX);
	junction.mov(RDX, R8);
	junction.call(callback, RAX);
	junction.add(RSP, 0x28);
	junction.ret();
	junction.patchTo((byte*)CommandOutputSender$send + 0x12d, ORIGINAL_CODE, RAX, false, "commandLogging");
}

void MinecraftFunctionTable::skipCommandListDestruction() noexcept
{
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8D, 0x4B, 0x78,			// lea         rcx,[rbx+78h]  
		0xE8, 0x04, 0x24, 0x00, 0x00,	// call        std::deque<ScriptCommand,std::allocator<ScriptCommand> >::_Tidy (07FF7ED6A00E0h)  
	};
	Unprotector unpro((byte*)ScriptEngine$dtor$ScriptEngine + 435, sizeof(ORIGINAL_CODE));
	if (!checkCode(unpro, ORIGINAL_CODE, "skipCommandListDestruction", { {5, 4} })) return;
	memset(unpro, 0x90, sizeof(ORIGINAL_CODE));
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
}
