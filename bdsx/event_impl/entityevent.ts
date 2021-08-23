import { Actor, ActorDamageSource, ItemActor } from "../bds/actor";
import { ProjectileComponent, SplashPotionEffectSubcomponent } from "../bds/components";
import { ItemStack } from "../bds/inventory";
import { MinecraftPacketIds } from "../bds/packetids";
import { CompletedUsingItemPacket, ScriptCustomEventPacket } from "../bds/packets";
import { Player } from "../bds/player";
import { procHacker } from "../bds/proc";
import { CANCEL } from "../common";
import { NativePointer, VoidPointer } from "../core";
import { events } from "../event";
import { makefunc } from "../makefunc";
import { bool_t, float32_t, int32_t, void_t } from "../nativetype";
import { _tickCallback } from "../util";


interface IEntityHurtEvent {
    entity: Actor;
    damage: number;
    damageSource: ActorDamageSource;
    knock: boolean,
    ignite: boolean,
}
export class EntityHurtEvent implements IEntityHurtEvent {
    constructor(
        public entity: Actor,
        public damage: number,
        public damageSource: ActorDamageSource,
        public knock: boolean,
        public ignite: boolean,
    ) {
    }
}

interface IEntityHeathChangeEvent {
    entity: Actor;
    readonly oldHealth: number;
    readonly newHealth: number;
}
export class EntityHeathChangeEvent implements IEntityHeathChangeEvent {
    constructor(
        public entity: Actor,
        readonly oldHealth: number,
        readonly newHealth: number,
    ) {
    }
}

interface IEntityDieEvent {
    entity: Actor;
    damageSource: ActorDamageSource;
}
export class EntityDieEvent implements IEntityDieEvent {
    constructor(
        public entity: Actor,
        public damageSource: ActorDamageSource,
    ) {
    }
}
interface IEntityStartSwimmingEvent {
    entity: Actor;
}
export class EntityStartSwimmingEvent implements IEntityStartSwimmingEvent {
    constructor(
        public entity: Actor,
    ) {
    }
}
interface IEntityStartRidingEvent {
    entity: Actor;
    ride: Actor;
}
export class EntityStartRidingEvent implements IEntityStartRidingEvent {
    constructor(
        public entity: Actor,
        public ride: Actor,
    ) {
    }
}
interface IEntityStopRidingEvent {
    entity: Actor;
    exitFromRider: boolean;
    actorIsBeingDestroyed: boolean;
    switchingRides: boolean;
}
export class EntityStopRidingEvent implements IEntityStopRidingEvent {
    constructor(
        public entity: Actor,
        public exitFromRider: boolean,
        public actorIsBeingDestroyed: boolean,
        public switchingRides: boolean,
    ) {
    }
}
interface IEntitySneakEvent {
    entity: Actor;
    isSneaking: boolean;
}
export class EntitySneakEvent implements IEntitySneakEvent {
    constructor(
        public entity: Actor,
        public isSneaking: boolean,
    ) {
    }
}

interface IEntityCreatedEvent {
    entity: Actor;
}
export class EntityCreatedEvent implements IEntityCreatedEvent {
    constructor(
        public entity: Actor
    ) {
    }
}

// interface IEntityDeathEvent {
//     entity: Actor;
//     damageSource: ActorDamageSource;
//     ActorType: number;
// }
// export class EntityDeathEvent implements IEntityDeathEvent {
//     constructor(
//         public entity: Actor,
//         public damageSource: ActorDamageSource,
//         public ActorType: number
//     ) {
//     }
// }

interface IPlayerAttackEvent {
    player: Player;
    victim: Actor;
}
export class PlayerAttackEvent implements IPlayerAttackEvent {
    constructor(
        public player: Player,
        public victim: Actor,
    ) {
    }
}

interface IPlayerDropItemEvent {
    player: Player;
    itemStack: ItemStack;
}
export class PlayerDropItemEvent implements IPlayerDropItemEvent {
    constructor(
        public player: Player,
        public itemStack: ItemStack,
    ) {
    }
}

