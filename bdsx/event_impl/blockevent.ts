import { Actor } from "../bds/actor";
import { Block, BlockSource } from "../bds/block";
import { BlockPos } from "../bds/blockpos";
import { GameMode, SurvivalMode } from "../bds/gamemode";
import { Player } from "../bds/player";
import { procHacker } from "../bds/proc";
import { CANCEL } from "../common";
import { NativePointer } from "../core";
import { events } from "../event";
import { bool_t, float32_t, int32_t, void_t } from "../nativetype";
import { _tickCallback } from "../util";

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

function onBlockDestroy(survivalMode:SurvivalMode, blockPos:BlockPos, facing:number):boolean {
    const event = new BlockDestroyEvent(survivalMode.actor as Player, blockPos);
    const canceled = events.blockDestroy.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        return false;
    } else {
        survivalMode.actor = event.player;
        return _onBlockDestroy(survivalMode, event.blockPos, facing);
    }
}
function onBlockDestroyCreative(gameMode:GameMode, blockPos:BlockPos, facing:number):boolean {
    const event = new BlockDestroyEvent(gameMode.actor as Player, blockPos);
    const canceled = events.blockDestroy.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        return false;
    } else {
        gameMode.actor = event.player;
        return _onBlockDestroyCreative(gameMode, event.blockPos, facing);
    }
}
const _onBlockDestroy = procHacker.hooking("SurvivalMode::destroyBlock", bool_t, null, SurvivalMode, BlockPos, int32_t)(onBlockDestroy);
const _onBlockDestroyCreative = procHacker.hooking("GameMode::_creativeDestroyBlock", bool_t, null, SurvivalMode, BlockPos, int32_t)(onBlockDestroyCreative);

function onBlockPlace(blockSource:BlockSource, block:Block, blockPos:BlockPos, facing:number, actor:Actor, ignoreEntities:boolean):boolean {
    const event = new BlockPlaceEvent(actor as Player, block, blockSource, blockPos);
    const canceled = events.blockPlace.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        return false;
    } else {
        return _onBlockPlace(event.blockSource, event.block, event.blockPos, facing, event.player, ignoreEntities);
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
    _tickCallback();
    return _onPistonMove(pistonBlockActor, event.blockSource);
}
const _onPistonMove = procHacker.hooking("?_spawnMovingBlocks@PistonBlockActor@@AEAAXAEAVBlockSource@@@Z", void_t, null, NativePointer, BlockSource)(onPistonMove);

interface IFarmlandDecayEvent {
    block: Block;
    blockPos: BlockPos;
    blockSource: BlockSource;
    culprit: Actor;
}
export class FarmlandDecayEvent implements IFarmlandDecayEvent {
    constructor(
        public block: Block,
        public blockPos: BlockPos,
        public blockSource: BlockSource,
        public culprit: Actor,
    ) {
    }
}
function onFarmlandDecay(block: Block, blockSource: BlockSource, blockPos: BlockPos, culprit: Actor, fallDistance: float32_t):void_t {
    const event = new FarmlandDecayEvent(block, blockPos, blockSource, culprit);
    const canceled = events.farmlandDecay.fire(event) === CANCEL;
    _tickCallback();
    if (!canceled) {
        return _onFarmlandDecay(event.block, event.blockSource, event.blockPos, event.culprit, fallDistance);
    }
}
const _onFarmlandDecay = procHacker.hooking("FarmBlock::transformOnFall", void_t, null, Block, BlockSource, BlockPos, Actor, float32_t)(onFarmlandDecay);

interface ICampfireTryLightFire {
    blockSource: BlockSource;
    blockPos: BlockPos;
}

export class CampfireTryLightFire implements ICampfireTryLightFire {
    constructor(
        public blockPos: BlockPos,
        public blockSource: BlockSource
    ) {
    }
}

function onCampfireTryLightFire(blockSource:BlockSource, blockPos:BlockPos):bool_t {
    const event = new CampfireTryLightFire(blockPos, blockSource);
    const canceled = events.campfireLight.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) return false;
    else return _CampfireTryLightFire(event.blockSource, event.blockPos);
}

const _CampfireTryLightFire = procHacker.hooking("?tryLightFire@CampfireBlock@@SA_NAEAVBlockSource@@AEBVBlockPos@@@Z", bool_t, null, BlockSource, BlockPos)(onCampfireTryLightFire);

interface ICampfireTryDouseFire {
    blockSource: BlockSource;
    blockPos: BlockPos;
}
export class CampfireTryDouseFire implements ICampfireTryDouseFire {
    constructor(
        public blockPos: BlockPos,
        public blockSource: BlockSource
    ) {
    }
}

function onCampfireTryDouseFire(blockSource:BlockSource, blockPos:BlockPos):bool_t {
    const event = new CampfireTryDouseFire(blockPos, blockSource);
    const canceled = events.campfireDouse.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) return false;
    else return _CampfireTryDouseFire(event.blockSource, event.blockPos);
}

const _CampfireTryDouseFire = procHacker.hooking("?tryDouseFire@CampfireBlock@@SA_NAEAVBlockSource@@AEBVBlockPos@@_N@Z", bool_t, null, BlockSource, BlockPos)(onCampfireTryDouseFire);
