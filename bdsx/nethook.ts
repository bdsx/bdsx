
import Event, { CapsuledEvent } from "krevent";
import { Register } from "./assembler";
import { NetworkHandler, NetworkIdentifier } from "./bds/networkidentifier";
import { createPacket as createPacketOld, createPacketRaw, ExtendedStreamReadResult, Packet, PacketSharedPtr, StreamReadResult } from "./bds/packet";
import { MinecraftPacketIds } from "./bds/packetids";
import { LoginPacket, PacketIdToType } from "./bds/packets";
import { proc, procHacker } from "./bds/proc";
import { abstract, CANCEL } from "./common";
import { NativePointer, StaticPointer, VoidPointer } from "./core";
import { makefunc, RawTypeId } from "./makefunc";
import { NativeClass } from "./nativeclass";
import { CxxStringWrapper } from "./pointer";
import { SharedPtr } from "./sharedpointer";
import { remapAndPrintError } from "./source-map-support";
import { hex, _tickCallback } from "./util";
import asmcode = require ('./asm/asmcode');

const MAX_PACKET_ID = 0x100;
const EVENT_INDEX_COUNT = 0x500;

class ReadOnlyBinaryStream extends NativeClass {
    data:CxxStringWrapper;

    read(dest:VoidPointer, size:number):boolean {
        abstract();
    }
}

ReadOnlyBinaryStream.abstract({
    data:[CxxStringWrapper.ref(), 0x38]
});
ReadOnlyBinaryStream.prototype.read = makefunc.js([0x8], RawTypeId.Boolean, {this: ReadOnlyBinaryStream}, VoidPointer, RawTypeId.FloatAsInt64);

class OnPacketRBP extends NativeClass {
    packet:SharedPtr<Packet>;
    stream:ReadOnlyBinaryStream;
    readResult:ExtendedStreamReadResult;
    networkHandler:NetworkHandler;
    connection:NetworkHandler.Connection;
}
OnPacketRBP.abstract({
    packet: [SharedPtr.make(Packet), 0x148],
    stream: [ReadOnlyBinaryStream, 0x1e0],
    readResult: [ExtendedStreamReadResult, 0x70],
    networkHandler: [NetworkHandler.ref(), -0xa8],
    connection: [NetworkHandler.Connection.ref(), -0xc8],
});

type AllEventTarget = Event<nethook.RawListener|nethook.BeforeListener<any>|nethook.AfterListener<any>|nethook.SendListener<any>|nethook.SendRawListener>;
type AnyEventTarget = Event<nethook.RawListener&nethook.BeforeListener<any>&nethook.AfterListener<any>&nethook.SendListener<any>&nethook.SendRawListener>;

const alltargets = new Array<AllEventTarget|null>(EVENT_INDEX_COUNT);
for (let i=0;i<EVENT_INDEX_COUNT;i++) {
    alltargets[i] = null;
}

function getNetEventTarget(type:nethook.EventType, packetId:MinecraftPacketIds):AnyEventTarget {
    if ((packetId>>>0) >= MAX_PACKET_ID) {
        throw Error(`Out of range: packetId < 0x100 (packetId=${packetId})`);
    }
    const id = type*MAX_PACKET_ID + packetId;
    let target = alltargets[id];
    if (target !== null) return target as AnyEventTarget;
    alltargets[id] = target = new Event;
    return target as AnyEventTarget;
}

