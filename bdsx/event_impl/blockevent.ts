import { Actor } from "../bds/actor";
import { Block, BlockSource } from "../bds/block";
import { BlockPos } from "../bds/blockpos";
import { ItemStack } from "../bds/inventory";
import { Player, ServerPlayer } from "../bds/player";
import { procHacker } from "../bds/proc";
import { CANCEL } from "../common";
import { NativePointer, StaticPointer } from "../core";
import { decay } from "../decay";
import { events } from "../event";
import { bool_t, float32_t, int32_t, void_t } from "../nativetype";
import { _tickCallback } from "../util";

interface IBlockDestroyEvent {
    player: ServerPlayer;
    blockSource: BlockSource,
    blockPos: BlockPos;
    itemStack: ItemStack;
    generateParticle: boolean;
}
export class BlockDestroyEvent implements IBlockDestroyEvent {
    constructor(
        public player: ServerPlayer,
        public blockPos: BlockPos,
        public blockSource: BlockSource,
        public itemStack: ItemStack,
        public generateParticle: boolean
    ) {
    }
}

interface IBlockDestructionStartEvent {
    player: ServerPlayer;
    blockPos: BlockPos;
}
export class BlockDestructionStartEvent implements IBlockDestructionStartEvent {
    constructor(
        public player: ServerPlayer,
        public blockPos: BlockPos,
    ) {
    }
}

interface IBlockPlaceEvent {
    player: ServerPlayer,
    block: Block,
    blockSource: BlockSource,
    blockPos: BlockPos;
}
export class BlockPlaceEvent implements IBlockPlaceEvent {
    constructor(
        public player: ServerPlayer,
        public block: Block,
        public blockSource: BlockSource,
        public blockPos: BlockPos,
    ) {
    }
}

function onBlockDestroy(blockSource:BlockSource, actor:Actor, blockPos:BlockPos, itemStack:ItemStack, generateParticle:bool_t):boolean {
    const event = new BlockDestroyEvent(actor as ServerPlayer, blockPos, blockSource, itemStack, generateParticle);
    const canceled = events.blockDestroy.fire(event) === CANCEL;
    _tickCallback();
    decay(blockSource);
    decay(blockPos);
    decay(itemStack);
    if (canceled) {
        return false;
    } else {
        return _onBlockDestroy(event.blockSource, event.player, event.blockPos, event.itemStack, event.generateParticle);
    }
}
const _onBlockDestroy = procHacker.hooking("BlockSource::checkBlockDestroyPermissions", bool_t, null, BlockSource, Actor, BlockPos, ItemStack, bool_t)(onBlockDestroy);


function onBlockDestructionStart(blockEventCoordinator:StaticPointer, player:Player, blockPos:BlockPos):void {
    const event = new BlockDestructionStartEvent(player as ServerPlayer, blockPos);
    events.blockDestructionStart.fire(event);
    _tickCallback();
    decay(blockPos);
    return _onBlockDestructionStart(blockEventCoordinator, event.player, event.blockPos);
}
const _onBlockDestructionStart = procHacker.hooking("BlockEventCoordinator::sendBlockDestructionStarted", void_t, null, StaticPointer, Player, BlockPos)(onBlockDestructionStart);

function onBlockPlace(blockSource:BlockSource, block:Block, blockPos:BlockPos, facing:number, actor:Actor, ignoreEntities:boolean):boolean {
    const event = new BlockPlaceEvent(actor as ServerPlayer, block, blockSource, blockPos);
    const canceled = events.blockPlace.fire(event) === CANCEL;
    _tickCallback();
    decay(blockSource);
    decay(block);
    decay(blockPos);
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
    decay(pistonBlockActor);
    decay(blockSource);
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
    decay(block);
    decay(blockSource);
    decay(blockPos);
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
    decay(blockSource);
    decay(blockPos);
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
    decay(blockSource);
    decay(blockPos);
    if (canceled) return false;
    else return _CampfireTryDouseFire(event.blockSource, event.blockPos);
}

const _CampfireTryDouseFire = procHacker.hooking("?tryDouseFire@CampfireBlock@@SA_NAEAVBlockSource@@AEBVBlockPos@@_N@Z", bool_t, null, BlockSource, BlockPos)(onCampfireTryDouseFire);
