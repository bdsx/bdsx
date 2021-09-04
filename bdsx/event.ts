import { Color } from "colors";
import type { CommandContext } from "./bds/command";
import type { NetworkIdentifier } from "./bds/networkidentifier";
import { MinecraftPacketIds } from "./bds/packetids";
import { CANCEL } from "./common";
import { Event } from "./eventtarget";
import type { BlockDestroyEvent, BlockPlaceEvent, CampfireTryDouseFire, CampfireTryLightFire, FarmlandDecayEvent, PistonMoveEvent } from "./event_impl/blockevent";
import type { EntityCreatedEvent, EntityDieEvent, EntityHeathChangeEvent, EntityHurtEvent, EntitySneakEvent, EntityStartRidingEvent, EntityStartSwimmingEvent, EntityStopRidingEvent, PlayerAttackEvent, PlayerCritEvent, PlayerDropItemEvent, PlayerInventoryChangeEvent, PlayerJoinEvent, PlayerLevelUpEvent, PlayerPickupItemEvent, PlayerRespawnEvent, PlayerUseItemEvent, SplashPotionHitEvent } from "./event_impl/entityevent";
import type { LevelExplodeEvent, LevelSaveEvent, LevelTickEvent, LevelWeatherChangeEvent } from "./event_impl/levelevent";
import type { ObjectiveCreateEvent, QueryRegenerateEvent, ScoreAddEvent, ScoreRemoveEvent, ScoreResetEvent, ScoreSetEvent } from "./event_impl/miscevent";
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


/** @deprecated */
export namespace events {

    ////////////////////////////////////////////////////////
    // Block events

    /** @deprecated */
    export const blockDestroy = new Event<(event: BlockDestroyEvent) => void | CANCEL>();
    /** @deprecated */
    export const blockPlace = new Event<(event: BlockPlaceEvent) => void | CANCEL>();
    /** @deprecated */
    export const pistonMove = new Event<(event: PistonMoveEvent) => void>();
    /** @deprecated */
    export const farmlandDecay = new Event<(event: FarmlandDecayEvent) => void | CANCEL>();

    /** @deprecated */
    export const campfireLight = new Event<(event: CampfireTryLightFire) => void | CANCEL>();
    /** @deprecated */
    export const campfireDouse = new Event<(event: CampfireTryDouseFire) => void | CANCEL>();
    ////////////////////////////////////////////////////////
    // Entity events

    /** @deprecated */
    export const entityHurt = new Event<(event: EntityHurtEvent) => void | CANCEL>();
    /** @deprecated */
    export const entityHealthChange = new Event<(event: EntityHeathChangeEvent) => void>();
    /** @deprecated */
    export const entityDie = new Event<(event: EntityDieEvent) => void>();
    /** @deprecated */
    export const entitySneak = new Event<(event: EntitySneakEvent) => void>();
    /** @deprecated */
    export const entityStartSwimming = new Event<(event: EntityStartSwimmingEvent) => void | CANCEL>();
    /** @deprecated */
    export const entityStartRiding = new Event<(event: EntityStartRidingEvent) => void | CANCEL>();
    /** @deprecated */
    export const entityStopRiding = new Event<(event: EntityStopRidingEvent) => void | CANCEL>();
    /** @deprecated */
    export const playerAttack = new Event<(event: PlayerAttackEvent) => void | CANCEL>();
    /** @deprecated */
    export const playerDropItem = new Event<(event: PlayerDropItemEvent) => void | CANCEL>();
    /** @deprecated */
    export const playerInventoryChange = new Event<(event: PlayerInventoryChangeEvent) => void | CANCEL>();
    /** @deprecated */
    export const playerRespawn = new Event<(event: PlayerRespawnEvent) => void | CANCEL>();
    /** @deprecated */
    export const playerLevelUp = new Event<(event: PlayerLevelUpEvent) => void | CANCEL>();
    /** @deprecated */
    export const entityCreated = new Event<(event: EntityCreatedEvent) => void>();
    /** @deprecated */
    export const playerJoin = new Event<(event: PlayerJoinEvent) => void>();
    /** @deprecated */
    export const playerPickupItem = new Event<(event: PlayerPickupItemEvent) => void | CANCEL>();
    /** @deprecated */
    export const playerCrit = new Event<(event: PlayerCritEvent) => void>();
    /** @deprecated */
    export const playerUseItem = new Event<(event: PlayerUseItemEvent) => void>();
    /** @deprecated */
    export const splashPotionHit = new Event<(event: SplashPotionHitEvent) => void | CANCEL>();

    ////////////////////////////////////////////////////////
    // Level events

    /** @deprecated */
    export const levelExplode = new Event<(event: LevelExplodeEvent) => void | CANCEL>();
    /** @deprecated */
    export const levelTick = new Event<(event: LevelTickEvent) => void>();
    /** Cancellable but you won't be able to stop the server */
    export const levelSave = new Event<(event: LevelSaveEvent) => void | CANCEL>();
    /** @deprecated */
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

    /** @deprecated */
    export function packetRaw(id:MinecraftPacketIds):Event<nethook.RawListener> {
        return getNetEventTarget(PacketEventType.Raw, id);
    }

    /** @deprecated */
    export function packetBefore<ID extends MinecraftPacketIds>(id:ID):Event<nethook.PacketListener<ID>> {
        return getNetEventTarget(PacketEventType.Before, id);
    }

    /** @deprecated */
    export function packetAfter<ID extends MinecraftPacketIds>(id:ID):Event<nethook.PacketListener<ID>> {
        return getNetEventTarget(PacketEventType.After, id);
    }

    /** @deprecated */
    export function packetSend<ID extends MinecraftPacketIds>(id:ID):Event<nethook.PacketListener<ID>> {
        return getNetEventTarget(PacketEventType.Send, id);
    }

    /** @deprecated */
    export function packetSendRaw(id:number):Event<nethook.SendRawListener> {
        return getNetEventTarget(PacketEventType.SendRaw, id);
    }

    ////////////////////////////////////////////////////////
    // Misc

    /** @deprecated */
    export const queryRegenerate = new Event<(event: QueryRegenerateEvent) => void>();
    /** @deprecated */
    export const scoreReset = new Event<(event: ScoreResetEvent) => void | CANCEL>();
    /** @deprecated */
    export const scoreSet = new Event<(event: ScoreSetEvent) => void | CANCEL>();
    /** @deprecated */
    export const scoreAdd = new Event<(event: ScoreAddEvent) => void | CANCEL>();
    /** @deprecated */
    export const scoreRemove = new Event<(event: ScoreRemoveEvent) => void | CANCEL>();
    /** @deprecated */
    export const objectiveCreate = new Event<(event: ObjectiveCreateEvent) => void | CANCEL>();

    /** @deprecated */
    export const error = Event.errorHandler;

    /** @deprecated */
    export function errorFire(err:unknown):void {
        if (err instanceof Error) {
            err.stack = remapStack(err.stack);
        }
        if (events.error.fire(err) !== CANCEL) {
            console.error(err && ((err as any).stack || err));
        }
    }

    /** @deprecated */
    export const commandOutput = new Event<(log:string)=>CANCEL|void>();

    /** @deprecated */
    export const command = new Event<(command: string, originName: string, ctx: CommandContext) => void | number>();

    /** @deprecated */
    export const networkDisconnected = new Event<(ni:NetworkIdentifier)=>void>();

}
