
import { Register } from "bdsx/assembler";
import { abstract, RawTypeId } from "bdsx/common";
import { dll } from "bdsx/dll";
import { Hashable, HashSet } from "bdsx/hashset";
import { NativeClass } from "bdsx/nativeclass";
import { NativeType } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { SharedPtr } from "bdsx/sharedpointer";
import { remapAndPrintError } from "bdsx/source-map-support";
import { _tickCallback } from "bdsx/util";
import { CapsuledEvent, Event } from "krevent";
import { makefunc, StaticPointer, VoidPointer } from "../core";
import { Packet } from "./packet";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import { ServerPlayer } from "./player";
import { procHacker } from "./proc";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";

export class NetworkHandler extends NativeClass {
    vftable:VoidPointer;
    instance:RakNetInstance;

    send(ni:NetworkIdentifier, packet:Packet, u:number):void {
        abstract();
    }
    
    getConnectionFromId(ni:NetworkIdentifier):NetworkHandler.Connection {
        abstract();
    }
}

export namespace NetworkHandler
{
    export class Connection extends NativeClass {
        networkIdentifier:NetworkIdentifier;
        u1:VoidPointer;
        u2:VoidPointer;
        u3:VoidPointer;
        epeer:SharedPtr<EncryptedNetworkPeer>;
        bpeer:SharedPtr<BatchedNetworkPeer>;
        bpeer2:SharedPtr<BatchedNetworkPeer>;
    }
}

class ServerNetworkHandler$Client extends NativeClass {
}
ServerNetworkHandler$Client.abstract({});

export class ServerNetworkHandler extends NativeClass {
}
ServerNetworkHandler.abstract({});

export namespace ServerNetworkHandler
{
    export type Client = ServerNetworkHandler$Client;
}

const identifiers = new HashSet<NetworkIdentifier>();
const closeEvTarget = new Event<(ni:NetworkIdentifier)=>void>();

export class NetworkIdentifier extends NativeClass implements Hashable {
    public address:RakNet.AddressOrGUID;

    constructor(allocate?:boolean) {
        super(allocate);
    }

    assignTo(target:VoidPointer):void {
        dll.vcruntime140.memcpy(target, this, NetworkHandler[NativeClass.contentSize]);
    }

    equals(other:NetworkIdentifier):boolean {
        abstract();
    }

    hash():number {
        abstract();
    }

    getActor():ServerPlayer|null {
        abstract();
    }

    getAddress():string {
        const idx = this.address.GetSystemIndex();
        const rakpeer = networkHandler.instance.peer;
        return rakpeer.GetSystemAddressFromIndex(idx).toString();
    }

    toString():string {
        return this.getAddress();
    }

    static readonly close:CapsuledEvent<(ni:NetworkIdentifier)=>void> = closeEvTarget;
    static fromPointer(ptr:StaticPointer):NetworkIdentifier {
        return identifiers.get(ptr.as(NetworkIdentifier))!;
    }
    static [makefunc.np2js](ptr:NetworkIdentifier):NetworkIdentifier {
        let ni = identifiers.get(ptr);
        if (ni) return ni;
        ni = new NetworkIdentifier(true);
        ni.copyFrom(ptr, NetworkIdentifier[NativeType.size]);
        identifiers.add(ni);
        return ni;
    }
    
    static all():IterableIterator<NetworkIdentifier> {
        return identifiers.values();
    }
}

export let networkHandler:NetworkHandler;

procHacker.hookingRawWithCallOriginal('NetworkHandler::onConnectionClosed#1', makefunc.np((handler, ni, msg)=>{
    try {
        closeEvTarget.fire(ni);
        _tickCallback();
    } catch (err) {
        remapAndPrintError(err);
    }
    // ni is used after onConnectionClosed. on some message processings.
    // timeout for avoiding the re-allocation
    setTimeout(()=>{
        identifiers.delete(ni);
    }, 3000);
}, RawTypeId.Void, null, NetworkHandler, NetworkIdentifier, CxxStringWrapper), 
[Register.rcx, Register.rdx, Register.r8, Register.r9], []);
