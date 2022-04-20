import { Actor, ActorDamageCause, ActorDamageSource, ItemActor } from "../bds/actor";
import { BlockPos, Vec3 } from "../bds/blockpos";
import { ProjectileComponent, SplashPotionEffectSubcomponent } from "../bds/components";
import { ComplexInventoryTransaction, ContainerId, InventorySource, InventorySourceType, ItemStack } from "../bds/inventory";
import { BedSleepingResult } from "../bds/level";
import { ServerNetworkHandler } from "../bds/networkidentifier";
import { MinecraftPacketIds } from "../bds/packetids";
import { CompletedUsingItemPacket } from "../bds/packets";
import { Player, ServerPlayer } from "../bds/player";
import { procHacker } from "../bds/proc";
import { CANCEL } from "../common";
import { NativePointer, VoidPointer } from "../core";
import { decay } from "../decay";
import { events } from "../event";
import { makefunc } from "../makefunc";
import { bool_t, float32_t, int32_t, uint8_t, void_t } from "../nativetype";
import { Wrapper } from "../pointer";

export class EntityHurtEvent {
    constructor(
        public entity: Actor,
        public damage: number,
        public damageSource: ActorDamageSource,
        public knock: boolean,
        public ignite: boolean,
    ) {
    }
}

export class EntityHeathChangeEvent {
    constructor(
        public entity: Actor,
        readonly oldHealth: number,
        readonly newHealth: number,
    ) {
    }
}

export class EntityDieEvent {
    constructor(
        public entity: Actor,
        public damageSource: ActorDamageSource,
    ) {
    }
}
export class EntityStartSwimmingEvent {
    constructor(
        public entity: Actor,
    ) {
    }
}
export class EntityStartRidingEvent {
    constructor(
        public entity: Actor,
        public ride: Actor,
    ) {
    }
}
export class EntityStopRidingEvent {
    constructor(
        public entity: Actor,
        public exitFromRider: boolean,
        public actorIsBeingDestroyed: boolean,
        public switchingRides: boolean,
    ) {
    }
}
export class EntitySneakEvent {
    constructor(
        public entity: Actor,
        public isSneaking: boolean,
    ) {
    }
}

export class EntityCreatedEvent {
    constructor(
        public entity: Actor,
    ) {
    }
}

// interface IEntityDeathEvent {
//     entity: Actor;
//     damageSource: ActorDamageSource;
//     ActorType: number;
// }
// export class EntityDeathEvent {
//     constructor(
//         public entity: Actor,
//         public damageSource: ActorDamageSource,
//         public ActorType: number
//     ) {
//     }
// }

export class PlayerAttackEvent {
    constructor(
        public player: Player,
        public victim: Actor,
    ) {
    }
}

export class PlayerDropItemEvent {
    constructor(
        public player: Player,
        public itemStack: ItemStack,
        public inContainer: boolean,
        public hotbarSlot?: number,
    ) {
    }
}

export class PlayerInventoryChangeEvent {
    constructor(
        public player: Player,
        readonly oldItemStack: ItemStack,
        readonly newItemStack: ItemStack,
        readonly slot:number,
    ) {
    }
}

export class PlayerRespawnEvent {
    constructor(
        public player: Player,
    ) {
    }
}

export class PlayerLevelUpEvent {
    constructor(
        public player: Player,
        /** Amount of levels upgraded */
        public levels: number,
    ) {
    }
}

export class PlayerJoinEvent {
    constructor(
        readonly player: ServerPlayer,
    ) {
    }
}

export class PlayerLeftEvent {
    constructor(
        public player: ServerPlayer,
        public skipMessage: boolean,
    ) {
    }
}

export class PlayerPickupItemEvent {
    constructor(
        public player: Player,
        public itemActor: ItemActor,
    ) {
    }
}
export class PlayerCritEvent {
    constructor(
        public player: Player,
        public victim: Actor,
    ) {
    }
}

