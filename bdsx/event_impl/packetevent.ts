import { asmcode } from "../asm/asmcode";
import { OperationSize, Register } from "../assembler";
import { NetworkHandler, NetworkIdentifier } from "../bds/networkidentifier";
import { createPacketRaw, ExtendedStreamReadResult, Packet, PacketSharedPtr, StreamReadResult } from "../bds/packet";
import { MinecraftPacketIds } from "../bds/packetids";
import { PacketIdToType } from "../bds/packets";
import { proc } from "../bds/symbols";
import { abstract, CANCEL } from "../common";
import { VoidPointer } from "../core";
import { decay } from "../decay";
import { events } from "../event";
import { bedrockServer } from "../launcher";
import { makefunc } from "../makefunc";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { bool_t, int32_t, int64_as_float_t, void_t } from "../nativetype";
import { nethook } from "../nethook";
import { CxxStringWrapper } from "../pointer";
import { procHacker } from "../prochacker";
import { CxxSharedPtr } from "../sharedpointer";
import { remapAndPrintError } from "../source-map-support";

@nativeClass(null)
class ReadOnlyBinaryStream extends AbstractClass {
    @nativeField(CxxStringWrapper.ref(), 0x38)
    data:CxxStringWrapper;

    read(dest:VoidPointer, size:number):boolean {
        abstract();
    }
}

ReadOnlyBinaryStream.prototype.read = procHacker.jsv('??_7ReadOnlyBinaryStream@@6B@', '?read@ReadOnlyBinaryStream@@EEAA_NPEAX_K@Z', bool_t, {this: ReadOnlyBinaryStream}, VoidPointer, int64_as_float_t);

@nativeClass(null)
class OnPacketRBP extends AbstractClass {
    // stack memories of NetworkHandler::_sortAndPacketizeEvents
    @nativeField(CxxSharedPtr.make(Packet), 0x80)
    packet:CxxSharedPtr<Packet>; // NetworkHandler::_sortAndPacketizeEvents before Packet::readNoHeader
    @nativeField(ReadOnlyBinaryStream, 0x100)
    stream:ReadOnlyBinaryStream; // NetworkHandler::_sortAndPacketizeEvents before Packet::readNoHeader
    @nativeField(ExtendedStreamReadResult, 0x98)
    result:ExtendedStreamReadResult;  // NetworkHandler::_sortAndPacketizeEvents before Packet::readNoHeader
}

