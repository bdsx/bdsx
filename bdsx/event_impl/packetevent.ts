import { asmcode } from "../asm/asmcode";
import { Register } from "../assembler";
import { NetworkHandler, NetworkIdentifier } from "../bds/networkidentifier";
import { createPacketRaw, ExtendedStreamReadResult, Packet, PacketSharedPtr, StreamReadResult } from "../bds/packet";
import { MinecraftPacketIds } from "../bds/packetids";
import { PacketIdToType } from "../bds/packets";
import { proc, procHacker } from "../bds/proc";
import { abstract, CANCEL } from "../common";
import { VoidPointer } from "../core";
import { events } from "../event";
import { bedrockServer } from "../launcher";
import { makefunc } from "../makefunc";
import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { bool_t, int32_t, int64_as_float_t, void_t } from "../nativetype";
import { nethook } from "../nethook";
import { CxxStringWrapper } from "../pointer";
import { SharedPtr } from "../sharedpointer";
import { remapAndPrintError } from "../source-map-support";
import { _tickCallback } from "../util";

@nativeClass(null)
class ReadOnlyBinaryStream extends NativeClass {
    @nativeField(CxxStringWrapper.ref(), 0x38)
    data:CxxStringWrapper;

    read(dest:VoidPointer, size:number):boolean {
        abstract();
    }
}

ReadOnlyBinaryStream.prototype.read = makefunc.js([0x8], bool_t, {this: ReadOnlyBinaryStream}, VoidPointer, int64_as_float_t);

@nativeClass(null)
class OnPacketRBP extends NativeClass {
    @nativeField(SharedPtr.make(Packet), 0xb8)
    packet:SharedPtr<Packet>;
    @nativeField(ReadOnlyBinaryStream, 0x100)
    stream:ReadOnlyBinaryStream;
}

let sendInternalOriginal:(handler:NetworkHandler, ni:NetworkIdentifier, packet:Packet, data:CxxStringWrapper)=>void;

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
                try {
                    const ptr = rawpacketptr.add();
                    if (listener(ptr, data.length, ni, packetId) === CANCEL) {
                        _tickCallback();
                        return null;
                    }
                } catch (err) {
                    events.errorFire(err);
                }
            }
            _tickCallback();
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
            for (const listener of target.allListeners()) {
                try {
                    if (listener(typedPacket, ni, packetId) === CANCEL) {
                        result.streamReadResult = StreamReadResult.Ignore;
                        _tickCallback();
                        return result;
                    }
                } catch (err) {
                    events.errorFire(err);
                }
            }
            _tickCallback();
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
            for (const listener of target.allListeners()) {
                try {
                    if (listener(typedPacket, ni, packetId) === CANCEL) break;
                } catch (err) {
                    events.errorFire(err);
                }
            }
            _tickCallback();
        }
    } catch (err) {
        remapAndPrintError(err);
    }
}
function onPacketSend(handler:NetworkHandler, ni:NetworkIdentifier, packet:Packet):void{
    try {
        const packetId = packet.getId();
        const target = events.packetSend(packetId);
        if (target !== null && !target.isEmpty()) {
            const TypedPacket = PacketIdToType[packetId] || Packet;
            const typedPacket = packet.as(TypedPacket);
            for (const listener of target.allListeners()) {
                try {
                    if (listener(typedPacket, ni, packetId) === CANCEL) break;
                } catch (err) {
                    events.errorFire(err);
                }
            }
            _tickCallback();
        }
    } catch (err) {
        remapAndPrintError(err);
    }
}
function onPacketSendInternal(handler:NetworkHandler, ni:NetworkIdentifier, packet:Packet, data:CxxStringWrapper):void {
    try {
        const packetId = packet.getId();
        const target = events.packetSendRaw(packetId);
        if (target !== null && !target.isEmpty()) {
            for (const listener of target.allListeners()) {
                try {
                    if (listener(data.valueptr, data.length, ni, packetId) === CANCEL) {
                        _tickCallback();
                        return;
                    }
                } catch (err) {
                    events.errorFire(err);
                }
            }
            _tickCallback();
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    sendInternalOriginal(handler, ni, packet, data);
}

bedrockServer.withLoading().then(()=>{
    // hook raw
    asmcode.onPacketRaw = makefunc.np(onPacketRaw, PacketSharedPtr, null, OnPacketRBP, int32_t, NetworkHandler.Connection);
    procHacker.patching('hook-packet-raw', 'NetworkHandler::_sortAndPacketizeEvents', 0x1f1,
        asmcode.packetRawHook, Register.rax, true, [
            0x8B, 0xD6,                               // mov edx,esi
            0x48, 0x8D, 0x8D, 0xB8, 0x00, 0x00, 0x00, // lea rcx,qword ptr ss:[rbp+78]
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF,             // call <bedrock_server.public: static class std::shared_ptr<class Packet> __cdecl MinecraftPackets::createPacket(enum MinecraftPacketIds)>
            0x90                                      // nop
        ], [10, 14]);

    // hook before
    asmcode.onPacketBefore = makefunc.np(onPacketBefore, ExtendedStreamReadResult, null, ExtendedStreamReadResult, OnPacketRBP, int32_t);
    procHacker.patching('hook-packet-before', 'NetworkHandler::_sortAndPacketizeEvents', 0x2f4,
        asmcode.packetBeforeHook, // original code depended
        Register.rax,
        true, [
            0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
            0x4C, 0x8D, 0x85, 0x00, 0x01, 0x00, 0x00, // lea r8,qword ptr ss:[rbp+100]
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
    asmcode.onPacketAfter = makefunc.np(onPacketAfter, void_t, null, OnPacketRBP, int32_t);
    procHacker.patching('hook-packet-after', 'NetworkHandler::_sortAndPacketizeEvents', 0x475,
        asmcode.packetAfterHook, // original code depended
        Register.rax, true, [
            0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
            0x4C, 0x8D, 0x8D, 0xB8, 0x00, 0x00, 0x00, // lea r9,qword ptr ss:[rbp+b8]
            0x4C, 0x8B, 0xC6, // mov r8,rsi
            0x49, 0x8B, 0xD6, // mov rdx,r14
            0xFF, 0x50, 0x08, // call qword ptr ds:[rax+8]
        ], []);

    const onPacketSendNp = makefunc.np(onPacketSend, void_t, null, NetworkHandler, NetworkIdentifier, Packet);
    asmcode.onPacketSend = onPacketSendNp;
    procHacker.hookingRawWithCallOriginal('NetworkHandler::send', onPacketSendNp, [Register.rcx, Register.rdx, Register.r8, Register.r9], []);
    procHacker.patching('hook-packet-send-all', 'LoopbackPacketSender::sendToClients', 0x90,
        asmcode.packetSendAllHook, // original code depended
        Register.rax, true, [
            0x49, 0x8B, 0x07, // mov rax,qword ptr ds:[r15]
            0x49, 0x8D, 0x96, 0x48, 0x02, 0x00, 0x00, // lea rdx,qword ptr ds:[r14+248]
            0x49, 0x8B, 0xCF, // mov rcx,r15
            0xFF, 0x50, 0x18, // call qword ptr ds:[rax+18]
        ], []);

    sendInternalOriginal = procHacker.hooking('NetworkHandler::_sendInternal', void_t, null,
        NetworkHandler, NetworkIdentifier, Packet, CxxStringWrapper)(onPacketSendInternal);
});
