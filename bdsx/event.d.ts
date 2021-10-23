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
/** @deprecated use bdsx.events */
export declare namespace events {
    /** @deprecated use bdsx.events */
    const blockDestroy: Event<(event: BlockDestroyEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const blockPlace: Event<(event: BlockPlaceEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const pistonMove: Event<(event: PistonMoveEvent) => void>;
    /** @deprecated use bdsx.events */
    const farmlandDecay: Event<(event: FarmlandDecayEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const campfireLight: Event<(event: CampfireTryLightFire) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const campfireDouse: Event<(event: CampfireTryDouseFire) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const entityHurt: Event<(event: EntityHurtEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const entityHealthChange: Event<(event: EntityHeathChangeEvent) => void>;
    /** @deprecated use bdsx.events */
    const entityDie: Event<(event: EntityDieEvent) => void>;
    /** @deprecated use bdsx.events */
    const entitySneak: Event<(event: EntitySneakEvent) => void>;
    /** @deprecated use bdsx.events */
    const entityStartSwimming: Event<(event: EntityStartSwimmingEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const entityStartRiding: Event<(event: EntityStartRidingEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const entityStopRiding: Event<(event: EntityStopRidingEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const playerAttack: Event<(event: PlayerAttackEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const playerDropItem: Event<(event: PlayerDropItemEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const playerInventoryChange: Event<(event: PlayerInventoryChangeEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const playerRespawn: Event<(event: PlayerRespawnEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const playerLevelUp: Event<(event: PlayerLevelUpEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const entityCreated: Event<(event: EntityCreatedEvent) => void>;
    /** @deprecated use bdsx.events */
    const playerJoin: Event<(event: PlayerJoinEvent) => void>;
    /** @deprecated use bdsx.events */
    const playerPickupItem: Event<(event: PlayerPickupItemEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const playerCrit: Event<(event: PlayerCritEvent) => void>;
    /** @deprecated use bdsx.events */
    const playerUseItem: Event<(event: PlayerUseItemEvent) => void>;
    /** @deprecated use bdsx.events */
    const splashPotionHit: Event<(event: SplashPotionHitEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const levelExplode: Event<(event: LevelExplodeEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const levelTick: Event<(event: LevelTickEvent) => void>;
    /** Cancellable but you won't be able to stop the server */
    const levelSave: Event<(event: LevelSaveEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const levelWeatherChange: Event<(event: LevelWeatherChangeEvent) => void | CANCEL>;
    /**
     * before launched. after execute the main thread of BDS.
     * BDS will be loaded on the separated thread. this event will be executed concurrently with the BDS loading
     */
    const serverLoading: Event<() => void>;
    /**
     * after BDS launched
     * @deprecated use bdsx.events
     */
    const serverOpen: Event<() => void>;
    /**
     * on tick
     * @deprecated use bdsx.events
     */
    const serverUpdate: Event<() => void>;
    /**
     * before system.shutdown, Minecraft is alive yet
     * @deprecated use bdsx.events
     */
    const serverStop: Event<() => void>;
    /**
     * after BDS closed
     * @deprecated use bdsx.events
     */
    const serverClose: Event<() => void>;
    /**
     * server console outputs
     */
    const serverLog: Event<(log: string, color: import("colors").Color) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    enum PacketEventType {
        Raw = 0,
        Before = 1,
        After = 2,
        Send = 3,
        SendRaw = 4
    }
    /** @deprecated use bdsx.events */
    function packetEvent(type: PacketEventType, packetId: MinecraftPacketIds): Event<(...args: any[]) => (CANCEL | void)> | null;
    /** @deprecated use bdsx.events */
    function packetRaw(id: MinecraftPacketIds): Event<nethook.RawListener>;
    /** @deprecated use bdsx.events */
    function packetBefore<ID extends MinecraftPacketIds>(id: ID): Event<nethook.PacketListener<ID>>;
    /** @deprecated use bdsx.events */
    function packetAfter<ID extends MinecraftPacketIds>(id: ID): Event<nethook.PacketListener<ID>>;
    /** @deprecated use bdsx.events */
    function packetSend<ID extends MinecraftPacketIds>(id: ID): Event<nethook.PacketListener<ID>>;
    /** @deprecated use bdsx.events */
    function packetSendRaw(id: number): Event<nethook.SendRawListener>;
    /** @deprecated use bdsx.events */
    const queryRegenerate: Event<(event: QueryRegenerateEvent) => void>;
    /** @deprecated use bdsx.events */
    const scoreReset: Event<(event: ScoreResetEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const scoreSet: Event<(event: ScoreSetEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const scoreAdd: Event<(event: ScoreAddEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const scoreRemove: Event<(event: ScoreRemoveEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const objectiveCreate: Event<(event: ObjectiveCreateEvent) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    const error: Event<(error: any) => void | CANCEL>;
    /** @deprecated use bdsx.events */
    function errorFire(err: unknown): void;
    /** @deprecated use bdsx.events */
    const commandOutput: Event<(log: string) => CANCEL | void>;
    /** @deprecated use bdsx.events */
    const command: Event<(command: string, originName: string, ctx: CommandContext) => void | number>;
    /** @deprecated use bdsx.events */
    const networkDisconnected: Event<(ni: NetworkIdentifier) => void>;
}
