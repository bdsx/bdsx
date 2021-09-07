
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { dll } from "../dll";
import { events } from "../event";
import { events as newevents } from "../events";
import { Hashable } from "../hashset";
import { makefunc } from "../makefunc";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { CxxString, int32_t, NativeType } from "../nativetype";
import { CxxStringWrapper } from "../pointer";
import { SharedPtr } from "../sharedpointer";
import { remapAndPrintError } from "../source-map-support";
import { _tickCallback } from "../util";
import type { Packet } from "./packet";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import type { ServerPlayer } from "./player";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";
import minecraft = require('../minecraft');

const legacyLink = Symbol('legacy-ni');

/** @deprecated */
export class NetworkHandler extends NativeClass {
    vftable:VoidPointer;
    instance:RakNetInstance;

    send(ni:NetworkIdentifier, packet:Packet, senderSubClientId:number):void {
        abstract();
    }

    sendInternal(ni:NetworkIdentifier, packet:Packet, data:CxxStringWrapper):void {
        abstract();
    }

    getConnectionFromId(ni:NetworkIdentifier):NetworkHandler.Connection {
        abstract();
    }
}

/** @deprecated */
export namespace NetworkHandler {
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

/** @deprecated */
@nativeClass(null)
export class ServerNetworkHandler extends NativeClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    @nativeField(CxxString, 0x260)
    readonly motd:CxxString;
    @nativeField(int32_t, 0x2D8)
    readonly maxPlayers: int32_t;

    protected _disconnectClient(client:NetworkIdentifier, unknown:number, message:CxxString, skipMessage:boolean):void {
        abstract();
    }
    disconnectClient(client:NetworkIdentifier, message:string="disconnectionScreen.disconnected", skipMessage:boolean=false):void {
        this._disconnectClient(client, 0, message, skipMessage);
    }
    /**
     * Alias of allowIncomingConnections
     */
    setMotd(motd:string):void {
        this.allowIncomingConnections(motd, true);
    }
    /**
     * @deprecated
     */
    setMaxPlayers(count:number):void {
        this.setMaxNumPlayers(count);
    }
    allowIncomingConnections(motd:string, b:boolean):void {
        abstract();
    }
    updateServerAnnouncement():void {
        abstract();
    }
    setMaxNumPlayers(n:number):void {
        abstract();
    }
}

/** @deprecated */
export namespace ServerNetworkHandler {
    /** @deprecated */
    export type Client = ServerNetworkHandler$Client;
}

/** @deprecated */
@nativeClass()
export class NetworkIdentifier extends NativeClass implements Hashable {
    @nativeField(RakNet.AddressOrGUID)
    public address:RakNet.AddressOrGUID;

    constructor(allocate?:boolean) {
        super(allocate);
    }

    assignTo(target:VoidPointer):void {
        dll.vcruntime140.memcpy(target, this, NetworkIdentifier[NativeClass.contentSize]);
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

    static fromPointer(ptr:VoidPointer):NetworkIdentifier {
        return NetworkIdentifier.fromNewNi(minecraft.NetworkIdentifier.fromPointer(ptr));
    }
    static fromNewNi(ptr:minecraft.NetworkIdentifier):NetworkIdentifier {
        let legacy:NetworkIdentifier|undefined = (ptr as any)[legacyLink];
        if (legacy == null) {
            legacy = (ptr as any)[legacyLink] = ptr.as(NetworkIdentifier);
        }
        return legacy;
    }
    static [NativeType.getter](ptr:StaticPointer, offset?:number):NetworkIdentifier {
        const newni = minecraft.NetworkIdentifier[NativeType.getter](ptr, offset);
        return NetworkIdentifier.fromNewNi(newni);
    }
    static [makefunc.getFromParam](ptr:StaticPointer, offset?:number):NetworkIdentifier {
        const newni = minecraft.NetworkIdentifier[makefunc.getFromParam](ptr, offset);
        return NetworkIdentifier.fromNewNi(newni);
    }

    static *all():IterableIterator<NetworkIdentifier> {
        for (const newid of minecraft.NetworkIdentifier.all()) {
            yield NetworkIdentifier.fromNewNi(newid);
        }
    }
}


/** @deprecated */
export declare const networkHandler:NetworkHandler;

Object.defineProperty(exports, 'networkHandler', {
    get(){
        const networkHandler = minecraft.networkHandler.as(NetworkHandler);
        Object.defineProperty(exports, 'networkHandler', {value:networkHandler});
        return networkHandler;
    },
    configurable: true
});

newevents.networkDisconnected.on(ni=>{
    try {
        events.networkDisconnected.fire(NetworkIdentifier.fromNewNi(ni));
        _tickCallback();
    } catch (err) {
        remapAndPrintError(err);
    }
});
