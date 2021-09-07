import { CANCEL } from "../common";
import { VoidPointer } from "../core";
import { events } from "../events";
import { hook } from "../hook";
import { Actor, ActorDamageSource, CompletedUsingItemPacket, EventResult, HealthAttributeDelegate, ItemActor, ItemStack, MinecraftPacketIds, Mob, Player, ProjectileComponent, ScriptServerActorEventListener, SplashPotionEffectSubcomponent } from "../minecraft";
import { int32_t } from "../nativetype";
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
// const _onPlayerJump = hook(Player, 'jumpFromGround', void_t, null, Player)(onPlayerJump);

events.playerUseItem.setInstaller(()=>{
    function onPlayerUseItem(this: Player, itemStack:ItemStack, useMethod:number, consumeItem:boolean):void {
        const event = new PlayerUseItemEvent(this, useMethod, consumeItem, itemStack);
        events.playerUseItem.fire(event);
        _tickCallback();
        return _onPlayerUseItem.call(event.player, event.itemStack, event.useMethod, event.consumeItem);
    }
    const _onPlayerUseItem = hook(Player, 'useItem')(onPlayerUseItem);
});

events.playerCrit.setInstaller(()=>{
    function onPlayerCrit(this: Player, actor:Actor):void {
        const event = new PlayerCritEvent(this);
        events.playerCrit.fire(event);
        _tickCallback();
        return _onPlayerCrit.call(event.player, actor);
    }
    const _onPlayerCrit = hook(Player, '_crit')(onPlayerCrit);
});

events.entityHurt.setInstaller(()=>{
    function onEntityHurt(this: Actor, actorDamageSource: ActorDamageSource, damage: number, knock: boolean, ignite: boolean):boolean {
        const event = new EntityHurtEvent(this, damage, actorDamageSource, knock, ignite);
        const canceled = events.entityHurt.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            return false;
        }
        return _onEntityHurt.call(event.entity, event.damageSource, event.damage, knock, ignite);
    }
    const _onEntityHurt = hook(Actor, 'hurt')(onEntityHurt);
});

events.entityHealthChange.setInstaller(()=>{
    function onEntityHealthChange(this: HealthAttributeDelegate, oldHealth:number, newHealth:number, attributeBuffInfo:VoidPointer):boolean {
        const event = new EntityHeathChangeEvent(this.actor, oldHealth, newHealth);
        events.entityHealthChange.fire(event);
        this.setPointer(event.entity, 0x20);
        _tickCallback();
        return _onEntityHealthChange.call(this, oldHealth, newHealth, attributeBuffInfo);
    }
    const _onEntityHealthChange = hook(HealthAttributeDelegate, 'change')(onEntityHealthChange);
});

events.entityDie.setInstaller(()=>{
    function onEntityDie(this:Mob, damageSource:ActorDamageSource):boolean {
        const event = new EntityDieEvent(this, damageSource);
        events.entityDie.fire(event);
        _tickCallback();
        return _onEntityDie.call(event.entity, event.damageSource);
    }
    const _onEntityDie = hook(Mob, 'die')(onEntityDie);
});

events.entityStartSwimming.setInstaller(()=>{
    function onEntityStartSwimming(this:Actor):void {
        const event = new EntityStartSwimmingEvent(this);
        const canceled = events.entityStartSwimming.fire(event) === CANCEL;
        _tickCallback();
        if (!canceled) {
            return _onEntityStartSwimming.call(event.entity);
        }
    }
    const _onEntityStartSwimming = hook(Actor, 'startSwimming')(onEntityStartSwimming);
});

events.entityStartSwimming.setInstaller(()=>{
    function onPlayerStartSwimming(this:Player):void {
        const event = new EntityStartSwimmingEvent(this);
        const canceled = events.entityStartSwimming.fire(event) === CANCEL;
        _tickCallback();
        if (!canceled) {
            return _onPlayerStartSwimming.call(event.entity as Player);
        }
    }
    const _onPlayerStartSwimming = hook(Player, 'startSwimming')(onPlayerStartSwimming);
});

events.entityStartRiding.setInstaller(()=>{
    function onEntityStartRiding(this:Actor, ride:Actor):boolean {
        const event = new EntityStartRidingEvent(this, ride);
        const canceled = events.entityStartRiding.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            return false;
        }
        return _onEntityStartRiding.call(event.entity, event.ride);
    }
    const _onEntityStartRiding = hook(Actor, 'startRiding')(onEntityStartRiding);
});

events.entityStopRiding.setInstaller(()=>{
    function onEntityStopRiding(this:Actor, exitFromRider:boolean, actorIsBeingDestroyed:boolean, switchingRides:boolean):void {
        const event = new EntityStopRidingEvent(this, exitFromRider, actorIsBeingDestroyed, switchingRides);
        const notCanceled = events.entityStopRiding.fire(event) !== CANCEL;
        _tickCallback();
        if (notCanceled) {
            return _onEntityStopRiding.call(event.entity, event.exitFromRider, event.actorIsBeingDestroyed, event.switchingRides);
        }
    }
    const _onEntityStopRiding = hook(Actor, 'stopRiding')(onEntityStopRiding);
});

