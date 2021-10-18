declare namespace __tsb {
// events\index.ts
export namespace events {
import Color = __tsb_colors.Color;
import CANCEL = __tsb_common.CANCEL;
import NativePointer = __tsb_core.NativePointer;
import Event = __tsb_eventtarget.Event;
import MinecraftPacketIds = __tsb_minecraft.MinecraftPacketIds;
import NetworkIdentifier = __tsb_minecraft.NetworkIdentifier;
import Packet = __tsb_minecraft.Packet;
import EntityCreatedEvent = __tsb.entity.EntityCreatedEvent;
import BlockDestroyEvent = __tsb.blockevent4.BlockDestroyEvent;
import BlockPlaceEvent = __tsb.blockevent4.BlockPlaceEvent;
import CampfireTryDouseFire = __tsb.blockevent4.CampfireTryDouseFire;
import CampfireTryLightFire = __tsb.blockevent4.CampfireTryLightFire;
import FarmlandDecayEvent = __tsb.blockevent4.FarmlandDecayEvent;
import PistonMoveEvent = __tsb.blockevent4.PistonMoveEvent;
import CommandEvent = __tsb.commandevent.CommandEvent;
import EntityDieEvent = __tsb.entityevent4.EntityDieEvent;
import EntityHeathChangeEvent = __tsb.entityevent4.EntityHeathChangeEvent;
import EntityHurtEvent = __tsb.entityevent4.EntityHurtEvent;
import EntitySneakEvent = __tsb.entityevent4.EntitySneakEvent;
import EntityStartRidingEvent = __tsb.entityevent4.EntityStartRidingEvent;
import EntityStopRidingEvent = __tsb.entityevent4.EntityStopRidingEvent;
import SplashPotionHitEvent = __tsb.entityevent4.SplashPotionHitEvent;
import LevelExplodeEvent = __tsb.levelevent4.LevelExplodeEvent;
import LevelSaveEvent = __tsb.levelevent4.LevelSaveEvent;
import LevelTickEvent = __tsb.levelevent4.LevelTickEvent;
import LevelWeatherChangeEvent = __tsb.levelevent4.LevelWeatherChangeEvent;
import ObjectiveCreateEvent = __tsb.miscevent4.ObjectiveCreateEvent;
import QueryRegenerateEvent = __tsb.miscevent4.QueryRegenerateEvent;
import ScoreAddEvent = __tsb.miscevent4.ScoreAddEvent;
import ScoreRemoveEvent = __tsb.miscevent4.ScoreRemoveEvent;
import ScoreResetEvent = __tsb.miscevent4.ScoreResetEvent;
import ScoreSetEvent = __tsb.miscevent4.ScoreSetEvent;
import PlayerAttackEvent = __tsb.playerevent2.PlayerAttackEvent;
import PlayerCritEvent = __tsb.playerevent2.PlayerCritEvent;
import PlayerDisconnectEvent = __tsb.playerevent2.PlayerDisconnectEvent;
import PlayerDropItemEvent = __tsb.playerevent2.PlayerDropItemEvent;
import PlayerInventoryChangeEvent = __tsb.playerevent2.PlayerInventoryChangeEvent;
import PlayerJoinEvent = __tsb.playerevent2.PlayerJoinEvent;
import PlayerLevelUpEvent = __tsb.playerevent2.PlayerLevelUpEvent;
import PlayerLoginEvent = __tsb.playerevent2.PlayerLoginEvent;
import PlayerPickupItemEvent = __tsb.playerevent2.PlayerPickupItemEvent;
import PlayerRespawnEvent = __tsb.playerevent2.PlayerRespawnEvent;
import PlayerStartSwimmingEvent = __tsb.playerevent2.PlayerStartSwimmingEvent;
import PlayerUseItemEvent = __tsb.playerevent2.PlayerUseItemEvent;
export namespace events {
    type RawListener = (ptr: NativePointer, size: number, networkIdentifier: NetworkIdentifier, packetId: number) => CANCEL | void | Promise<void>;
    type PacketListener<ID extends MinecraftPacketIds> = (packet: Packet.idMap[ID], networkIdentifier: NetworkIdentifier, packetId: ID) => CANCEL | void | Promise<void>;
    type BeforeListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    type AfterListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    type SendListener<ID extends MinecraftPacketIds> = PacketListener<ID>;
    type SendRawListener = (ptr: NativePointer, size: number, networkIdentifier: NetworkIdentifier, packetId: number) => CANCEL | void | Promise<void>;
    /** Cancellable */
    const blockDestroy: Event<(event: BlockDestroyEvent) => void | CANCEL>;
    /** Cancellable */
    const blockPlace: Event<(event: BlockPlaceEvent) => void | CANCEL>;
    /** Not cancellable */
    const pistonMove: Event<(event: PistonMoveEvent) => void>;
    /** Cancellable */
    const farmlandDecay: Event<(event: FarmlandDecayEvent) => void | CANCEL>;
    /** Cancellable but requires additional stimulation */
    const campfireLight: Event<(event: CampfireTryLightFire) => void | CANCEL>;
    /** Cancellable but requires additional stimulation */
    const campfireDouse: Event<(event: CampfireTryDouseFire) => void | CANCEL>;
    /** Cancellable */
    const entityHurt: Event<(event: EntityHurtEvent) => void | CANCEL>;
    /** Not cancellable */
    const entityHealthChange: Event<(event: EntityHeathChangeEvent) => void>;
    /** Not cancellable */
    const entityDie: Event<(event: EntityDieEvent) => void>;
    /** Not cancellable */
    const entitySneak: Event<(event: EntitySneakEvent) => void>;
    /** Cancellable */
    const entityStartRiding: Event<(event: EntityStartRidingEvent) => void | CANCEL>;
    /** Cancellable but the client is still exiting though it will automatically ride again after rejoin */
    const entityStopRiding: Event<(event: EntityStopRidingEvent) => void | CANCEL>;
    /** Not cancellable */
    const entityCreated: Event<(event: EntityCreatedEvent) => void>;
    /** Cancellable */
    const splashPotionHit: Event<(event: SplashPotionHitEvent) => void | CANCEL>;
    /** Cancellable */
    const playerStartSwimming: Event<(event: PlayerStartSwimmingEvent) => void | CANCEL>;
    /** Cancellable */
    const playerAttack: Event<(event: PlayerAttackEvent) => void | CANCEL>;
    /** Cancellable but only when player is in container screens*/
    const playerDropItem: Event<(event: PlayerDropItemEvent) => void | CANCEL>;
    /** Not cancellable */
    const playerInventoryChange: Event<(event: PlayerInventoryChangeEvent) => void | CANCEL>;
    /** Not cancellable */
    const playerRespawn: Event<(event: PlayerRespawnEvent) => void | CANCEL>;
    /** Cancellable */
    const playerLevelUp: Event<(event: PlayerLevelUpEvent) => void | CANCEL>;
    /** Not cancellable */
    const playerJoin: Event<(event: PlayerJoinEvent) => void>;
    /** Cancellable */
    const playerPickupItem: Event<(event: PlayerPickupItemEvent) => void | CANCEL>;
    /** Not cancellable */
    const playerCrit: Event<(event: PlayerCritEvent) => void>;
    /** Not cancellable */
    const playerUseItem: Event<(event: PlayerUseItemEvent) => void>;
    /** Not cancellable */
    const playerLogin: Event<(player: PlayerLoginEvent) => void>;
    /** Not cancellable */
    const playerDisconnect: Event<(player: PlayerDisconnectEvent) => void>;
    /** Cancellable */
    const levelExplode: Event<(event: LevelExplodeEvent) => void | CANCEL>;
    /** Not cancellable */
    const levelTick: Event<(event: LevelTickEvent) => void>;
    /** Cancellable but you won't be able to stop the server */
    const levelSave: Event<(event: LevelSaveEvent) => void | CANCEL>;
    /** Cancellable */
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
    /**
     * before 'before' and 'after'
     * earliest event for the packet receiving.
     * It will bring raw packet buffers before parsing
     * It can be canceled the packet if you return 'CANCEL'
     */
    function packetRaw(id: MinecraftPacketIds): Event<RawListener>;
    /**
     * after 'raw', before 'after'
     * the event that before processing but after parsed from raw.
     * It can be canceled the packet if you return 'CANCEL'
     */
    function packetBefore<ID extends MinecraftPacketIds>(id: ID): Event<PacketListener<ID>>;
    /**
     * after 'raw' and 'before'
     * the event that after processing. some fields are assigned after the processing
     */
    function packetAfter<ID extends MinecraftPacketIds>(id: ID): Event<PacketListener<ID>>;
    /**
     * before serializing.
     * it can modify class fields.
     */
    function packetSend<ID extends MinecraftPacketIds>(id: ID): Event<PacketListener<ID>>;
    /**
     * after serializing. before sending.
     * it can access serialized buffer.
     */
    function packetSendRaw(id: number): Event<SendRawListener>;
    /**
     * @alias packetBefore(MinecraftPacketIds.Text)
     */
    const chat: any;
    /** Not cancellable */
    const queryRegenerate: Event<(event: QueryRegenerateEvent) => void>;
    /** Cancellable */
    const scoreReset: Event<(event: ScoreResetEvent) => void | CANCEL>;
    /** Cancellable */
    const scoreSet: Event<(event: ScoreSetEvent) => void | CANCEL>;
    /** Cancellable */
    const scoreAdd: Event<(event: ScoreAddEvent) => void | CANCEL>;
    /** Cancellable */
    const scoreRemove: Event<(event: ScoreRemoveEvent) => void | CANCEL>;
    /** Cancellable */
    const objectiveCreate: Event<(event: ObjectiveCreateEvent) => void | CANCEL>;
    /**
     * global error listeners
     * if returns 'CANCEL', then default error printing is disabled
     */
    const error: any;
    function errorFire(err: unknown): void;
    /**
     * command console outputs
     */
    const commandOutput: Event<(log: string) => CANCEL | void>;
    /**
     * command input
     * Commands will be canceled if you return a error code.
     * 0 means success for error codes but others are unknown.
     */
    const command: Event<(command: CommandEvent) => void | number>;
}

}
// events\commandevent.ts
export namespace commandevent {
import CommandContext = __tsb_minecraft.CommandContext;
import command = __tsb.command.command;
export class CommandEvent {
    command: string;
    readonly origin: command.Origin;
    private readonly context;
    constructor(command: string, origin: command.Origin, context: CommandContext);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawContext(): CommandContext;
}

}
// server.ts
export namespace server {
export namespace server {
    function getMotd(): string;
    function setMotd(motd: string): void;
    function getMaxPlayers(): number;
    function setMaxPlayers(count: number): void;
    function disconnectAllClients(message?: string): void;
    function getActivePlayerCount(): number;
    function nextTick(): Promise<void>;
    const networkProtocolVersion: number;
    const bdsVersion: string;
}

}
// entity.ts
export namespace entity {
import AttributeId = __tsb_enums.AttributeId;
import DimensionId = __tsb_enums.DimensionId;
import MobEffectIds = __tsb_enums.MobEffectIds;
import Actor = __tsb_minecraft.Actor;
import ActorUniqueID = __tsb_minecraft.ActorUniqueID;
import AttributeInstance = __tsb_minecraft.AttributeInstance;
import MobEffectInstance = __tsb_minecraft.MobEffectInstance;
import Vec3 = __tsb_minecraft.Vec3;
import bin64_t = __tsb_nativetype2.bin64_t;
const entityKey: unique symbol;
const entityMapper: unique symbol;
interface OptionalAttributeValues {
    current?: number;
    min?: number;
    max?: number;
    default?: number;
}
interface AttributeValues {
    current: number;
    min: number;
    max: number;
    default: number;
}
export class Entity {
    protected actor: ActorX | null;
    entity: IEntity | null;
    constructor(actor: ActorX | null);
    protected actorMust(): Actor;
    get name(): string;
    get identifier(): string;
    get dimensionId(): DimensionId;
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawEntity(): ActorX | null;
    getPosition(): Vec3;
    getUniqueID(): ActorUniqueID;
    getUniqueIdBin(): bin64_t;
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getAttributeInstance(id: AttributeId): AttributeInstance;
    getAttributeValues(id: AttributeId): AttributeValues;
    getAttribute(id: AttributeId): number;
    setAttribute(id: AttributeId, value: number | OptionalAttributeValues): boolean;
    teleport(pos: Vec3, dimensionId?: DimensionId): void;
    addEffect(id: MobEffectIds, duration: number, amplifier?: number): void;
    hasEffect(id: MobEffectIds): boolean;
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getEffect(id: MobEffectIds): MobEffectInstance | null;
    static registerMapper<T extends Actor>(rawClass: new (...args: any[]) => T, mapper: (actor: T) => (Entity | null)): void;
    static fromUniqueId(lowBits: string | number, highBits: number): Entity;
    static fromUniqueId(bin: string): Entity;
    static fromRaw(actor: Actor): Entity | null;
    /**
     * from the scripting API entity.
     */
    static fromEntity(entity: IEntity): Entity | null;
    toString(): string;
}
interface ActorX extends Actor {
    [entityKey]?: Entity;
    [entityMapper]?(): Entity | null;
}
export class EntityCreatedEvent {
    entity: Entity;
    constructor(entity: Entity);
}
export {};

}
// player.ts
export namespace player {
import Actor = __tsb_minecraft.Actor;
import CommandPermissionLevel = __tsb_minecraft.CommandPermissionLevel;
import NetworkIdentifier = __tsb_minecraft.NetworkIdentifier;
import Packet = __tsb_minecraft.Packet;
import PlayerRaw = __tsb_minecraft.Player;
import ServerPlayer = __tsb_minecraft.ServerPlayer;
import Entity = __tsb.entity.Entity;
interface PlayerComponentClass {
    new (player: Player): PlayerComponent;
    available?(player: Player): boolean;
}
export class PlayerComponent {
    readonly player: Player;
    constructor(player: Player);
    /**
     * check if it's available for the specific player.
     */
    static available?(player: Player): boolean;
    /**
     * register this component class.
     * it will add the component to all Player instances.
     * can be filtered with UserComponent.available.
     */
    static register(this: PlayerComponentClass): void;
}
const playerKey: unique symbol;
interface NetworkIdentifierX extends NetworkIdentifier {
    [playerKey]?: PlayerNew;
}
export class Player extends Entity {
    private readonly networkIdentifier;
    private readonly _name;
    readonly xuid: string;
    /** it can be undefined if the player entity is not created */
    entity: IEntity;
    protected actor: ServerPlayer | null;
    private readonly components;
    constructor(networkIdentifier: NetworkIdentifierX, _name: string, xuid: string);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    sendPacket(packet: Packet): void;
    get disconnected(): boolean;
    get name(): string;
    get ip(): string;
    addComponent(componentClass: PlayerComponentClass): PlayerComponent;
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawNetworkIdentifier(): NetworkIdentifier;
    getRawEntity(): PlayerRaw | null;
    getCommandPermissionLevel(): CommandPermissionLevel;
    message(message: string): void;
    toString(): string;
    static all(): IterableIterator<Player>;
    static fromIP(ipaddr: string): IterableIterator<Player>;
    static fromName(name: string): Player | null;
    static fromXuid(xuid: string): Player | null;
    static fromEntity(entity: IEntity): Player | null;
    static fromNetworkIdentifier(networkIdentifier: NetworkIdentifierX): Player | null;
    static fromRaw(actor: Actor): Player | null;
}
type PlayerNew = Player;
export {};

}
// events\levelevent.ts
export namespace levelevent4 {
import Actor = __tsb_minecraft.Actor;
import BlockSource = __tsb_minecraft.BlockSource;
import Level = __tsb_minecraft.Level;
import Vec3 = __tsb_minecraft.Vec3;
import EntityEvent = __tsb.entityevent4.EntityEvent;
export class LevelExplodeEvent extends EntityEvent {
    position: Vec3;
    /** The radius of the explosion in blocks and the amount of damage the explosion deals. */
    power: number;
    /** If true, blocks in the explosion radius will be set on fire. */
    causesFire: boolean;
    /** If true, the explosion will destroy blocks in the explosion radius. */
    breaksBlocks: boolean;
    /** A blocks explosion resistance will be capped at this value when an explosion occurs. */
    maxResistance: number;
    allowUnderwater: boolean;
    private level;
    private blockSource;
    constructor(actor: Actor, position: Vec3, 
    /** The radius of the explosion in blocks and the amount of damage the explosion deals. */
    power: number, 
    /** If true, blocks in the explosion radius will be set on fire. */
    causesFire: boolean, 
    /** If true, the explosion will destroy blocks in the explosion radius. */
    breaksBlocks: boolean, 
    /** A blocks explosion resistance will be capped at this value when an explosion occurs. */
    maxResistance: number, allowUnderwater: boolean, level: Level, blockSource: BlockSource);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawLevel(): Level;
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawBlockSource(): BlockSource;
}
export class LevelSaveEvent {
    private level;
    constructor(level: Level);
}
export class LevelTickEvent {
    private level;
    constructor(level: Level);
}
export class LevelWeatherChangeEvent {
    rainLevel: number;
    rainTime: number;
    lightningLevel: number;
    lightningTime: number;
    private level;
    constructor(rainLevel: number, rainTime: number, lightningLevel: number, lightningTime: number, level: Level);
}

}
// events\miscevent.ts
export namespace miscevent4 {
import Objective = __tsb_minecraft.Objective;
import ObjectiveCriteria = __tsb_minecraft.ObjectiveCriteria;
import ScoreboardIdentityRef = __tsb_minecraft.ScoreboardIdentityRef;
export class QueryRegenerateEvent {
    motd: string;
    levelname: string;
    currentPlayers: number;
    maxPlayers: number;
    isJoinableThroughServerScreen: boolean;
    constructor(motd: string, levelname: string, currentPlayers: number, maxPlayers: number, isJoinableThroughServerScreen: boolean);
}
export class ScoreResetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
    constructor(identityRef: ScoreboardIdentityRef, objective: Objective);
}
export class ScoreSetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
    /** The score to be set */
    score: number;
    constructor(identityRef: ScoreboardIdentityRef, objective: Objective, 
    /** The score to be set */
    score: number);
}
export class ScoreAddEvent extends ScoreSetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
    /** The score to be added */
    score: number;
    constructor(identityRef: ScoreboardIdentityRef, objective: Objective, 
    /** The score to be added */
    score: number);
}
export class ScoreRemoveEvent extends ScoreSetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
    /** The score to be removed */
    score: number;
    constructor(identityRef: ScoreboardIdentityRef, objective: Objective, 
    /** The score to be removed */
    score: number);
}
export class ObjectiveCreateEvent {
    name: string;
    displayName: string;
    criteria: ObjectiveCriteria;
    constructor(name: string, displayName: string, criteria: ObjectiveCriteria);
}

}
// events\playerevent.ts
export namespace playerevent2 {
import DeviceOS = __tsb_enums.DeviceOS;
import Actor = __tsb_minecraft.Actor;
import CompletedUsingItemPacket = __tsb_minecraft.CompletedUsingItemPacket;
import ConnectionRequest = __tsb_minecraft.ConnectionRequest;
import LoginPacket = __tsb_minecraft.LoginPacket;
import Entity = __tsb.entity.Entity;
import Item = __tsb.item2.Item;
import ItemEntity = __tsb.itementity2.ItemEntity;
import Player = __tsb.player.Player;
export class PlayerEvent {
    player: Player;
    constructor(player: Player);
}
interface LoginPacketWithConnectionRequest extends LoginPacket {
    connreq: ConnectionRequest;
}
export class PlayerLoginEvent extends PlayerEvent {
    private readonly packet;
    constructor(player: Player, packet: LoginPacketWithConnectionRequest);
    get os(): DeviceOS;
    get deviceId(): string;
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawPacket(): LoginPacket;
}
export class PlayerDisconnectEvent extends PlayerEvent {
}
export class PlayerAttackEvent extends PlayerEvent {
    private readonly _victimActor;
    victim: Entity;
    private readonly _victimEntity;
    constructor(player: Player, _victimActor: Actor);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawVictimEntity(): Actor;
}
export class PlayerDropItemEvent extends PlayerEvent {
    item: Item;
    constructor(player: Player, item: Item);
}
export class PlayerInventoryChangeEvent extends PlayerEvent {
    readonly oldItem: Item;
    readonly newItem: Item;
    readonly slot: number;
    constructor(player: Player, oldItem: Item, newItem: Item, slot: number);
}
export class PlayerRespawnEvent extends PlayerEvent {
}
export class PlayerLevelUpEvent extends PlayerEvent {
    /** Amount of levels upgraded */
    levels: number;
    constructor(player: Player, 
    /** Amount of levels upgraded */
    levels: number);
}
export class PlayerJoinEvent extends PlayerEvent {
    constructor(player: Player);
}
export class PlayerPickupItemEvent extends PlayerEvent {
    itemActor: ItemEntity;
    constructor(player: Player, itemActor: ItemEntity);
}
export class PlayerCritEvent extends PlayerEvent {
}
export class PlayerUseItemEvent extends PlayerEvent {
    useMethod: PlayerUseItemEvent.Actions;
    consumeItem: boolean;
    item: Item;
    constructor(player: Player, useMethod: PlayerUseItemEvent.Actions, consumeItem: boolean, item: Item);
}
export namespace PlayerUseItemEvent {
    export import Actions = CompletedUsingItemPacket.Actions;
}
export class PlayerJumpEvent extends PlayerEvent {
}
export class PlayerStartSwimmingEvent extends PlayerEvent {
}
export {};

}
// events\blockevent.ts
export namespace blockevent4 {
import PistonAction = __tsb_enums.PistonAction;
import BlockRaw = __tsb_minecraft.Block;
import BlockPos = __tsb_minecraft.BlockPos;
import BlockSource = __tsb_minecraft.BlockSource;
import Block = __tsb.block.Block;
import Entity = __tsb.entity.Entity;
import Player = __tsb.player.Player;
import PlayerEvent = __tsb.playerevent2.PlayerEvent;
export class BlockDestroyEvent extends PlayerEvent {
    blockPos: BlockPos;
    constructor(player: Player, blockPos: BlockPos);
}
export class BlockEvent {
    blockPos: BlockPos;
    private blockSource;
    constructor(blockPos: BlockPos, blockSource: BlockSource);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawBlockSource(): BlockSource;
}
export class BlockPlaceEvent extends BlockEvent {
    player: Player;
    private rawBlock;
    constructor(player: Player, blockPos: BlockPos, rawBlock: BlockRaw, blockSource: BlockSource);
    get block(): Block;
}
export class PistonMoveEvent extends BlockEvent {
    readonly action: PistonAction;
    constructor(blockPos: BlockPos, action: PistonAction, blockSource: BlockSource);
}
export class FarmlandDecayEvent extends BlockEvent {
    culprit: Entity;
    private rawBlock;
    constructor(blockPos: BlockPos, culprit: Entity, rawBlock: BlockRaw, blockSource: BlockSource);
    get block(): Block;
}
export class CampfireTryLightFire extends BlockEvent {
}
export class CampfireTryDouseFire extends BlockEvent {
}

}
// events\entityevent.ts
export namespace entityevent4 {
import Actor = __tsb_minecraft.Actor;
import ActorDamageSource = __tsb_minecraft.ActorDamageSource;
import Entity = __tsb.entity.Entity;
export class EntityEvent {
    private readonly _actor;
    entity: Entity;
    private _entity;
    constructor(_actor: Actor);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawEntity(): Actor;
    static defineEntityGetter(target: unknown, entityKey: string, internalEntityKey: string, internalActorKey: string): void;
}
export class EntityHurtEvent extends EntityEvent {
    damage: number;
    knock: boolean;
    ignite: boolean;
    private damageSource;
    constructor(actor: Actor, damage: number, knock: boolean, ignite: boolean, damageSource: ActorDamageSource);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawActorDamageSource(): ActorDamageSource;
}
export class EntityHeathChangeEvent extends EntityEvent {
    readonly oldHealth: number;
    readonly newHealth: number;
    constructor(actor: Actor, oldHealth: number, newHealth: number);
}
export class EntityDieEvent extends EntityEvent {
    private damageSource;
    constructor(actor: Actor, damageSource: ActorDamageSource);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawActorDamageSource(): ActorDamageSource;
}
export class EntityStartRidingEvent extends EntityEvent {
    private readonly _rideActor;
    ride: Entity;
    private _rideEntity;
    constructor(actor: Actor, _rideActor: Actor);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawRideEntity(): Actor;
}
export class EntityStopRidingEvent extends EntityEvent {
    exitFromRider: boolean;
    actorIsBeingDestroyed: boolean;
    switchingRides: boolean;
    constructor(actor: Actor, exitFromRider: boolean, actorIsBeingDestroyed: boolean, switchingRides: boolean);
}
export class EntitySneakEvent extends EntityEvent {
    isSneaking: boolean;
    constructor(actor: Actor, isSneaking: boolean);
}
export class SplashPotionHitEvent extends EntityEvent {
    potionEffect: number;
    constructor(entity: Actor, potionEffect: number);
}

}
// command.ts
export namespace command {
import BlockPos = __tsb_minecraft.BlockPos;
import CommandOrigin = __tsb_minecraft.CommandOrigin;
import CommandOutput = __tsb_minecraft.CommandOutput;
import CommandPermissionLevel = __tsb_minecraft.CommandPermissionLevel;
import Dimension = __tsb_minecraft.Dimension;
import MCRESULT = __tsb_minecraft.MCRESULT;
import RelativeFloatType = __tsb_minecraft.RelativeFloat;
import Vec3 = __tsb_minecraft.Vec3;
import Entity = __tsb.entity.Entity;
export namespace command {
    abstract class Param<T> {
        optional(): Param<T | undefined>;
    }
    class Origin {
        private readonly origin;
        private _pos;
        private _blockPos;
        private _entity;
        constructor(origin: CommandOrigin);
        /**
         * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
         */
        getRawOrigin(): CommandOrigin;
        get isServerOrigin(): boolean;
        get isScriptOrigin(): boolean;
        get entity(): Entity | null;
        get position(): Vec3;
        get blockPosition(): BlockPos;
    }
    const Boolean: Param<boolean>;
    const Integer: Param<number>;
    const String: Param<string>;
    const RawText: Param<string>;
    const RelativeFloat: Param<RelativeFloatType>;
    const EntityWildcard: Param<Entity[]>;
    const Json: Param<any>;
    class Factory {
        readonly name: string;
        constructor(name: string);
        overload<PARAMS extends Record<string, Param<any>>>(callback: (params: {
            [key in keyof PARAMS]: PARAMS[key] extends Param<infer T> ? T : never;
        }, origin: CommandOrigin, output: CommandOutput) => void, parameters: PARAMS): this;
        alias(alias: string): this;
    }
    function register(name: string, description: string, perm?: CommandPermissionLevel): Factory;
    /**
     * it does the same thing with bedrockServer.executeCommandOnConsole
     * but call the internal function directly
     */
    function execute(command: string, dimension?: Dimension | null): MCRESULT;
    /**
     * resend the command list packet to clients
     */
    function update(): void;
}

}
// itementity.ts
export namespace itementity2 {
import ItemActor = __tsb_minecraft.ItemActor;
import Entity = __tsb.entity.Entity;
export class ItemEntity extends Entity {
    static fromRaw(actor: ItemActor): Entity;
}

}
// item.ts
export namespace item2 {
import ItemStack = __tsb_minecraft.ItemStack;
import ItemRaw = __tsb_minecraft.Item;
export class Item {
    private itemStack;
    private item;
    constructor(itemStack: ItemStack | null, item: ItemRaw | null);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawItemStack(): ItemStack;
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawItem(): ItemRaw;
}

}
// block.ts
export namespace block {
import BlockRaw = __tsb_minecraft.Block;
export class Block {
    private readonly block;
    constructor(block: BlockRaw);
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawBlock(): BlockRaw;
}

}
}
import __tsb_colors = require('colors');
import __tsb_common = require('../common');
import __tsb_core = require('../core');
import __tsb_eventtarget = require('../eventtarget');
import __tsb_minecraft = require('../minecraft');
import __tsb_enums = require('../enums');
import __tsb_nativetype2 = require('../nativetype');
// index.ts
import eventsModule = __tsb.events;
import serverModule = __tsb.server;
import entityModule = __tsb.entity;
import playerModule = __tsb.player;
import commandModule = __tsb.command;
export declare namespace bdsx {
    export import Entity = entityModule.Entity;
    export import Player = playerModule.Player;
    export import events = eventsModule.events;
    export import server = serverModule.server;
    export import command = commandModule.command;
}

