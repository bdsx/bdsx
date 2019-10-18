

#include <KR3/main.h>
#include <KR3/wl/windows.h>
#include <KRWin/handle.h>
#include <KRWin/hook.h>
#include <KR3/fs/file.h>
#include <KR3/meta/function.h>
#include <KR3/js/js.h>
#include <KR3/data/binarray.h>

#include "nativepointer.h"
#include "fs.h"
#include "console.h"

// #include "ChakraDebugService.h"

 #define USE_EDGEMODE_JSRT
 #include <jsrt.h>

#include "pdb.h"
#include "nativepointer.h"
#include "reversed.h"
#include "fs.h"

#pragma comment(lib, "chakrart.lib")


using namespace kr;
using namespace win;


namespace
{
	Module* s_module = Module::getModule(nullptr);
	hook::IATHookerList s_iatChakra(s_module, "chakra.dll");
	Manual<JsContext> s_ctx;
	bool s_ctxCreated = false;
	//JsDebugService s_debug;
	//JsDebugProtocolHandler s_debugHandler;

}

JsPersistent s_callbacks[0x100];

JsErrorCode CALLBACK JsCreateRuntimeHook(
	JsRuntimeAttributes attributes,
	JsThreadServiceCallback threadService,
	JsRuntimeHandle* runtime) noexcept
{
	JsErrorCode err = JsCreateRuntime(attributes, threadService, runtime);
	if (err == JsNoError)
	{
		JsRuntime::setRuntime(*runtime);
		
		//JsDebugServiceCreate(&s_debug);
		//JsDebugProtocolHandlerCreate(*runtime, &s_debugHandler);
		//JsDebugServiceRegisterHandler(s_debug, "minecraft", s_debugHandler, false);
		//JsDebugServiceListen(s_debug, 9229);
		//JsDebugProtocolHandlerWaitForDebugger(s_debugHandler);
	}
	return err;
}
JsErrorCode CALLBACK JsDisposeRuntimeHook(JsRuntimeHandle runtime) noexcept
{
	if (s_ctxCreated)
	{
		s_ctx.remove();
		s_ctxCreated = false;
	}
	return JsDisposeRuntime(runtime);
}
JsErrorCode CALLBACK JsCreateContextHook(JsRuntimeHandle runtime, JsContextRef* newContext) noexcept
{
	JsErrorCode err = JsCreateContext(runtime, newContext);
	if (err == JsNoError)
	{
		if (s_ctxCreated) s_ctx.remove();
		s_ctx.create(*newContext);
		s_ctxCreated = true;
		s_ctx->enter();

		JsValue chakraX = JsNewObject;
		chakraX.set(u"console", createConsoleModule());
		chakraX.setMethod(u"update", [] {
			SleepEx(0, false);
		});
		chakraX.set(u"fs", createFsModule());
		chakraX.set(u"NativePointer", NativePointer::classObject);
		chakraX.set(u"NativeFile", NativeFile::classObject);

		JsRuntime::global().set(u"chakraX", chakraX);

		s_ctx->exit();
	}
	return err;
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
void hookOnPacket(PdbReader &reader, byte* packetlize, void(*onPacket)(byte * rbp)) noexcept
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
void hookOnPacketRead(byte* packetlize, PacketReadResult (*onPacketRead)(byte*, PacketReadResult)) noexcept
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

BOOL WINAPI DllMain(
	_In_ HINSTANCE hinstDLL,
	_In_ DWORD     fdwReason,
	_In_ LPVOID    lpvReserved
)
{
	if (fdwReason == DLL_PROCESS_ATTACH)
	{
		ondebug(requestDebugger());
		ucout << u"ChakraX Attached" << endl;
				
		s_iatChakra.hooking("JsCreateContext", JsCreateContextHook);
		s_iatChakra.hooking("JsCreateRuntime", JsCreateRuntimeHook);
		s_iatChakra.hooking("JsDisposeRuntime", JsDisposeRuntimeHook);

		using namespace hook;
		
		PdbReader reader;
		byte* packetlize = (byte*)reader.getFunctionAddress("NetworkHandler::_sortAndPacketizeEvents");
		if (packetlize)
		{
			try
			{
				hookOnPacketRead(packetlize, [](byte* rbp, PacketReadResult res) {
					byte packetId = rbp[0x88];
					void* packetInstance = *(void**)(rbp + 0x90);

					JsPersistent& callback = s_callbacks[packetId];
					if (!callback.isEmpty())
					{
						s_ctx->enter();
						NativePointer* natptr = NativePointer::newInstance();
						natptr->setAddressRaw(packetInstance);
						((JsValue)callback).call(undefined, { packetId, natptr });
						s_ctx->exit();
					}

					switch (packetId)
					{
					case 0x4d:
						cout << "CommandRequest" << endl;
						break;
					}
					cout << "onReadPacket" << endl;
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
			}
			catch (int)
			{
				return false;
			}
		}
	}
	return true;
}

