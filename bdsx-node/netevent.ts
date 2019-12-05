import { nethook, NativePointer, AfterPacketExtra, NetworkIdentifier } from "./native";
import PacketId = require("./packetId");
import { EventEx, CapsuledEvent } from "krevent";
import { CANCEL } from "./common";

type RawListener = (ptr:NativePointer, size:number, networkIdentifier:NetworkIdentifier, packetId: number)=>CANCEL|void;
type BeforeListener = (ptr: NativePointer, intnetworkIdentifier: NetworkIdentifier, packetId: number) => CANCEL|void;
type SendListener = (ptr: NativePointer, networkIdentifier: NetworkIdentifier, packetId: number) => CANCEL|void;
type AfterListener<ID extends PacketId> = (ptr: NativePointer, networkIdentifier: NetworkIdentifier, packetId: number, extra: AfterPacketExtra<ID>) => void;

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
    
    constructor(public readonly id:PacketId)
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

class NetEventBefore extends EventEx<BeforeListener>
{
    private readonly caller = (ptr:NativePointer, networkIdentifier:NetworkIdentifier, packetId:number)=>{
        const ptrlow = ptr.getAddressLow();
        const ptrhigh = ptr.getAddressHigh();
        for (const listener of this.allListeners())
        {
            try
            {
                ptr.setAddress(ptrlow, ptrhigh);
                const ret = listener(ptr, networkIdentifier, packetId);
                if (ret === CANCEL) return false;
            }
            catch(err)
            {
                console.error(err);
            }
        }
    };
    
    constructor(public readonly id:PacketId)
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

class NetEventAfter<ID extends PacketId> extends EventEx<AfterListener<ID>>
{
    private readonly caller = (ptr:NativePointer, networkIdentifier:NetworkIdentifier, packetId:number, extra:AfterPacketExtra<ID>)=>{
        const ptrlow = ptr.getAddressLow();
        const ptrhigh = ptr.getAddressHigh();
        for (const listener of this.allListeners())
        {
            ptr.setAddress(ptrlow, ptrhigh);
            listener(ptr, networkIdentifier, packetId, extra);
        }
    };
    
    constructor(public readonly id:ID)
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

class NetEventSend extends EventEx<SendListener>
{
    private readonly caller = (ptr:NativePointer, networkIdentifier:NetworkIdentifier, packetId:number)=>{
        const ptrlow = ptr.getAddressLow();
        const ptrhigh = ptr.getAddressHigh();
        for (const listener of this.allListeners())
        {
            ptr.setAddress(ptrlow, ptrhigh);
            listener(ptr, networkIdentifier, packetId);
        }
    };
    
    constructor(public readonly id:PacketId)
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
const beforeListeners:CapsuledEvent<BeforeListener>[] = [];
const afterListeners:CapsuledEvent<any>[] = [];
const sendListeners:CapsuledEvent<SendListener>[] = [];

/**
* It will bring raw packet buffers before parsing
* It will cancel the packet if you return false
*/
export function raw(id:PacketId):CapsuledEvent<RawListener>
{
    const event = rawListeners[id];
    if (event) return event;
    return rawListeners[id] = new NetEventRaw(id);
}
/**
* Maybe you cannot find any documents about the parsed packet structure
* You need to discover it self!
*/
export function before(id:PacketId):CapsuledEvent<BeforeListener>
{
    const event = beforeListeners[id];
    if (event) return event;
    return beforeListeners[id] = new NetEventBefore(id);
}
/**
* Maybe you cannot find any documents about the parsed packet structure
* You need to discover it self!
*/
export function after<ID extends PacketId>(id:ID):CapsuledEvent<AfterListener<ID>>
{
    const event = afterListeners[id];
    if (event) return event;
    return afterListeners[id] = new NetEventAfter<ID>(id);
}
/**
* Maybe you cannot find any documents about the parsed packet structure
* You need to discover it self!
*/
export function send<ID extends PacketId>(id:ID):CapsuledEvent<SendListener>
{
    const event = sendListeners[id];
    if (event) return event;
    return sendListeners[id] = new NetEventSend(id);
}
export const close:CapsuledEvent<(networkIdentifier:NetworkIdentifier)=>void> = new CloseEvent;

/**
 * Write all packets to console
 * @param exceptions (defaults: [
 *                  ClientCacheBlobStatus, 
 *                  NetworkStackLatencyPacket, 
 *                  LevelChunk,
 *                  ClientCacheMissResponse,
 *                  MoveEntityDelta,
 *                  SetEntityMotion,
 *                  SetEntityData])
 */
export function watchAll(exceptions:PacketId[] = [
    PacketId.ClientCacheBlobStatus,
    PacketId.NetworkStackLatencyPacket,

    PacketId.LevelChunk,
    PacketId.ClientCacheMissResponse,
    PacketId.MoveEntityDelta,
    PacketId.SetEntityMotion,
    PacketId.SetEntityData,
]):void
{
    const ex = new Set(exceptions);
    for (let i=1; i<=0x88; i++)
    {
        if (ex.has(i)) continue;
        before(i).on((ptr, ni, id)=>{
            ptr.move(0x28); // skip basic packet datas
            console.log(`R ${PacketId[id]}(${id}) ${ptr.readHex(16)}`);
        });
    }
    for (let i=1; i<=0x88; i++)
    {
        if (ex.has(i)) continue;
        send(i).on((ptr, ni, id)=>{
            ptr.move(0x28); // skip basic packet datas
            console.log(`S ${PacketId[id]}(${id}) ${ptr.readHex(16)}`);
        });
    }
}