interface IPlayerInventoryChangeEvent {
    player: Player;
    readonly oldItemStack: ItemStack;
    readonly newItemStack: ItemStack;
    readonly slot:number;
}
export class PlayerInventoryChangeEvent implements IPlayerInventoryChangeEvent {
    constructor(
        public player: Player,
        readonly oldItemStack: ItemStack,
        readonly newItemStack: ItemStack,
        readonly slot:number,
    ) {
    }
}

interface IPlayerRespawnEvent {
    player: Player;
}
export class PlayerRespawnEvent implements IPlayerRespawnEvent {
    constructor(
        public player: Player,
    ) {
    }
}

interface IPlayerLevelUpEvent {
    player: Player;
    levels: number;
}
export class PlayerLevelUpEvent implements IPlayerLevelUpEvent {
    constructor(
        public player: Player,
        /** Amount of levels upgraded */
        public levels: number,
    ) {
    }
}

interface IPlayerJoinEvent {
    readonly player: Player;
}
export class PlayerJoinEvent implements IPlayerJoinEvent {
    constructor(
        readonly player: Player,
    ) {
    }
}

interface IPlayerPickupItemEvent {
    player: Player;
    itemActor: ItemActor;
}
export class PlayerPickupItemEvent implements IPlayerPickupItemEvent {
    constructor(
        public player: Player,
        public itemActor: ItemActor,
    ) {
    }
}
interface IPlayerCritEvent {
    player: Player;
}
export class PlayerCritEvent implements IPlayerCritEvent {
    constructor(
        public player: Player
    ) {
    }
}

interface IPlayerUseItemEvent {
    player: Player;
    useMethod: CompletedUsingItemPacket.Actions;
    consumeItem: boolean;
    itemStack: ItemStack;
}
export class PlayerUseItemEvent implements IPlayerUseItemEvent {
    constructor(
        public player: Player,
        public useMethod: CompletedUsingItemPacket.Actions,
        public consumeItem: boolean,
        public itemStack: ItemStack
    ) {
    }
}

interface IPlayerJumpEvent {
    player: Player;
}
export class PlayerJumpEvent implements IPlayerJumpEvent {
    constructor(
        public player: Player
    ) {
    }
}

interface ISplashPotionHitEvent {
    entity: Actor;
    potionEffect: number;
}
export class SplashPotionHitEvent implements ISplashPotionHitEvent {
    constructor(
        public entity: Actor,
        public potionEffect: number,
    ) {
    }
}

// function onPlayerJump(player: Player):void {
//     const event = new PlayerJumpEvent(player);
//     console.log(player.getName());
//     // events.playerUseItem.fire(event);    Not work yet
//     return _onPlayerJump(event.player);
// }
// const _onPlayerJump = procHacker.hooking('Player::jumpFromGround', void_t, null, Player)(onPlayerJump);


function onPlayerUseItem(player: Player, itemStack:ItemStack, useMethod:number, consumeItem:boolean):void {
    const event = new PlayerUseItemEvent(player, useMethod, consumeItem, itemStack);
    events.playerUseItem.fire(event);
    _tickCallback();
    return _onPlayerUseItem(event.player, event.itemStack, event.useMethod, event.consumeItem);
}
const _onPlayerUseItem = procHacker.hooking('Player::useItem', void_t, null, Player, ItemStack, int32_t, bool_t)(onPlayerUseItem);

function onPlayerCrit(player: Player):void {
    const event = new PlayerCritEvent(player);
    events.playerCrit.fire(event);
    _tickCallback();
    return _onPlayerCrit(event.player);
}
const _onPlayerCrit = procHacker.hooking('Player::_crit', void_t, null, Player)(onPlayerCrit);

function onEntityHurt(entity: Actor, actorDamageSource: ActorDamageSource, damage: number, knock: boolean, ignite: boolean):boolean {
    const event = new EntityHurtEvent(entity, damage, actorDamageSource, knock, ignite);
    const canceled = events.entityHurt.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        return false;
    }
    return _onEntityHurt(event.entity, event.damageSource, event.damage, knock, ignite);
}
const _onEntityHurt = procHacker.hooking('Actor::hurt', bool_t, null, Actor, ActorDamageSource, int32_t, bool_t, bool_t)(onEntityHurt);