export class PlayerUseItemEvent {
    constructor(
        public player: Player,
        public useMethod: CompletedUsingItemPacket.Actions,
        public consumeItem: boolean,
        public itemStack: ItemStack,
    ) {
    }
}

export class ItemUseEvent {
    constructor(
        public itemStack: ItemStack,
        public player: Player,
    ) {
    }
}

export class ItemUseOnBlockEvent {
    constructor(
        public itemStack: ItemStack,
        public actor: Actor,
        public x: number,
        public y: number,
        public z: number,
        public face: number,
        public clickX: number,
        public clickY: number,
        public clickZ: number,
    ) {
    }
}

export class PlayerJumpEvent {
    constructor(
        public player: Player,
    ) {
    }
}

export class SplashPotionHitEvent {
    constructor(
        public entity: Actor,
        public potionEffect: number,
    ) {
    }
}

export class ProjectileShootEvent {
    constructor(public projectile: Actor, public shooter: Actor) {}
}

export class PlayerSleepInBedEvent {
    constructor(
        public player: Player,
        public pos: BlockPos,
    ) {
    }
}

export class EntityConsumeTotemEvent {
    constructor(public entity: Actor, public totem: ItemStack) { }
}

function onPlayerJump(player: Player):void {
    const event = new PlayerJumpEvent(player);
    events.playerJump.fire(event);
    return _onPlayerJump(event.player);
}
const _onPlayerJump = procHacker.hooking("?jumpFromGround@Player@@UEAAXXZ", void_t, null, Player)(onPlayerJump);

function onPlayerUseItem(player: Player, itemStack:ItemStack, useMethod:number, consumeItem:boolean):void {
    const event = new PlayerUseItemEvent(player, useMethod, consumeItem, itemStack);
    events.playerUseItem.fire(event);
    decay(itemStack);
    return _onPlayerUseItem(event.player, event.itemStack, event.useMethod, event.consumeItem);
}
const _onPlayerUseItem = procHacker.hooking('Player::useItem', void_t, null, Player, ItemStack, int32_t, bool_t)(onPlayerUseItem);

function onItemUse(itemStack: ItemStack, player: Player): ItemStack {
    const event = new ItemUseEvent(itemStack, player);
    const canceled = events.itemUse.fire(event) === CANCEL;
    decay(itemStack);
    if(canceled) {
        return itemStack;
    }
    return _onItemUse(event.itemStack, event.player);
}
const _onItemUse = procHacker.hooking("ItemStack::use", ItemStack, null, ItemStack, Player)(onItemUse);

function onItemUseOnBlock(itemStack: ItemStack, actor: Actor, x: int32_t, y: int32_t, z: int32_t, face: uint8_t, clickPos: Vec3): bool_t {
    const event = new ItemUseOnBlockEvent(itemStack, actor, x, y, z, face, clickPos.x, clickPos.y, clickPos.z);
    const canceled = events.itemUseOnBlock.fire(event) === CANCEL;
    decay(itemStack);
    if(canceled) {
        return false;
    }
    clickPos.x = event.clickX;
    clickPos.y = event.clickY;
    clickPos.z = event.clickZ;
    return _onItemUseOnBlock(event.itemStack, event.actor, event.x, event.y, event.z, event.face, clickPos);
}
const _onItemUseOnBlock = procHacker.hooking("ItemStack::useOn", bool_t, null, ItemStack, Actor, int32_t, int32_t, int32_t, uint8_t, Vec3)(onItemUseOnBlock);

function onPlayerCrit(player: Player, victim: Actor):void {
    const event = new PlayerCritEvent(player, victim);
    events.playerCrit.fire(event);
    return _onPlayerCrit(player, victim);
}
const _onPlayerCrit = procHacker.hooking("Player::_crit", void_t, null, Player, Actor)(onPlayerCrit);

