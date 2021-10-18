import { Actor } from "../bds/actor";
import { BlockSource } from "../bds/block";
import { Vec3 } from "../bds/blockpos";
import { Level } from "../bds/level";
interface ILevelExplodeEvent {
    level: Level;
    blockSource: BlockSource;
    entity: Actor;
    position: Vec3;
    power: number;
    causesFire: boolean;
    breaksBlocks: boolean;
    maxResistance: number;
    allowUnderwater: boolean;
}
export declare class LevelExplodeEvent implements ILevelExplodeEvent {
    level: Level;
    blockSource: BlockSource;
    entity: Actor;
    position: Vec3;
    /** The radius of the explosion in blocks and the amount of damage the explosion deals. */
    power: number;
    /** If true, blocks in the explosion radius will be set on fire. */
    causesFire: boolean;
    /** If true, the explosion will destroy blocks in the explosion radius. */
    breaksBlocks: boolean;
    /** A blocks explosion resistance will be capped at this value when an explosion occurs. */
    maxResistance: number;
    allowUnderwater: boolean;
    constructor(level: Level, blockSource: BlockSource, entity: Actor, position: Vec3, 
    /** The radius of the explosion in blocks and the amount of damage the explosion deals. */
    power: number, 
    /** If true, blocks in the explosion radius will be set on fire. */
    causesFire: boolean, 
    /** If true, the explosion will destroy blocks in the explosion radius. */
    breaksBlocks: boolean, 
    /** A blocks explosion resistance will be capped at this value when an explosion occurs. */
    maxResistance: number, allowUnderwater: boolean);
}
interface ILevelSaveEvent {
    level: Level;
}
export declare class LevelSaveEvent implements ILevelSaveEvent {
    level: Level;
    constructor(level: Level);
}
interface ILevelTickEvent {
    level: Level;
}
export declare class LevelTickEvent implements ILevelTickEvent {
    level: Level;
    constructor(level: Level);
}
interface ILevelWeatherChangeEvent {
    level: Level;
    rainLevel: number;
    rainTime: number;
    lightningLevel: number;
    lightningTime: number;
}
export declare class LevelWeatherChangeEvent implements ILevelWeatherChangeEvent {
    level: Level;
    rainLevel: number;
    rainTime: number;
    lightningLevel: number;
    lightningTime: number;
    constructor(level: Level, rainLevel: number, rainTime: number, lightningLevel: number, lightningTime: number);
}
export {};
