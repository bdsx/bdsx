#include "nethook.h"

#include <KRWin/hook.h>
#include <KRWin/handle.h>
#include <KR3/data/binarray.h>

#include "jsctx.h"
#include "pdb.h"
#include "reversed.h"
#include "nativepointer.h"


using namespace kr;

namespace
{
	JsPersistent s_listeners[0x100];
}

template <size_t size>
void mustMatch(const byte* code, const byte(&buffer)[size]) throws(int)
{
	if (memcmp(code, buffer, size) != 0)
	{
		cerr << "chakraX: junction point code unmatch" << endl;
		throw 0;
	}
}
void hookOnPacket(PdbReader& reader, byte* packetlize, void(*onPacket)(byte* rbp)) noexcept
{
	using namespace hook;
	ExecutableAllocator* alloc = ExecutableAllocator::getInstance();

	void* jumpTo = reader.getFunctionAddress("MinecraftPackets::createPacket");

	byte* junctionPoint = packetlize + 0x2b4;
	static const byte ORIGINAL_CODE[] = {
		0xE8, 0x87, 0xC5, 0x01, 0x00, // call MinecraftPackets::createPacket
		0x90, // nop
		0x48, 0x83, 0xBD, 0x90, 0x00, 0x00, 0x00, 0x00, // cmp qword ptr ss:[rbp+90],0
	};
	void* fncode = alloc->alloc(64);
	memset(fncode, 0xcc, 64);
	CodeWriter junction(fncode, 64);
	junction.sub(RSP, 0x28);
	junction.call(jumpTo);
	junction.mov(RCX, RBP);
	junction.call(onPacket);
	junction.add(RSP, 0x28);
	junction.write(ORIGINAL_CODE + 6, 8);
	junction.ret();

	Unprotector unpro(junctionPoint, sizeof(ORIGINAL_CODE));
	mustMatch(unpro, ORIGINAL_CODE);
	CodeWriter writer((void*)unpro, sizeof(ORIGINAL_CODE));
	writer.call(fncode);
	writer.fillNop();
}
void hookOnPacketRead(byte* packetlize, PacketReadResult(*onPacketRead)(byte*, PacketReadResult)) noexcept
{
	using namespace hook;
	ExecutableAllocator* alloc = ExecutableAllocator::getInstance();

	byte* junctionPoint = packetlize + 0x30e;
	static const byte ORIGINAL_CODE[] = {
		0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
		0x48, 0x8D, 0x95, 0xA0, 0x00, 0x00, 0x00, // lea rdx,qword ptr ss:[rbp+A0]
		0xFF, 0x50, 0x20, // call qword ptr ds:[rax+20] (Packet::read)
	};
	void* fncode = alloc->alloc(64);
	memset(fncode, 0xcc, 64);
	CodeWriter junction(fncode, 64);
	junction.sub(RSP, 0x28);
	junction.write(ORIGINAL_CODE, sizeof(ORIGINAL_CODE));
	junction.mov(RDX, RAX);
	junction.mov(RCX, RBP);
	junction.call(onPacketRead);
	junction.add(RSP, 0x28);
	junction.ret();

	Unprotector unpro(junctionPoint, sizeof(ORIGINAL_CODE));
	mustMatch(unpro, ORIGINAL_CODE);
	CodeWriter writer((void*)unpro, sizeof(ORIGINAL_CODE));
	writer.call(fncode);
	writer.fillNop();
}

JsValue createNetHookModule() noexcept
{
	using namespace hook;

	PdbReader reader;
	byte* packetlize = (byte*)reader.getFunctionAddress("NetworkHandler::_sortAndPacketizeEvents");
	if (!packetlize) return nullptr;
	
	try
	{
		JsValue nethook = JsNewObject;
		nethook.setMethod(u"setListener", [](int id, JsValue func){
			if (func.getType() != JsType::Function)
			{
				throw JsException(u"2nd argument must be function");
			}
			s_listeners[id] = func;
		});

		hookOnPacketRead(packetlize, [](byte* rbp, PacketReadResult res) {
			byte packetId = rbp[0x88];
			void* packetInstance = *(void**)(rbp + 0x90);

			JsPersistent& listener = s_listeners[packetId];
			if (!listener.isEmpty())
			{
				JsScope scope;
				NativePointer* natptr = NativePointer::newInstance();
				natptr->setAddressRaw(packetInstance);
				JsValue a = natptr;
				((JsValue)listener).call(undefined, { natptr, packetId });
			}
			return res;
		});

		//hookOnPacket(reader, packetlize, [](byte * rbp){
		//	//cout << "onPacket" << endl;

		//	//NativePointer* rbpptr = NativePointer::newInstance();
		//	//rbpptr->setAddressRaw(rbp);

		//	//byte packetId = rbp[0x88];
		//	//ReadOnlyBinaryStream* is = (ReadOnlyBinaryStream*)(rbp + 0xa0);
		//	//Text data = is->getData();

		//	//if (s_packetFilter.get(packetId))
		//	//{
		//	//}
		//	//int a = 0;	
		//});

		return nethook;
	}
	catch (int)
	{
		return nullptr;
	}
}
void destroyNetHookModule() noexcept
{
	for (auto& persistent : s_listeners)
	{
		persistent = JsPersistent();
	}
}
