
import { Register } from "../assembler";
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { dll } from "../dll";
import { events } from "../event";
import { Hashable, HashSet } from "../hashset";
import { makefunc } from "../makefunc";
import { AbstractClass, nativeClass, NativeClass, nativeField, NativeStruct } from "../nativeclass";
import { bin64_t, CxxString, int32_t, NativeType, void_t } from "../nativetype";
import { CxxStringWrapper } from "../pointer";
import { procHacker } from "../prochacker";
import { remapAndPrintError } from "../source-map-support";
import { ConnectionRequest } from "./connreq";
import type { Packet } from "./packet";
import type { ServerPlayer } from "./player";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";

enum SubClientId {
    // TODO: fill
}

export class NetworkHandler extends AbstractClass {
    vftable:VoidPointer;
    instance:RakNetInstance;

    send(ni:NetworkIdentifier, packet:Packet, senderSubClientId:number):void;
    send(ni:NetworkIdentifier, packet:Packet, senderSubClientId:SubClientId):void;

    send(ni:NetworkIdentifier, packet:Packet, senderSubClientId:number):void {
        abstract();
    }

    sendInternal(ni:NetworkIdentifier, packet:Packet, data:CxxStringWrapper):void {
        abstract();
    }

    getConnectionFromId(ni:NetworkIdentifier):NetworkHandler.Connection|null {
        abstract();
    }
}

export namespace NetworkHandler {
    export class Connection extends AbstractClass {
        networkIdentifier:NetworkIdentifier;
    }
}

@nativeClass(null)
class ServerNetworkHandler$Client extends AbstractClass {
}

@nativeClass(null)
export class ServerNetworkHandler extends AbstractClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    @nativeField(CxxString, 0x278) // accessed in ServerNetworkHandler::allowIncomingConnections
    readonly motd:CxxString;
    @nativeField(int32_t, 0x2f0) // accessed in ServerNetworkHandler:setMaxNumPlayers
    readonly maxPlayers: int32_t;

    disconnectClient(client:NetworkIdentifier, message:string="disconnectionScreen.disconnected", skipMessage:boolean=false):void {
        abstract();
    }
    /**
     * @alias allowIncomingConnections
     */
    setMotd(motd:string):void {
        this.allowIncomingConnections(motd, true);
    }
    /**
     * @deprecated use setMaxNumPlayers
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
    /**
     * it's the same with `client.getActor()`
     */
    _getServerPlayer(client:NetworkIdentifier, clientSubId:number):ServerPlayer|null;
    _getServerPlayer(client:NetworkIdentifier, clientSubId:SubClientId):ServerPlayer|null;

    _getServerPlayer(client:NetworkIdentifier, clientSubId:number):ServerPlayer|null {
        abstract();
    }
    fetchConnectionRequest(target: NetworkIdentifier): ConnectionRequest {
        abstract();
    }
}

export namespace ServerNetworkHandler {
    export type Client = ServerNetworkHandler$Client;
}

const identifiers = new HashSet<NetworkIdentifier>();

@nativeClass()
export class NetworkIdentifier extends NativeStruct implements Hashable {
    @nativeField(bin64_t)
    unknown:bin64_t;
    @nativeField(RakNet.AddressOrGUID)
    address:RakNet.AddressOrGUID;
    @nativeField(int32_t, {ghost:true, offset:0x98})
    type:int32_t;

    assignTo(target:VoidPointer):void {
        dll.vcruntime140.memcpy(target, this, networkIdentifierSize);
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
        abstract();
    }

    toString():string {
        return this.getAddress();
    }

    static fromPointer(ptr:StaticPointer):NetworkIdentifier {
        return identifiers.get(ptr.as(NetworkIdentifier))!;
    }
    static all():IterableIterator<NetworkIdentifier> {
        return identifiers.values();
    }
}
const networkIdentifierSize = NetworkIdentifier[NativeClass.contentSize];
NetworkIdentifier.setResolver(ptr=>{
    if (ptr === null) return null;
    let ni = identifiers.get(ptr.as(NetworkIdentifier));
    if (ni != null) return ni;
    ni = new NetworkIdentifier(true);
    (ni as any).copyFrom(ptr, NetworkIdentifier[NativeType.size]);
    identifiers.add(ni);
    return ni;
});
/** @deprecated use bedrockServer.networkHandler */
export let networkHandler:NetworkHandler;

procHacker.hookingRawWithCallOriginal('?onConnectionClosed@NetworkHandler@@EEAAXAEBVNetworkIdentifier@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@_N@Z', makefunc.np((handler, ni, msg)=>{
    try {
        events.networkDisconnected.fire(ni);
    } catch (err) {
        remapAndPrintError(err);
    }
    // ni is used after onConnectionClosed. on some message processings.
    // timeout for avoiding the re-allocation
    setTimeout(()=>{
        identifiers.delete(ni);
    }, 3000);
}, void_t, {name: 'hook of NetworkIdentifier dtor'}, NetworkHandler, NetworkIdentifier, CxxStringWrapper),
[Register.rcx, Register.rdx, Register.r8, Register.r9], []);
