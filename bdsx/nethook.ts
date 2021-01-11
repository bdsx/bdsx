
import { asm, OperationSize, Register } from "./assembler";
import { NetworkHandler, NetworkIdentifier } from "./bds/networkidentifier";
import { createPacket as createPacketOld, ExtendedStreamReadResult, Packet, PacketSharedPtr, createPacketRawFunc, StreamReadResult } from "./bds/packet";
import { MinecraftPacketIds } from "./bds/packetids";
import { LoginPacket, PacketIdToType, TextPacket } from "./bds/packets";
import { proc } from "./bds/proc";
import { makefunc_vf } from "./capi";
import { RawTypeId } from "./common";
import { makefunc, NativePointer, StaticPointer, StructurePointer, VoidPointer } from "./core";
import { exehacker } from "./exehacker";
import { NativeClass } from "./nativeclass";
import { CxxStringPointer, Pointer } from "./pointer";
import { SharedPtr } from "./sharedpointer";
import { _tickCallback } from "./util";

enum EventType
{
    Raw,
    Before,
    After,
    Send
}

const MAX_PACKET_ID = 0x100;

type RawListener = (ptr: NativePointer, size: number, networkIdentifier: NetworkIdentifier, packetId: number) => void | boolean;
type CxxListener<ID extends MinecraftPacketIds> = (ptr: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => void | boolean;
type ConnectionClosedListener = (networkIdentifier: NetworkIdentifier) => void;

const allListeners = new Map<number, RawListener|CxxListener<any>>();

function getEventIndex(type:EventType, id:MinecraftPacketIds):number
{
	return type * MAX_PACKET_ID + id;
}

function setCallback<ID extends MinecraftPacketIds>(type:EventType, packetId:ID, func:RawListener|CxxListener<ID>|null):void
{
    if (packetId < 0 || packetId >= MAX_PACKET_ID)
    {
        throw Error(`Out of range: packetId < 0x100 (packetId=${packetId})`);
    }
    const id = getEventIndex(type, packetId);
    if (func === null)
    {
		allListeners.delete(id);
    }
    else
    {
		allListeners.set(id, func);
    }
}

class ReadOnlyBinaryStream extends NativeClass
{
    data:CxxStringPointer;

    read(dest:VoidPointer, size:number):boolean
    {
        throw 'abstract';
    }
}

ReadOnlyBinaryStream.abstract({
    data:[CxxStringPointer, 0x38]
});
ReadOnlyBinaryStream.prototype.read = makefunc_vf(0, 0x8, RawTypeId.Boolean, false, VoidPointer, RawTypeId.FloatAsInt64);

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

export function patchForNethook(fireError:(err:any)=>void):void
{
    function onPacketRaw(rbp:OnPacketRBP, packetId:MinecraftPacketIds, conn:NetworkHandler.Connection):PacketSharedPtr|null
    {
        const ni = conn.networkIdentifier;
        nethook.lastSender = ni;
        const packet_dest = rbp.packet;

        const listener = allListeners.get(getEventIndex(EventType.Raw, packetId)) as RawListener;
        if (listener !== undefined) 
        {
            const s = rbp.stream;
            const data = s.data;
            const rawpacketptr = new NativePointer(data.pptr);

            let ignore:boolean;
            try
            {
                ignore = listener(rawpacketptr, data.length, ni, packetId) === false;
            }
            catch (err)
            {
                ignore = false;
                fireError(err);
            }
            _tickCallback();
            if (ignore) return null;
        }
        createPacketRawFunc(packet_dest, packetId);
        return packet_dest;
    }
    
    exehacker.patching('hook-packet-raw', 'NetworkHandler::_sortAndPacketizeEvents', 0x2c9, 
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
        if (result.streamReadResult != StreamReadResult.Pass) return result;

        const listener = allListeners.get(getEventIndex(EventType.Before, packetId)) as CxxListener<MinecraftPacketIds>;
        if (listener === undefined) return result;

        const packet = rbp.packet.p!;
        const TypedPacket = PacketIdToType[packetId];
        const typedPacket = new TypedPacket(packet);

        try
        {
            const ignore = listener(typedPacket, nethook.lastSender, packetId) == false;
            if (ignore)
            {
                result.streamReadResult = StreamReadResult.Ignore;
            }
        }
        catch (err)
        {
            fireError(err);
        }
        _tickCallback();
        return result;
    }

    /*
    mov rax,qword ptr ds:[rcx]
    lea r8,qword ptr ss:[rbp+1E0]
    lea rdx,qword ptr ss:[rbp+70]
    call qword ptr ds:[rax+28]
    */
    const packetBeforeOriginalCode = [ 0x48, 0x8B, 0x01, 0x4C, 0x8D, 0x85, 0xE0, 0x01, 0x00, 0x00, 0x48, 0x8D, 0x55, 0x70, 0xFF, 0x50, 0x28 ];

    exehacker.patching('hook-packet-before', 'NetworkHandler::_sortAndPacketizeEvents', 0x430, 
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
    exehacker.patching('hook-packet-before-skip', 'PacketViolationHandler::_handleViolation', 0, 
        asm()
        .cmp_r_c(Register.r8, 0x7f)
        .jz(9)
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
        const listener = allListeners.get(getEventIndex(EventType.After, packetId)) as CxxListener<MinecraftPacketIds>;
        if (listener === undefined) return;

        const packet = rbp.packet.p!;
        const TypedPacket = PacketIdToType[packetId];
        const typedPacket = new TypedPacket(packet);

        try
        {
            listener(typedPacket, nethook.lastSender, packetId);
        }
        catch (err)
        {
            fireError(err);
        }
        _tickCallback();
    }
    exehacker.patching('hook-packet-after', 'NetworkHandler::_sortAndPacketizeEvents', 0x720, 
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

    // const packetSendOriginalCode = [
    //     0x48, 0x8B, 0x81, 0x48, 0x02, 0x00, 0x00, // mov rax,qword ptr ds:[rcx+248]
    //     0x48, 0x8B, 0xD9, // mov rbx,rcx
    //     0x41, 0x0F, 0xB6, 0xE9, // movzx ebp,r9b
    //     0x49, 0x8B, 0xF8, // mov rdi,r8
    //     0x4C, 0x8B, 0xF2, // mov r14,rdx
    // ];
    // exehacker.patching('hook-packet-send', 'NetworkHandler::send', 0x1A, 
    //     asm()
    //     .write(...packetSendOriginalCode.slice(7, 20))
    //     .sub_r_c(Register.rsp, 0x28)
    //     .call64(callback, Register.rax) // void(*callback)(NetworkHandler*, const NetworkIdentifier&, Packet*, unsigned char)
    //     .add_r_c(Register.rsp, 0x28)
    //     .mov_r_rp(Register.rax, Register.rbx, 0x248)
    //     .mov_r_r(Register.r8, Register.rdi)
    //     .ret()
    //     .alloc(),
    //     Register.rax, true, packetSendOriginalCode, []);

    function onPacketSend(handler:NetworkHandler, ni:NetworkIdentifier, packet:Packet, data:CxxStringPointer):NetworkHandler.Connection|null
    {
        const packetId = packet.getId();
        
        const listener = allListeners.get(getEventIndex(EventType.Send, packetId)) as CxxListener<MinecraftPacketIds>;
        if (listener !== undefined)
        {
            const TypedPacket = PacketIdToType[packetId];
            const packetptr = new TypedPacket(packet);
        
        	let ignore:boolean;
        	try
        	{
        		ignore = listener(packetptr, ni, packetId) === false;
        	}
        	catch (err)
        	{
                ignore = false;
                fireError(err);
        	}
        	_tickCallback();
        	if (ignore) return null;
        }
        return handler.getConnectionFromId(ni);
    }
    exehacker.patching('hook-packet-send', 'NetworkHandler::_sendInternal', 0x14,
        asm()
        .mov_r_r(Register.r14, Register.r9)
        .mov_r_r(Register.rdi, Register.r8)
        .sub_r_r(Register.rbp, Register.rdx)
        .mov_r_r(Register.rsi, Register.rcx)
        .add_r_c(Register.rsp, 0x28)
        .call64(makefunc.np(onPacketSend, NetworkHandler.Connection, null, NetworkHandler, NetworkIdentifier, Packet, CxxStringPointer), Register.rax)
        .add_r_c(Register.rsp, 0x28)
        .ret()
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

export let onConnectionClosed:ConnectionClosedListener|null = null;

export namespace nethook
{
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

    /**
    * @param packetId You can use enum PacketId
    * It will bring parsed packets by the native
    * It will cancel the packet if you return false
    * Maybe you cannot find any documents about the parsed packet structure
    * You need to discover it self!
    */
    export function setOnPacketBeforeListener<ID extends MinecraftPacketIds>(packetId: ID, listener: CxxListener<ID>|null): void
    {
        setCallback(EventType.Before, packetId, listener);
    }
    /**
    * @param packetId You can use enum PacketId
    * It will bring parsed packets by the native
    * This event is called after the packet process, So It's too late to cancel packet.
    * Maybe you cannot find any documents about the parsed packet structure
    * You need to discover it self!
    */
    export function setOnPacketAfterListener<ID extends MinecraftPacketIds>(packetId: ID, listener: CxxListener<ID>|null): void
    {
        setCallback(EventType.After, packetId, listener);
    }

    /**
    * @param packetId You can use enum PacketId
    * Maybe you cannot find any documents about the parsed packet structure
    * You need to discover it self!
    */
    export function setOnPacketSendListener<ID extends MinecraftPacketIds>(packetId: number, listener: CxxListener<ID>|null): void
    {
        setCallback(EventType.Send, packetId, listener);
    }

    export function setOnConnectionClosedListener(listener: ConnectionClosedListener|null): void
    {
        onConnectionClosed = listener;
    }

    /**
     * @deprecated use *Packet.create() instead
     */
    export const createPacket = createPacketOld;


    /**
     * @deprecated use packet.sendTo instead
     */
    export function sendPacket(networkIdentifier:NetworkIdentifier, packet:StaticPointer, unknownarg?:number):void
    {
        new Packet(packet).sendTo(networkIdentifier, unknownarg);
    }

    /**
    * @param packetId You can use enum PacketId
    * It will bring raw packet buffers before parsing
    * It will cancel the packet if you return false
    */
    export function setOnPacketRawListener(packetId: MinecraftPacketIds, listener: (RawListener|null)):void
    {
        setCallback(EventType.Raw, packetId, listener);
    }
}