function onEntityHealthChange(attributeDelegate: NativePointer, oldHealth:number, newHealth:number, attributeBuffInfo:VoidPointer):boolean {
    const actor = Actor[makefunc.getFromParam](attributeDelegate, 0x20);
    const event = new EntityHeathChangeEvent(actor!, oldHealth, newHealth);
    events.entityHealthChange.fire(event);
    attributeDelegate.setPointer(event.entity, 0x20);
    _tickCallback();
    return _onEntityHealthChange(attributeDelegate, oldHealth, newHealth, attributeBuffInfo);
}
const _onEntityHealthChange = procHacker.hooking('HealthAttributeDelegate::change', bool_t, null, NativePointer, float32_t, float32_t, VoidPointer)(onEntityHealthChange);

function onEntityDie(entity:Actor, damageSource:ActorDamageSource):boolean {
    const event = new EntityDieEvent(entity, damageSource);
    events.entityDie.fire(event);
    _tickCallback();
    return _onEntityDie(event.entity, event.damageSource);
}
const _onEntityDie = procHacker.hooking('Mob::die', bool_t, null, Actor, ActorDamageSource)(onEntityDie);

function onEntityStartSwimming(entity:Actor):void {
    const event = new EntityStartSwimmingEvent(entity);
    const canceled = events.entityStartSwimming.fire(event) === CANCEL;
    _tickCallback();
    if (!canceled) {
        return _onEntityStartSwimming(event.entity);
    }
}
function onPlayerStartSwimming(entity:Player):void {
    const event = new EntityStartSwimmingEvent(entity);
    const canceled = events.entityStartSwimming.fire(event) === CANCEL;
    _tickCallback();
    if (!canceled) {
        return _onPlayerStartSwimming(event.entity as Player);
    }
}
const _onEntityStartSwimming = procHacker.hooking('Actor::startSwimming', void_t, null, Actor)(onEntityStartSwimming);
const _onPlayerStartSwimming = procHacker.hooking('Player::startSwimming', void_t, null, Player)(onPlayerStartSwimming);

function onEntityStartRiding(entity:Actor, ride:Actor):boolean {
    const event = new EntityStartRidingEvent(entity, ride);
    const canceled = events.entityStartRiding.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        return false;
    }
    return _onEntityStartRiding(event.entity, event.ride);
}
const _onEntityStartRiding = procHacker.hooking('Actor::startRiding', bool_t, null, Actor, Actor)(onEntityStartRiding);

function onEntityStopRiding(entity:Actor, exitFromRider:boolean, actorIsBeingDestroyed:boolean, switchingRides:boolean):void {
    const event = new EntityStopRidingEvent(entity, exitFromRider, actorIsBeingDestroyed, switchingRides);
    const notCanceled = events.entityStopRiding.fire(event) !== CANCEL;
    _tickCallback();
    if (notCanceled) {
        return _onEntityStopRiding(event.entity, event.exitFromRider, event.actorIsBeingDestroyed, event.switchingRides);
    }
}
const _onEntityStopRiding = procHacker.hooking('Actor::stopRiding', void_t, null, Actor, bool_t, bool_t, bool_t)(onEntityStopRiding);

function onEntitySneak(Script:ScriptCustomEventPacket, entity:Actor, isSneaking:boolean):boolean {
    const event = new EntitySneakEvent(entity, isSneaking);
    events.entitySneak.fire(event);
    _tickCallback();
    return _onEntitySneak(Script, event.entity, event.isSneaking);
}
const _onEntitySneak = procHacker.hooking('ScriptServerActorEventListener::onActorSneakChanged', bool_t, null, ScriptCustomEventPacket, Actor, bool_t)(onEntitySneak);

function onEntityCreated(Script:ScriptCustomEventPacket, entity:Actor):boolean {
    const event = new EntityCreatedEvent(entity);
    events.entityCreated.fire(event);
    _tickCallback();
    return _onEntityCreated(Script, event.entity);
}
const _onEntityCreated = procHacker.hooking('ScriptServerActorEventListener::onActorCreated', bool_t, null, ScriptCustomEventPacket, Actor)(onEntityCreated);


