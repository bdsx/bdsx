
import { Register } from "bdsx/assembler";
import { abstract } from "bdsx/common";
import { dll } from "bdsx/dll";
import { Hashable, HashSet } from "bdsx/hashset";
import { makefunc } from "bdsx/makefunc";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { CxxString, int32_t, NativeType, void_t } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { SharedPtr } from "bdsx/sharedpointer";
import { remapAndPrintError } from "bdsx/source-map-support";
import { _tickCallback } from "bdsx/util";
import { CapsuledEvent } from "krevent";
import { StaticPointer, VoidPointer } from "../core";
import { events } from "../event";
import type { Packet } from "./packet";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import type { ServerPlayer } from "./player";
import { procHacker } from "./proc";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";

export class NetworkHandler extends NativeClass {
    vftable:VoidPointer;
    instance:RakNetInstance;

    send(ni:NetworkIdentifier, packet:Packet, u:number):void {
        abstract();
    }

    sendInternal(ni:NetworkIdentifier, packet:Packet, data:CxxStringWrapper):void {
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

@nativeClass(null)
class ServerNetworkHandler$Client extends NativeClass {
}

@nativeClass(null)
export class ServerNetworkHandler extends NativeClass {
    @nativeField(CxxString, 0x258)
    motd: CxxString;
    @nativeField(int32_t, 0x2D0)
    maxPlayers: int32_t;

    protected _disconnectClient(client:NetworkIdentifier, b:number, message:CxxString, d:number):void {
        abstract();
    }
    disconnectClient(client:NetworkIdentifier, message:string="disconnectionScreen.disconnected"):void {
        this._disconnectClient(client, 0, message, 0);
    }
    setMotd(motd:string):void {
        this.motd = motd;
        this.updateServerAnnouncement();
    }
    setMaxPlayers(count:number):void {
        this.maxPlayers = count;
        this.updateServerAnnouncement();
    }
    updateServerAnnouncement():void {
        abstract();
    }
}

export namespace ServerNetworkHandler
{
    export type Client = ServerNetworkHandler$Client;
}

const identifiers = new HashSet<NetworkIdentifier>();

@nativeClass()
export class NetworkIdentifier extends NativeClass implements Hashable {
    @nativeField(RakNet.AddressOrGUID)
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

    /**
     * @deprecated use events.networkDisconnected
     */
    static readonly close:CapsuledEvent<(ni:NetworkIdentifier)=>void> = events.networkDisconnected;
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
        events.networkDisconnected.fire(ni);
        _tickCallback();
    } catch (err) {
        remapAndPrintError(err);
    }
    // ni is used after onConnectionClosed. on some message processings.
    // timeout for avoiding the re-allocation
    setTimeout(()=>{
        identifiers.delete(ni);
    }, 3000);
}, void_t, null, NetworkHandler, NetworkIdentifier, CxxStringWrapper),
[Register.rcx, Register.rdx, Register.r8, Register.r9], []);