function onEntityHurt(entity: Actor, actorDamageSource: ActorDamageSource, damage: number, knock: boolean, ignite: boolean):boolean {
    const event = new EntityHurtEvent(entity, damage, actorDamageSource, knock, ignite);
    const canceled = events.entityHurt.fire(event) === CANCEL;
    decay(actorDamageSource);
    if (canceled) {
        return false;
    }
    return _onEntityHurt(event.entity, event.damageSource, event.damage, knock, ignite);
}
const _onEntityHurt = procHacker.hooking('Actor::hurt', bool_t, null, Actor, ActorDamageSource, float32_t, bool_t, bool_t)(onEntityHurt);

function onEntityHealthChange(attributeDelegate: NativePointer, oldHealth:number, newHealth:number, attributeBuffInfo:VoidPointer):boolean {
    const actor = Actor[makefunc.getFromParam](attributeDelegate, 0x20);
    const event = new EntityHeathChangeEvent(actor, oldHealth, newHealth);
    events.entityHealthChange.fire(event);
    attributeDelegate.setPointer(event.entity, 0x20);
    return _onEntityHealthChange(attributeDelegate, oldHealth, newHealth, attributeBuffInfo);
}
const _onEntityHealthChange = procHacker.hooking('HealthAttributeDelegate::change', bool_t, null, NativePointer, float32_t, float32_t, VoidPointer)(onEntityHealthChange);

function onEntityDie(entity:Actor, damageSource:ActorDamageSource):boolean {
    const event = new EntityDieEvent(entity, damageSource);
    events.entityDie.fire(event);
    decay(damageSource);
    return _onEntityDie(event.entity, event.damageSource);
}
const _onEntityDie = procHacker.hooking('Mob::die', bool_t, null, Actor, ActorDamageSource)(onEntityDie);

function onEntityStartSwimming(entity:Actor):void {
    const event = new EntityStartSwimmingEvent(entity);
    const canceled = events.entityStartSwimming.fire(event) === CANCEL;
    if (!canceled) {
        return _onEntityStartSwimming(event.entity);
    }
}
function onPlayerStartSwimming(entity:Player):void {
    const event = new EntityStartSwimmingEvent(entity);
    const canceled = events.entityStartSwimming.fire(event) === CANCEL;
    if (!canceled) {
        return _onPlayerStartSwimming(event.entity as Player);
    }
}
const _onEntityStartSwimming = procHacker.hooking('Actor::startSwimming', void_t, null, Actor)(onEntityStartSwimming);
const _onPlayerStartSwimming = procHacker.hooking('Player::startSwimming', void_t, null, Player)(onPlayerStartSwimming);

function onEntityStartRiding(entity:Actor, ride:Actor):boolean {
    const event = new EntityStartRidingEvent(entity, ride);
    const canceled = events.entityStartRiding.fire(event) === CANCEL;
    if (canceled) {
        return false;
    }
    return _onEntityStartRiding(event.entity, event.ride);
}
const _onEntityStartRiding = procHacker.hooking('Actor::startRiding', bool_t, null, Actor, Actor)(onEntityStartRiding);

function onEntityStopRiding(entity:Actor, exitFromRider:boolean, actorIsBeingDestroyed:boolean, switchingRides:boolean):void {
    const event = new EntityStopRidingEvent(entity, exitFromRider, actorIsBeingDestroyed, switchingRides);
    const canceled = events.entityStopRiding.fire(event) === CANCEL;
    if (canceled) {
        return;
    }
    return _onEntityStopRiding(event.entity, event.exitFromRider, event.actorIsBeingDestroyed, event.switchingRides);
}
const _onEntityStopRiding = procHacker.hooking('Actor::stopRiding', void_t, null, Actor, bool_t, bool_t, bool_t)(onEntityStopRiding);

function onEntitySneak(actorEventCoordinator:VoidPointer, entity:Actor, isSneaking:boolean): void {
    const event = new EntitySneakEvent(entity, isSneaking);
    events.entitySneak.fire(event);
    return _onEntitySneak(actorEventCoordinator, entity, isSneaking);
}
const _onEntitySneak = procHacker.hooking('ActorEventCoordinator::sendActorSneakChanged', void_t, null, VoidPointer, Actor, bool_t)(onEntitySneak);

