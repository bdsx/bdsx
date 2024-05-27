import { Color } from "colors";
import { asmcode } from "./asm/asmcode";
import type { CommandContext } from "./bds/command";
import type { NetworkIdentifier } from "./bds/networkidentifier";
import { MinecraftPacketIds } from "./bds/packetids";
import { CANCEL } from "./common";
import { PACKET_ID_COUNT } from "./const";
import type {
    BlockAttackEvent,
    BlockDestroyEvent,
    BlockDestructionStartEvent,
    BlockInteractedWithEvent,
    BlockPlaceEvent,
    ButtonPressEvent,
    CampfireTryDouseFire,
    CampfireTryLightFire,
    ChestOpenEvent,
    ChestPairEvent,
    FallOnBlockEvent,
    FarmlandDecayEvent,
    LightningHitBlockEvent,
    PistonCheckEvent,
    PistonMoveEvent,
    ProjectileHitBlockEvent,
    SculkSensorActivateEvent,
    SculkShriekEvent,
} from "./event_impl/blockevent";
import type {
    EntityCarriedItemChangedEvent,
    EntityConsumeTotemEvent,
    EntityCreatedEvent,
    EntityDieEvent,
    EntityHealthChangeEvent,
    EntityHurtEvent,
    EntityKnockbackEvent,
    EntitySneakEvent,
    EntityStartRidingEvent,
    EntityStartSwimmingEvent,
    EntityStopRidingEvent,
    ItemUseEvent,
    ItemUseOnBlockEvent,
    PlayerAttackEvent,
    PlayerCritEvent,
    PlayerDimensionChangeEvent,
    PlayerDropItemEvent,
    PlayerInteractEvent,
    PlayerInventoryChangeEvent,
    PlayerJoinEvent,
    PlayerJumpEvent,
    PlayerLeftEvent,
    PlayerLevelUpEvent,
    PlayerPickupItemEvent,
    PlayerRespawnEvent,
    PlayerSleepInBedEvent,
    PlayerUseItemEvent,
    ProjectileHitEvent,
    ProjectileShootEvent,
    SplashPotionHitEvent,
} from "./event_impl/entityevent";
import type { LevelExplodeEvent, LevelSaveEvent, LevelTickEvent, LevelWeatherChangeEvent } from "./event_impl/levelevent";
import type { ObjectiveCreateEvent, QueryRegenerateEvent, ScoreAddEvent, ScoreRemoveEvent, ScoreResetEvent, ScoreSetEvent } from "./event_impl/miscevent";
import { Event } from "./eventtarget";
import type { nethook } from "./nethook";
import { remapAndPrintError, remapError } from "./source-map-support";

const PACKET_EVENT_COUNT = PACKET_ID_COUNT * 5;

const enabledPacket = asmcode.addressof_enabledPacket;
enabledPacket.fill(0, PACKET_ID_COUNT);

class PacketEvent extends Event<(...args: any[]) => void | CANCEL> {
    constructor(public readonly id: number) {
        super();
    }
}

