
import { Register } from "../assembler";
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { dll } from "../dll";
import { events } from "../event";
import { Hashable, HashSet } from "../hashset";
import { makefunc } from "../makefunc";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, CxxString, int32_t, NativeType, void_t } from "../nativetype";
import { CxxStringWrapper } from "../pointer";
import { remapAndPrintError } from "../source-map-support";
import { _tickCallback } from "../util";
import type { Packet } from "./packet";
import type { ServerPlayer } from "./player";
import { procHacker } from "./proc";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";

export class NetworkHandler extends NativeClass {
    vftable:VoidPointer;
    instance:RakNetInstance;

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

export namespace NetworkHandler
{
    export class Connection extends NativeClass {
        networkIdentifier:NetworkIdentifier;
    }
}

@nativeClass(null)
class ServerNetworkHandler$Client extends NativeClass {
}

@nativeClass(null)
export class ServerNetworkHandler extends NativeClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    @nativeField(CxxString, 0x268)
    readonly motd:CxxString;
    @nativeField(int32_t, 0x2e0)
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

export namespace ServerNetworkHandler
{
    export type Client = ServerNetworkHandler$Client;
}

const identifiers = new HashSet<NetworkIdentifier>();

@nativeClass()
export class NetworkIdentifier extends NativeClass implements Hashable {
    @nativeField(bin64_t)
    unknown:bin64_t;
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

    static fromPointer(ptr:StaticPointer):NetworkIdentifier {
        return identifiers.get(ptr.as(NetworkIdentifier))!;
    }
    static [NativeType.getter](ptr:StaticPointer, offset?:number):NetworkIdentifier {
        return NetworkIdentifier._singletoning(ptr.addAs(NetworkIdentifier, offset, offset! >> 31));
    }
    static [makefunc.getFromParam](ptr:StaticPointer, offset?:number):NetworkIdentifier {
        return NetworkIdentifier._singletoning(ptr.getPointerAs(NetworkIdentifier, offset));
    }

    static all():IterableIterator<NetworkIdentifier> {
        return identifiers.values();
    }
    private static _singletoning(ptr:NetworkIdentifier):NetworkIdentifier {
        let ni = identifiers.get(ptr);
        if (ni != null) return ni;
        ni = new NetworkIdentifier(true);
        ni.copyFrom(ptr, NetworkIdentifier[NativeType.size]);
        identifiers.add(ni);
        return ni;
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
