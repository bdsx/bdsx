import { Register } from "../assembler";
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { dll } from "../dll";
import { events } from "../event";
import { HashSet, Hashable } from "../hashset";
import { makefunc } from "../makefunc";
import { AbstractClass, NativeClass, NativeStruct, nativeClass, nativeField } from "../nativeclass";
import { CxxString, NativeType, bin64_t, bool_t, int32_t, void_t } from "../nativetype";
import { CxxStringWrapper } from "../pointer";
import { procHacker } from "../prochacker";
import { remapAndPrintError } from "../source-map-support";
import { ConnectionRequest } from "./connreq";
import type { Packet } from "./packet";
import type { ServerPlayer } from "./player";
import { RakNet } from "./raknet";
import { RakNetConnector } from "./raknetinstance";

// TODO: fill
enum SubClientId {}

@nativeClass()
export class NetworkSystem extends AbstractClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    /** @deprecated use bedrockServer.connector */
    instance: RakNetConnector;

    send(ni: NetworkIdentifier, packet: Packet, senderSubClientId: number): void;
    send(ni: NetworkIdentifier, packet: Packet, senderSubClientId: SubClientId): void;

    send(ni: NetworkIdentifier, packet: Packet, senderSubClientId: number): void {
        abstract();
    }

    sendInternal(ni: NetworkIdentifier, packet: Packet, data: CxxStringWrapper): void {
        abstract();
    }

    getConnectionFromId(ni: NetworkIdentifier): NetworkConnection | null {
        abstract();
    }
}
export import NetworkHandler = NetworkSystem;

export class NetworkConnection extends AbstractClass {
    networkIdentifier: NetworkIdentifier;

    disconnect(): void {
        abstract();
    }
}

export namespace NetworkSystem {
    /** @deprecated renamed to NetworkConnection */
    export const Connection = NetworkConnection;
    /** @deprecated renamed to NetworkConnection */
    export type Connection = NetworkConnection;
}

@nativeClass(null)
class ServerNetworkHandler$Client extends AbstractClass {}

@nativeClass(null)
export class ServerNetworkHandler extends AbstractClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    @nativeField(CxxString, 0x2c8) // serverName, accessed in ServerNetworkHandler::allowIncomingConnections
    readonly motd: CxxString;
    @nativeField(int32_t, 0x320) // accessed in ServerNetworkHandler::setMaxNumPlayers
    readonly maxPlayers: int32_t;

    disconnectClient(client: NetworkIdentifier, message: string = "disconnectionScreen.disconnected", skipMessage: boolean = false): void {
        abstract();
    }
    /**
     * @alias allowIncomingConnections
     */
    setMotd(motd: string): void {
        this.allowIncomingConnections(motd, true);
    }
    /**
     * @deprecated use setMaxNumPlayers
     */
    setMaxPlayers(count: number): void {
        this.setMaxNumPlayers(count);
    }
    allowIncomingConnections(motd: string, shouldAnnounce: boolean): void {
        abstract();
    }
    updateServerAnnouncement(): void {
        abstract();
    }
    setMaxNumPlayers(n: number): void {
        abstract();
    }
    /**
     * it's the same with `client.getActor()`
     */
    _getServerPlayer(client: NetworkIdentifier, clientSubId: number): ServerPlayer | null;
    _getServerPlayer(client: NetworkIdentifier, clientSubId: SubClientId): ServerPlayer | null;

    _getServerPlayer(client: NetworkIdentifier, clientSubId: number): ServerPlayer | null {
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
    unknown: bin64_t;
    @nativeField(RakNet.AddressOrGUID)
    address: RakNet.AddressOrGUID;
    @nativeField(int32_t, { ghost: true, offset: 0x98 })
    type: int32_t;

    assignTo(target: VoidPointer): void {
        dll.vcruntime140.memcpy(target, this, networkIdentifierSize);
    }

    equals(other: NetworkIdentifier): boolean {
        abstract();
    }

    hash(): number {
        abstract();
    }

    getActor(): ServerPlayer | null {
        abstract();
    }

    getAddress(): string {
        abstract();
    }

    toString(): string {
        return this.getAddress();
    }

    static fromPointer(ptr: StaticPointer): NetworkIdentifier {
        return identifiers.get(ptr.as(NetworkIdentifier))!;
    }
    static all(): IterableIterator<NetworkIdentifier> {
        return identifiers.values();
    }
}
const networkIdentifierSize = NetworkIdentifier[NativeClass.contentSize];
NetworkIdentifier.setResolver(ptr => {
    if (ptr === null) return null;
    let ni = identifiers.get(ptr.as(NetworkIdentifier));
    if (ni != null) return ni;
    ni = new NetworkIdentifier(true);
    (ni as any).copyFrom(ptr, NetworkIdentifier[NativeType.size]);
    identifiers.add(ni);
    return ni;
});
/** @deprecated use bedrockServer.networkSystem */
export let networkSystem: NetworkSystem;

procHacker.hookingRawWithCallOriginal(
    "?onConnectionClosed@NetworkSystem@@EEAAXAEBVNetworkIdentifier@@W4DisconnectFailReason@Connection@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@_N@Z",
    makefunc.np(
        (handler, ni, reason, msg, b) => {
            try {
                events.networkDisconnected.fire(ni);
            } catch (err) {
                remapAndPrintError(err);
            }
            // ni is used after onConnectionClosed. on some message processings.
            // timeout for avoiding the re-allocation
            setTimeout(() => {
                identifiers.delete(ni);
            }, 3000);
        },
        void_t,
        { name: "hook of NetworkIdentifier dtor" },
        NetworkSystem,
        NetworkIdentifier,
        int32_t,
        CxxStringWrapper,
        bool_t,
    ),
    [Register.rcx, Register.rdx, Register.r8, Register.r9],
    [],
);
