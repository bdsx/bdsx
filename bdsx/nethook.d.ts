import { NetworkIdentifier } from "./bds/networkidentifier";
import { PacketIdToType } from "./bds/packets";
import { CANCEL } from "./common";
import { NativePointer } from "./core";
import { MinecraftPacketIds } from "./minecraft";
export declare namespace nethook {
    /** @deprecated */
    type RawListener = (ptr: NativePointer, size: number, networkIdentifier: NetworkIdentifier, packetId: number) => CANCEL | void | Promise<void>;
    /** @deprecated */
    type PacketListener<ID extends MinecraftPacketIds> = (packet: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL | void | Promise<void>;
    /** @deprecated */
    type BeforeListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    /** @deprecated */
    type AfterListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    /** @deprecated */
    type SendListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    /** @deprecated */
    type SendRawListener = (ptr: NativePointer, size: number, networkIdentifier: NetworkIdentifier, packetId: number) => CANCEL | void | Promise<void>;
    /** @deprecated */
    let lastSender: NetworkIdentifier;
    /**
     * Write all packets to console
     */
    function watchAll(exceptions?: MinecraftPacketIds[]): void;
}
