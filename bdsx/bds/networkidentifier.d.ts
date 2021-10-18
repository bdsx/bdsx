import { StaticPointer, VoidPointer } from "../core";
import { Hashable } from "../hashset";
import { makefunc } from "../makefunc";
import { NativeClass } from "../nativeclass";
import { CxxString, int32_t, NativeType } from "../nativetype";
import { CxxStringWrapper } from "../pointer";
import { SharedPtr } from "../sharedpointer";
import type { Packet } from "./packet";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import type { ServerPlayer } from "./player";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";
import minecraft = require('../minecraft');
declare const legacyLink: unique symbol;
/** @deprecated */
export declare class NetworkHandler extends NativeClass {
    vftable: VoidPointer;
    instance: RakNetInstance;
    send(ni: NetworkIdentifier, packet: Packet, senderSubClientId: number): void;
    sendInternal(ni: NetworkIdentifier, packet: Packet, data: CxxStringWrapper): void;
    getConnectionFromId(ni: NetworkIdentifier): NetworkHandler.Connection;
}
/** @deprecated */
export declare namespace NetworkHandler {
    class Connection extends NativeClass {
        networkIdentifier: NetworkIdentifier;
        u1: VoidPointer;
        u2: VoidPointer;
        u3: VoidPointer;
        epeer: SharedPtr<EncryptedNetworkPeer>;
        bpeer: SharedPtr<BatchedNetworkPeer>;
        bpeer2: SharedPtr<BatchedNetworkPeer>;
    }
}
declare class ServerNetworkHandler$Client extends NativeClass {
}
/** @deprecated */
export declare class ServerNetworkHandler extends NativeClass {
    vftable: VoidPointer;
    readonly motd: CxxString;
    readonly maxPlayers: int32_t;
    protected _disconnectClient(client: NetworkIdentifier, unknown: number, message: CxxString, skipMessage: boolean): void;
    disconnectClient(client: NetworkIdentifier, message?: string, skipMessage?: boolean): void;
    /**
     * Alias of allowIncomingConnections
     */
    setMotd(motd: string): void;
    /**
     * @deprecated
     */
    setMaxPlayers(count: number): void;
    allowIncomingConnections(motd: string, b: boolean): void;
    updateServerAnnouncement(): void;
    setMaxNumPlayers(n: number): void;
}
/** @deprecated */
export declare namespace ServerNetworkHandler {
    /** @deprecated */
    type Client = ServerNetworkHandler$Client;
}
/** @deprecated */
export declare class NetworkIdentifier extends NativeClass implements Hashable {
    address: RakNet.AddressOrGUID;
    constructor(allocate?: boolean);
    assignTo(target: VoidPointer): void;
    equals(other: NetworkIdentifier): boolean;
    hash(): number;
    getActor(): ServerPlayer | null;
    getAddress(): string;
    toString(): string;
    static fromPointer(ptr: VoidPointer): NetworkIdentifier;
    static fromNewNi(ptr: minecraft.NetworkIdentifier & {
        [legacyLink]?: NetworkIdentifier;
    }): NetworkIdentifier;
    static [NativeType.getter](ptr: StaticPointer, offset?: number): NetworkIdentifier;
    static [makefunc.getFromParam](ptr: StaticPointer, offset?: number): NetworkIdentifier;
    static all(): IterableIterator<NetworkIdentifier>;
}
/** @deprecated */
export declare const networkHandler: NetworkHandler;
export {};
