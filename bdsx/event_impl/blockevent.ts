import { Actor } from "../bds/actor";
import { Block, BlockSource } from "../bds/block";
import { BlockPos } from "../bds/blockpos";
import { Player } from "../bds/player";
import { events } from "../event";
import { events as newevents } from "../events";
import enums = require('../enums');

interface IBlockDestroyEvent {
    player: Player;
    blockPos: BlockPos;
}
/** @deprecated */
export class BlockDestroyEvent implements IBlockDestroyEvent {
    constructor(
        public player: Player,
        public blockPos: BlockPos,
    ) {
    }
}

events.blockDestroy.pipe(newevents.blockDestroy, function(ev){
    const event = new BlockDestroyEvent(ev.player.as(Player), ev.blockPos);
    return this.fire(event);
});

interface IBlockPlaceEvent {
    player: Player,
    block: Block,
    blockSource: BlockSource,
    blockPos: BlockPos;
}
/** @deprecated */
export class BlockPlaceEvent implements IBlockPlaceEvent {
    constructor(
        public player: Player,
        public block: Block,
        public blockSource: BlockSource,
        public blockPos: BlockPos,
    ) {
    }
}

events.blockPlace.pipe(newevents.blockPlace, function(ev){
    const event = new BlockPlaceEvent(ev.player.as(Player), ev.block.as(Block), ev.blockSource.as(BlockSource), ev.blockPos);
    return this.fire(event);
});

/** @deprecated */
export const PistonAction = enums.PistonAction;
/** @deprecated */
export type PistonAction = enums.PistonAction;

interface IPistonMoveEvent {
    blockPos: BlockPos;
    blockSource: BlockSource;
    readonly action: PistonAction;
}
/** @deprecated */
export class PistonMoveEvent implements IPistonMoveEvent {
    constructor(
        public blockPos: BlockPos,
        public blockSource: BlockSource,
        public action: PistonAction,
    ) {
    }
}

events.pistonMove.pipe(newevents.pistonMove, function(ev){
    const event = new PistonMoveEvent(ev.blockPos, ev.blockSource.as(BlockSource), ev.action);
    return this.fire(event);
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

events.farmlandDecay.pipe(newevents.farmlandDecay, function(ev){
    const event = new FarmlandDecayEvent(ev.block.as(Block), ev.blockPos, ev.blockSource.as(BlockSource), ev.culprit.as(Actor));
    return this.fire(event);
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

events.campfireLight.pipe(newevents.campfireLight, function(ev){
    const event = new CampfireTryLightFire(ev.blockPos, ev.blockSource.as(BlockSource));
    return this.fire(event);
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

events.campfireDouse.pipe(newevents.campfireDouse, function(ev){
    const event = new CampfireTryDouseFire(ev.blockPos, ev.blockSource.as(BlockSource));
    return this.fire(event);
});
