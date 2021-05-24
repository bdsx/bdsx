import { CANCEL } from "bdsx/common";
import { Color } from "colors";
import Event from "krevent";
import type { CommandContext } from "./bds/command";
import type { NetworkIdentifier } from "./bds/networkidentifier";
import { MinecraftPacketIds } from "./bds/packetids";
import type { BlockDestroyEvent, BlockPlaceEvent, PistonMoveEvent } from "./event_impl/blockevent";
import type { EntityCreatedEvent, EntityHealEvent, EntityHurtEvent, EntitySneakEvent, PlayerAttackEvent, PlayerCritEvent, PlayerDropItemEvent, PlayerJoinEvent, PlayerPickupItemEvent, PlayerUseItemEvent } from "./event_impl/entityevent";
import type { QueryRegenerateEvent } from "./event_impl/miscevent";
import type { nethook } from "./nethook";
import { remapStack } from "./source-map-support";

const PACKET_ID_COUNT = 0x100;
const PACKET_EVENT_COUNT = 0x500;

function getNetEventTarget(type:events.PacketEventType, packetId:MinecraftPacketIds):Event<(...args:any[])=>(CANCEL|void)> {
    if ((packetId>>>0) >= PACKET_ID_COUNT) {
        throw Error(`Out of range: packetId < 0x100 (packetId=${packetId})`);
    }
    const id = type*PACKET_ID_COUNT + packetId;
    let target = packetAllTargets[id];
    if (target !== null) return target;
    packetAllTargets[id] = target = new Event;
    return target;
}
const packetAllTargets = new Array<Event<(...args:any[])=>(CANCEL|void)>|null>(PACKET_EVENT_COUNT);
for (let i=0;i<PACKET_EVENT_COUNT;i++) {
    packetAllTargets[i] = null;
}


export namespace events {

    ////////////////////////////////////////////////////////
    // Block events

    /** Cancellable */
    export const blockDestroy = new Event<(event: BlockDestroyEvent) => void | CANCEL>();
    /** Cancellable */
    export const blockPlace = new Event<(event: BlockPlaceEvent) => void | CANCEL>();
    /** Not cancellable */
    export const pistonMove = new Event<(event: PistonMoveEvent) => void>();

    ////////////////////////////////////////////////////////
    // Entity events
    /** Cancellable */
    export const entityHurt = new Event<(event: EntityHurtEvent) => void | CANCEL>();
    /** Cancellable */
    export const entityHeal = new Event<(event: EntityHealEvent) => void | CANCEL>();
    /** Cancellable */
    export const playerAttack = new Event<(event: PlayerAttackEvent) => void | CANCEL>();
    /** Cancellable but only when player is in container screens*/
    export const playerDropItem = new Event<(event: PlayerDropItemEvent) => void | CANCEL>();
    /** Not cancellable */
    export const entitySneak = new Event<(event: EntitySneakEvent) => void>();
    /** Not cancellable */
    export const entityCreated = new Event<(event: EntityCreatedEvent) => void>();
    /** Not cancellable */
    export const playerJoin = new Event<(event: PlayerJoinEvent) => void>();
    /** Cancellable */
    export const playerPickupItem = new Event<(event: PlayerPickupItemEvent) => void | CANCEL>();
    /** Not cancellable */
    export const playerCrit = new Event<(event: PlayerCritEvent) => void>();
    /** Not cancellable */
    export const playerUseItem = new Event<(event: PlayerUseItemEvent) => void>();

    ////////////////////////////////////////////////////////
    // Server events

    /**
     * before launched. after execute the main thread of BDS.
     * BDS will be loaded on the separated thread. this event will be executed concurrently with the BDS loading
     */
    export const serverLoading = new Event<()=>void>();

    /**
     * after BDS launched
     */
    export const serverOpen = new Event<()=>void>();

    /**
     * on tick
     */
    export const serverUpdate = new Event<()=>void>();

    /**
     * before system.shutdown, Minecraft is alive yet
     */
    export const serverStop = new Event<()=>void>();

    /**
     * after BDS closed
     */
    export const serverClose = new Event<()=>void>();

    /**
     * server console outputs
     */
    export const serverLog = new Event<(log:string, color:Color)=>CANCEL|void>();

    ////////////////////////////////////////////////////////
    // Packet events

    export enum PacketEventType
    {
        Raw,
        Before,
        After,
        Send,
        SendRaw
    }

    export function packetEvent(type:PacketEventType, packetId:MinecraftPacketIds):Event<(...args:any[])=>(CANCEL|void)>|null {
        if ((packetId>>>0) >= PACKET_ID_COUNT) {
            console.error(`Out of range: packetId < 0x100 (type=${PacketEventType[type]}, packetId=${packetId})`);
            return null;
        }
        const id = type*PACKET_ID_COUNT + packetId;
        return packetAllTargets[id];
    }

    /**
     * before 'before' and 'after'
     * earliest event for the packet receiving.
     * It will bring raw packet buffers before parsing
     * It will cancel the packet if you return false
     */
    export function packetRaw(id:MinecraftPacketIds):Event<nethook.RawListener> {
        return getNetEventTarget(PacketEventType.Raw, id);
    }

    /**
     * after 'raw', before 'after'
     * the event that before processing but after parsed from raw.
     */
    export function packetBefore<ID extends MinecraftPacketIds>(id:ID):Event<nethook.PacketListener<ID>> {
        return getNetEventTarget(PacketEventType.Before, id);
    }

    /**
     * after 'raw' and 'before'
     * the event that after processing. some fields are assigned after the processing
     */
    export function packetAfter<ID extends MinecraftPacketIds>(id:ID):Event<nethook.PacketListener<ID>> {
        return getNetEventTarget(PacketEventType.After, id);
    }

    /**
     * before serializing.
     * it can modify class fields.
     */
    export function packetSend<ID extends MinecraftPacketIds>(id:ID):Event<nethook.PacketListener<ID>> {
        return getNetEventTarget(PacketEventType.Send, id);
    }

    /**
     * after serializing. before sending.
     * it can access serialized buffer.
     */
    export function packetSendRaw(id:number):Event<nethook.SendRawListener> {
        return getNetEventTarget(PacketEventType.SendRaw, id);
    }

    ////////////////////////////////////////////////////////
    // Misc

    /** Not cancellable */
    export const queryRegenerate = new Event<(event: QueryRegenerateEvent) => void>();

    /**
    * global error listeners
    * if returns CANCEL, then default error printing is disabled
    */
    export const error = new Event<(err:any)=>CANCEL|void>();

    export function errorFire(err:unknown):void {
        if (err instanceof Error) {
            err.stack = remapStack(err.stack);
        }
        if (events.error.fire(err) !== CANCEL) {
            console.error(err && ((err as any).stack || err));
        }
    }

     /**
      * command console outputs
      */
    export const commandOutput = new Event<(log:string)=>CANCEL|void>();


     /**
      * command input
      */
    export const command = new Event<(command: string, originName: string, ctx: CommandContext) => void | number>();


    /**
      * network identifier disconnected
      */
    export const networkDisconnected = new Event<(ni:NetworkIdentifier)=>void>();

}
