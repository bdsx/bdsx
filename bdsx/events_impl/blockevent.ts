import { CANCEL } from "../common";
import { PistonAction } from "../enums";
import { events } from "../events";
import { hook } from "../hook";
import { Actor, Block, BlockPos, BlockSource, CampfireBlock, FarmBlock, GameMode, PistonBlockActor, Player, SurvivalMode } from "../minecraft";
import { bool_t, float32_t, void_t } from "../nativetype";
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

events.blockDestroy.setInstaller(()=>{
    function onBlockDestroy(this:SurvivalMode, blockPos:BlockPos, facing:number):boolean {
        const event = new BlockDestroyEvent(this.actor as Player, blockPos);
        const canceled = events.blockDestroy.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            return false;
        } else {
            this.actor = event.player;
            return _onBlockDestroy.call(this, event.blockPos, facing);
        }
    }
    function onBlockDestroyCreative(this:GameMode, blockPos:BlockPos, facing:number):boolean {
        const event = new BlockDestroyEvent(this.actor as Player, blockPos);
        const canceled = events.blockDestroy.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            return false;
        } else {
            this.actor = event.player;
            return _onBlockDestroyCreative.call(this, event.blockPos, facing);
        }
    }

    const _onBlockDestroy = hook(SurvivalMode, 'destroyBlock')(onBlockDestroy);

    const _onBlockDestroyCreative = hook(GameMode, '_creativeDestroyBlock')(onBlockDestroyCreative);
});

events.blockPlace.setInstaller(()=>{
    function onBlockPlace(this:BlockSource, block:Block, blockPos:BlockPos, facing:number, actor:Actor, ignoreEntities:boolean):boolean {
        const event = new BlockPlaceEvent(actor as Player, block, this, blockPos);
        const canceled = events.blockPlace.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            return false;
        } else {
            return _onBlockPlace.call(event.blockSource, event.block, event.blockPos, facing, event.player, ignoreEntities);
        }
    }
    const _onBlockPlace = hook(BlockSource, 'mayPlace')(onBlockPlace);
});

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

events.pistonMove.setInstaller(()=>{
    function onPistonMove(this:PistonBlockActor, blockSource:BlockSource):void_t {
        const event = new PistonMoveEvent(
            BlockPos.create(this.getInt32(0x2C), this.getUint32(0x30), this.getInt32(0x34)),
            blockSource,
            this.getInt8(0xE0));
        events.pistonMove.fire(event);
        _tickCallback();
        return _onPistonMove.call(this, event.blockSource);
    }
    const _onPistonMove = hook(PistonBlockActor, '_spawnMovingBlocks')(onPistonMove);
});

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

events.farmlandDecay.setInstaller(()=>{
    function onFarmlandDecay(this: FarmBlock, blockSource: BlockSource, blockPos: BlockPos, culprit: Actor, fallDistance: float32_t):void_t {
        const event = new FarmlandDecayEvent(this, blockPos, blockSource, culprit);
        const canceled = events.farmlandDecay.fire(event) === CANCEL;
        _tickCallback();
        if (!canceled) {
            return _onFarmlandDecay.call(event.block, event.blockSource, event.blockPos, event.culprit, fallDistance);
        }
    }
    const _onFarmlandDecay = hook(FarmBlock, 'transformOnFall')(onFarmlandDecay);
});

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

events.campfireLight.setInstaller(()=>{
    function onCampfireTryLightFire(blockSource:BlockSource, blockPos:BlockPos):bool_t {
        const event = new CampfireTryLightFire(blockPos, blockSource);
        const canceled = events.campfireLight.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) return false;
        else return _CampfireTryLightFire(event.blockSource, event.blockPos);
    }

    const _CampfireTryLightFire = hook(CampfireBlock.tryLightFire)(onCampfireTryLightFire);
});

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

events.campfireDouse.setInstaller(()=>{
    function onCampfireTryDouseFire(blockSource:BlockSource, blockPos:BlockPos, b:bool_t):bool_t {
        const event = new CampfireTryDouseFire(blockPos, blockSource);
        const canceled = events.campfireDouse.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) return false;
        else return _CampfireTryDouseFire(event.blockSource, event.blockPos, b);
    }

    const _CampfireTryDouseFire = hook(CampfireBlock.tryDouseFire)(onCampfireTryDouseFire);
});
