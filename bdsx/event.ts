
import { Actor, MinecraftPacketIds, nethook, RawTypeId } from "bdsx";
import { Block, BlockSource } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { GameMode, SurvivalMode } from "bdsx/bds/gamemode";
import { ItemStack } from "bdsx/bds/inventory";
import { Player } from "bdsx/bds/player";
import { procHacker } from "bdsx/bds/proc";
import { CANCEL } from "bdsx/common";
import { VoidPointer } from "bdsx/core";
import Event from "krevent";

interface IBlockDestroyEvent {
    readonly player: Player,
    readonly blockPos: BlockPos;
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
        return _onBlockDestroy(survivalMode, blockPos, v);
    }
}
function onBlockDestroyCreative(gameMode:GameMode, blockPos:BlockPos, v:number):boolean {
    const event = new BlockDestroyEvent(gameMode.actor as Player, blockPos);
    if (events.blockDestroy.fire(event) === CANCEL) {
        return false;
    } else {
        return _onBlockDestroyCreative(gameMode, blockPos, v);
    }
}
const _onBlockDestroy = procHacker.hooking("SurvivalMode::destroyBlock", RawTypeId.Boolean, null, SurvivalMode, BlockPos, RawTypeId.Int32)(onBlockDestroy);
const _onBlockDestroyCreative = procHacker.hooking("GameMode::_creativeDestroyBlock", RawTypeId.Boolean, null, SurvivalMode, BlockPos, RawTypeId.Int32)(onBlockDestroyCreative);

interface IBlockPlaceEvent {
    readonly player: Player,
    readonly block: Block,
    readonly blockSource: BlockSource,
    readonly blockPos: BlockPos;
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
        return _onBlockPlace(blockSource, block, blockPos, v1, actor, v2);
    }
}
const _onBlockPlace = procHacker.hooking("BlockSource::mayPlace", RawTypeId.Boolean, null, BlockSource, Block, BlockPos, RawTypeId.Int32, Actor, RawTypeId.Boolean)(onBlockPlace);

interface IPlayerAttackEvent {
    readonly player: Player;
    readonly victim: Actor;
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
        return _onPlayerAttack(player, victim);
    }
}
const _onPlayerAttack = procHacker.hooking("Player::attack", RawTypeId.Boolean, null, Player, Actor)(onPlayerAttack);

interface IPlayerDropItemEvent {
    readonly player: Player;
    readonly itemStack: ItemStack;
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
        return _onPlayerDropItem(player, itemStack, v);
    }
}
const _onPlayerDropItem = procHacker.hooking("Player::drop", RawTypeId.Boolean, null, Player, ItemStack, RawTypeId.Boolean)(onPlayerDropItem);

interface IPlayerJoinEvent {
    readonly player: Player;
}
class PlayerJoinEvent implements IPlayerJoinEvent {
    constructor(
        public player: Player,
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
    readonly player: Player;
    //readonly itemStack: ItemStack;
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
        return _onPlayerPickupItem(player, itemActor, v1, v2);
    }
}
const _onPlayerPickupItem = procHacker.hooking("Player::take", RawTypeId.Boolean, null, Player, VoidPointer, RawTypeId.Int32, RawTypeId.Int32)(onPlayerPickupItem);

export const events = {
    /** Cancellable */
    blockDestroy: new Event<(event: BlockDestroyEvent) => void | CANCEL>(),
    /** Cancellable */
    blockPlace: new Event<(event: BlockPlaceEvent) => void | CANCEL>(),
    /** Cancellable */
    playerAttack: new Event<(event: PlayerAttackEvent) => void | CANCEL>(),
    /** Cancellable but only when player is in container screens*/
    playerDropItem: new Event<(event: PlayerDropItemEvent) => void | CANCEL>(),
    /** Not cancellable */
    playerJoin: new Event<(event: PlayerJoinEvent) => void>(),
    /** Cancellable */
    playerPickupItem: new Event<(event: PlayerPickupItemEvent) => void | CANCEL>(),
};
