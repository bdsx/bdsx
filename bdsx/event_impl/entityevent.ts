import { Actor, ActorDamageSource } from "../bds/actor";
import { AttributeId } from "../bds/attribute";
import { ItemStack } from "../bds/inventory";
import { MinecraftPacketIds } from "../bds/packetids";
import { ScriptCustomEventPacket } from "../bds/packets";
import { Player } from "../bds/player";
import { procHacker } from "../bds/proc";
import { CANCEL } from "../common";
import { NativePointer, VoidPointer } from "../core";
import { events } from "../event";
import { bool_t, float32_t, int32_t, void_t } from "../nativetype";


interface IEntityHurtEvent {
    entity: Actor;
    damage: number;
    knock: boolean,
    ignite: boolean,
}
export class EntityHurtEvent implements IEntityHurtEvent {
    constructor(
        public entity: Actor,
        public damage: number,
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
    consumeItem: boolean;
    itemStack: ItemStack;
}
export class PlayerUseItemEvent implements IPlayerUseItemEvent {
    constructor(
        public player: Player,
        public useMethod: number,
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
    return _onPlayerUseItem(event.player, event.itemStack, event.useMethod, event.consumeItem);
}
const _onPlayerUseItem = procHacker.hooking('Player::useItem', void_t, null, Player, ItemStack, int32_t, bool_t)(onPlayerUseItem);

function onPlayerCrit(player: Player):void {
    const event = new PlayerCritEvent(player);
    events.playerCrit.fire(event);
    return _onPlayerCrit(event.player);
}
const _onPlayerCrit = procHacker.hooking('Player::_crit', void_t, null, Player)(onPlayerCrit);

function onEntityHurt(entity: Actor, actorDamageSource: ActorDamageSource, damage: number, knock: boolean, ignite: boolean):boolean {
    const event = new EntityHurtEvent(entity, damage, knock, ignite);
    if (events.entityHurt.fire(event) === CANCEL) {
        return false;
    } else {
        return _onEntityHurt(event.entity, actorDamageSource, event.damage, knock, ignite);
    }
}
const _onEntityHurt = procHacker.hooking('Actor::hurt', bool_t, null, Actor, ActorDamageSource, int32_t, bool_t, bool_t)(onEntityHurt);

function onEntityHealthChange(attributeDelegate: NativePointer, oldHealth:number, newHealth:number, attributeBuffInfo:VoidPointer):boolean {
    const event = new EntityHeathChangeEvent(attributeDelegate.getPointerAs(Actor, 0x20), oldHealth, newHealth);
    events.entityHealthChange.fire(event);
    attributeDelegate.setPointer(event.entity, 0x20);
    return _onEntityHealthChange(attributeDelegate, oldHealth, newHealth, attributeBuffInfo);
}
const _onEntityHealthChange = procHacker.hooking('HealthAttributeDelegate::change', bool_t, null, NativePointer, float32_t, float32_t, VoidPointer)(onEntityHealthChange);

function onEntityDie(entity:Actor, damageSource:ActorDamageSource):boolean {
    const event = new EntityDieEvent(entity, damageSource);
    events.entityDie.fire(event);
    return _onEntityDie(event.entity, event.damageSource);
}
const _onEntityDie = procHacker.hooking('Mob::die', bool_t, null, Actor, ActorDamageSource)(onEntityDie);

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

function onPlayerDropItem(player:Player, itemStack:ItemStack, randomly:boolean):boolean {
    const event = new PlayerDropItemEvent(player, itemStack);
    if (events.playerDropItem.fire(event) === CANCEL) {
        return false;
    } else {
        return _onPlayerDropItem(event.player, event.itemStack, randomly);
    }
}
const _onPlayerDropItem = procHacker.hooking("Player::drop", bool_t, null, Player, ItemStack, bool_t)(onPlayerDropItem);

function onPlayerRespawn(player:Player):void {
    const event = new PlayerRespawnEvent(player);
    events.playerRespawn.fire(event);
    return _onPlayerRespawn(event.player);
}
const _onPlayerRespawn = procHacker.hooking("Player::respawn", void_t, null, Player)(onPlayerRespawn);

function onPlayerLevelUp(player:Player, levels:int32_t):void {
    const event = new PlayerLevelUpEvent(player, levels);
    if (events.playerLevelUp.fire(event) !== CANCEL) {
        return _onPlayerLevelUp(event.player, event.levels);
    }
}
const _onPlayerLevelUp = procHacker.hooking("Player::addLevels", void_t, null, Player, int32_t)(onPlayerLevelUp);

events.packetBefore(MinecraftPacketIds.SetLocalPlayerAsInitialized).on((pk, ni) =>{
    const event = new PlayerJoinEvent(ni.getActor()!);
    events.playerJoin.fire(event);
});

function onPlayerPickupItem(player:Player, itemActor:Actor, orgCount:number, favoredSlot:number):boolean {
    const event = new PlayerPickupItemEvent(player, itemActor);
    if (events.playerPickupItem.fire(event) === CANCEL) {
        return false;
    } else {
        return _onPlayerPickupItem(event.player, itemActor, orgCount, favoredSlot);
    }
}
const _onPlayerPickupItem = procHacker.hooking("Player::take", bool_t, null, Player, Actor, int32_t, int32_t)(onPlayerPickupItem);
