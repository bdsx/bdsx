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
/** @deprecated */
export declare namespace events {
    /** @deprecated */
    const blockDestroy: Event<(event: BlockDestroyEvent) => void | CANCEL>;
    /** @deprecated */
    const blockPlace: Event<(event: BlockPlaceEvent) => void | CANCEL>;
    /** @deprecated */
    const pistonMove: Event<(event: PistonMoveEvent) => void>;
    /** @deprecated */
    const farmlandDecay: Event<(event: FarmlandDecayEvent) => void | CANCEL>;
    /** @deprecated */
    const campfireLight: Event<(event: CampfireTryLightFire) => void | CANCEL>;
    /** @deprecated */
    const campfireDouse: Event<(event: CampfireTryDouseFire) => void | CANCEL>;
    /** @deprecated */
    const entityHurt: Event<(event: EntityHurtEvent) => void | CANCEL>;
    /** @deprecated */
    const entityHealthChange: Event<(event: EntityHeathChangeEvent) => void>;
    /** @deprecated */
    const entityDie: Event<(event: EntityDieEvent) => void>;
    /** @deprecated */
    const entitySneak: Event<(event: EntitySneakEvent) => void>;
    /** @deprecated */
    const entityStartSwimming: Event<(event: EntityStartSwimmingEvent) => void | CANCEL>;
    /** @deprecated */
    const entityStartRiding: Event<(event: EntityStartRidingEvent) => void | CANCEL>;
    /** @deprecated */
    const entityStopRiding: Event<(event: EntityStopRidingEvent) => void | CANCEL>;
    /** @deprecated */
    const playerAttack: Event<(event: PlayerAttackEvent) => void | CANCEL>;
    /** @deprecated */
    const playerDropItem: Event<(event: PlayerDropItemEvent) => void | CANCEL>;
    /** @deprecated */
    const playerInventoryChange: Event<(event: PlayerInventoryChangeEvent) => void | CANCEL>;
    /** @deprecated */
    const playerRespawn: Event<(event: PlayerRespawnEvent) => void | CANCEL>;
    /** @deprecated */
    const playerLevelUp: Event<(event: PlayerLevelUpEvent) => void | CANCEL>;
    /** @deprecated */
    const entityCreated: Event<(event: EntityCreatedEvent) => void>;
    /** @deprecated */
    const playerJoin: Event<(event: PlayerJoinEvent) => void>;
    /** @deprecated */
    const playerPickupItem: Event<(event: PlayerPickupItemEvent) => void | CANCEL>;
    /** @deprecated */
    const playerCrit: Event<(event: PlayerCritEvent) => void>;
    /** @deprecated */
    const playerUseItem: Event<(event: PlayerUseItemEvent) => void>;
    /** @deprecated */
    const splashPotionHit: Event<(event: SplashPotionHitEvent) => void | CANCEL>;
    /** @deprecated */
    const levelExplode: Event<(event: LevelExplodeEvent) => void | CANCEL>;
    /** @deprecated */
    const levelTick: Event<(event: LevelTickEvent) => void>;
    /** Cancellable but you won't be able to stop the server */
    const levelSave: Event<(event: LevelSaveEvent) => void | CANCEL>;
    /** @deprecated */
    const levelWeatherChange: Event<(event: LevelWeatherChangeEvent) => void | CANCEL>;
    /**
     * before launched. after execute the main thread of BDS.
     * BDS will be loaded on the separated thread. this event will be executed concurrently with the BDS loading
     */
    const serverLoading: Event<() => void>;
    /**
     * after BDS launched
     */
    const serverOpen: Event<() => void>;
    /**
     * on tick
     */
    const serverUpdate: Event<() => void>;
    /**
     * before system.shutdown, Minecraft is alive yet
     */
    const serverStop: Event<() => void>;
    /**
     * after BDS closed
     */
    const serverClose: Event<() => void>;
    /**
     * server console outputs
     */
    const serverLog: Event<(log: string, color: Color) => CANCEL | void>;
    enum PacketEventType {
        Raw = 0,
        Before = 1,
        After = 2,
        Send = 3,
        SendRaw = 4
    }
    function packetEvent(type: PacketEventType, packetId: MinecraftPacketIds): Event<(...args: any[]) => (CANCEL | void)> | null;
    /** @deprecated */
    function packetRaw(id: MinecraftPacketIds): Event<nethook.RawListener>;
    /** @deprecated */
    function packetBefore<ID extends MinecraftPacketIds>(id: ID): Event<nethook.PacketListener<ID>>;
    /** @deprecated */
    function packetAfter<ID extends MinecraftPacketIds>(id: ID): Event<nethook.PacketListener<ID>>;
    /** @deprecated */
    function packetSend<ID extends MinecraftPacketIds>(id: ID): Event<nethook.PacketListener<ID>>;
    /** @deprecated */
    function packetSendRaw(id: number): Event<nethook.SendRawListener>;
    /** @deprecated */
    const queryRegenerate: Event<(event: QueryRegenerateEvent) => void>;
    /** @deprecated */
    const scoreReset: Event<(event: ScoreResetEvent) => void | CANCEL>;
    /** @deprecated */
    const scoreSet: Event<(event: ScoreSetEvent) => void | CANCEL>;
    /** @deprecated */
    const scoreAdd: Event<(event: ScoreAddEvent) => void | CANCEL>;
    /** @deprecated */
    const scoreRemove: Event<(event: ScoreRemoveEvent) => void | CANCEL>;
    /** @deprecated */
    const objectiveCreate: Event<(event: ObjectiveCreateEvent) => void | CANCEL>;
    /** @deprecated */
    const error: Event<(error: any) => void | CANCEL>;
    /** @deprecated */
    function errorFire(err: unknown): void;
    /** @deprecated */
    const commandOutput: Event<(log: string) => CANCEL | void>;
    /** @deprecated */
    const command: Event<(command: string, originName: string, ctx: CommandContext) => void | number>;
    /** @deprecated */
    const networkDisconnected: Event<(ni: NetworkIdentifier) => void>;
}
