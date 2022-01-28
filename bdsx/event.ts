import { Color } from "colors";
import { asmcode } from "./asm/asmcode";
import type { CommandContext } from "./bds/command";
import type { NetworkIdentifier } from "./bds/networkidentifier";
import { MinecraftPacketIds } from "./bds/packetids";
import { CANCEL } from "./common";
import { Event, EventEx } from "./eventtarget";
import type { BlockDestroyEvent, BlockDestructionStartEvent, BlockPlaceEvent, ButtonPressEvent, CampfireTryDouseFire, CampfireTryLightFire, FarmlandDecayEvent, PistonMoveEvent } from "./event_impl/blockevent";
import type { EntityCreatedEvent, EntityDieEvent, EntityHeathChangeEvent, EntityHurtEvent, EntitySneakEvent, EntityStartRidingEvent, EntityStartSwimmingEvent, EntityStopRidingEvent, PlayerAttackEvent, PlayerCritEvent, PlayerDropItemEvent, PlayerInventoryChangeEvent, PlayerJoinEvent, PlayerLeftEvent, PlayerLevelUpEvent, PlayerPickupItemEvent, PlayerRespawnEvent, PlayerUseItemEvent, ProjectileShootEvent, SplashPotionHitEvent, ItemUseEvent, ItemUseOnBlockEvent, PlayerSleepInBedEvent } from "./event_impl/entityevent";
import type { LevelExplodeEvent, LevelSaveEvent, LevelTickEvent, LevelWeatherChangeEvent } from "./event_impl/levelevent";
import type { ObjectiveCreateEvent, QueryRegenerateEvent, ScoreAddEvent, ScoreRemoveEvent, ScoreResetEvent, ScoreSetEvent } from "./event_impl/miscevent";
import type { nethook } from "./nethook";
import { remapStack } from "./source-map-support";

const PACKET_ID_COUNT = 0x100;
const PACKET_EVENT_COUNT = 0x500;

asmcode.addressof_enabledPacket.fill(0, 256);

class PacketEvent extends EventEx<(...args:any[])=>(CANCEL|void)> {
    constructor(public readonly id:number) {
        super();
    }

    onStarted():void {
        const v = asmcode.getEnabledPacket(this.id);
        asmcode.setEnabledPacket(v+1, this.id);
    }

    onCleared():void {
        const v = asmcode.getEnabledPacket(this.id);
        asmcode.setEnabledPacket(v-1, this.id);
    }
}

function getNetEventTarget(type:events.PacketEventType, packetId:MinecraftPacketIds):PacketEvent {
    if ((packetId>>>0) >= PACKET_ID_COUNT) {
        throw Error(`Out of range: packetId < 0x100 (packetId=${packetId})`);
    }
    const id = type*PACKET_ID_COUNT + packetId;
    let target = packetAllTargets[id];
    if (target !== null) return target;
    packetAllTargets[id] = target = new PacketEvent(packetId);
    return target;
}
const packetAllTargets = new Array<PacketEvent|null>(PACKET_EVENT_COUNT);
for (let i=0;i<PACKET_EVENT_COUNT;i++) {
    packetAllTargets[i] = null;
}

export namespace events {

    ////////////////////////////////////////////////////////
    // Block events

    /** Cancellable */
    export const blockDestroy = new Event<(event: BlockDestroyEvent) => void | CANCEL>();
    /** Not cancellable */
    export const blockDestructionStart = new Event<(event: BlockDestructionStartEvent) => void>();
    /** Cancellable */
    export const blockPlace = new Event<(event: BlockPlaceEvent) => void | CANCEL>();
    /** Not cancellable */
    export const pistonMove = new Event<(event: PistonMoveEvent) => void>();
    /** Cancellable */
    export const farmlandDecay = new Event<(event: FarmlandDecayEvent) => void | CANCEL>();

    /** Cancellable but requires additional stimulation */
    export const campfireLight = new Event<(event: CampfireTryLightFire) => void | CANCEL>();
    /** Cancellable but requires additional stimulation */
    export const campfireDouse = new Event<(event: CampfireTryDouseFire) => void | CANCEL>();
    /** Cancellable but the client will have the motion and sound*/
    export const buttonPress = new Event<(event: ButtonPressEvent) => void | CANCEL>();

    ////////////////////////////////////////////////////////
    // Entity events

