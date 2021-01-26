
import Event from "krevent";
import { asm, OperationSize, Register } from "./assembler";
import { NetworkHandler, NetworkIdentifier } from "./bds/networkidentifier";
import { createPacket as createPacketOld, createPacketRaw, ExtendedStreamReadResult, Packet, PacketSharedPtr, StreamReadResult } from "./bds/packet";
import { MinecraftPacketIds } from "./bds/packetids";
import { LoginPacket, PacketIdToType } from "./bds/packets";
import { proc, procHacker } from "./bds/proc";
import { abstract, CANCEL, RawTypeId } from "./common";
import { makefunc, NativePointer, StaticPointer, VoidPointer } from "./core";
import { NativeClass } from "./nativeclass";
import { CxxStringPointer, CxxStringStructure } from "./pointer";
import { SharedPtr } from "./sharedpointer";
import { remapStack } from "./source-map-support";
import { _tickCallback } from "./util";

const MAX_PACKET_ID = 0x100;
const EVENT_INDEX_COUNT = 0x400;

class ReadOnlyBinaryStream extends NativeClass
{
    data:CxxStringStructure;

    read(dest:VoidPointer, size:number):boolean
    {
        abstract();
    }
}

ReadOnlyBinaryStream.abstract({
    data:[CxxStringStructure.ref(), 0x38]
});
ReadOnlyBinaryStream.prototype.read = makefunc.js([0x8], RawTypeId.Boolean, {this: ReadOnlyBinaryStream}, VoidPointer, RawTypeId.FloatAsInt64);

