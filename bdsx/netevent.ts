import { CapsuledEvent } from "krevent";
import { NetworkIdentifier } from "./bds/networkidentifier";
import { MinecraftPacketIds } from "./bds/packetids";
import { nethook } from "./nethook";
import { hex } from "./util";


import readLoginPacket = nethook.readLoginPacket;

export { readLoginPacket };

/**
 * before 'before' and 'after'
 * earliest event for the packet receiving.
 * It will bring raw packet buffers before parsing
 * It will cancel the packet if you return false
 */
export function raw(id:MinecraftPacketIds):CapsuledEvent<nethook.RawListener> {
    return nethook.getEventTarget(nethook.EventType.Raw, id);
}

/**
 * after 'raw', before 'after'
 * the event that before processing but after parsed from raw.
 */
export function before<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.BeforeListener<ID>> {
    return nethook.getEventTarget(nethook.EventType.Before, id);
}

/**
 * after 'raw' and 'before'
 * the event that after processing. some fields are assigned after the processing
 */
export function after<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.AfterListener<ID>> {
    return nethook.getEventTarget(nethook.EventType.After, id);
}

/**
 * before serializing.
 * it can modify class fields.
 */
export function send<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.SendListener<ID>> {
    return nethook.getEventTarget(nethook.EventType.Send, id);
}

/**
 * after serializing. before sending.
 * it can access serialized buffer.
 */
export function sendRaw(id:number):CapsuledEvent<nethook.SendRawListener> {
    return nethook.getEventTarget(nethook.EventType.SendRaw, id);
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