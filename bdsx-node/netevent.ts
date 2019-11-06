import { nethook, NativePointer, AfterPacketExtra } from "./native";
import PacketId = require("./packetId");
import { EventEx, CapsuledEvent } from "krevent";

type BeforeListener<ID extends PacketId> = (ptr:NativePointer, networkIdentifier:string, packetId:number)=>boolean|void;
type AfterListener<ID extends PacketId> = (ptr:NativePointer, networkIdentifier:string, packetId:number, extra:AfterPacketExtra<ID>)=>void

class NetEventBefore<ID extends PacketId> extends EventEx<BeforeListener<ID>>
{
    private readonly caller = (ptr:NativePointer, networkIdentifier:string, packetId:number)=>{
        const ptrlow = ptr.getAddressLow();
        const ptrhigh = ptr.getAddressHigh();
        for (const listener of this.allListeners())
        {
            try
            {
                ptr.setAddress(ptrlow, ptrhigh);
                listener(ptr, networkIdentifier, packetId);
            }
            catch(err)
            {
                console.error(err);
            }
        }
    };
    
    constructor(public readonly id:ID)
    {
        super();
    }
    onStarted():void
    {
        nethook.setOnPacketReadListener(this.id, this.caller);
    }
    onCleared():void
    {
        nethook.setOnPacketReadListener(this.id, null);
    }
}
class NetEventAfter<ID extends PacketId> extends EventEx<AfterListener<ID>>
{
    private readonly caller = (ptr:NativePointer, networkIdentifier:string, packetId:number, extra:AfterPacketExtra<ID>)=>{
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

class CloseEvent extends EventEx<(networkIdentifier:string)=>void>
{
    private readonly caller = (networkIdentifier:string)=>{
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

const beforeListeners:CapsuledEvent<any>[] = [];
const afterListeners:CapsuledEvent<any>[] = [];

export function before<ID extends PacketId>(id:ID):CapsuledEvent<BeforeListener<ID>>
{
    const event = beforeListeners[id];
    if (event) return event;
    return beforeListeners[id] = new NetEventBefore<ID>(id);
}
export function after<ID extends PacketId>(id:ID):CapsuledEvent<AfterListener<ID>>
{
    const event = afterListeners[id];
    if (event) return event;
    return afterListeners[id] = new NetEventAfter<ID>(id);
}
export const close:CapsuledEvent<(networkIdentifier:string)=>void> = new CloseEvent;

export function watchAll(exceptions:PacketId[] = [
    PacketId.ClientCacheBlobStatus,
    PacketId.NetworkStackLatencyPacket
]):void
{
    const ex = new Set(exceptions);
    for (let i=1; i<=0x88; i++)
    {
        if (ex.has(i)) continue;
        before(i).on((ptr, ni, id)=>{
            ptr.move(0x28); // skip basic packet datas
            console.log(`${PacketId[id]}(${id}) ${ptr.readHex(16)}`);
        });
    }
}