class OnPacketRBP extends NativeClass
{
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

export namespace nethook
{
    export type RawListener = (ptr:NativePointer, size:number, networkIdentifier:NetworkIdentifier, packetId: number)=>CANCEL|void;
    export type BeforeListener<ID extends MinecraftPacketIds> = (ptr: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL|void;
    export type AfterListener<ID extends MinecraftPacketIds> = (ptr: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => void;
    export type SendListener<ID extends MinecraftPacketIds> = (ptr: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL|void;
    type AllEventTarget = Event<RawListener|BeforeListener<any>|AfterListener<any>|SendListener<any>>;
    type AnyEventTarget = Event<RawListener&BeforeListener<any>&AfterListener<any>&SendListener<any>>;
    
    const alltargets = new Array<AllEventTarget|null>(EVENT_INDEX_COUNT);
    for (let i=0;i<EVENT_INDEX_COUNT;i++)
    {
        alltargets[i] = null;
    }

    export enum EventType
    {
        Raw,
        Before,
        After,
        Send
    }

    const RAW_OFFSET = EventType.Raw*MAX_PACKET_ID;
    const BEFORE_OFFSET = EventType.Before*MAX_PACKET_ID;
    const AFTER_OFFSET = EventType.After*MAX_PACKET_ID;
    const SEND_OFFSET = EventType.Send*MAX_PACKET_ID;
        
    export function hooking(fireError:(err:any)=>void):void
    {
        function onPacketRaw(rbp:OnPacketRBP, packetId:MinecraftPacketIds, conn:NetworkHandler.Connection):PacketSharedPtr|null
        {
            try
            {
                if ((packetId>>>0) >= MAX_PACKET_ID)
                {
                    console.error(`onPacketRaw - Unexpected packetId: ${packetId}`);
                    return createPacketRaw(rbp.packet, packetId);
                }

                const ni = conn.networkIdentifier;
                nethook.lastSender = ni;
                const packet_dest = rbp.packet;
    
                const target = alltargets[packetId + RAW_OFFSET] as Event<RawListener>;
                if (target !== null && !target.isEmpty()) 
                {
                    const s = rbp.stream;
                    const data = s.data;
                    const rawpacketptr = data.valueptr;
    
                    for (const listener of target.allListeners())
                    {
                        try
                        {
                            const ptr = new NativePointer(rawpacketptr);
                            if (listener(ptr, data.length, ni, packetId) === CANCEL)
                            {
                                _tickCallback();
                                return null;
                            }
                        }
                        catch (err)
                        {
                            fireError(err);
                        }
                    }
                    _tickCallback();
                }
                return createPacketRaw(packet_dest, packetId);
            }
            catch (err)
            {
                console.error(remapStack(err.stack));
                return null;
            }
        }
        
        procHacker.patching('hook-packet-raw', 'NetworkHandler::_sortAndPacketizeEvents', 0x2c9, 
            asm()
            .sub_r_c(Register.rsp, 0x28)
            .mov_r_r(Register.rcx, Register.rbp) // rbp
            .mov_r_r(Register.rdx, Register.r15) // packetId
            .mov_r_r(Register.r8, Register.r13) // Connection
            .call64(makefunc.np(onPacketRaw, PacketSharedPtr, null, OnPacketRBP, RawTypeId.Int32, NetworkHandler.Connection), Register.rax)
            .add_r_c(Register.rsp, 0x28)
            .ret()
            .alloc(), Register.rax, true,
            [ 
                0x41, 0x8B, 0xD7,                           // 	mov edx,r15d
                0x48, 0x8D, 0x8D, 0x48, 0x01, 0x00, 0x00,   // 	lea rcx,qword ptr ss:[rbp+148]
                0xE8, 0xB8, 0x3A, 0x00, 0x00                // 	call <bedrock_server.public: static class std::shared_ptr<class Packet> __cdecl MinecraftPackets::createPacket(enum MinecraftPacketIds)>
            ],
            [ 11, 15 ]);
            
        function onPacketBefore(result:ExtendedStreamReadResult, rbp:OnPacketRBP, packetId:MinecraftPacketIds):ExtendedStreamReadResult
        {
            try
            {
                if ((packetId>>>0) >= MAX_PACKET_ID)
                {
                    console.error(`onPacketBefore - Unexpected packetId: ${packetId}`);
                    return result;
                }

                if (result.streamReadResult != StreamReadResult.Pass) return result;
    
                const target = alltargets[packetId + BEFORE_OFFSET] as Event<BeforeListener<MinecraftPacketIds>>;
                if (target !== null && !target.isEmpty())
                {
                    const packet = rbp.packet.p!;
                    const TypedPacket = PacketIdToType[packetId] || Packet;
                    const typedPacket = new TypedPacket(packet);
                    for (const listener of target.allListeners())
                    {
                        try
                        {
                            if (listener(typedPacket, nethook.lastSender, packetId) === CANCEL)
                            {
                                result.streamReadResult = StreamReadResult.Ignore;
                                _tickCallback();
                                return result;
                            }
                        }
                        catch (err)
                        {
                            fireError(err);
                        }
                    }
                    _tickCallback();
                }
            }
            catch (err)
            {
                console.error(remapStack(err.stack));
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

        procHacker.patching('hook-packet-before', 'NetworkHandler::_sortAndPacketizeEvents', 0x430, 
            asm()
            .sub_r_c(Register.rsp, 0x28)
            .write(...packetBeforeOriginalCode)
            .mov_r_r(Register.rcx, Register.rax) // read result
            .mov_r_r(Register.rdx, Register.rbp) // rbp
            .mov_r_r(Register.r8, Register.r15) // packetId
            .call64(makefunc.np(onPacketBefore, ExtendedStreamReadResult, null, ExtendedStreamReadResult, OnPacketRBP, RawTypeId.Int32), Register.rax)
            .add_r_c(Register.rsp, 0x28)
            .ret()
            .alloc(),
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
        procHacker.patching('hook-packet-before-skip', 'PacketViolationHandler::_handleViolation', 0, 
            asm()
            .cmp_r_c(Register.r8, 0x7f)
            .jnz(9)
            .mov_r_rp(Register.rax, Register.rsp, 0x28)
            .mov_rp_c(Register.rax, 0, 0, OperationSize.byte)
            .ret()
            .write(...packetViolationOriginalCode)
            .jmp64(proc['PacketViolationHandler::_handleViolation'].add(packetViolationOriginalCode.length), Register.rax)
            .alloc(), 
            Register.rax, false, packetViolationOriginalCode, [3, 7, 21, 24])
                
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
        function onPacketAfter(rbp:OnPacketRBP, packetId:MinecraftPacketIds):void
        {
            try
            {
                if ((packetId>>>0) >= MAX_PACKET_ID)
                {
                    console.error(`onPacketAfter - Unexpected packetId: ${packetId}`);
                    return;
                }
                const target = alltargets[packetId + AFTER_OFFSET] as Event<AfterListener<MinecraftPacketIds>>;
                if (target !== null && !target.isEmpty())
                {
                    const packet = rbp.packet.p!;
                    const TypedPacket = PacketIdToType[packetId] || Packet;
                    const typedPacket = new TypedPacket(packet);
                    for (const listener of target.allListeners())
                    {
                        try
                        {
                            listener(typedPacket, nethook.lastSender, packetId);
                        }
                        catch (err)
                        {
                            fireError(err);
                        }
                    }
                    _tickCallback();
                }
            }
            catch (err)
            {
                console.error(remapStack(err.stack));
            }
        }
        procHacker.patching('hook-packet-after', 'NetworkHandler::_sortAndPacketizeEvents', 0x720, 
            asm()
            .sub_r_c(Register.rsp, 0x28)
            .write(...packetAfterOriginalCode)
            .mov_r_r(Register.rcx, Register.rbp) // rbp
            .mov_r_r(Register.rdx, Register.r15) // packetId
            .call64(makefunc.np(onPacketAfter, RawTypeId.Void, null, OnPacketRBP, RawTypeId.Int32), Register.rax)
            .add_r_c(Register.rsp, 0x28)
            .ret()
            .alloc(), 
            Register.rax, true, packetAfterOriginalCode, []);

        const onPacketSend = makefunc.np((handler:NetworkHandler, ni:NetworkIdentifier, packet:Packet, data:CxxStringPointer)=>{
            try
            {
                const packetId = packet.getId();
                if ((packetId>>>0) >= MAX_PACKET_ID)
                {
                    console.error(`onPacketSend - Unexpected packetId: ${packetId}`);
                    return;
                }
                
                const target = alltargets[packetId+SEND_OFFSET] as Event<SendListener<MinecraftPacketIds>>;
                if (target !== null && !target.isEmpty())
                {
                    const TypedPacket = PacketIdToType[packetId] || Packet;
                    const packetptr = new TypedPacket(packet);
                    const ignore = target.fire(packetptr, ni, packetId) === CANCEL;
                    _tickCallback();
                    if (ignore) return;
                }
            }
            catch (err)
            {
                console.error(remapStack(err.stack));
            }
        }, RawTypeId.Void, null, NetworkHandler, NetworkIdentifier, Packet, CxxStringPointer);

        const packetSendOriginalCode = [
            0x48, 0x8B, 0x81, 0x68, 0x02, 0x00, 0x00, // mov rax,qword ptr ds:[rcx+268]
            0x48, 0x8B, 0xD9, // mov rbx,rcx
            0x41, 0x0F, 0xB6, 0xE9, // movzx ebp,r9b
            0x49, 0x8B, 0xF8, // mov rdi,r8
            0x4C, 0x8B, 0xF2, // mov r14,rdx
        ];
        procHacker.patching('hook-packet-send', 'NetworkHandler::send', 0x1A, 
            asm()
            .write(...packetSendOriginalCode.slice(7))
            .sub_r_c(Register.rsp, 0x28)
            .call64(onPacketSend, Register.rax)
            .add_r_c(Register.rsp, 0x28)
            .mov_r_rp(Register.rax, Register.rbx, 0x268)
            .mov_r_r(Register.r8, Register.rdi)
            .ret()
            .alloc(),
            Register.rax, true, packetSendOriginalCode, []);
        
        procHacker.patching('hook-packet-send', 'NetworkHandler::_sendInternal', 0x14,
            asm()
            .mov_r_r(Register.r14, Register.r9)
            .mov_r_r(Register.rdi, Register.r8)
            .mov_r_r(Register.rbp, Register.rdx)
            .mov_r_r(Register.rsi, Register.rcx)
            .sub_r_c(Register.rsp, 0x28)
            .call64(onPacketSend, Register.rax)
            .add_r_c(Register.rsp, 0x28)
            .mov_r_r(Register.rcx, Register.rsi)
            .mov_r_r(Register.rdx, Register.rbp)
            .jmp64(proc[`NetworkHandler::_getConnectionFromId`], Register.rax)
            .alloc(),
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
    export function readLoginPacket(packet: StaticPointer):[string, string]
    {
        const loginpacket = new LoginPacket(packet);
        const conn = loginpacket.connreq;
        if (conn !== null)
        {
            const cert = conn.cert;
            if (cert !== null)
            {
                return [cert.getXuid(), cert.getId()];
            }
        }
        throw Error('LoginPacket does not have cert info');
    }
    
    export function getEventTarget(type:EventType, packetId:MinecraftPacketIds):AnyEventTarget
    {
        if ((packetId>>>0) >= MAX_PACKET_ID)
        {
            throw Error(`Out of range: packetId < 0x100 (packetId=${packetId})`);
        }
        const id = type*MAX_PACKET_ID + packetId;
        let target = alltargets[id];
        if (target !== null) return target as AnyEventTarget;
        alltargets[id] = target = new Event;
        return target as AnyEventTarget;
    }

    /**
     * @deprecated use *Packet.create() instead
     */
    export const createPacket = createPacketOld;

    /**
     * @deprecated use packet.sendTo instead
     */
    export function sendPacket(networkIdentifier:NetworkIdentifier, packet:StaticPointer, unknownarg:number=0):void
    {
        new Packet(packet).sendTo(networkIdentifier, 0);
    }
}