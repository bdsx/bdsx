import { Actor, MinecraftPacketIds, nethook, RawTypeId, serverInstance } from "bdsx";
import { Block, BlockSource } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { GameMode, SurvivalMode } from "bdsx/bds/gamemode";
import { ItemStack } from "bdsx/bds/inventory";
import { Player } from "bdsx/bds/player";
import { procHacker } from "bdsx/bds/proc";
import { CANCEL } from "bdsx/common";
import { VoidPointer } from "bdsx/core";
import { CxxStringWrapper } from "./pointer";
import { bin64_t } from "./nativetype";
import Event from "krevent";

interface IBlockDestroyEvent {
    player: Player,
    blockPos: BlockPos;
}
class BlockDestroyEvent implements IBlockDestroyEvent {
    constructor(
        public player: Player,
        public blockPos: BlockPos,
    ) {
    }
}
function onBlockDestroy(survivalMode:SurvivalMode, blockPos:BlockPos, v:number):boolean {
    const event = new BlockDestroyEvent(survivalMode.actor as Player, blockPos);
    if (events.blockDestroy.fire(event) === CANCEL) {
        return false;
    } else {
        survivalMode.actor = event.player;
        return _onBlockDestroy(survivalMode, event.blockPos, v);
    }
}
function onBlockDestroyCreative(gameMode:GameMode, blockPos:BlockPos, v:number):boolean {
    const event = new BlockDestroyEvent(gameMode.actor as Player, blockPos);
    if (events.blockDestroy.fire(event) === CANCEL) {
        return false;
    } else {
        gameMode.actor = event.player;
        return _onBlockDestroyCreative(gameMode, event.blockPos, v);
    }
}
const _onBlockDestroy = procHacker.hooking("SurvivalMode::destroyBlock", RawTypeId.Boolean, null, SurvivalMode, BlockPos, RawTypeId.Int32)(onBlockDestroy);
const _onBlockDestroyCreative = procHacker.hooking("GameMode::_creativeDestroyBlock", RawTypeId.Boolean, null, SurvivalMode, BlockPos, RawTypeId.Int32)(onBlockDestroyCreative);

interface IBlockPlaceEvent {
    player: Player,
    block: Block,
    blockSource: BlockSource,
    blockPos: BlockPos;
}
class BlockPlaceEvent implements IBlockPlaceEvent {
    constructor(
        public player: Player,
        public block: Block,
        public blockSource: BlockSource,
        public blockPos: BlockPos,
    ) {
    }
}
function onBlockPlace(blockSource:BlockSource, block:Block, blockPos:BlockPos, v1:number, actor:Actor, v2:boolean):boolean {
    const event = new BlockPlaceEvent(actor as Player, block, blockSource, blockPos);
    if (events.blockPlace.fire(event) === CANCEL) {
        return false;
    } else {
        return _onBlockPlace(event.blockSource, event.block, event.blockPos, v1, event.player, v2);
    }
}
const _onBlockPlace = procHacker.hooking("BlockSource::mayPlace", RawTypeId.Boolean, null, BlockSource, Block, BlockPos, RawTypeId.Int32, Actor, RawTypeId.Boolean)(onBlockPlace);

interface IEntityHurtEvent {
    entity: Actor;
    damage: number;
}
class EntityHurtEvent implements IEntityHurtEvent {
    constructor(
        public entity: Actor,
        public damage: number,
    ) {
    }
}
function onEntityHurt(entity: Actor, actorDamageSource: VoidPointer, damage: number, v1: boolean, v2: boolean):boolean {
    const event = new EntityHurtEvent(entity, damage);
    if (events.entityHurt.fire(event) === CANCEL) {
        return false;
    } else {
        return _onEntityHurt(event.entity, actorDamageSource, event.damage, v1, v2);
    }
}
const _onEntityHurt = procHacker.hooking("Actor::hurt", RawTypeId.Boolean, null, Actor, VoidPointer, RawTypeId.Int32, RawTypeId.Boolean, RawTypeId.Boolean)(onEntityHurt);

interface IPlayerAttackEvent {
    player: Player;
    victim: Actor;
}
class PlayerAttackEvent implements IPlayerAttackEvent {
    constructor(
        public player: Player,
        public victim: Actor,
    ) {
    }
}
function onPlayerAttack(player:Player, victim:Actor):boolean {
    const event = new PlayerAttackEvent(player, victim);
    if (events.playerAttack.fire(event) === CANCEL) {
        return false;
    } else {
        return _onPlayerAttack(event.player, event.victim);
    }
}
const _onPlayerAttack = procHacker.hooking("Player::attack", RawTypeId.Boolean, null, Player, Actor)(onPlayerAttack);