function onEntityCreated(actorEventCoordinator:VoidPointer, entity:Actor):void {
    const event = new EntityCreatedEvent(entity);
    _onEntityCreated(actorEventCoordinator, event.entity);
    events.entityCreated.fire(event);
}
const _onEntityCreated = procHacker.hooking('ActorEventCoordinator::sendActorCreated', void_t, null, VoidPointer, Actor)(onEntityCreated);

function onPlayerAttack(player:Player, victim:Actor, cause:Wrapper<ActorDamageCause>):boolean {
    const event = new PlayerAttackEvent(player, victim);
    const canceled = events.playerAttack.fire(event) === CANCEL;
    if (canceled) {
        return false;
    }
    return _onPlayerAttack(event.player, event.victim, cause);
}
const _onPlayerAttack = procHacker.hooking("Player::attack", bool_t, null, Player, Actor, Wrapper.make(int32_t))(onPlayerAttack);

events.packetBefore(MinecraftPacketIds.InventoryTransaction).on((pk, ni) => {
    const transaction = pk.transaction;
    if (transaction === null) return; // nullable
    if (transaction.type === ComplexInventoryTransaction.Type.NormalTransaction) {
        const src = InventorySource.create(ContainerId.Inventory, InventorySourceType.ContainerInventory);
        const actions = transaction.data.getActions(src);
        if (actions.length === 1) {
            const player = ni.getActor()!;
            const slot = actions[0].slot;
            const itemStack = player.getInventory().getItem(slot, ContainerId.Inventory);
            const event = new PlayerDropItemEvent(player, itemStack, false, slot);
            const canceled = events.playerDropItem.fire(event) === CANCEL;
            decay(itemStack);
            if (canceled) {
                ni.getActor()!.sendInventory();
                return CANCEL;
            }
        }
    }
});

const hasOpenContainer = Symbol('hasOpenContainer');
events.packetSend(MinecraftPacketIds.ContainerOpen).on((pk, ni) => {
    const player = ni.getActor()!;
    (player as any)[hasOpenContainer] = true;
});
events.packetSend(MinecraftPacketIds.ContainerClose).on((pk, ni) => {
    const player = ni.getActor()!;
    (player as any)[hasOpenContainer] = false;
});

function onPlayerDropItem(player:Player, itemStack:ItemStack, randomly:boolean):boolean {
    if ((player as any)[hasOpenContainer]) {
        const event = new PlayerDropItemEvent(player, itemStack, true);
        const canceled = events.playerDropItem.fire(event) === CANCEL;
        decay(itemStack);
        if (canceled) {
            return false;
        }
        return _onPlayerDropItem(event.player, event.itemStack, randomly);
    }
    return _onPlayerDropItem(player, itemStack, randomly);
}
const _onPlayerDropItem = procHacker.hooking("Player::drop", bool_t, null, Player, ItemStack, bool_t)(onPlayerDropItem);

function onPlayerInventoryChange(player:Player, container:VoidPointer, slot:number, oldItemStack:ItemStack, newItemStack:ItemStack, unknown:boolean):void {
    const event = new PlayerInventoryChangeEvent(player, oldItemStack, newItemStack, slot);
    events.playerInventoryChange.fire(event);
    decay(oldItemStack);
    decay(newItemStack);
    return _onPlayerInventoryChange(event.player, container, slot, event.oldItemStack, event.newItemStack, unknown);
}
const _onPlayerInventoryChange = procHacker.hooking("Player::inventoryChanged", void_t, null, Player, VoidPointer, int32_t, ItemStack, ItemStack, bool_t)(onPlayerInventoryChange);

function onPlayerRespawn(player:Player):void {
    const event = new PlayerRespawnEvent(player);
    events.playerRespawn.fire(event);
    return _onPlayerRespawn(event.player);
}
const _onPlayerRespawn = procHacker.hooking("Player::respawn", void_t, null, Player)(onPlayerRespawn);

