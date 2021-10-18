"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplashPotionHitEvent = exports.PlayerJumpEvent = exports.PlayerUseItemEvent = exports.PlayerCritEvent = exports.PlayerPickupItemEvent = exports.PlayerJoinEvent = exports.PlayerLevelUpEvent = exports.PlayerRespawnEvent = exports.PlayerInventoryChangeEvent = exports.PlayerDropItemEvent = exports.PlayerAttackEvent = exports.EntityCreatedEvent = exports.EntitySneakEvent = exports.EntityStopRidingEvent = exports.EntityStartRidingEvent = exports.EntityStartSwimmingEvent = exports.EntityDieEvent = exports.EntityHeathChangeEvent = exports.EntityHurtEvent = void 0;
const actor_1 = require("../bds/actor");
const components_1 = require("../bds/components");
const inventory_1 = require("../bds/inventory");
const packetids_1 = require("../bds/packetids");
const packets_1 = require("../bds/packets");
const player_1 = require("../bds/player");
const proc_1 = require("../bds/proc");
const common_1 = require("../common");
const core_1 = require("../core");
const event_1 = require("../event");
const makefunc_1 = require("../makefunc");
const nativetype_1 = require("../nativetype");
const util_1 = require("../util");
class EntityHurtEvent {
    constructor(entity, damage, damageSource, knock, ignite) {
        this.entity = entity;
        this.damage = damage;
        this.damageSource = damageSource;
        this.knock = knock;
        this.ignite = ignite;
    }
}
exports.EntityHurtEvent = EntityHurtEvent;
class EntityHeathChangeEvent {
    constructor(entity, oldHealth, newHealth) {
        this.entity = entity;
        this.oldHealth = oldHealth;
        this.newHealth = newHealth;
    }
}
exports.EntityHeathChangeEvent = EntityHeathChangeEvent;
class EntityDieEvent {
    constructor(entity, damageSource) {
        this.entity = entity;
        this.damageSource = damageSource;
    }
}
exports.EntityDieEvent = EntityDieEvent;
class EntityStartSwimmingEvent {
    constructor(entity) {
        this.entity = entity;
    }
}
exports.EntityStartSwimmingEvent = EntityStartSwimmingEvent;
class EntityStartRidingEvent {
    constructor(entity, ride) {
        this.entity = entity;
        this.ride = ride;
    }
}
exports.EntityStartRidingEvent = EntityStartRidingEvent;
class EntityStopRidingEvent {
    constructor(entity, exitFromRider, actorIsBeingDestroyed, switchingRides) {
        this.entity = entity;
        this.exitFromRider = exitFromRider;
        this.actorIsBeingDestroyed = actorIsBeingDestroyed;
        this.switchingRides = switchingRides;
    }
}
exports.EntityStopRidingEvent = EntityStopRidingEvent;
class EntitySneakEvent {
    constructor(entity, isSneaking) {
        this.entity = entity;
        this.isSneaking = isSneaking;
    }
}
exports.EntitySneakEvent = EntitySneakEvent;
class EntityCreatedEvent {
    constructor(entity) {
        this.entity = entity;
    }
}
exports.EntityCreatedEvent = EntityCreatedEvent;
class PlayerAttackEvent {
    constructor(player, victim) {
        this.player = player;
        this.victim = victim;
    }
}
exports.PlayerAttackEvent = PlayerAttackEvent;
class PlayerDropItemEvent {
    constructor(player, itemStack) {
        this.player = player;
        this.itemStack = itemStack;
    }
}
exports.PlayerDropItemEvent = PlayerDropItemEvent;
class PlayerInventoryChangeEvent {
    constructor(player, oldItemStack, newItemStack, slot) {
        this.player = player;
        this.oldItemStack = oldItemStack;
        this.newItemStack = newItemStack;
        this.slot = slot;
    }
}
exports.PlayerInventoryChangeEvent = PlayerInventoryChangeEvent;
class PlayerRespawnEvent {
    constructor(player) {
        this.player = player;
    }
}
exports.PlayerRespawnEvent = PlayerRespawnEvent;
class PlayerLevelUpEvent {
    constructor(player, 
    /** Amount of levels upgraded */
    levels) {
        this.player = player;
        this.levels = levels;
    }
}
exports.PlayerLevelUpEvent = PlayerLevelUpEvent;
class PlayerJoinEvent {
    constructor(player) {
        this.player = player;
    }
}
exports.PlayerJoinEvent = PlayerJoinEvent;
class PlayerPickupItemEvent {
    constructor(player, itemActor) {
        this.player = player;
        this.itemActor = itemActor;
    }
}
exports.PlayerPickupItemEvent = PlayerPickupItemEvent;
class PlayerCritEvent {
    constructor(player) {
        this.player = player;
    }
}
exports.PlayerCritEvent = PlayerCritEvent;
class PlayerUseItemEvent {
    constructor(player, useMethod, consumeItem, itemStack) {
        this.player = player;
        this.useMethod = useMethod;
        this.consumeItem = consumeItem;
        this.itemStack = itemStack;
    }
}
exports.PlayerUseItemEvent = PlayerUseItemEvent;
class PlayerJumpEvent {
    constructor(player) {
        this.player = player;
    }
}
exports.PlayerJumpEvent = PlayerJumpEvent;
class SplashPotionHitEvent {
    constructor(entity, potionEffect) {
        this.entity = entity;
        this.potionEffect = potionEffect;
    }
}
exports.SplashPotionHitEvent = SplashPotionHitEvent;
// function onPlayerJump(player: Player):void {
//     const event = new PlayerJumpEvent(player);
//     console.log(player.getName());
//     // events.playerUseItem.fire(event);    Not work yet
//     return _onPlayerJump(event.player);
// }
// const _onPlayerJump = procHacker.hooking('Player::jumpFromGround', void_t, null, Player)(onPlayerJump);
function onPlayerUseItem(player, itemStack, useMethod, consumeItem) {
    const event = new PlayerUseItemEvent(player, useMethod, consumeItem, itemStack);
    event_1.events.playerUseItem.fire(event);
    (0, util_1._tickCallback)();
    return _onPlayerUseItem(event.player, event.itemStack, event.useMethod, event.consumeItem);
}
const _onPlayerUseItem = proc_1.procHacker.hooking('Player::useItem', nativetype_1.void_t, null, player_1.Player, inventory_1.ItemStack, nativetype_1.int32_t, nativetype_1.bool_t)(onPlayerUseItem);
function onPlayerCrit(player, actor) {
    const event = new PlayerCritEvent(player);
    event_1.events.playerCrit.fire(event);
    (0, util_1._tickCallback)();
    return _onPlayerCrit(event.player, actor);
}
const _onPlayerCrit = proc_1.procHacker.hooking('Player::_crit', nativetype_1.void_t, null, player_1.Player, actor_1.Actor)(onPlayerCrit);
function onEntityHurt(entity, actorDamageSource, damage, knock, ignite) {
    const event = new EntityHurtEvent(entity, damage, actorDamageSource, knock, ignite);
    const canceled = event_1.events.entityHurt.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (canceled) {
        return false;
    }
    return _onEntityHurt(event.entity, event.damageSource, event.damage, knock, ignite);
}
const _onEntityHurt = proc_1.procHacker.hooking('Actor::hurt', nativetype_1.bool_t, null, actor_1.Actor, actor_1.ActorDamageSource, nativetype_1.int32_t, nativetype_1.bool_t, nativetype_1.bool_t)(onEntityHurt);
function onEntityHealthChange(attributeDelegate, oldHealth, newHealth, attributeBuffInfo) {
    const actor = actor_1.Actor[makefunc_1.makefunc.getFromParam](attributeDelegate, 0x20);
    const event = new EntityHeathChangeEvent(actor, oldHealth, newHealth);
    event_1.events.entityHealthChange.fire(event);
    attributeDelegate.setPointer(event.entity, 0x20);
    (0, util_1._tickCallback)();
    return _onEntityHealthChange(attributeDelegate, oldHealth, newHealth, attributeBuffInfo);
}
const _onEntityHealthChange = proc_1.procHacker.hooking('HealthAttributeDelegate::change', nativetype_1.bool_t, null, core_1.NativePointer, nativetype_1.float32_t, nativetype_1.float32_t, core_1.VoidPointer)(onEntityHealthChange);
function onEntityDie(entity, damageSource) {
    const event = new EntityDieEvent(entity, damageSource);
    event_1.events.entityDie.fire(event);
    (0, util_1._tickCallback)();
    return _onEntityDie(event.entity, event.damageSource);
}
const _onEntityDie = proc_1.procHacker.hooking('Mob::die', nativetype_1.bool_t, null, actor_1.Actor, actor_1.ActorDamageSource)(onEntityDie);
function onEntityStartSwimming(entity) {
    const event = new EntityStartSwimmingEvent(entity);
    const canceled = event_1.events.entityStartSwimming.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (!canceled) {
        return _onEntityStartSwimming(event.entity);
    }
}
function onPlayerStartSwimming(entity) {
    const event = new EntityStartSwimmingEvent(entity);
    const canceled = event_1.events.entityStartSwimming.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (!canceled) {
        return _onPlayerStartSwimming(event.entity);
    }
}
const _onEntityStartSwimming = proc_1.procHacker.hooking('Actor::startSwimming', nativetype_1.void_t, null, actor_1.Actor)(onEntityStartSwimming);
const _onPlayerStartSwimming = proc_1.procHacker.hooking('Player::startSwimming', nativetype_1.void_t, null, player_1.Player)(onPlayerStartSwimming);
function onEntityStartRiding(entity, ride) {
    const event = new EntityStartRidingEvent(entity, ride);
    const canceled = event_1.events.entityStartRiding.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (canceled) {
        return false;
    }
    return _onEntityStartRiding(event.entity, event.ride);
}
const _onEntityStartRiding = proc_1.procHacker.hooking('Actor::startRiding', nativetype_1.bool_t, null, actor_1.Actor, actor_1.Actor)(onEntityStartRiding);
function onEntityStopRiding(entity, exitFromRider, actorIsBeingDestroyed, switchingRides) {
    const event = new EntityStopRidingEvent(entity, exitFromRider, actorIsBeingDestroyed, switchingRides);
    const notCanceled = event_1.events.entityStopRiding.fire(event) !== common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (notCanceled) {
        return _onEntityStopRiding(event.entity, event.exitFromRider, event.actorIsBeingDestroyed, event.switchingRides);
    }
}
const _onEntityStopRiding = proc_1.procHacker.hooking('Actor::stopRiding', nativetype_1.void_t, null, actor_1.Actor, nativetype_1.bool_t, nativetype_1.bool_t, nativetype_1.bool_t)(onEntityStopRiding);
function onEntitySneak(Script, entity, isSneaking) {
    const event = new EntitySneakEvent(entity, isSneaking);
    event_1.events.entitySneak.fire(event);
    (0, util_1._tickCallback)();
    return _onEntitySneak(Script, event.entity, event.isSneaking);
}
const _onEntitySneak = proc_1.procHacker.hooking('ScriptServerActorEventListener::onActorSneakChanged', nativetype_1.bool_t, null, packets_1.ScriptCustomEventPacket, actor_1.Actor, nativetype_1.bool_t)(onEntitySneak);
// function onEntityDeath(Script:ScriptCustomEventPacket, entity:Actor, actorDamageSource:ActorDamageSource, ActorType:number):boolean {
//     const event = new EntityDeathEvent(entity, actorDamageSource, ActorType);
//     console.log(`${entity} ${actorDamageSource} ${ActorType}`)
//     events.entityCreated.fire(event);
//     return _onEntityDeath(Script, event.entity, event.damageSource, event.ActorType);
// }
// const _onEntityDeath = procHacker.hooking('ScriptServerActorEventListener::onActorDeath', bool_t, null, ScriptCustomEventPacket, Actor, ActorDamageSource, int32_t)(onEntityDeath);
function onPlayerAttack(player, victim) {
    const event = new PlayerAttackEvent(player, victim);
    const canceled = event_1.events.playerAttack.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (canceled) {
        return false;
    }
    return _onPlayerAttack(event.player, event.victim);
}
const _onPlayerAttack = proc_1.procHacker.hooking("Player::attack", nativetype_1.bool_t, null, player_1.Player, actor_1.Actor)(onPlayerAttack);
function onPlayerDropItem(player, itemStack, randomly) {
    const event = new PlayerDropItemEvent(player, itemStack);
    const canceled = event_1.events.playerDropItem.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (canceled) {
        return false;
    }
    return _onPlayerDropItem(event.player, event.itemStack, randomly);
}
const _onPlayerDropItem = proc_1.procHacker.hooking("Player::drop", nativetype_1.bool_t, null, player_1.Player, inventory_1.ItemStack, nativetype_1.bool_t)(onPlayerDropItem);
function onPlayerInventoryChange(player, container, slot, oldItemStack, newItemStack, unknown) {
    const event = new PlayerInventoryChangeEvent(player, oldItemStack, newItemStack, slot);
    event_1.events.playerInventoryChange.fire(event);
    (0, util_1._tickCallback)();
    return _onPlayerInventoryChange(event.player, container, slot, event.oldItemStack, event.newItemStack, unknown);
}
const _onPlayerInventoryChange = proc_1.procHacker.hooking("Player::inventoryChanged", nativetype_1.void_t, null, player_1.Player, core_1.VoidPointer, nativetype_1.int32_t, inventory_1.ItemStack, inventory_1.ItemStack, nativetype_1.bool_t)(onPlayerInventoryChange);
function onPlayerRespawn(player) {
    const event = new PlayerRespawnEvent(player);
    event_1.events.playerRespawn.fire(event);
    (0, util_1._tickCallback)();
    return _onPlayerRespawn(event.player);
}
const _onPlayerRespawn = proc_1.procHacker.hooking("Player::respawn", nativetype_1.void_t, null, player_1.Player)(onPlayerRespawn);
function onPlayerLevelUp(player, levels) {
    const event = new PlayerLevelUpEvent(player, levels);
    const notCanceled = event_1.events.playerLevelUp.fire(event) !== common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (notCanceled) {
        return _onPlayerLevelUp(event.player, event.levels);
    }
}
const _onPlayerLevelUp = proc_1.procHacker.hooking("Player::addLevels", nativetype_1.void_t, null, player_1.Player, nativetype_1.int32_t)(onPlayerLevelUp);
event_1.events.packetAfter(packetids_1.MinecraftPacketIds.SetLocalPlayerAsInitialized).on((pk, ni) => {
    const event = new PlayerJoinEvent(ni.getActor());
    event_1.events.playerJoin.fire(event);
    (0, util_1._tickCallback)();
});
function onPlayerPickupItem(player, itemActor, orgCount, favoredSlot) {
    const event = new PlayerPickupItemEvent(player, itemActor);
    const canceled = event_1.events.playerPickupItem.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (canceled) {
        return false;
    }
    return _onPlayerPickupItem(event.player, itemActor, orgCount, favoredSlot);
}
const _onPlayerPickupItem = proc_1.procHacker.hooking("Player::take", nativetype_1.bool_t, null, player_1.Player, actor_1.ItemActor, nativetype_1.int32_t, nativetype_1.int32_t)(onPlayerPickupItem);
function onSplashPotionHit(splashPotionEffectSubcomponent, entity, projectileComponent) {
    const event = new SplashPotionHitEvent(entity, splashPotionEffectSubcomponent.potionEffect);
    const canceled = event_1.events.splashPotionHit.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (!canceled) {
        splashPotionEffectSubcomponent.potionEffect = event.potionEffect;
        return _onSplashPotionHit(splashPotionEffectSubcomponent, event.entity, projectileComponent);
    }
}
const _onSplashPotionHit = proc_1.procHacker.hooking("SplashPotionEffectSubcomponent::doOnHitEffect", nativetype_1.void_t, null, components_1.SplashPotionEffectSubcomponent, actor_1.Actor, components_1.ProjectileComponent)(onSplashPotionHit);
//# sourceMappingURL=entityevent.js.map