asmcode.createPacketRaw = proc['?createPacket@MinecraftPackets@@SA?AV?$shared_ptr@VPacket@@@std@@W4MinecraftPacketIds@@@Z'];
function onPacketRaw(rbp:OnPacketRBP, packetId:MinecraftPacketIds, conn:NetworkHandler.Connection):PacketSharedPtr|null {
    try {
        const target = events.packetRaw(packetId);
        const ni = conn.networkIdentifier;
        nethook.lastSender = ni;
        if (target !== null && !target.isEmpty()) {
            const s = rbp.stream;
            const data = s.data;
            const rawpacketptr = data.valueptr;

            for (const listener of target.allListeners()) {
                const ptr = rawpacketptr.add();
                try {
                    if (listener(ptr, data.length, ni, packetId) === CANCEL) {
                        return null;
                    }
                } catch (err) {
                    events.errorFire(err);
                } finally {
                    decay(ptr);
                }
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    return createPacketRaw(rbp.packet, packetId);
}
function onPacketBefore(rbp:OnPacketRBP, packetId:MinecraftPacketIds):bool_t {
    try {
        const result = rbp.result;
        if (result.streamReadResult !== StreamReadResult.Pass) return false;
        const packet = rbp.packet.p!;
        const target = events.packetBefore(packetId);
        if (target !== null && !target.isEmpty()) {
            const ni = nethook.lastSender;
            const TypedPacket = PacketIdToType[packetId] || Packet;
            const typedPacket = packet.as(TypedPacket);
            try {
                for (const listener of target.allListeners()) {
                    try {
                        if (listener(typedPacket, ni, packetId) === CANCEL) {
                            result.streamReadResult = StreamReadResult.Ignore;
                            return false;
                        }
                    } catch (err) {
                        events.errorFire(err);
                    }
                }
            } finally {
                decay(typedPacket);
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    return true;
}
function onPacketAfter(packet:Packet, ni:NetworkIdentifier):void {
    try {
        const packetId = packet.getId();
        const target = events.packetAfter(packetId);
        if (target !== null && !target.isEmpty()) {
            const TypedPacket = PacketIdToType[packetId] || Packet;
            const typedPacket = packet.as(TypedPacket);
            try {
                for (const listener of target.allListeners()) {
                    try {
                        if (listener(typedPacket, ni, packetId) === CANCEL) {
                            break;
                        }
                    } catch (err) {
                        events.errorFire(err);
                    }
                }
            } finally {
                decay(typedPacket);
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
}
function onPacketSend(_:void, ni:NetworkIdentifier, packet:Packet):number{
    try {
        const packetId = packet.getId();
        const target = events.packetSend(packetId);
        if (target !== null && !target.isEmpty()) {
            const TypedPacket = PacketIdToType[packetId] || Packet;
            const typedPacket = packet.as(TypedPacket);
            try {
                for (const listener of target.allListeners()) {
                    try {
                        if (listener(typedPacket, ni, packetId) === CANCEL) {
                            return 1;
                        }
                    } catch (err) {
                        events.errorFire(err);
                    }
                }
            } finally {
                decay(typedPacket);
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    return 0;
}
function onPacketSendInternal(handler:NetworkHandler, ni:NetworkIdentifier, packet:Packet, data:CxxStringWrapper):number {
    try {
        const packetId = packet.getId();
        const target = events.packetSendRaw(packetId);
        if (target !== null && !target.isEmpty()) {
            const dataptr = data.valueptr;
            try {
                for (const listener of target.allListeners()) {
                    try {
                        if (listener(dataptr, data.length, ni, packetId) === CANCEL) {
                            return 1;
                        }
                    } catch (err) {
                        events.errorFire(err);
                    }
                }
            } finally {
                decay(dataptr);
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    return 0;
}

bedrockServer.withLoading().then(()=>{
    const handleViolationSymbol = '?_handleViolation@PacketViolationHandler@@AEAA?AW4PacketViolationResponse@@W4MinecraftPacketIds@@W4StreamReadResult@@AEBVNetworkIdentifier@@PEA_N@Z';
    const packetHandleSymbol = '?handle@Packet@@QEAAXAEBVNetworkIdentifier@@AEAVNetEventCallback@@AEAV?$shared_ptr@VPacket@@@std@@@Z';
    const sendToMultipleSymbol = '?sendToMultiple@NetworkHandler@@QEAAXAEBV?$vector@UNetworkIdentifierWithSubId@@V?$allocator@UNetworkIdentifierWithSubId@@@std@@@std@@AEBVPacket@@@Z';
    const packetlizeSymbol = '?_sortAndPacketizeEvents@NetworkHandler@@AEAA_NAEAVConnection@1@V?$time_point@Usteady_clock@chrono@std@@V?$duration@_JU?$ratio@$00$0DLJKMKAA@@std@@@23@@chrono@std@@@Z';

    // hook raw
    asmcode.onPacketRaw = makefunc.np(onPacketRaw, PacketSharedPtr, null, OnPacketRBP, int32_t, NetworkHandler.Connection);
    procHacker.patching('hook-packet-raw', packetlizeSymbol, 0x219,
        asmcode.packetRawHook, // original code depended
        Register.rax, true, [
            0x41, 0x8B, 0xD7,                          // mov edx,r15d
            0x48, 0x8D, 0x8D, 0x80, 0x00, 0x00, 0x00,  // lea rcx,qword ptr ss:[rbp+80]
            0xE8, null, null, null, null,              // call <bedrock_server.public: static class std::shared_ptr<class Packet> __cdecl MinecraftPackets::createPacket(enum MinecraftPacketIds)>
            0x90,                                      // nop
        ]);

    // hook before
    asmcode.onPacketBefore = makefunc.np(onPacketBefore, bool_t, {name: 'onPacketBefore'}, OnPacketRBP, int32_t, ExtendedStreamReadResult);
    asmcode.packetBeforeOriginal = procHacker.hookingRaw('?readNoHeader@Packet@@QEAA_NAEAVReadOnlyBinaryStream@@AEBW4SubClientId@@AEAUExtendedStreamReadResult@@@Z', asmcode.packetBeforeHook);

    // skip packet when result code is 0x7f
    const packetViolationOriginalCode = [
        0x48, 0x89, 0x5C, 0x24, 0x10, // mov qword ptr ss:[rsp+10],rbx
        0x55, // push rbp
        0x56, // push rsi
        0x57, // push rdi
        0x41, 0x54, // push r12
        0x41, 0x55, // push r13
        0x41, 0x56, // push r14
    ];
    asmcode.PacketViolationHandlerHandleViolationAfter = proc[handleViolationSymbol].add(packetViolationOriginalCode.length);
    procHacker.patching('hook-packet-before-skip', handleViolationSymbol, 0,
        asmcode.packetBeforeCancelHandling,
        Register.rax, false, packetViolationOriginalCode);

    // hook after
    asmcode.onPacketAfter = makefunc.np(onPacketAfter, void_t, null, Packet, NetworkIdentifier);
    procHacker.hookingRawWithOriginal(packetHandleSymbol)((asm, original)=>{
        asm.stack_c(0x28);
        asm.call64(original, Register.rax);
    });
    asmcode.handlePacket = proc[packetHandleSymbol];
    procHacker.patching('hook-packet-after', packetlizeSymbol, 0x580,
        asmcode.packetAfterHook, // original code depended
        Register.rax, true, [
            0x48, 0x8B, 0x8D, 0x80, 0x00, 0x00, 0x00, // mov rcx,qword ptr ss:[rbp+80]
            0xE8, null, null, null, null,             // call <bedrock_server.public: void __cdecl Packet::handle(class NetworkIdentifier const & __ptr64,class NetEventCallback & __ptr64,class std::shared_ptr<class Packet> & __ptr64) __ptr64>
        ]);

    asmcode.onPacketSend = makefunc.np(onPacketSend, int32_t, null, void_t, NetworkIdentifier, Packet);
    asmcode.sendOriginal = procHacker.hookingRaw('?send@NetworkHandler@@QEAAXAEBVNetworkIdentifier@@AEBVPacket@@W4SubClientId@@@Z', asmcode.packetSendHook);
    const sendToMultiple = proc[sendToMultipleSymbol];
    asmcode.packetSendAllCancelPoint = sendToMultiple.add(0x147);
    asmcode.packetSendAllJumpPoint = sendToMultiple.add(0x4c);
    procHacker.patching('hook-packet-send-all', sendToMultipleSymbol, 0x37,
        asmcode.packetSendAllHook, // original code depended
        Register.rax, true, [
            // loop begin point
            0x4D, 0x85, 0xF6,                                // test r14,r14
            0x74, 0x10,                                      // je bedrock_server.7FF7436D8315
            0x41, 0x0F, 0xB6, 0x86, 0xA0, 0x00, 0x00, 0x00,  // movzx eax,byte ptr ds:[r14+A0]
        ]);

    asmcode.onPacketSendInternal = makefunc.np(onPacketSendInternal, int32_t, null, NetworkHandler, NetworkIdentifier, Packet, CxxStringWrapper);
    asmcode.sendInternalOriginal = procHacker.hookingRaw('?_sendInternal@NetworkHandler@@AEAAXAEBVNetworkIdentifier@@AEBVPacket@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z', asmcode.packetSendInternalHook);
});
