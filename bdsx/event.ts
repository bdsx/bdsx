import { Color } from "colors";
import type { CommandContext } from "./bds/command";
import type { NetworkIdentifier } from "./bds/networkidentifier";
import { MinecraftPacketIds } from "./bds/packetids";
import { CANCEL } from "./common";
import { Event } from "./eventtarget";
import type { BlockDestroyEvent, BlockPlaceEvent, CampfireTryDouseFire, CampfireTryLightFire, PistonMoveEvent } from "./event_impl/blockevent";
import type { EntityCreatedEvent, EntityDieEvent, EntityHeathChangeEvent, EntityHurtEvent, EntitySneakEvent, EntityStartRidingEvent, EntityStopRidingEvent, PlayerAttackEvent, PlayerCritEvent, PlayerDropItemEvent, PlayerJoinEvent, PlayerLevelUpEvent, PlayerPickupItemEvent, PlayerRespawnEvent, PlayerUseItemEvent } from "./event_impl/entityevent";
import type { LevelExplodeEvent, LevelSaveEvent, LevelWeatherChangeEvent } from "./event_impl/levelevent";
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
    /** Cancellable but requires additional stimulation */
    export const campfireLight = new Event<(event: CampfireTryLightFire) => void | CANCEL>();
    /** Cancellable but requires additional stimulation */
    export const campfireDouse = new Event<(event: CampfireTryDouseFire) => void | CANCEL>();
    ////////////////////////////////////////////////////////
    // Entity events

    /** Cancellable */
    export const entityHurt = new Event<(event: EntityHurtEvent) => void | CANCEL>();
    /** Not cancellable */
    export const entityHealthChange = new Event<(event: EntityHeathChangeEvent) => void>();
    /** Not cancellable */
    export const entityDie = new Event<(event: EntityDieEvent) => void>();
    /** Not cancellable */
    export const entitySneak = new Event<(event: EntitySneakEvent) => void>();
    /** Cancellable */
    export const entityStartRiding = new Event<(event: EntityStartRidingEvent) => void | CANCEL>();
    /** Cancellable but the client is still exiting though it will automatically ride again after rejoin */
    export const entityStopRiding = new Event<(event: EntityStopRidingEvent) => void | CANCEL>();
    /** Cancellable */
    export const playerAttack = new Event<(event: PlayerAttackEvent) => void | CANCEL>();
    /** Cancellable but only when player is in container screens*/
    export const playerDropItem = new Event<(event: PlayerDropItemEvent) => void | CANCEL>();
    /** Not cancellable */
    export const playerRespawn = new Event<(event: PlayerRespawnEvent) => void | CANCEL>();
    /** Cancellable */
    export const playerLevelUp = new Event<(event: PlayerLevelUpEvent) => void | CANCEL>();
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
    // Level events

    /** Cancellable */
    export const levelExplode = new Event<(event: LevelExplodeEvent) => void | CANCEL>();
    /** Cancellable but you won't be able to stop the server */
    export const levelSave = new Event<(event: LevelSaveEvent) => void | CANCEL>();
    /** Cancellable */
    export const levelWeatherChange = new Event<(event: LevelWeatherChangeEvent) => void | CANCEL>();

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
     * It can be canceled the packet if you return 'CANCEL'
     */
    export function packetRaw(id:MinecraftPacketIds):Event<nethook.RawListener> {
        return getNetEventTarget(PacketEventType.Raw, id);
    }

    /**
     * after 'raw', before 'after'
     * the event that before processing but after parsed from raw.
     * It can be canceled the packet if you return 'CANCEL'
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
    * if returns 'CANCEL', then default error printing is disabled
    */
    export const error = Event.errorHandler;

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
      * Commands will be canceled if you return a error code.
      * 0 means success for error codes but others are unknown.
      */
    export const command = new Event<(command: string, originName: string, ctx: CommandContext) => void | number>();


    /**
      * network identifier disconnected
      */
    export const networkDisconnected = new Event<(ni:NetworkIdentifier)=>void>();

}
