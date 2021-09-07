import { NetworkIdentifier } from "./bds/networkidentifier";
import { PacketIdToType } from "./bds/packets";
import { CANCEL } from "./common";
import { NativePointer } from "./core";
import { events } from "./events";
import { MinecraftPacketIds } from "./minecraft";
import { hex } from "./util";
import minecraft = require('./minecraft');

export namespace nethook {
    /** @deprecated */
    export type RawListener = (ptr:NativePointer, size:number, networkIdentifier:NetworkIdentifier, packetId: number)=>CANCEL|void|Promise<void>;
    /** @deprecated */
    export type PacketListener<ID extends MinecraftPacketIds> = (packet: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL|void|Promise<void>;
    /** @deprecated */
    export type BeforeListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    /** @deprecated */
    export type AfterListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    /** @deprecated */
    export type SendListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    /** @deprecated */
    export type SendRawListener = (ptr:NativePointer, size:number, networkIdentifier: NetworkIdentifier, packetId: number) => CANCEL|void|Promise<void>;

    /** @deprecated */
    export let lastSender:NetworkIdentifier;

    /**
     * Write all packets to console
     */
    export function watchAll(exceptions:MinecraftPacketIds[] = [
        MinecraftPacketIds.ClientCacheBlobStatus,
        MinecraftPacketIds.LevelChunk,
        MinecraftPacketIds.ClientCacheMissResponse,
        MinecraftPacketIds.MoveActorDelta,
        MinecraftPacketIds.SetActorMotion,
        MinecraftPacketIds.SetActorData,
    ]):void {
        const ex = new Set(exceptions);
        for (let i=1; i<=0xa3; i++) {
            if (ex.has(i)) continue;
            events.packetBefore<MinecraftPacketIds>(i).on((ptr, ni, id)=>{
                console.log(`R ${MinecraftPacketIds[id]}(${id}) ${hex(ptr.getBuffer(0x10, 0x28))}`);
            });
        }
        for (let i=1; i<=0xa3; i++) {
            if (ex.has(i)) continue;
            events.packetSend<MinecraftPacketIds>(i).on((ptr, ni, id)=>{
                console.log(`S ${MinecraftPacketIds[id]}(${id}) ${hex(ptr.getBuffer(0x10, 0x28))}`);
            });
        }
    }
}


Object.defineProperty(nethook, 'lastSender', {
    get(){
        const sender = minecraft.NetworkIdentifier.lastSender;
        return NetworkIdentifier.fromNewNi(sender);
    }
});
