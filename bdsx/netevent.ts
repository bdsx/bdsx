import { CapsuledEvent } from "krevent";
import { NetworkIdentifier } from "./bds/networkidentifier";
import { MinecraftPacketIds } from "./bds/packetids";
import { nethook } from "./nethook";
import { hex } from "./util";


import readLoginPacket = nethook.readLoginPacket;

export { readLoginPacket };

/**
* It will bring raw packet buffers before parsing
* It will cancel the packet if you return false
*/
export function raw(id:MinecraftPacketIds):CapsuledEvent<nethook.RawListener> {
    return nethook.getEventTarget(nethook.EventType.Raw, id);
}
/**
* Maybe you cannot find any documents about the parsed packet structure
* You need to discover it self!
*/
export function before<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.BeforeListener<ID>> {
    return nethook.getEventTarget(nethook.EventType.Before, id);
}
/**
* Maybe you cannot find any documents about the parsed packet structure
* You need to discover it self!
*/
export function after<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.AfterListener<ID>> {
    return nethook.getEventTarget(nethook.EventType.After, id);
}
/**
* Maybe you cannot find any documents about the parsed packet structure
* You need to discover it self!
*/
export function send<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.SendListener<ID>> {
    return nethook.getEventTarget(nethook.EventType.Send, id);
}

/** @deprecated use NetworkIdentifier.close */
export const close:CapsuledEvent<(networkIdentifier:NetworkIdentifier)=>void> = NetworkIdentifier.close;

/**
 * Write all packets to console
 */
export function watchAll(exceptions:MinecraftPacketIds[] = [
    MinecraftPacketIds.ClientCacheBlobStatus,
    MinecraftPacketIds.LevelChunk,
    MinecraftPacketIds.ClientCacheMissResponse,
    MinecraftPacketIds.MoveEntityDelta,
    MinecraftPacketIds.SetEntityMotion,
    MinecraftPacketIds.SetEntityData,
]):void {
    const ex = new Set(exceptions);
    for (let i=1; i<=0x88; i++) {
        if (ex.has(i)) continue;
        before<MinecraftPacketIds>(i).on((ptr, ni, id)=>{
            console.log(`R ${MinecraftPacketIds[id]}(${id}) ${hex(ptr.getBuffer(0x10, 0x28))}`);
        });
    }
    for (let i=1; i<=0x88; i++) {
        if (ex.has(i)) continue;
        send<MinecraftPacketIds>(i).on((ptr, ni, id)=>{
            console.log(`S ${MinecraftPacketIds[id]}(${id}) ${hex(ptr.getBuffer(0x10, 0x28))}`);
        });
    }
}