import { Actor, ActorDamageSource, ItemActor } from "../bds/actor";
import { ItemStack } from "../bds/inventory";
import { CompletedUsingItemPacket } from "../bds/packets";
import { Player } from "../bds/player";
interface IEntityHurtEvent {
    entity: Actor;
    damage: number;
    damageSource: ActorDamageSource;
    knock: boolean;
    ignite: boolean;
}
export declare class EntityHurtEvent implements IEntityHurtEvent {
    entity: Actor;
    damage: number;
    damageSource: ActorDamageSource;
    knock: boolean;
    ignite: boolean;
    constructor(entity: Actor, damage: number, damageSource: ActorDamageSource, knock: boolean, ignite: boolean);
}
interface IEntityHeathChangeEvent {
    entity: Actor;
    readonly oldHealth: number;
    readonly newHealth: number;
}
export declare class EntityHeathChangeEvent implements IEntityHeathChangeEvent {
    entity: Actor;
    readonly oldHealth: number;
    readonly newHealth: number;
    constructor(entity: Actor, oldHealth: number, newHealth: number);
}
interface IEntityDieEvent {
    entity: Actor;
    damageSource: ActorDamageSource;
}
export declare class EntityDieEvent implements IEntityDieEvent {
    entity: Actor;
    damageSource: ActorDamageSource;
    constructor(entity: Actor, damageSource: ActorDamageSource);
}
interface IEntityStartSwimmingEvent {
    entity: Actor;
}
export declare class EntityStartSwimmingEvent implements IEntityStartSwimmingEvent {
    entity: Actor;
    constructor(entity: Actor);
}
interface IEntityStartRidingEvent {
    entity: Actor;
    ride: Actor;
}
export declare class EntityStartRidingEvent implements IEntityStartRidingEvent {
    entity: Actor;
    ride: Actor;
    constructor(entity: Actor, ride: Actor);
}
interface IEntityStopRidingEvent {
    entity: Actor;
    exitFromRider: boolean;
    actorIsBeingDestroyed: boolean;
    switchingRides: boolean;
}
export declare class EntityStopRidingEvent implements IEntityStopRidingEvent {
    entity: Actor;
    exitFromRider: boolean;
    actorIsBeingDestroyed: boolean;
    switchingRides: boolean;
    constructor(entity: Actor, exitFromRider: boolean, actorIsBeingDestroyed: boolean, switchingRides: boolean);
}
interface IEntitySneakEvent {
    entity: Actor;
    isSneaking: boolean;
}
export declare class EntitySneakEvent implements IEntitySneakEvent {
    entity: Actor;
    isSneaking: boolean;
    constructor(entity: Actor, isSneaking: boolean);
}
interface IEntityCreatedEvent {
    entity: Actor;
}
export declare class EntityCreatedEvent implements IEntityCreatedEvent {
    entity: Actor;
    constructor(entity: Actor);
}
interface IPlayerAttackEvent {
    player: Player;
    victim: Actor;
}
export declare class PlayerAttackEvent implements IPlayerAttackEvent {
    player: Player;
    victim: Actor;
    constructor(player: Player, victim: Actor);
}
interface IPlayerDropItemEvent {
    player: Player;
    itemStack: ItemStack;
}
export declare class PlayerDropItemEvent implements IPlayerDropItemEvent {
    player: Player;
    itemStack: ItemStack;
    constructor(player: Player, itemStack: ItemStack);
}
interface IPlayerInventoryChangeEvent {
    player: Player;
    readonly oldItemStack: ItemStack;
    readonly newItemStack: ItemStack;
    readonly slot: number;
}
export declare class PlayerInventoryChangeEvent implements IPlayerInventoryChangeEvent {
    player: Player;
    readonly oldItemStack: ItemStack;
    readonly newItemStack: ItemStack;
    readonly slot: number;
    constructor(player: Player, oldItemStack: ItemStack, newItemStack: ItemStack, slot: number);
}
interface IPlayerRespawnEvent {
    player: Player;
}
export declare class PlayerRespawnEvent implements IPlayerRespawnEvent {
    player: Player;
    constructor(player: Player);
}
interface IPlayerLevelUpEvent {
    player: Player;
    levels: number;
}
export declare class PlayerLevelUpEvent implements IPlayerLevelUpEvent {
    player: Player;
    /** Amount of levels upgraded */
    levels: number;
    constructor(player: Player, 
    /** Amount of levels upgraded */
    levels: number);
}
interface IPlayerJoinEvent {
    readonly player: Player;
}
export declare class PlayerJoinEvent implements IPlayerJoinEvent {
    readonly player: Player;
    constructor(player: Player);
}
interface IPlayerPickupItemEvent {
    player: Player;
    itemActor: ItemActor;
}
export declare class PlayerPickupItemEvent implements IPlayerPickupItemEvent {
    player: Player;
    itemActor: ItemActor;
    constructor(player: Player, itemActor: ItemActor);
}
interface IPlayerCritEvent {
    player: Player;
}
export declare class PlayerCritEvent implements IPlayerCritEvent {
    player: Player;
    constructor(player: Player);
}
interface IPlayerUseItemEvent {
    player: Player;
    useMethod: CompletedUsingItemPacket.Actions;
    consumeItem: boolean;
    itemStack: ItemStack;
}
export declare class PlayerUseItemEvent implements IPlayerUseItemEvent {
    player: Player;
    useMethod: CompletedUsingItemPacket.Actions;
    consumeItem: boolean;
    itemStack: ItemStack;
    constructor(player: Player, useMethod: CompletedUsingItemPacket.Actions, consumeItem: boolean, itemStack: ItemStack);
}
interface IPlayerJumpEvent {
    player: Player;
}
export declare class PlayerJumpEvent implements IPlayerJumpEvent {
    player: Player;
    constructor(player: Player);
}
interface ISplashPotionHitEvent {
    entity: Actor;
    potionEffect: number;
}
export declare class SplashPotionHitEvent implements ISplashPotionHitEvent {
    entity: Actor;
    potionEffect: number;
    constructor(entity: Actor, potionEffect: number);
}
export {};
