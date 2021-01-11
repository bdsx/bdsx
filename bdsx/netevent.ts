import { NativePointer } from "./core";
import { EventEx, CapsuledEvent } from "krevent";
import { CANCEL } from "./common";

import { NetworkIdentifier } from "./bds/networkidentifier";
import { nethook } from "./nethook";

import readLoginPacket = nethook.readLoginPacket;
import { MinecraftPacketIds } from "./bds/packetids";
import { PacketIdToType } from "./bds/packets";
import { hex } from "./util";

export { readLoginPacket };

type RawListener = (ptr:NativePointer, size:number, networkIdentifier:NetworkIdentifier, packetId: number)=>CANCEL|void;
type BeforeListener<ID extends MinecraftPacketIds> = (ptr: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL|void;
type SendListener<ID extends MinecraftPacketIds> = (ptr: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL|void;
type AfterListener<ID extends MinecraftPacketIds> = (ptr: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => void;

class NetEventRaw extends EventEx<RawListener>
{
    private readonly caller = (ptr:NativePointer, size:number, networkIdentifier:NetworkIdentifier, packetId:number)=>{
        const ptrlow = ptr.getAddressLow();
        const ptrhigh = ptr.getAddressHigh();
        for (const listener of this.allListeners())
        {
            try
            {
                ptr.setAddress(ptrlow, ptrhigh);
                const ret = listener(ptr, size, networkIdentifier, packetId);
                if (ret === CANCEL) return false;
            }
            catch(err)
            {
                console.error(err);
            }
        }
    };
    
    constructor(public readonly id:MinecraftPacketIds)
    {
        super();
    }
    onStarted():void
    {
        nethook.setOnPacketRawListener(this.id, this.caller);
    }
    onCleared():void
    {
        nethook.setOnPacketRawListener(this.id, null);
    }
}

class NetEventBefore<ID extends MinecraftPacketIds> extends EventEx<BeforeListener<ID>>
{
    private readonly caller = (ptr:PacketIdToType[ID], networkIdentifier:NetworkIdentifier, packetId:ID)=>{
        const ptrlow = ptr.getAddressLow();
        const ptrhigh = ptr.getAddressHigh();
        for (const listener of this.allListeners())
        {
            try
            {
                const ret = listener(ptr, networkIdentifier, packetId);
                if (ret === CANCEL) return false;
            }
            catch(err)
            {
                console.error(err);
            }
        }
    };
    
    constructor(public readonly id:MinecraftPacketIds)
    {
        super();
    }
    onStarted():void
    {
        nethook.setOnPacketBeforeListener(this.id, this.caller);
    }
    onCleared():void
    {
        nethook.setOnPacketBeforeListener(this.id, null);
    }
}

class NetEventAfter<ID extends MinecraftPacketIds> extends EventEx<AfterListener<ID>>
{
    private readonly caller = (ptr:PacketIdToType[ID], networkIdentifier:NetworkIdentifier, packetId:ID)=>{
        for (const listener of this.allListeners())
        {
            listener(ptr, networkIdentifier, packetId);
        }
    };
    
    constructor(public readonly id:MinecraftPacketIds)
    {
        super();
    }
    onStarted():void
    {
        nethook.setOnPacketAfterListener(this.id, this.caller);
    }
    onCleared():void
    {
        nethook.setOnPacketAfterListener(this.id, null);
    }
}

class NetEventSend<ID extends MinecraftPacketIds> extends EventEx<SendListener<ID>>
{
    private readonly caller = (ptr:PacketIdToType[ID], networkIdentifier:NetworkIdentifier, packetId:ID)=>{
        for (const listener of this.allListeners())
        {
            listener(ptr, networkIdentifier, packetId);
        }
    };
    
    constructor(public readonly id:MinecraftPacketIds)
    {
        super();
    }
    onStarted():void
    {
        nethook.setOnPacketSendListener(this.id, this.caller);
    }
    onCleared():void
    {
        nethook.setOnPacketSendListener(this.id, null);
    }
}

class CloseEvent extends EventEx<(networkIdentifier:NetworkIdentifier)=>void>
{
    private readonly caller = (networkIdentifier:NetworkIdentifier)=>{
        this.fire(networkIdentifier);
    };
    
    onStarted():void
    {
        nethook.setOnConnectionClosedListener(this.caller);
    }
    onCleared():void
    {
        nethook.setOnConnectionClosedListener(null);
    }
}

const rawListeners:CapsuledEvent<RawListener>[] = [];
const beforeListeners:CapsuledEvent<BeforeListener<any>>[] = [];
const afterListeners:CapsuledEvent<any>[] = [];
const sendListeners:CapsuledEvent<SendListener<any>>[] = [];

/**
* It will bring raw packet buffers before parsing
* It will cancel the packet if you return false
*/
export function raw(id:MinecraftPacketIds):CapsuledEvent<RawListener>
{
    const event = rawListeners[id];
    if (event) return event;
    return rawListeners[id] = new NetEventRaw(id);
}
/**
* Maybe you cannot find any documents about the parsed packet structure
* You need to discover it self!
*/
export function before<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<BeforeListener<ID>>
{
    const event = beforeListeners[id];
    if (event) return event;
    return beforeListeners[id] = new NetEventBefore<ID>(id);
}
/**
* Maybe you cannot find any documents about the parsed packet structure
* You need to discover it self!
*/
export function after<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<AfterListener<ID>>
{
    const event = afterListeners[id];
    if (event) return event;
    return afterListeners[id] = new NetEventAfter<ID>(id);
}
/**
* Maybe you cannot find any documents about the parsed packet structure
* You need to discover it self!
*/
export function send<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<SendListener<ID>>
{
    const event = sendListeners[id];
    if (event) return event;
    return sendListeners[id] = new NetEventSend(id);
}
export const close:CapsuledEvent<(networkIdentifier:NetworkIdentifier)=>void> = new CloseEvent;

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
]):void
{
    const ex = new Set(exceptions);
    for (let i=1; i<=0x88; i++)
    {
        if (ex.has(i)) continue;
        before<MinecraftPacketIds>(i).on((ptr, ni, id)=>{
            console.log(`R ${MinecraftPacketIds[id]}(${id}) ${hex(ptr.getBuffer(0x10, 0x28))}`);
        });
    }
    for (let i=1; i<=0x88; i++)
    {
        if (ex.has(i)) continue;
        send<MinecraftPacketIds>(i).on((ptr, ni, id)=>{
            console.log(`S ${MinecraftPacketIds[id]}(${id}) ${hex(ptr.getBuffer(0x10, 0x28))}`);
        });
    }
}