import { Actor } from "../bds/actor";
import { BlockSource } from "../bds/block";
import { Vec3 } from "../bds/blockpos";
import { Level } from "../bds/level";
import { procHacker } from "../bds/proc";
import { CANCEL } from "../common";
import { events } from "../event";
import { bool_t, float32_t, int32_t, void_t } from "../nativetype";
import { _tickCallback } from "../util";

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
export class LevelExplodeEvent implements ILevelExplodeEvent {
    constructor(
        public level: Level,
        public blockSource: BlockSource,
        public entity: Actor,
        public position: Vec3,
        /** The radius of the explosion in blocks and the amount of damage the explosion deals. */
        public power: number,
        /** If true, blocks in the explosion radius will be set on fire. */
        public causesFire: boolean,
        /** If true, the explosion will destroy blocks in the explosion radius. */
        public breaksBlocks: boolean,
        /** A blocks explosion resistance will be capped at this value when an explosion occurs. */
        public maxResistance: number,
        public allowUnderwater: boolean,
    ) {
    }
}

interface ILevelSaveEvent {
    level: Level;
}
export class LevelSaveEvent implements ILevelSaveEvent {
    constructor(
        public level: Level,
    ) {
    }
}

interface ILevelTickEvent {
    level: Level;
}
export class LevelTickEvent implements ILevelTickEvent {
    constructor(
        public level: Level,
    ) {
    }
}

interface ILevelWeatherChangeEvent {
    level: Level;
    rainLevel: number;
    rainTime: number;
    lightningLevel: number;
    lightningTime: number;
}
export class LevelWeatherChangeEvent implements ILevelWeatherChangeEvent {
    constructor(
        public level: Level,
        public rainLevel: number,
        public rainTime: number,
        public lightningLevel: number,
        public lightningTime: number,
    ) {
    }
}

function onLevelExplode(level:Level, blockSource:BlockSource, entity:Actor, position:Vec3, power:float32_t, causesFire:bool_t, breaksBlocks:bool_t, maxResistance:float32_t, allowUnderwater:bool_t):void {
    const event = new LevelExplodeEvent(level, blockSource, entity, position, power, causesFire, breaksBlocks, maxResistance, allowUnderwater);
    const canceled = events.levelExplode.fire(event) === CANCEL;
    _tickCallback();
    if (!canceled) {
        return _onLevelExplode(event.level, event.blockSource, event.entity, event.position, event.power, event.causesFire, event.breaksBlocks, event.maxResistance, event.allowUnderwater);
    }
}
const _onLevelExplode = procHacker.hooking("?explode@Level@@UEAAXAEAVBlockSource@@PEAVActor@@AEBVVec3@@M_N3M3@Z", void_t, null, Level, BlockSource, Actor, Vec3, float32_t, bool_t, bool_t, float32_t, bool_t)(onLevelExplode);

function onLevelSave(level:Level):void {
    const event = new LevelSaveEvent(level);
    const canceled = events.levelSave.fire(event) === CANCEL;
    _tickCallback();
    if (!canceled) {
        return _onLevelSave(event.level);
    }
}
const _onLevelSave = procHacker.hooking("Level::save", void_t, null, Level)(onLevelSave);

function onLevelTick(level:Level):void {
    const event = new LevelTickEvent(level);
    events.levelTick.fire(event);
    _onLevelTick(event.level);
}
const _onLevelTick = procHacker.hooking("Level::tick", void_t, null, Level)(onLevelTick);

function onLevelWeatherChange(level:Level, rainLevel:float32_t, rainTime:int32_t, lightningLevel:float32_t, lightningTime:int32_t):void {
    const event = new LevelWeatherChangeEvent(level, rainLevel, rainTime, lightningLevel, lightningTime);
    const canceled = events.levelWeatherChange.fire(event) === CANCEL;
    _tickCallback();
    if (!canceled) {
        return _onLevelWeatherChange(event.level, event.rainLevel, event.rainTime, event.lightningLevel, event.lightningTime);
    }
}
const _onLevelWeatherChange = procHacker.hooking("Level::updateWeather", void_t, null, Level, float32_t, int32_t, float32_t, int32_t)(onLevelWeatherChange);