interface IPlayerDropItemEvent {
    player: Player;
    itemStack: ItemStack;
}
class PlayerDropItemEvent implements IPlayerDropItemEvent {
    constructor(
        public player: Player,
        public itemStack: ItemStack,
    ) {
    }
}
function onPlayerDropItem(player:Player, itemStack:ItemStack, v:boolean):boolean {
    const event = new PlayerDropItemEvent(player, itemStack);
    if (events.playerDropItem.fire(event) === CANCEL) {
        return false;
    } else {
        return _onPlayerDropItem(event.player, event.itemStack, v);
    }
}
const _onPlayerDropItem = procHacker.hooking("Player::drop", RawTypeId.Boolean, null, Player, ItemStack, RawTypeId.Boolean)(onPlayerDropItem);

interface IPlayerJoinEvent {
    readonly player: Player;
}
class PlayerJoinEvent implements IPlayerJoinEvent {
    constructor(
        readonly player: Player,
    ) {
    }
}
nethook.send(MinecraftPacketIds.PlayStatus).on((pk, ni) =>{
    if (pk.status === 3) {
        const event = new PlayerJoinEvent(ni.getActor()!);
        events.playerJoin.fire(event);
    }
});

interface IPlayerPickupItemEvent {
    player: Player;
    //itemStack: ItemStack;
}
class PlayerPickupItemEvent implements IPlayerPickupItemEvent {
    constructor(
        public player: Player,
        //public itemStack: ItemStack, // should be from 0x688 at ItemActor but unexpected undefined value
    ) {
    }
}

function onPlayerPickupItem(player:Player, itemActor:VoidPointer, v1:number, v2:number):boolean {
    const event = new PlayerPickupItemEvent(player/*, itemActor.itemStack*/);
    if (events.playerPickupItem.fire(event) === CANCEL) {
        return false;
    } else {
        return _onPlayerPickupItem(event.player, itemActor, v1, v2);
    }
}
const _onPlayerPickupItem = procHacker.hooking("Player::take", RawTypeId.Boolean, null, Player, VoidPointer, RawTypeId.Int32, RawTypeId.Int32)(onPlayerPickupItem);

interface IQueryRegenerateEvent {
    motd: string,
    levelname: string,
    currentPlayers: number,
    maxPlayers: number,

}
class QueryRegenerateEvent implements IQueryRegenerateEvent {
    constructor(
        public motd: string,
        public levelname: string,
        public currentPlayers: number,
        public maxPlayers: number,
    ) {
    }
}
function onQueryRegenerate(rakNetServerLocator: VoidPointer, motd: CxxStringWrapper, levelname: CxxStringWrapper, gameType: VoidPointer, currentPlayers: number, maxPlayers: number, v: boolean):bin64_t {
    const event = new QueryRegenerateEvent(motd.value, levelname.value, currentPlayers, maxPlayers);
    events.queryRegenerate.fire(event);
    motd.value = event.motd;
    levelname.value = event.levelname;
    return _onQueryRegenerate(rakNetServerLocator, motd, levelname, gameType, event.currentPlayers, event.maxPlayers, v);
}
const _onQueryRegenerate = procHacker.hooking("RakNetServerLocator::announceServer", RawTypeId.Bin64, null, VoidPointer, CxxStringWrapper, CxxStringWrapper, VoidPointer, RawTypeId.Int32, RawTypeId.Int32, RawTypeId.Boolean)(onQueryRegenerate);

export const events = {
    /** Cancellable */
    blockDestroy: new Event<(event: BlockDestroyEvent) => void | CANCEL>(),
    /** Cancellable */
    blockPlace: new Event<(event: BlockPlaceEvent) => void | CANCEL>(),
    /** Cancellable */
    entityHurt: new Event<(event: EntityHurtEvent) => void | CANCEL>(),
    /** Cancellable */
    playerAttack: new Event<(event: PlayerAttackEvent) => void | CANCEL>(),
    /** Cancellable but only when player is in container screens*/
    playerDropItem: new Event<(event: PlayerDropItemEvent) => void | CANCEL>(),
    /** Not cancellable */
    playerJoin: new Event<(event: PlayerJoinEvent) => void>(),
    /** Cancellable */
    playerPickupItem: new Event<(event: PlayerPickupItemEvent) => void | CANCEL>(),
    /** Not cancellable */
    queryRegenerate: new Event<(event: QueryRegenerateEvent) => void>(),
};

serverInstance.minecraft.something.shandler.updateServerAnnouncement();