function getNetEventTarget(type: events.PacketEventType, packetId: MinecraftPacketIds): PacketEvent {
    if (packetId >>> 0 >= PACKET_ID_COUNT) {
        throw Error(`Out of range: packetId < 0x100 (packetId=${packetId})`);
    }
    const idx = type * PACKET_ID_COUNT + packetId;
    let target = packetAllTargets[idx];
    if (target !== null) return target;
    packetAllTargets[idx] = target = new PacketEvent(packetId);
    const bit = 1 << type;
    target.setInstaller(
        () => {
            const packetId = target!.id;
            enabledPacket.setUint8(enabledPacket.getUint8(packetId) | bit, packetId);
        },
        () => {
            const packetId = target!.id;
            enabledPacket.setUint8(enabledPacket.getUint8(packetId) & ~bit, packetId);
        },
    );
    return target;
}
const packetAllTargets = new Array<PacketEvent | null>(PACKET_EVENT_COUNT);
for (let i = 0; i < PACKET_EVENT_COUNT; i++) {
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
    /** Cancellable
     * Triggers when a piston checks a block. Cancelling this event will prevent blocks from being pushed by the piston.
     * This event will fire constantly if the piston is activated even if the event is cancelled.
     */
    export const pistonCheck = new Event<(event: PistonCheckEvent) => void | CANCEL>();
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
    /** Cancellable.
     * Triggered when a player opens a chest. Cancelling this event will prevent the player from opening the chest.
     * To note : This event works for all chest types (normal chests, trapped chests, ender chests).
     */
    export const chestOpen = new Event<(event: ChestOpenEvent) => void | CANCEL>();
    /** Cancellable.
     * Triggered when 2 chests are paired to form a double chest. Cancelling this event will prevent the chests from pairing.
     * To note : This event works for all chest types that can be doubled (normal chests, trapped chests).
     */
    export const chestPair = new Event<(event: ChestPairEvent) => void | CANCEL>();
    /** Cancellable but only in a few cases (e.g. interacting with the blocks such as anvil, grindstone, enchanting table, etc.*/
    export const blockInteractedWith = new Event<(event: BlockInteractedWithEvent) => void | CANCEL>();

    /** Not cancellable */
    export const projectileHitBlock = new Event<(event: ProjectileHitBlockEvent) => void>();
    /** Not cancellable */
    export const lightningHitBlock = new Event<(event: LightningHitBlockEvent) => void>();
    /** Not cancellable */
    export const fallOnBlock = new Event<(event: FallOnBlockEvent) => void>();
    /** Cancellable but only when the player is not in creative mode */
    export const attackBlock = new Event<(event: BlockAttackEvent) => void | CANCEL>();
    /** Cancellable */
    export const sculkShriek = new Event<(event: SculkShriekEvent) => void | CANCEL>();
    /** Cancellable */
    export const sculkSensorActivate = new Event<(event: SculkSensorActivateEvent) => void | CANCEL>();
    ////////////////////////////////////////////////////////
    // Entity events

    /** Cancellable */
    export const entityHurt = new Event<(event: EntityHurtEvent) => void | CANCEL>();
    /** Not cancellable */
    export const entityHealthChange = new Event<(event: EntityHealthChangeEvent) => void>();
    /**
     * Not cancellable.
     * it can be occurred multiple times even it already died.
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
    /**
     * Not cancellable
     * **NOT IMPLEMENTED**
     */
    export const entityCarriedItemChanged = new Event<(event: EntityCarriedItemChangedEvent) => void>();
    /** Cancellable */
    export const playerAttack = new Event<(event: PlayerAttackEvent) => void | CANCEL>();
    /** Cancellable */
    export const playerInteract = new Event<(event: PlayerInteractEvent) => void | CANCEL>();
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
     * (e.g : flint and steel won't ignite block, seeds won't be planted, buckets won't be filled or poured, etc...)
     * To note : this event is triggered with every item, even if they are not usable on blocks.
     */
    export const itemUseOnBlock = new Event<(event: ItemUseOnBlockEvent) => void | CANCEL>();
    /** Cancellable */
    export const splashPotionHit = new Event<(event: SplashPotionHitEvent) => void | CANCEL>();
    /** Not cancellable */
    export const projectileShoot = new Event<(event: ProjectileShootEvent) => void>();
    /** Not cancellable */
    export const projectileHit = new Event<(event: ProjectileHitEvent) => void>();
    /** Cancellable
     * Triggered when a player sleeps in a bed.
     * Cancelling this event will prevent the player from sleeping.
     */
    export const playerSleepInBed = new Event<(event: PlayerSleepInBedEvent) => void | CANCEL>();
    /** Not cancellable */
    export const playerJump = new Event<(event: PlayerJumpEvent) => void>();
    /** Not cancellable */
    export const entityConsumeTotem = new Event<(event: EntityConsumeTotemEvent) => void>();
    /** Cancellable
     * Triggered when a player changes dimension.
     * Cancelling this event will prevent the player from changing dimension (e.g : entering a nether portal).
     */
    export const playerDimensionChange = new Event<(event: PlayerDimensionChangeEvent) => void | CANCEL>();
    /** Cancellable.
     * Triggered when an entity has knockback applied to them (e.g : being hit by another entity).
     * Cancelling this event will prevent the knockback from being applied.
     */
    export const entityKnockback = new Event<(event: EntityKnockbackEvent) => void | CANCEL>();
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
     * Usual scripts are no need to use this event. it's for plugin scripts that are loaded before BDS.
     */
    export const serverLoading = new Event<() => void>();

    /**
     * after BDS launched
     * Usual scripts are no need to use this event. it's for plugin scripts that are loaded before BDS.
     * or `bedrockServer.afterOpen().then(callback)` is usable for both situation.
     */
    export const serverOpen = new Event<() => void>();

    /**
     * on internal update. but it's not tick.
     * @deprecated useless and incomprehensible
     */
    export const serverUpdate = new Event<() => void>();

    /**
     * before serverStop, Minecraft is alive yet
     * LoopbackPacketSender is alive yet
     */
    export const serverLeave = new Event<() => void>();

    /**
     * before system.shutdown, Minecraft is alive yet
     * LoopbackPacketSender is destroyed
     * some commands are failed on this event. use `events.serverLeave` instead.
     */
    export const serverStop = new Event<() => void>();

    /**
     * after BDS closed
     */
    export const serverClose = new Event<() => void>();

    /**
     * server console outputs
     */
    export const serverLog = new Event<(log: string, color: Color) => void | CANCEL>();

    export const resourceReload = new Event<() => void>();

    ////////////////////////////////////////////////////////
    // Packet events

    export enum PacketEventType {
        Raw,
        Before,
        After,
        Send,
        SendRaw,
    }

    export function packetEvent(type: PacketEventType, packetId: MinecraftPacketIds): Event<(...args: any[]) => void | CANCEL> | null {
        if (packetId >>> 0 >= PACKET_ID_COUNT) {
            console.error(`Out of range: packetId < 0x100 (type=${PacketEventType[type]}, packetId=${packetId})`);
            return null;
        }
        const id = type * PACKET_ID_COUNT + packetId;
        return packetAllTargets[id];
    }

    /**
     * before 'before' and 'after'
     * earliest event for the packet receiving.
     * It will bring raw packet buffers before parsing
     * It can be canceled the packet if you return 'CANCEL'
     */
    export function packetRaw(id: MinecraftPacketIds): Event<nethook.RawListener> {
        return getNetEventTarget(PacketEventType.Raw, id);
    }

    /**
     * after 'raw', before 'after'
     * the event that before processing but after parsed from raw.
     * It can be canceled the packet if you return 'CANCEL'
     */
    export function packetBefore<ID extends MinecraftPacketIds>(id: ID): Event<nethook.PacketListener<ID>> {
        return getNetEventTarget(PacketEventType.Before, id);
    }

    /**
     * after 'raw' and 'before'
     * the event that after processing. some fields are assigned after the processing
     */
    export function packetAfter<ID extends MinecraftPacketIds>(id: ID): Event<nethook.PacketListener<ID>> {
        return getNetEventTarget(PacketEventType.After, id);
    }

    /**
     * before serializing.
     * it can modify class fields.
     */
    export function packetSend<ID extends MinecraftPacketIds>(id: ID): Event<nethook.PacketListener<ID>> {
        return getNetEventTarget(PacketEventType.Send, id);
    }

    /**
     * after serializing. before sending.
     * it can access serialized buffer.
     */
    export function packetSendRaw(id: number): Event<nethook.SendRawListener> {
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

    export function errorFire(err: unknown): void {
        if (err instanceof Error) {
            remapError(err);
        }
        if (events.error.fire(err) !== CANCEL) {
            remapAndPrintError(err as any);
        }
    }

    /**
     * command console outputs
     */
    export const commandOutput = new Event<(log: string) => void | CANCEL>();

    /**
     * command input
     * Commands will be canceled if you return a error code.
     * 0 means success for error codes but others are unknown.
     */
    export const command = new Event<(command: string, originName: string, ctx: CommandContext) => void | number>();

    /**
     * network identifier disconnected
     */
    export const networkDisconnected = new Event<(ni: NetworkIdentifier) => void>();
}
