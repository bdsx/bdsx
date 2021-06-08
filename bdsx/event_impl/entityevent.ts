import { Actor } from "../bds/actor";
import { AttributeId } from "../bds/attribute";
import { ItemStack } from "../bds/inventory";
import { MinecraftPacketIds } from "../bds/packetids";
import { ScriptCustomEventPacket } from "../bds/packets";
import { Player } from "../bds/player";
import { procHacker } from "../bds/proc";
import { CANCEL } from "../common";
import { NativePointer, VoidPointer } from "../core";
import { events } from "../event";
import { NativeClass } from "../nativeclass";
import { bool_t, float32_t, int32_t, void_t } from "../nativetype";


interface IEntityHurtEvent {
    entity: Actor;
    damage: number;
}
export class EntityHurtEvent implements IEntityHurtEvent {
    constructor(
        public entity: Actor,
        public damage: number,
    ) {
    }
}

interface IEntityHealEvent {
    entity: Actor;
    readonly damage: number;
}
export class EntityHealEvent implements IEntityHealEvent {
    constructor(
        public entity: Actor,
        readonly damage: number,
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

class ActorDamageSource extends NativeClass{
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
    itemActor: Actor;
    //itemStack: ItemStack;
}
export class PlayerPickupItemEvent implements IPlayerPickupItemEvent {
    constructor(
        public player: Player,
        public itemActor: Actor,
        //public itemStack: ItemStack, // should be from 0x688 at ItemActor but unexpected undefined value
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
    useMethod: number;
    itemStack: ItemStack;
}
export class PlayerUseItemEvent implements IPlayerUseItemEvent {
    constructor(
        public player: Player,
        public useMethod: number,
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

// function onPlayerJump(player: Player):void {
//     const event = new PlayerJumpEvent(player);
//     console.log(player.getName());
//     // events.playerUseItem.fire(event);    Not work yet
//     return _onPlayerJump(event.player);
// }
// const _onPlayerJump = procHacker.hooking('Player::jumpFromGround', void_t, null, Player)(onPlayerJump);


function onPlayerUseItem(player: Player, item:ItemStack, useMethod:number, v:boolean):void {
    const event = new PlayerUseItemEvent(player, useMethod, item);
    events.playerUseItem.fire(event);
    return _onPlayerUseItem(event.player, event.itemStack, event.useMethod, v);
}
const _onPlayerUseItem = procHacker.hooking('Player::useItem', void_t, null, Player, ItemStack, int32_t, bool_t)(onPlayerUseItem);

function onPlayerCrit(player: Player):void {
    const event = new PlayerCritEvent(player);
    events.playerCrit.fire(event);
    return _onPlayerCrit(event.player);
}
const _onPlayerCrit = procHacker.hooking('Player::_crit', void_t, null, Player)(onPlayerCrit);

function onEntityHurt(entity: Actor, actorDamageSource: VoidPointer, damage: number, v1: boolean, v2: boolean):boolean {
    const event = new EntityHurtEvent(entity, damage);
    if (events.entityHurt.fire(event) === CANCEL) {
        return false;
    } else {
        return _onEntityHurt(event.entity, actorDamageSource, event.damage, v1, v2);
    }
}
const _onEntityHurt = procHacker.hooking("Actor::hurt", bool_t, null, Actor, VoidPointer, int32_t, bool_t, bool_t)(onEntityHurt);

function onEntityHeal(attributeDelegate: NativePointer, oldHealth:number, newHealth:number, v:VoidPointer):boolean {
    if (oldHealth < newHealth) {
        const event = new EntityHurtEvent(attributeDelegate.getPointerAs(Actor, 0x20), newHealth - oldHealth);
        if (events.entityHeal.fire(event) === CANCEL) {
            event.entity.setAttribute(AttributeId.Health, oldHealth);
            return false;
        } else {
            attributeDelegate.setPointer(event.entity, 0x20);
            return _onEntityHeal(attributeDelegate, oldHealth, newHealth, v);
        }
    }
    return _onEntityHeal(attributeDelegate, oldHealth, newHealth, v);
}
const _onEntityHeal = procHacker.hooking("HealthAttributeDelegate::change", bool_t, null, NativePointer, float32_t, float32_t, VoidPointer)(onEntityHeal);

function onEntitySneak(Script:ScriptCustomEventPacket, entity:Actor, isSneaking:boolean):boolean {
    const event = new EntitySneakEvent(entity, isSneaking);
    events.entitySneak.fire(event);
    return _onEntitySneak(Script, event.entity, event.isSneaking);
}
const _onEntitySneak = procHacker.hooking('ScriptServerActorEventListener::onActorSneakChanged', bool_t, null, ScriptCustomEventPacket, Actor, bool_t)(onEntitySneak);

function onEntityCreated(Script:ScriptCustomEventPacket, entity:Actor):boolean {
    const event = new EntityCreatedEvent(entity);
    events.entityCreated.fire(event);
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
    if (events.playerAttack.fire(event) === CANCEL) {
        return false;
    } else {
        return _onPlayerAttack(event.player, event.victim);
    }
}
const _onPlayerAttack = procHacker.hooking("Player::attack", bool_t, null, Player, Actor)(onPlayerAttack);

function onPlayerDropItem(player:Player, itemStack:ItemStack, v:boolean):boolean {
    const event = new PlayerDropItemEvent(player, itemStack);
    if (events.playerDropItem.fire(event) === CANCEL) {
        return false;
    } else {
        return _onPlayerDropItem(event.player, event.itemStack, v);
    }
}
const _onPlayerDropItem = procHacker.hooking("Player::drop", bool_t, null, Player, ItemStack, bool_t)(onPlayerDropItem);

events.packetBefore(MinecraftPacketIds.SetLocalPlayerAsInitialized).on((pk, ni) =>{
    const event = new PlayerJoinEvent(ni.getActor()!);
    events.playerJoin.fire(event);
});

function onPlayerPickupItem(player:Player, itemActor:Actor, v1:number, v2:number):boolean {
    const event = new PlayerPickupItemEvent(player, itemActor);
    if (events.playerPickupItem.fire(event) === CANCEL) {
        return false;
    } else {
        return _onPlayerPickupItem(event.player, itemActor, v1, v2);
    }
}
const _onPlayerPickupItem = procHacker.hooking("Player::take", bool_t, null, Player, Actor, int32_t, int32_t)(onPlayerPickupItem);
