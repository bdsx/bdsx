import { asmcode } from "../asm/asmcode";
import { Register } from "../assembler";
import { NetworkHandler, NetworkIdentifier } from "../bds/networkidentifier";
import { createPacketRaw, ExtendedStreamReadResult, Packet, PacketSharedPtr, StreamReadResult } from "../bds/packet";
import { MinecraftPacketIds } from "../bds/packetids";
import { PacketIdToType } from "../bds/packets";
import { proc, procHacker } from "../bds/proc";
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
import { SharedPtr } from "../sharedpointer";
import { remapAndPrintError } from "../source-map-support";

@nativeClass(null)
class ReadOnlyBinaryStream extends AbstractClass {
    @nativeField(CxxStringWrapper.ref(), 0x38)
    data:CxxStringWrapper;

    read(dest:VoidPointer, size:number):boolean {
        abstract();
    }
}

ReadOnlyBinaryStream.prototype.read = makefunc.js([0x8], bool_t, {this: ReadOnlyBinaryStream}, VoidPointer, int64_as_float_t);

@nativeClass(null)
class OnPacketRBP extends AbstractClass {
    // stack memories of NetworkHandler::_sortAndPacketizeEvents
    @nativeField(SharedPtr.make(Packet), 0xb8)
    packet:SharedPtr<Packet>; // accessed in NetworkHandler::_sortAndPacketizeEvents before calling MinecraftPackets::createPacket
    @nativeField(ReadOnlyBinaryStream, 0x120)
    stream:ReadOnlyBinaryStream; // accessed in NetworkHandler::_sortAndPacketizeEvents at getting the packet id
}

asmcode.createPacketRaw = proc["MinecraftPackets::createPacket"];
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
        return createPacketRaw(rbp.packet, packetId);
    } catch (err) {
        remapAndPrintError(err);
        return null;
    }
}
function onPacketBefore(result:ExtendedStreamReadResult, rbp:OnPacketRBP, packetId:MinecraftPacketIds):ExtendedStreamReadResult {
    try {
        if (result.streamReadResult !== StreamReadResult.Pass) return result;

        const target = events.packetBefore(packetId);
        if (target !== null && !target.isEmpty()) {
            const packet = rbp.packet.p!;
            const ni = nethook.lastSender;
            const TypedPacket = PacketIdToType[packetId] || Packet;
            const typedPacket = packet.as(TypedPacket);
            try {
                for (const listener of target.allListeners()) {
                    try {
                        if (listener(typedPacket, ni, packetId) === CANCEL) {
                            result.streamReadResult = StreamReadResult.Ignore;
                            return result;
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
    return result;
}
function onPacketAfter(rbp:OnPacketRBP):void {
    try {
        const packet = rbp.packet.p!;
        const packetId = packet.getId();
        const target = events.packetAfter(packetId);
        if (target !== null && !target.isEmpty()) {
            const ni = nethook.lastSender;
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
function onPacketSend(handler:NetworkHandler, ni:NetworkIdentifier, packet:Packet):number{
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
    // hook raw
    asmcode.onPacketRaw = makefunc.np(onPacketRaw, PacketSharedPtr, null, OnPacketRBP, int32_t, NetworkHandler.Connection);
    procHacker.patching('hook-packet-raw', 'NetworkHandler::_sortAndPacketizeEvents', 0x1f0,
        asmcode.packetRawHook, Register.rax, true, [
            0x8B, 0xD6,                               // mov edx,esi
            0x48, 0x8D, 0x8D, 0xB8, 0x00, 0x00, 0x00, // lea rcx,qword ptr ss:[rbp+B8]
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF,             // call <bedrock_server.public: static class std::shared_ptr<class Packet> __cdecl MinecraftPackets::createPacket(enum MinecraftPacketIds)>
            0x90,                                     // nop
        ], [10, 14]);

    // hook before
    asmcode.onPacketBefore = makefunc.np(onPacketBefore, ExtendedStreamReadResult, {name: 'onPacketBefore'}, ExtendedStreamReadResult, OnPacketRBP, int32_t);
    procHacker.patching('hook-packet-before', 'NetworkHandler::_sortAndPacketizeEvents', 0x2f2,
        asmcode.packetBeforeHook, // original code depended
        Register.rax,
        true, [
            0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
            0x4C, 0x8D, 0x85, 0x20, 0x01, 0x00, 0x00, // lea r8,qword ptr ss:[rbp+100]
            0x48, 0x8D, 0x55, 0xE0, //lea rdx,qword ptr ss:[rbp-20]
            0xFF, 0x50, 0x20, // call qword ptr ds:[rax+20]
        ], []);

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
    asmcode.PacketViolationHandlerHandleViolationAfter = proc['PacketViolationHandler::_handleViolation'].add(packetViolationOriginalCode.length);
    procHacker.patching('hook-packet-before-skip', 'PacketViolationHandler::_handleViolation', 0,
        asmcode.packetBeforeCancelHandling,
        Register.rax, false, packetViolationOriginalCode, []);

    // hook after
    asmcode.onPacketAfter = makefunc.np(onPacketAfter, void_t, null, OnPacketRBP);
    procHacker.patching('hook-packet-after', 'NetworkHandler::_sortAndPacketizeEvents', 0x46f,
        asmcode.packetAfterHook, // original code depended
        Register.rax, true, [
            0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
            0x4C, 0x8D, 0x8D, 0xB8, 0x00, 0x00, 0x00, // lea r9,qword ptr ss:[rbp+b8]
            0x4C, 0x8B, 0xC6, // mov r8,rsi
            0x49, 0x8B, 0xD6, // mov rdx,r14
            0xFF, 0x50, 0x08, // call qword ptr ds:[rax+8]
        ], []);

    asmcode.onPacketSend = makefunc.np(onPacketSend, int32_t, null, NetworkHandler, NetworkIdentifier, Packet);
    asmcode.sendOriginal = procHacker.hookingRaw('NetworkHandler::send', asmcode.packetSendHook);
    asmcode.packetSendAllCancelPoint = proc['LoopbackPacketSender::sendToClients'].add(0xb5);
    procHacker.patching('hook-packet-send-all', 'LoopbackPacketSender::sendToClients', 0x90,
        asmcode.packetSendAllHook, // original code depended
        Register.rax, true, [
            0x49, 0x8B, 0x07, // mov rax,qword ptr ds:[r15]
            0x49, 0x8D, 0x96, 0x50, 0x02, 0x00, 0x00, // lea rdx,qword ptr ds:[r14+248]
            0x49, 0x8B, 0xCF, // mov rcx,r15
            0xFF, 0x50, 0x18, // call qword ptr ds:[rax+18]
        ], []);

    asmcode.onPacketSendInternal = makefunc.np(onPacketSendInternal, int32_t, null, NetworkHandler, NetworkIdentifier, Packet, CxxStringWrapper);
    asmcode.sendInternalOriginal = procHacker.hookingRaw('NetworkHandler::_sendInternal', asmcode.packetSendInternalHook);
});