    /** Cancellable */
    export const entityHurt = new Event<(event: EntityHurtEvent) => void | CANCEL>();
    /** Not cancellable */
    export const entityHealthChange = new Event<(event: EntityHeathChangeEvent) => void>();
    /**
     * Not cancellable.
     * it can be occured multiple times even it already died.
     */
    export const entityDie = new Event<(event: EntityDieEvent) => void>();
    /** Not cancellable */
    export const entitySneak = new Event<(event: EntitySneakEvent) => void>();
    /** Cancellable */
    export const entityStartSwimming = new Event<(event: EntityStartSwimmingEvent) => void | CANCEL>();
    /** Cancellable */
    export const entityStartRiding = new Event<(event: EntityStartRidingEvent) => void | CANCEL>();
    /** Cancellable but the client is still exiting though it will automatically ride again after rejoin */
    export const entityStopRiding = new Event<(event: EntityStopRidingEvent) => void | CANCEL>();
    /** Cancellable */
    export const playerAttack = new Event<(event: PlayerAttackEvent) => void | CANCEL>();
    /** Cancellable */
    export const playerDropItem = new Event<(event: PlayerDropItemEvent) => void | CANCEL>();
    /** Not cancellable */
    export const playerInventoryChange = new Event<(event: PlayerInventoryChangeEvent) => void | CANCEL>();
    /** Not cancellable */
    export const playerRespawn = new Event<(event: PlayerRespawnEvent) => void | CANCEL>();
    /** Cancellable */
    export const playerLevelUp = new Event<(event: PlayerLevelUpEvent) => void | CANCEL>();
    /** Not cancellable */
    export const entityCreated = new Event<(event: EntityCreatedEvent) => void>();
    /** Not cancellable */
    export const playerJoin = new Event<(event: PlayerJoinEvent) => void>();
    /** Not cancellable */
    export const playerLeft = new Event<(event: PlayerLeftEvent) => void>();
    /** Cancellable */
    export const playerPickupItem = new Event<(event: PlayerPickupItemEvent) => void | CANCEL>();
    /** Not cancellable */
    export const playerCrit = new Event<(event: PlayerCritEvent) => void>();
    /** Not cancellable.
     * Triggered when a player finishes consuming an item.
     * (e.g : food, potion, etc...)
     */
    export const playerUseItem = new Event<(event: PlayerUseItemEvent) => void>();
    /** Cancellable.
     * Triggered when a player uses an item. Cancelling this event will prevent the item from being used.
     * (e.g : splash potion won't be thrown, food won't be consumed, etc...)
     * To note : this event is triggered with every item, even if they are not consumable.
     *
     * @remarks use `itemUseOnBlock` to cancel the usage of an item on a block (e.g : flint and steel)
     */
    export const itemUse = new Event<(event: ItemUseEvent) => void | CANCEL>();
    /** Cancellable.
     * Triggered when a player uses an item on a block. Cancelling this event will prevent the item from being used
     * (e.g : flint and steel won't ignite block, seeds won't be planted, etc...)
     * To note : this event is triggered with every item, even if they are not usable on blocks.
     */
    export const itemUseOnBlock = new Event<(event: ItemUseOnBlockEvent) => void | CANCEL>();
    /** Cancellable */
    export const splashPotionHit = new Event<(event: SplashPotionHitEvent) => void | CANCEL>();
    /** Not cancellable */
    export const projectileShoot = new Event <(event:ProjectileShootEvent)=> void> ();
    /** Cancellable
     * Triggered when a player sleeps in a bed.
     * Cancelling this event will prevent the player from sleeping.
     */
    export const playerSleepInBed = new Event<(event: PlayerSleepInBedEvent) => void | CANCEL>();
    ////////////////////////////////////////////////////////
    // Level events

    /** Cancellable */
    export const levelExplode = new Event<(event: LevelExplodeEvent) => void | CANCEL>();
    /** Not cancellable */
    export const levelTick = new Event<(event: LevelTickEvent) => void>();
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
     * on internal update. but it's not tick.
     * @deprecated useless and incomprehensible
     */
    export const serverUpdate = new Event<()=>void>();

    /**
     * before serverStop, Minecraft is alive yet
     * LoopbackPacketSender is alive yet
     */
    export const serverLeave = new Event<()=>void>();

    /**
     * before system.shutdown, Minecraft is alive yet
     * LoopbackPacketSender is destroyed
     * some commands are failed on this event. use `events.serverLeave` intead.
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

    export enum PacketEventType {
        Raw,
        Before,
        After,
        Send,
        SendRaw,
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
    /** Cancellable */
    export const scoreReset = new Event<(event: ScoreResetEvent) => void | CANCEL>();
    /** Cancellable */
    export const scoreSet = new Event<(event: ScoreSetEvent) => void | CANCEL>();
    /** Cancellable */
    export const scoreAdd = new Event<(event: ScoreAddEvent) => void | CANCEL>();
    /** Cancellable */
    export const scoreRemove = new Event<(event: ScoreRemoveEvent) => void | CANCEL>();
    /** Cancellable */
    export const objectiveCreate = new Event<(event: ObjectiveCreateEvent) => void | CANCEL>();

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