export namespace nethook
{
    export type RawListener = (ptr:NativePointer, size:number, networkIdentifier:NetworkIdentifier, packetId: number)=>CANCEL|void;
    export type BeforeListener<ID extends MinecraftPacketIds> = (packet: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL|void;
    export type AfterListener<ID extends MinecraftPacketIds> = (packet: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL|void;
    export type SendListener<ID extends MinecraftPacketIds> = (packet: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL|void;
    export type SendRawListener = (ptr:NativePointer, size:number, networkIdentifier: NetworkIdentifier, packetId: number) => CANCEL|void;

    export enum EventType
    {
        Raw,
        Before,
        After,
        Send,
        SendRaw
    }

    const RAW_OFFSET = EventType.Raw*MAX_PACKET_ID;
    const BEFORE_OFFSET = EventType.Before*MAX_PACKET_ID;
    const AFTER_OFFSET = EventType.After*MAX_PACKET_ID;
    const SEND_OFFSET = EventType.Send*MAX_PACKET_ID;
    const SEND_AFTER_OFFSET = EventType.SendRaw*MAX_PACKET_ID;
        
    export function hooking(fireError:(err:any)=>void):void {
        function onPacketRaw(rbp:OnPacketRBP, packetId:MinecraftPacketIds, conn:NetworkHandler.Connection):PacketSharedPtr|null {
            try {
                if ((packetId>>>0) >= MAX_PACKET_ID) {
                    console.error(`onPacketRaw - Unexpected packetId: ${packetId}`);
                    return createPacketRaw(rbp.packet, packetId);
                }

                const ni = conn.networkIdentifier;
                nethook.lastSender = ni;
                const packet_dest = rbp.packet;
    
                const target = alltargets[packetId + RAW_OFFSET] as Event<RawListener>;
                if (target !== null && !target.isEmpty()) {
                    const s = rbp.stream;
                    const data = s.data;
                    const rawpacketptr = data.valueptr;
    
                    for (const listener of target.allListeners()) {
                        try {
                            const ptr = new NativePointer(rawpacketptr);
                            if (listener(ptr, data.length, ni, packetId) === CANCEL) {
                                _tickCallback();
                                return null;
                            }
                        } catch (err) {
                            fireError(err);
                        }
                    }
                    _tickCallback();
                }
                return createPacketRaw(packet_dest, packetId);
            } catch (err) {
                remapAndPrintError(err);
                return null;
            }
        }
        
        asmcode.onPacketRaw = makefunc.np(onPacketRaw, PacketSharedPtr, null, OnPacketRBP, RawTypeId.Int32, NetworkHandler.Connection);
        procHacker.patching('hook-packet-raw', 'NetworkHandler::_sortAndPacketizeEvents', 0x2c9, 
            asmcode.packetRawHook, Register.rax, true,
            [ 
                0x41, 0x8B, 0xD7,                           // 	mov edx,r15d
                0x48, 0x8D, 0x8D, 0x48, 0x01, 0x00, 0x00,   // 	lea rcx,qword ptr ss:[rbp+148]
                0xE8, 0xB8, 0x3A, 0x00, 0x00                // 	call <bedrock_server.public: static class std::shared_ptr<class Packet> __cdecl MinecraftPackets::createPacket(enum MinecraftPacketIds)>
            ],
            [ 11, 15 ]);
            
        function onPacketBefore(result:ExtendedStreamReadResult, rbp:OnPacketRBP, packetId:MinecraftPacketIds):ExtendedStreamReadResult {
            try {
                if ((packetId>>>0) >= MAX_PACKET_ID) {
                    console.error(`onPacketBefore - Unexpected packetId: ${packetId}`);
                    return result;
                }

                if (result.streamReadResult !== StreamReadResult.Pass) return result;
    
                const target = alltargets[packetId + BEFORE_OFFSET] as Event<BeforeListener<MinecraftPacketIds>>;
                if (target !== null && !target.isEmpty()) {
                    const packet = rbp.packet.p!;
                    const TypedPacket = PacketIdToType[packetId] || Packet;
                    const typedPacket = new TypedPacket(packet);
                    for (const listener of target.allListeners()) {
                        try {
                            if (listener(typedPacket, nethook.lastSender, packetId) === CANCEL) {
                                result.streamReadResult = StreamReadResult.Ignore;
                                _tickCallback();
                                return result;
                            }
                        } catch (err) {
                            fireError(err);
                        }
                    }
                    _tickCallback();
                }
            } catch (err) {
                remapAndPrintError(err);
            }
            return result;
        }

        /*
        mov rax,qword ptr ds:[rcx]
        lea r8,qword ptr ss:[rbp+1E0]
        lea rdx,qword ptr ss:[rbp+70]
        call qword ptr ds:[rax+28]
        */
        const packetBeforeOriginalCode = [ 0x48, 0x8B, 0x01, 0x4C, 0x8D, 0x85, 0xE0, 0x01, 0x00, 0x00, 0x48, 0x8D, 0x55, 0x70, 0xFF, 0x50, 0x28 ];

        asmcode.onPacketBefore = makefunc.np(onPacketBefore, ExtendedStreamReadResult, null, ExtendedStreamReadResult, OnPacketRBP, RawTypeId.Int32);
        procHacker.patching('hook-packet-before', 'NetworkHandler::_sortAndPacketizeEvents', 0x430, 
            asmcode.packetBeforeHook,
            Register.rax,
            true, 
            packetBeforeOriginalCode,
            []);

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
            Register.rax, false, packetViolationOriginalCode, [3, 7, 21, 24]);
                
        /*
        mov rax,qword ptr ds:[rcx]
        lea r9,qword ptr ss:[rbp+148]
        mov r8,rsi
        mov rdx,r13
        call qword ptr ds:[rax+8]
        */
        const packetAfterOriginalCode = [
            0x48, 0x8B, 0x01, 0x4C, 0x8D, 0x8D, 0x48, 0x01, 0x00, 0x00, 0x4C, 0x8B, 0xC6, 0x49, 0x8B, 0xD5, 0xFF, 0x50, 0x08
        ];
        function onPacketAfter(rbp:OnPacketRBP, packetId:MinecraftPacketIds):void {
            try {
                if ((packetId>>>0) >= MAX_PACKET_ID) {
                    console.error(`onPacketAfter - Unexpected packetId: ${packetId}`);
                    return;
                }
                const target = alltargets[packetId + AFTER_OFFSET] as Event<AfterListener<MinecraftPacketIds>>;
                if (target !== null && !target.isEmpty()) {
                    const packet = rbp.packet.p!;
                    const TypedPacket = PacketIdToType[packetId] || Packet;
                    const typedPacket = new TypedPacket(packet);
                    for (const listener of target.allListeners()) {
                        try {
                            listener(typedPacket, nethook.lastSender, packetId);
                        } catch (err) {
                            fireError(err);
                        }
                    }
                    _tickCallback();
                }
            } catch (err) {
                remapAndPrintError(err);
            }
        }

        asmcode.onPacketAfter = makefunc.np(onPacketAfter, RawTypeId.Void, null, OnPacketRBP, RawTypeId.Int32);
        procHacker.patching('hook-packet-after', 'NetworkHandler::_sortAndPacketizeEvents', 0x720, asmcode.packetAfterHook, Register.rax, true, packetAfterOriginalCode, []);

        const onPacketSend = makefunc.np((handler:NetworkHandler, ni:NetworkIdentifier, packet:Packet)=>{
            try {
                const packetId = packet.getId();
                if ((packetId>>>0) >= MAX_PACKET_ID) {
                    console.error(`onPacketSend - Unexpected packetId: ${packetId}`);
                    return;
                }
                
                const target = alltargets[packetId+SEND_OFFSET] as Event<SendListener<MinecraftPacketIds>>;
                if (target !== null && !target.isEmpty()) {
                    const TypedPacket = PacketIdToType[packetId] || Packet;
                    const packetptr = new TypedPacket(packet);
                    const ignore = target.fire(packetptr, ni, packetId) === CANCEL;
                    _tickCallback();
                    if (ignore) return;
                }
            } catch (err) {
                remapAndPrintError(err);
            }
        }, RawTypeId.Void, null, NetworkHandler, NetworkIdentifier, Packet);

        const onPacketSendRaw = makefunc.np((handler:NetworkHandler, ni:NetworkIdentifier, packet:Packet, data:CxxStringWrapper)=>{
            try {
                const packetId = packet.getId();
                if ((packetId>>>0) >= MAX_PACKET_ID) {
                    console.error(`onPacketSendAfter - Unexpected packetId: ${packetId}`);
                    return 1;
                }

                const target = alltargets[packetId+SEND_AFTER_OFFSET] as Event<SendRawListener>;
                if (target !== null && !target.isEmpty()) {
                    const ignore = target.fire(data.valueptr, data.length, ni, packetId) === CANCEL;
                    _tickCallback();
                    if (ignore) return 0;
                }
            } catch (err) {
                remapAndPrintError(err);
            }
            return 1;
        }, RawTypeId.Int32, null, NetworkHandler, NetworkIdentifier, Packet, CxxStringWrapper);

        const packetSendOriginalCode = [
            0x48, 0x8B, 0x81, 0x68, 0x02, 0x00, 0x00, // mov rax,qword ptr ds:[rcx+268]
            0x48, 0x8B, 0xD9, // mov rbx,rcx
            0x41, 0x0F, 0xB6, 0xE9, // movzx ebp,r9b
            0x49, 0x8B, 0xF8, // mov rdi,r8
            0x4C, 0x8B, 0xF2, // mov r14,rdx
        ];
        asmcode.onPacketSend = onPacketSend;
        procHacker.patching('hook-packet-send', 'NetworkHandler::send', 0x1A, asmcode.packetSendHook,
            Register.rax, true, packetSendOriginalCode, []);

        const packetSendAllOriginalCode = [
            0x49, 0x8B, 0x06, // mov rax,qword ptr ds:[r14]
            0x49, 0x8D, 0x97, 0x08, 0x02, 0x00, 0x00, // lea rdx,qword ptr ds:[r15+208]
            0x49, 0x8B, 0xCE, // mov rcx,r14
            0xFF, 0x50, 0x18, // call qword ptr ds:[rax+18]
        ];
        procHacker.patching('hook-packet-send-all', 'LoopbackPacketSender::sendToClients', 0xf0,
            asmcode.packetSendAllHook,
            Register.rax, true, packetSendAllOriginalCode, []);
        
        asmcode.onPacketSendRaw = onPacketSendRaw;
        asmcode.NetworkHandlerGetConnectionFromId = proc[`NetworkHandler::_getConnectionFromId`];
        procHacker.patching('hook-packet-send-after', 'NetworkHandler::_sendInternal', 0x14,
            asmcode.packetSendInternalHook,
            Register.rax, true,
            [
                0x4D, 0x8B, 0xF1, // mov r14,r9
                0x49, 0x8B, 0xF8, // mov rdi,r8
                0x48, 0x8B, 0xEA, // mov rbp,rdx
                0x48, 0x8B, 0xF1, // mov rsi,rcx
                0xE8, 0xAB, 0xE3, 0xFF, 0xFF // call <bedrock_server.private: class NetworkHandler::Connection * __ptr64 __cdecl NetworkHandler::_getConnectionFromId(class NetworkIdentifier const & __ptr64)const __ptr64>
            ], 
            [10, 14]);
    }

    export let lastSender:NetworkIdentifier;

    /**
     * @deprecated just use `connreq.cert.get*()` from LoginPacket directly
     * @param ptr login packet pointer
     * @return [xuid, username]
     */
    export function readLoginPacket(packet: StaticPointer):[string, string] {
        const loginpacket = new LoginPacket(packet);
        const conn = loginpacket.connreq;
        if (conn !== null) {
            const cert = conn.cert;
            if (cert !== null) {
                return [cert.getXuid(), cert.getId()];
            }
        }
        throw Error('LoginPacket does not have cert info');
    }
    
    /**
     * @deprecated use nethook.*
     */
    export function getEventTarget(type:EventType, packetId:MinecraftPacketIds):AnyEventTarget {
        return getNetEventTarget(type, packetId);
    }

    /**
     * @deprecated use *Packet.create() instead
     */
    export const createPacket = createPacketOld;

    /**
     * @deprecated use packet.sendTo instead
     */
    export function sendPacket(networkIdentifier:NetworkIdentifier, packet:StaticPointer, unknownarg:number=0):void {
        new Packet(packet).sendTo(networkIdentifier, 0);
    }
    
    /**
     * before 'before' and 'after'
     * earliest event for the packet receiving.
     * It will bring raw packet buffers before parsing
     * It will cancel the packet if you return false
     */
    export function raw(id:MinecraftPacketIds):CapsuledEvent<nethook.RawListener> {
        return nethook.getEventTarget(nethook.EventType.Raw, id);
    }

    /**
     * after 'raw', before 'after'
     * the event that before processing but after parsed from raw.
     */
    export function before<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.BeforeListener<ID>> {
        return nethook.getEventTarget(nethook.EventType.Before, id);
    }

    /**
     * after 'raw' and 'before'
     * the event that after processing. some fields are assigned after the processing
     */
    export function after<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.AfterListener<ID>> {
        return nethook.getEventTarget(nethook.EventType.After, id);
    }

    /**
     * before serializing.
     * it can modify class fields.
     */
    export function send<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.SendListener<ID>> {
        return nethook.getEventTarget(nethook.EventType.Send, id);
    }

    /**
     * after serializing. before sending.
     * it can access serialized buffer.
     */
    export function sendRaw(id:number):CapsuledEvent<nethook.SendRawListener> {
        return nethook.getEventTarget(nethook.EventType.SendRaw, id);
    }

    /** @deprecated use NetworkIdentifier.close */
    export const close:CapsuledEvent<(networkIdentifier:NetworkIdentifier)=>void> = NetworkIdentifier.close;

    /**
     * Write all packets to console
     */
    export function watchAll(exceptions:MinecraftPacketIds[] = [
        MinecraftPacketIds.ClientCacheBlobStatus,
        MinecraftPacketIds.LevelChunk,
        MinecraftPacketIds.ClientCacheMissResponse,
        MinecraftPacketIds.MoveEntityDelta,
        MinecraftPacketIds.SetEntityMotion,
        MinecraftPacketIds.SetEntityData,
    ]):void {
        const ex = new Set(exceptions);
        for (let i=1; i<=0x88; i++) {
            if (ex.has(i)) continue;
            before<MinecraftPacketIds>(i).on((ptr, ni, id)=>{
                console.log(`R ${MinecraftPacketIds[id]}(${id}) ${hex(ptr.getBuffer(0x10, 0x28))}`);
            });
        }
        for (let i=1; i<=0x88; i++) {
            if (ex.has(i)) continue;
            send<MinecraftPacketIds>(i).on((ptr, ni, id)=>{
                console.log(`S ${MinecraftPacketIds[id]}(${id}) ${hex(ptr.getBuffer(0x10, 0x28))}`);
            });
        }
    }
}