// function onEntityDeath(Script:ScriptCustomEventPacket, entity:Actor, actorDamageSource:ActorDamageSource, ActorType:number):boolean {
//     const event = new EntityDeathEvent(entity, actorDamageSource, ActorType);
//     console.log(`${entity} ${actorDamageSource} ${ActorType}`)
//     events.entityCreated.fire(event);
//     return _onEntityDeath(Script, event.entity, event.damageSource, event.ActorType);
// }
// const _onEntityDeath = procHacker.hooking('ScriptServerActorEventListener::onActorDeath', bool_t, null, ScriptCustomEventPacket, Actor, ActorDamageSource, int32_t)(onEntityDeath);

function onPlayerAttack(player:Player, victim:Actor):boolean {
    const event = new PlayerAttackEvent(player, victim);
    const canceled = events.playerAttack.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        return false;
    }
    return _onPlayerAttack(event.player, event.victim);
}
const _onPlayerAttack = procHacker.hooking("Player::attack", bool_t, null, Player, Actor)(onPlayerAttack);

function onPlayerDropItem(player:Player, itemStack:ItemStack, randomly:boolean):boolean {
    const event = new PlayerDropItemEvent(player, itemStack);
    const canceled = events.playerDropItem.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        return false;
    }
    return _onPlayerDropItem(event.player, event.itemStack, randomly);
}
const _onPlayerDropItem = procHacker.hooking("Player::drop", bool_t, null, Player, ItemStack, bool_t)(onPlayerDropItem);

function onPlayerInventoryChange(player:Player, container:VoidPointer, slot:number, oldItemStack:ItemStack, newItemStack:ItemStack, unknown:boolean):void {
    const event = new PlayerInventoryChangeEvent(player, oldItemStack, newItemStack, slot);
    events.playerInventoryChange.fire(event);
    _tickCallback();
    return _onPlayerInventoryChange(event.player, container, slot, event.oldItemStack, event.newItemStack, unknown);
}
const _onPlayerInventoryChange = procHacker.hooking("Player::inventoryChanged", void_t, null, Player, VoidPointer, int32_t, ItemStack, ItemStack, bool_t)(onPlayerInventoryChange);

function onPlayerRespawn(player:Player):void {
    const event = new PlayerRespawnEvent(player);
    events.playerRespawn.fire(event);
    _tickCallback();
    return _onPlayerRespawn(event.player);
}
const _onPlayerRespawn = procHacker.hooking("Player::respawn", void_t, null, Player)(onPlayerRespawn);

function onPlayerLevelUp(player:Player, levels:int32_t):void {
    const event = new PlayerLevelUpEvent(player, levels);
    const notCanceled = events.playerLevelUp.fire(event) !== CANCEL;
    _tickCallback();
    if (notCanceled) {
        return _onPlayerLevelUp(event.player, event.levels);
    }
}
const _onPlayerLevelUp = procHacker.hooking("Player::addLevels", void_t, null, Player, int32_t)(onPlayerLevelUp);

events.packetAfter(MinecraftPacketIds.SetLocalPlayerAsInitialized).on((pk, ni) =>{
    const event = new PlayerJoinEvent(ni.getActor()!);
    events.playerJoin.fire(event);
    _tickCallback();
});

function onPlayerPickupItem(player:Player, itemActor:ItemActor, orgCount:number, favoredSlot:number):boolean {
    const event = new PlayerPickupItemEvent(player, itemActor);
    const canceled = events.playerPickupItem.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        return false;
    }
    return _onPlayerPickupItem(event.player, itemActor, orgCount, favoredSlot);
}
const _onPlayerPickupItem = procHacker.hooking("Player::take", bool_t, null, Player, ItemActor, int32_t, int32_t)(onPlayerPickupItem);


function onSplashPotionHit(splashPotionEffectSubcomponent: SplashPotionEffectSubcomponent, entity: Actor, projectileComponent: ProjectileComponent):void {
    const event = new SplashPotionHitEvent(entity, splashPotionEffectSubcomponent.potionEffect);
    const canceled = events.splashPotionHit.fire(event) === CANCEL;
    _tickCallback();
    if (!canceled) {
        splashPotionEffectSubcomponent.potionEffect = event.potionEffect;
        return _onSplashPotionHit(splashPotionEffectSubcomponent, event.entity, projectileComponent);
    }
}
const _onSplashPotionHit = procHacker.hooking("SplashPotionEffectSubcomponent::doOnHitEffect", void_t, null, SplashPotionEffectSubcomponent, Actor, ProjectileComponent)(onSplashPotionHit);
