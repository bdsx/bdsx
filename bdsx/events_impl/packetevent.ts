import { asmcode } from "../asm/asmcode";
import { Register } from "../assembler";
import { proc } from "../bds/proc";
import { abstract, CANCEL } from "../common";
import { VoidPointer } from "../core";
import { events } from "../events";
import { Event } from "../eventtarget";
import { hook } from "../hook";
import { bedrockServer } from "../launcher";
import { makefunc } from "../makefunc";
import { ExtendedStreamReadResult, LoopbackPacketSender, MinecraftPacketIds, MinecraftPackets, NetworkHandler, NetworkIdentifier, Packet, PacketViolationHandler, StreamReadResult } from "../minecraft";
import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { bool_t, int32_t, int64_as_float_t, void_t } from "../nativetype";
import { PacketIdToType } from "../packetidtotype";
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
    @nativeField(SharedPtr.make(Packet), 0x78)
    packet:SharedPtr<Packet>;
    @nativeField(ReadOnlyBinaryStream, 0xc0)
    stream:ReadOnlyBinaryStream;
}

let sendInternalOriginal:(this:NetworkHandler, ni:NetworkIdentifier, packet:Packet, data:CxxStringWrapper)=>void;

const PacketSharedPtr = SharedPtr.make(Packet);
const createPacketRaw = hook(MinecraftPackets.createPacket).reform(void_t, null, PacketSharedPtr, int32_t);

function onPacketRaw(rbp:OnPacketRBP, packetId:MinecraftPacketIds, conn:NetworkHandler.Connection):SharedPtr<Packet>|null {
    try {
        const target = events.packetEvent(events.PacketEventType.Raw, packetId) as Event<events.RawListener>;
        const ni = conn.networkIdentifier;
        NetworkIdentifier.lastSender = ni;
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
        createPacketRaw(rbp.packet, packetId);
        return rbp.packet;
    } catch (err) {
        remapAndPrintError(err);
        return null;
    }
}
function onPacketBefore(result:ExtendedStreamReadResult, rbp:OnPacketRBP, packetId:MinecraftPacketIds):ExtendedStreamReadResult {
    try {
        if (result.streamReadResult !== StreamReadResult.NoError) return result;

        const target = events.packetEvent(events.PacketEventType.Before, packetId) as Event<events.BeforeListener<MinecraftPacketIds>>;
        if (target !== null && !target.isEmpty()) {
            const packet = rbp.packet.p!;
            const ni = NetworkIdentifier.lastSender;
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
        const target = events.packetEvent(events.PacketEventType.After, packetId) as Event<events.AfterListener<MinecraftPacketIds>>;
        if (target !== null && !target.isEmpty()) {
            const ni = NetworkIdentifier.lastSender;
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
        const target = events.packetEvent(events.PacketEventType.Send, packetId) as Event<events.SendListener<MinecraftPacketIds>>;
        if (target !== null && !target.isEmpty()) {
            const TypedPacket = PacketIdToType[packetId] || Packet;
            const typedPacket = packet.as(TypedPacket);
            for (const listener of target.allListeners()) {
                try {
                    if (listener(typedPacket, ni, packetId) === CANCEL) {
                        _tickCallback();
                        return;
                    }
                } catch (err) {
                    events.errorFire(err);
                }
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
}
function onPacketSendInternal(this:NetworkHandler, ni:NetworkIdentifier, packet:Packet, data:CxxStringWrapper):void {
    try {
        const packetId = packet.getId();
        const target = events.packetEvent(events.PacketEventType.SendRaw, packetId) as Event<events.SendRawListener>;
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
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    sendInternalOriginal.call(this, ni, packet, data);
}

bedrockServer.withLoading().then(()=>{
    // hook raw
    asmcode.onPacketRaw = makefunc.np(onPacketRaw, PacketSharedPtr, null, OnPacketRBP, int32_t, NetworkHandler.Connection);
    const packetlizer = hook(NetworkHandler, '_sortAndPacketizeEvents');
    packetlizer.patch('hook-packet-raw', 0x240, asmcode.packetRawHook, Register.rax, true, [
        0x8B, 0xD6,                     // mov edx,esi
        0x48, 0x8D, 0x4D, 0x78,         // lea rcx,qword ptr ss:[rbp+78]
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,   // call <bedrock_server.public: static class std::shared_ptr<class Packet> __cdecl MinecraftPackets::createPacket(enum MinecraftPacketIds)>
        0x90                            // nop
    ], [7, 11]);

    // hook before
    asmcode.onPacketBefore = makefunc.np(onPacketBefore, ExtendedStreamReadResult, null, ExtendedStreamReadResult, OnPacketRBP, int32_t);
    packetlizer.patch(
        'hook-packet-before', 0x328,
        asmcode.packetBeforeHook, // original code depended
        Register.rax,
        true, [
            0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
            0x4C, 0x8D, 0x85, 0xC0, 0x00, 0x00, 0x00, // lea r8,qword ptr ss:[rbp+C0]
            0x48, 0x8D, 0x55, 0xA0, //lea rdx,qword ptr ss:[rbp-60]
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
    hook(PacketViolationHandler, '_handleViolation').patch(
        'hook-packet-before-skip', 0,
        asmcode.packetBeforeCancelHandling,
        Register.rax, false, packetViolationOriginalCode, [3, 7, 21, 24]);

    // hook after
    asmcode.onPacketAfter = makefunc.np(onPacketAfter, void_t, null, OnPacketRBP, int32_t);
    packetlizer.patch(
        'hook-packet-after', 0x48d,
        asmcode.packetAfterHook, // original code depended
        Register.rax, true, [
            0x48, 0x8B, 0x01, // mov rax,qword ptr ds:[rcx]
            0x4C, 0x8D, 0x4D, 0x78, // lea r9,qword ptr ss:[rbp+78]
            0x4C, 0x8B, 0xC6, // mov r8,rsi
            0x49, 0x8B, 0xD6, // mov rdx,r14
            0xFF, 0x50, 0x08, // call qword ptr ds:[rax+8]
        ], []);

    const onPacketSendNp = makefunc.np(onPacketSend, void_t, null, NetworkHandler, NetworkIdentifier, Packet);
    asmcode.onPacketSend = onPacketSendNp;
    hook(NetworkHandler, 'send').raw(onPacketSendNp, {callOriginal: true});
    hook(LoopbackPacketSender, 'sendToClients').patch(
        'hook-packet-send-all', 0x90,
        asmcode.packetSendAllHook, // original code depended
        Register.rax, true, [
            0x49, 0x8B, 0x07, // mov rax,qword ptr ds:[r15]
            0x49, 0x8D, 0x96, 0x20, 0x02, 0x00, 0x00, // lea rdx,qword ptr ds:[r14+220]
            0x49, 0x8B, 0xCF, // mov rcx,r15
            0xFF, 0x50, 0x18, // call qword ptr ds:[rax+18]
        ], []);

    sendInternalOriginal = hook(NetworkHandler, '_sendInternal').call(onPacketSendInternal);
});