function onPlayerLevelUp(player:Player, levels:int32_t):void {
    const event = new PlayerLevelUpEvent(player, levels);
    const canceled = events.playerLevelUp.fire(event) === CANCEL;
    if (canceled) {
        return;
    }
    return _onPlayerLevelUp(event.player, event.levels);
}
const _onPlayerLevelUp = procHacker.hooking("Player::addLevels", void_t, null, Player, int32_t)(onPlayerLevelUp);

events.packetAfter(MinecraftPacketIds.SetLocalPlayerAsInitialized).on((pk, ni) =>{
    const actor = ni.getActor();
    if (actor === null) return; // possibilities by the hacked client
    const event = new PlayerJoinEvent(actor);
    events.playerJoin.fire(event);
});

function onPlayerPickupItem(player:Player, itemActor:ItemActor, orgCount:number, favoredSlot:number):boolean {
    const event = new PlayerPickupItemEvent(player, itemActor);
    const canceled = events.playerPickupItem.fire(event) === CANCEL;
    if (canceled) {
        return false;
    }
    return _onPlayerPickupItem(event.player, itemActor, orgCount, favoredSlot);
}
const _onPlayerPickupItem = procHacker.hooking("Player::take", bool_t, null, Player, ItemActor, int32_t, int32_t)(onPlayerPickupItem);

function onPlayerLeft(networkHandler: ServerNetworkHandler, player: ServerPlayer, skipMessage: boolean):void {
    const event = new PlayerLeftEvent(player, skipMessage);
    events.playerLeft.fire(event);
    return _onPlayerLeft(networkHandler, event.player, event.skipMessage);
}

const _onPlayerLeft = procHacker.hooking("ServerNetworkHandler::_onPlayerLeft", void_t, null, ServerNetworkHandler, ServerPlayer, bool_t)(onPlayerLeft);

function onSplashPotionHit(splashPotionEffectSubcomponent: SplashPotionEffectSubcomponent, entity: Actor, projectileComponent: ProjectileComponent):void {
    const event = new SplashPotionHitEvent(entity, splashPotionEffectSubcomponent.potionEffect);
    const canceled = events.splashPotionHit.fire(event) === CANCEL;
    if (!canceled) {
        splashPotionEffectSubcomponent.potionEffect = event.potionEffect;
        _onSplashPotionHit(splashPotionEffectSubcomponent, event.entity, projectileComponent);
    }
    decay(splashPotionEffectSubcomponent);
}
const _onSplashPotionHit = procHacker.hooking("SplashPotionEffectSubcomponent::doOnHitEffect", void_t, null, SplashPotionEffectSubcomponent, Actor, ProjectileComponent)(onSplashPotionHit);

function onProjectileShoot(projectileComponent: ProjectileComponent, projectile: Actor, shooter: Actor): void {
    const event = new ProjectileShootEvent(projectile, shooter);
    events.projectileShoot.fire(event);
    decay(projectileComponent);
    return _onProjectileShoot(projectileComponent, event.projectile, event.shooter);
}
const _onProjectileShoot = procHacker.hooking("ProjectileComponent::shoot", void_t, null, ProjectileComponent, Actor, Actor)(onProjectileShoot);

function onPlayerSleepInBed(player: Player, pos: BlockPos): number {
    const event = new PlayerSleepInBedEvent(player, pos);
    const canceled = events.playerSleepInBed.fire(event) === CANCEL;
    decay(pos);
    if(canceled) {
        return BedSleepingResult.OTHER_PROBLEM;
    }
    return _onPlayerSleepInBed(event.player, event.pos);
}
const _onPlayerSleepInBed = procHacker.hooking("Player::startSleepInBed", uint8_t, null, Player, BlockPos)(onPlayerSleepInBed);

function onConsumeTotem(entity: Actor): boolean {
    const event = new EntityConsumeTotemEvent(entity, entity.getEquippedTotem());
    events.entityConsumeTotem.fire(event);
    return _onConsumeTotem(entity);
}
const _onConsumeTotem = procHacker.hooking("Actor::consumeTotem", bool_t, null, Actor)(onConsumeTotem);