events.entitySneak.setInstaller(()=>{
    function onEntitySneak(this:ScriptServerActorEventListener, entity:Actor, isSneaking:boolean):EventResult {
        const event = new EntitySneakEvent(entity, isSneaking);
        events.entitySneak.fire(event);
        _tickCallback();
        return _onEntitySneak.call(this, event.entity, event.isSneaking);
    }
    const _onEntitySneak = hook(ScriptServerActorEventListener, 'onActorSneakChanged')(onEntitySneak);
});

events.entityCreated.setInstaller(()=>{
    function onEntityCreated(this:ScriptServerActorEventListener, entity:Actor):EventResult {
        const event = new EntityCreatedEvent(entity);
        events.entityCreated.fire(event);
        _tickCallback();
        return _onEntityCreated.call(this, event.entity);
    }
    const _onEntityCreated = hook(ScriptServerActorEventListener, 'onActorCreated')(onEntityCreated);
});

// function onEntityDeath(Script:ScriptCustomEventPacket, entity:Actor, actorDamageSource:ActorDamageSource, ActorType:number):boolean {
//     const event = new EntityDeathEvent(entity, actorDamageSource, ActorType);
//     console.log(`${entity} ${actorDamageSource} ${ActorType}`)
//     events.entityCreated.fire(event);
//     return _onEntityDeath(Script, event.entity, event.damageSource, event.ActorType);
// }
// const _onEntityDeath = hook(ScriptServerActorEventListener, 'onActorDeath', bool_t, null, ScriptCustomEventPacket, Actor, ActorDamageSource, int32_t)(onEntityDeath);

events.playerAttack.setInstaller(()=>{
    function onPlayerAttack(this:Player, victim:Actor):boolean {
        const event = new PlayerAttackEvent(this, victim);
        const canceled = events.playerAttack.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            return false;
        }
        return _onPlayerAttack.call(event.player, event.victim);
    }
    const _onPlayerAttack = hook(Player, "attack")(onPlayerAttack);
});

events.playerDropItem.setInstaller(()=>{
    function onPlayerDropItem(this:Player, itemStack:ItemStack, randomly:boolean):boolean {
        const event = new PlayerDropItemEvent(this, itemStack);
        const canceled = events.playerDropItem.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            return false;
        }
        return _onPlayerDropItem.call(event.player, event.itemStack, randomly);
    }
    const _onPlayerDropItem = hook(Player, "drop")(onPlayerDropItem);
});

events.playerInventoryChange.setInstaller(()=>{
    function onPlayerInventoryChange(this:Player, container:VoidPointer, slot:number, oldItemStack:ItemStack, newItemStack:ItemStack, unknown:boolean):void {
        const event = new PlayerInventoryChangeEvent(this, oldItemStack, newItemStack, slot);
        events.playerInventoryChange.fire(event);
        _tickCallback();
        return _onPlayerInventoryChange.call(event.player, container, slot, event.oldItemStack, event.newItemStack, unknown);
    }
    const _onPlayerInventoryChange = hook(Player, "inventoryChanged")(onPlayerInventoryChange);
});

events.playerRespawn.setInstaller(()=>{
    function onPlayerRespawn(this:Player):void {
        const event = new PlayerRespawnEvent(this);
        events.playerRespawn.fire(event);
        _tickCallback();
        return _onPlayerRespawn.call(event.player);
    }
    const _onPlayerRespawn = hook(Player, "respawn")(onPlayerRespawn);
});

events.playerLevelUp.setInstaller(()=>{
    function onPlayerLevelUp(this:Player, levels:int32_t):void {
        const event = new PlayerLevelUpEvent(this, levels);
        const notCanceled = events.playerLevelUp.fire(event) !== CANCEL;
        _tickCallback();
        if (notCanceled) {
            return _onPlayerLevelUp.call(event.player, event.levels);
        }
    }
    const _onPlayerLevelUp = hook(Player, "addLevels")(onPlayerLevelUp);
});

events.playerJoin.setInstaller(()=>{
    events.packetAfter(MinecraftPacketIds.SetLocalPlayerAsInitialized).on((pk, ni) =>{
        const actor = ni.getActor();
        if (actor === null) return;
        const event = new PlayerJoinEvent(actor);
        events.playerJoin.fire(event);
        _tickCallback();
    });
});

events.playerPickupItem.setInstaller(()=>{
    function onPlayerPickupItem(this:Player, itemActor:ItemActor, orgCount:number, favoredSlot:number):boolean {
        const event = new PlayerPickupItemEvent(this, itemActor);
        const canceled = events.playerPickupItem.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            return false;
        }
        return _onPlayerPickupItem.call(event.player, itemActor, orgCount, favoredSlot);
    }
    const _onPlayerPickupItem = hook(Player, "take")(onPlayerPickupItem);
});

events.splashPotionHit.setInstaller(()=>{
    function onSplashPotionHit(this: SplashPotionEffectSubcomponent, entity: Actor, projectileComponent: ProjectileComponent):void {
        const event = new SplashPotionHitEvent(entity, this.potionEffect);
        const canceled = events.splashPotionHit.fire(event) === CANCEL;
        _tickCallback();
        if (!canceled) {
            this.potionEffect = event.potionEffect;
            return _onSplashPotionHit.call(this, event.entity, projectileComponent);
        }
    }
    const _onSplashPotionHit = hook(SplashPotionEffectSubcomponent, 'doOnHitEffect')(onSplashPotionHit);
});
