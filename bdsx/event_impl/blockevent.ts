import { Actor } from "../bds/actor";
import { Block, BlockSource } from "../bds/block";
import { BlockPos } from "../bds/blockpos";
import { GameMode, SurvivalMode } from "../bds/gamemode";
import { Player } from "../bds/player";
import { procHacker } from "../bds/proc";
import { CANCEL } from "../common";
import { NativePointer } from "../core";
import { events } from "../event";
import { bool_t, int32_t, void_t } from "../nativetype";

interface IBlockDestroyEvent {
    player: Player;
    blockPos: BlockPos;
}
export class BlockDestroyEvent implements IBlockDestroyEvent {
    constructor(
        public player: Player,
        public blockPos: BlockPos,
    ) {
    }
}

interface IBlockPlaceEvent {
    player: Player,
    block: Block,
    blockSource: BlockSource,
    blockPos: BlockPos;
}
export class BlockPlaceEvent implements IBlockPlaceEvent {
    constructor(
        public player: Player,
        public block: Block,
        public blockSource: BlockSource,
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
const _onBlockDestroy = procHacker.hooking("SurvivalMode::destroyBlock", bool_t, null, SurvivalMode, BlockPos, int32_t)(onBlockDestroy);
const _onBlockDestroyCreative = procHacker.hooking("GameMode::_creativeDestroyBlock", bool_t, null, SurvivalMode, BlockPos, int32_t)(onBlockDestroyCreative);

function onBlockPlace(blockSource:BlockSource, block:Block, blockPos:BlockPos, v1:number, actor:Actor, v2:boolean):boolean {
    const event = new BlockPlaceEvent(actor as Player, block, blockSource, blockPos);
    if (events.blockPlace.fire(event) === CANCEL) {
        return false;
    } else {
        return _onBlockPlace(event.blockSource, event.block, event.blockPos, v1, event.player, v2);
    }
}
const _onBlockPlace = procHacker.hooking("BlockSource::mayPlace", bool_t, null, BlockSource, Block, BlockPos, int32_t, Actor, bool_t)(onBlockPlace);

export enum PistonAction {
    Extend = 1,
    Retract = 3,
}
interface IPistonMoveEvent {
    blockPos: BlockPos;
    blockSource: BlockSource;
    readonly action: PistonAction;
}
export class PistonMoveEvent implements IPistonMoveEvent {
    constructor(
        public blockPos: BlockPos,
        public blockSource: BlockSource,
        public action: PistonAction,
    ) {
    }
}
function onPistonMove(pistonBlockActor:NativePointer, blockSource:BlockSource):void_t {
    const event = new PistonMoveEvent(BlockPos.create(pistonBlockActor.getInt32(0x2C), pistonBlockActor.getUint32(0x30), pistonBlockActor.getInt32(0x34)), blockSource, pistonBlockActor.getInt8(0xE0));
    events.pistonMove.fire(event);
    return _onPistonMove(pistonBlockActor, event.blockSource);
}
const _onPistonMove = procHacker.hooking("?_spawnMovingBlocks@PistonBlockActor@@AEAAXAEAVBlockSource@@@Z", void_t, null, NativePointer, BlockSource)(onPistonMove);
