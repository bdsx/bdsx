
import { abstract, RawTypeId } from "bdsx/common";
import { dll } from "bdsx/dll";
import { exehacker } from "bdsx/exehacker";
import { NativeClass } from "bdsx/nativeclass";
import { NativeType } from "bdsx/nativetype";
import { CxxStringPointer } from "bdsx/pointer";
import { SharedPtr } from "bdsx/sharedpointer";
import { _tickCallback } from "bdsx/util";
import { CapsuledEvent, EventEx } from "krevent";
import { makefunc, StaticPointer, VoidPointer } from "../core";
import { Actor } from "./actor";
import { Packet } from "./packet";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import { proc } from "./proc";
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

const identifiers = new Map<string, NetworkIdentifier>();

let closeHooked = false;

class CloseListener extends EventEx<(ni:NetworkIdentifier)=>void>
{
    onStart():void
    {
        if (closeHooked) return;
        closeHooked = true;
        exehacker.hooking('hook-on-close-connection', 'NetworkHandler::onConnectionClosed', makefunc.np((handler, ni, msg)=>{
            this.fire(ni);
            _tickCallback();
        }, RawTypeId.Void, null, NetworkHandler, NetworkIdentifier, CxxStringPointer), 
        [0x40, 0x53, 0x55, 0x56, 0x57, 0x41, 0x56, 0x41, 0x57, 0x48, 0x83, 0xEC, 0x48], []);
    }
}

export class NetworkIdentifier extends NativeClass
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

    // bool operator ==(const NetworkIdentifier& ni) const noexcept;
    // bool operator !=(const NetworkIdentifier& ni) const noexcept;
    // size_t getHash() const noexcept;
	
// 	static kr::JsValue fromRaw(const NetworkIdentifier& ni) noexcept;
// 	static kr::JsValue fromPointer(StaticPointer* ptr) throws(kr::JsException);
// 	static void dispose(const NetworkIdentifier& ni) noexcept;

// private:
// 	static kr::Map<NetworkIdentifier, kr::JsPersistent> s_networkIdentifiers;

    equals(other:NetworkIdentifier):boolean
    {
        abstract();
    }

// size_t NetworkIdentifier::getHash() const noexcept
// {
// 	return g_mcf.NetworkIdentifier$getHash(this);
// }
// size_t std::hash<NetworkIdentifier>::operator ()(const NetworkIdentifier& ni) const noexcept
// {
// 	return ni.getHash();
// }

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

    static readonly close:CapsuledEvent<(ni:NetworkIdentifier)=>void> = new CloseListener;
    static fromPointer(ptr:StaticPointer):NetworkIdentifier
    {
        const size = NetworkIdentifier[NativeType.size];
        const bin = ptr.getBin(size>>1);
        let ni = identifiers.get(bin);
        if (ni) return ni;
        ni = new NetworkIdentifier(true);
        ni.copyFrom(ptr, size);
        identifiers.set(bin, ni);
        return ni;
    }
	static [makefunc.np2js](ptr:VoidPointer):NetworkIdentifier
	{
		const binptr = ptr.getAddressBin();
		let ni = identifiers.get(binptr);
		if (ni) return ni;
        ni = new NetworkIdentifier(true);
        ni.copyFrom(ptr, NetworkIdentifier[NativeType.size]);
		identifiers.set(binptr, ni);
		return ni;
	}
}
NetworkIdentifier.define({
    address:RakNet.AddressOrGUID
});
NetworkIdentifier.prototype.equals = makefunc.js(proc["NetworkIdentifier::operator=="], RawTypeId.Boolean, {this:NetworkIdentifier}, NetworkIdentifier);
NetworkHandler$Connection.abstract({
    networkIdentifier:NetworkIdentifier,
    u1:VoidPointer, // null
    u2:VoidPointer, // null
    u3:VoidPointer, // null
    epeer:SharedPtr.make(EncryptedNetworkPeer),
    bpeer:SharedPtr.make(BatchedNetworkPeer),
    bpeer2:SharedPtr.make(BatchedNetworkPeer),
});

NetworkHandler.abstract({
    instance: [RakNetInstance.ref(), 0x30]
});

// NetworkHandler::Connection* NetworkHandler::getConnectionFromId(const NetworkIdentifier& ni)
NetworkHandler.prototype.getConnectionFromId = makefunc.js(proc[`NetworkHandler::_getConnectionFromId`], NetworkHandler$Connection, {this:NetworkHandler});

// void NetworkHandler::send(const NetworkIdentifier& ni, Packet* packet, unsigned char u)
NetworkHandler.prototype.send = makefunc.js(proc['NetworkHandler::send'], RawTypeId.Void, {this:NetworkHandler}, NetworkIdentifier, Packet, RawTypeId.Int32);

export let networkHandler:NetworkHandler;
