import { Actor } from "../bds/actor";
import { Block, BlockSource } from "../bds/block";
import { BlockPos } from "../bds/blockpos";
import { Player } from "../bds/player";
import enums = require('../enums');
interface IBlockDestroyEvent {
    player: Player;
    blockPos: BlockPos;
}
/** @deprecated */
export declare class BlockDestroyEvent implements IBlockDestroyEvent {
    player: Player;
    blockPos: BlockPos;
    constructor(player: Player, blockPos: BlockPos);
}
interface IBlockPlaceEvent {
    player: Player;
    block: Block;
    blockSource: BlockSource;
    blockPos: BlockPos;
}
/** @deprecated */
export declare class BlockPlaceEvent implements IBlockPlaceEvent {
    player: Player;
    block: Block;
    blockSource: BlockSource;
    blockPos: BlockPos;
    constructor(player: Player, block: Block, blockSource: BlockSource, blockPos: BlockPos);
}
/** @deprecated */
export declare const PistonAction: typeof enums.PistonAction;
/** @deprecated */
export declare type PistonAction = enums.PistonAction;
interface IPistonMoveEvent {
    blockPos: BlockPos;
    blockSource: BlockSource;
    readonly action: PistonAction;
}
/** @deprecated */
export declare class PistonMoveEvent implements IPistonMoveEvent {
    blockPos: BlockPos;
    blockSource: BlockSource;
    action: PistonAction;
    constructor(blockPos: BlockPos, blockSource: BlockSource, action: PistonAction);
}
interface IFarmlandDecayEvent {
    block: Block;
    blockPos: BlockPos;
    blockSource: BlockSource;
    culprit: Actor;
}
export declare class FarmlandDecayEvent implements IFarmlandDecayEvent {
    block: Block;
    blockPos: BlockPos;
    blockSource: BlockSource;
    culprit: Actor;
    constructor(block: Block, blockPos: BlockPos, blockSource: BlockSource, culprit: Actor);
}
interface ICampfireTryLightFire {
    blockSource: BlockSource;
    blockPos: BlockPos;
}
export declare class CampfireTryLightFire implements ICampfireTryLightFire {
    blockPos: BlockPos;
    blockSource: BlockSource;
    constructor(blockPos: BlockPos, blockSource: BlockSource);
}
interface ICampfireTryDouseFire {
    blockSource: BlockSource;
    blockPos: BlockPos;
}
export declare class CampfireTryDouseFire implements ICampfireTryDouseFire {
    blockPos: BlockPos;
    blockSource: BlockSource;
    constructor(blockPos: BlockPos, blockSource: BlockSource);
}
export {};
