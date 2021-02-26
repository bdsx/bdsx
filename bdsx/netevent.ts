/**
 * @deprecated combined to nethook.ts
 */

import { CapsuledEvent } from "krevent";
import { NetworkIdentifier } from "./bds/networkidentifier";
import { MinecraftPacketIds } from "./bds/packetids";
import { nethook } from "./nethook";

import readLoginPacket = nethook.readLoginPacket;

export { readLoginPacket };

/**
 * @deprecated use nethook.raw
 */
export function raw(id:MinecraftPacketIds):CapsuledEvent<nethook.RawListener> {
    return nethook.raw(id);
}

/**
 * @deprecated use nethook.before
 */
export function before<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.BeforeListener<ID>> {
    return nethook.before(id);
}

/**
 * @deprecated use nethook.after
 */
export function after<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.AfterListener<ID>> {
    return nethook.after(id);
}

/**
 * @deprecated use nethook.send
 */
export function send<ID extends MinecraftPacketIds>(id:ID):CapsuledEvent<nethook.SendListener<ID>> {
    return nethook.send(id);
}

/**
 * @deprecated use nethook.sendRaw
 */
export function sendRaw(id:number):CapsuledEvent<nethook.SendRawListener> {
    return nethook.sendRaw(id);
}

/** 
 * @deprecated use NetworkIdentifier.close 
 */
export const close:CapsuledEvent<(networkIdentifier:NetworkIdentifier)=>void> = NetworkIdentifier.close;

/**
 * @deprecated use nethook.watchAll
 */
export function watchAll(exceptions?:MinecraftPacketIds[]):void {
    return nethook.watchAll(exceptions);
}
