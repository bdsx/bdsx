import { NetworkIdentifier } from "./bds/networkidentifier";
import { MinecraftPacketIds } from "./bds/packetids";
import { PacketIdToType } from "./bds/packets";
import { CANCEL } from "./common";
import { NativePointer } from "./core";
import { events } from "./event";
import { hex } from "./util";

export namespace nethook
{
    export type RawListener = (ptr:NativePointer, size:number, networkIdentifier:NetworkIdentifier, packetId: number)=>CANCEL|void|Promise<void>;
    export type PacketListener<ID extends MinecraftPacketIds> = (packet: PacketIdToType[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL|void|Promise<void>;
    export type BeforeListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    export type AfterListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    export type SendListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    export type SendRawListener = (ptr:NativePointer, size:number, networkIdentifier: NetworkIdentifier, packetId: number) => CANCEL|void|Promise<void>;

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
