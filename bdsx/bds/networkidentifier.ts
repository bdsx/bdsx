
import { abstract, RawTypeId } from "bdsx/common";
import { dll } from "bdsx/dll";
import { exehacker } from "bdsx/exehacker";
import { Hashable, HashSet } from "bdsx/hashset";
import { NativeClass } from "bdsx/nativeclass";
import { NativeType } from "bdsx/nativetype";
import { CxxStringPointer } from "bdsx/pointer";
import { SharedPtr } from "bdsx/sharedpointer";
import { _tickCallback } from "bdsx/util";
import Event, { CapsuledEvent, EventEx } from "krevent";
import { makefunc, StaticPointer, VoidPointer } from "../core";
import { Actor } from "./actor";
import { Packet } from "./packet";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";

class NetworkHandler$Connection extends NativeClass
{
    networkIdentifier:NetworkIdentifier;
    u1:VoidPointer;
    u2:VoidPointer;
    u3:VoidPointer;
    epeer:SharedPtr<EncryptedNetworkPeer>;
    bpeer:SharedPtr<BatchedNetworkPeer>;
    bpeer2:SharedPtr<BatchedNetworkPeer>;
}
export class NetworkHandler extends NativeClass
{
    instance:RakNetInstance;

    send(ni:NetworkIdentifier, packet:Packet, u:number):void
    {
        abstract();
    }
    
    getConnectionFromId(ni:NetworkIdentifier):NetworkHandler.Connection
    {
        abstract();
    }
    
    static readonly Connection = NetworkHandler$Connection;
}

export namespace NetworkHandler
{
    export type Connection = NetworkHandler$Connection;
}

class ServerNetworkHandler$Client extends NativeClass
{
}
ServerNetworkHandler$Client.abstract({});

export class ServerNetworkHandler extends NativeClass
{
}
ServerNetworkHandler.abstract({});

export namespace ServerNetworkHandler
{
    export type Client = ServerNetworkHandler$Client;
}

const identifiers = new HashSet<NetworkIdentifier>();
const closeEvTarget = new Event<(ni:NetworkIdentifier)=>void>();

export class NetworkIdentifier extends NativeClass implements Hashable
{
    public address:RakNet.AddressOrGUID;

    constructor(allocate?:boolean)
    {
        super(allocate);
    }

    assignTo(target:VoidPointer):void
    {
        dll.vcruntime140.memcpy(target, this, NetworkHandler[NativeClass.contentSize]);
    }

    equals(other:NetworkIdentifier):boolean
    {
        abstract();
    }

    hash():number
    {
        abstract();
    }

    getActor():Actor|null
    {
        abstract();
    }

    getAddress():string
    {
        const idx = this.address.GetSystemIndex();
        const rakpeer = networkHandler.instance.peer;
        return rakpeer.GetSystemAddressFromIndex(idx).toString();
    }
    
    toString():string
    {
        return this.getAddress();
    }

    static readonly close:CapsuledEvent<(ni:NetworkIdentifier)=>void> = closeEvTarget;
    static fromPointer(ptr:StaticPointer):NetworkIdentifier
    {
        return identifiers.get(ptr.as(NetworkIdentifier))!;
    }
	static [makefunc.np2js](ptr:NetworkIdentifier):NetworkIdentifier
	{
		let ni = identifiers.get(ptr);
		if (ni) return ni;
        ni = new NetworkIdentifier(true);
        ni.copyFrom(ptr, NetworkIdentifier[NativeType.size]);
		identifiers.add(ni);
		return ni;
	}
}

export let networkHandler:NetworkHandler;

exehacker.hooking('hook-on-close-connection', 'NetworkHandler::onConnectionClosed#1', makefunc.np((handler, ni, msg)=>{
    closeEvTarget.fire(ni);
    identifiers.delete(ni);
    _tickCallback();
}, RawTypeId.Void, null, NetworkHandler, NetworkIdentifier, CxxStringPointer), 
[0x40, 0x53, 0x55, 0x56, 0x57, 0x41, 0x56, 0x41, 0x57, 0x48, 0x83, 0xEC, 0x48], []);
