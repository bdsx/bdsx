"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelWeatherChangeEvent = exports.LevelTickEvent = exports.LevelSaveEvent = exports.LevelExplodeEvent = void 0;
const actor_1 = require("../bds/actor");
const block_1 = require("../bds/block");
const blockpos_1 = require("../bds/blockpos");
const level_1 = require("../bds/level");
const proc_1 = require("../bds/proc");
const common_1 = require("../common");
const event_1 = require("../event");
const nativetype_1 = require("../nativetype");
const util_1 = require("../util");
class LevelExplodeEvent {
    constructor(level, blockSource, entity, position, 
    /** The radius of the explosion in blocks and the amount of damage the explosion deals. */
    power, 
    /** If true, blocks in the explosion radius will be set on fire. */
    causesFire, 
    /** If true, the explosion will destroy blocks in the explosion radius. */
    breaksBlocks, 
    /** A blocks explosion resistance will be capped at this value when an explosion occurs. */
    maxResistance, allowUnderwater) {
        this.level = level;
        this.blockSource = blockSource;
        this.entity = entity;
        this.position = position;
        this.power = power;
        this.causesFire = causesFire;
        this.breaksBlocks = breaksBlocks;
        this.maxResistance = maxResistance;
        this.allowUnderwater = allowUnderwater;
    }
}
exports.LevelExplodeEvent = LevelExplodeEvent;
class LevelSaveEvent {
    constructor(level) {
        this.level = level;
    }
}
exports.LevelSaveEvent = LevelSaveEvent;
class LevelTickEvent {
    constructor(level) {
        this.level = level;
    }
}
exports.LevelTickEvent = LevelTickEvent;
class LevelWeatherChangeEvent {
    constructor(level, rainLevel, rainTime, lightningLevel, lightningTime) {
        this.level = level;
        this.rainLevel = rainLevel;
        this.rainTime = rainTime;
        this.lightningLevel = lightningLevel;
        this.lightningTime = lightningTime;
    }
}
exports.LevelWeatherChangeEvent = LevelWeatherChangeEvent;
function onLevelExplode(level, blockSource, entity, position, power, causesFire, breaksBlocks, maxResistance, allowUnderwater) {
    const event = new LevelExplodeEvent(level, blockSource, entity, position, power, causesFire, breaksBlocks, maxResistance, allowUnderwater);
    const canceled = event_1.events.levelExplode.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (!canceled) {
        return _onLevelExplode(event.level, event.blockSource, event.entity, event.position, event.power, event.causesFire, event.breaksBlocks, event.maxResistance, event.allowUnderwater);
    }
}
const _onLevelExplode = proc_1.procHacker.hooking("?explode@Level@@UEAAXAEAVBlockSource@@PEAVActor@@AEBVVec3@@M_N3M3@Z", nativetype_1.void_t, null, level_1.Level, block_1.BlockSource, actor_1.Actor, blockpos_1.Vec3, nativetype_1.float32_t, nativetype_1.bool_t, nativetype_1.bool_t, nativetype_1.float32_t, nativetype_1.bool_t)(onLevelExplode);
function onLevelSave(level) {
    const event = new LevelSaveEvent(level);
    const canceled = event_1.events.levelSave.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (!canceled) {
        return _onLevelSave(event.level);
    }
}
const _onLevelSave = proc_1.procHacker.hooking("Level::save", nativetype_1.void_t, null, level_1.Level)(onLevelSave);
function onLevelTick(level) {
    const event = new LevelTickEvent(level);
    event_1.events.levelTick.fire(event);
    _onLevelTick(event.level);
}
const _onLevelTick = proc_1.procHacker.hooking("Level::tick", nativetype_1.void_t, null, level_1.Level)(onLevelTick);
function onLevelWeatherChange(level, rainLevel, rainTime, lightningLevel, lightningTime) {
    const event = new LevelWeatherChangeEvent(level, rainLevel, rainTime, lightningLevel, lightningTime);
    const canceled = event_1.events.levelWeatherChange.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (!canceled) {
        return _onLevelWeatherChange(event.level, event.rainLevel, event.rainTime, event.lightningLevel, event.lightningTime);
    }
}
const _onLevelWeatherChange = proc_1.procHacker.hooking("Level::updateWeather", nativetype_1.void_t, null, level_1.Level, nativetype_1.float32_t, nativetype_1.int32_t, nativetype_1.float32_t, nativetype_1.int32_t)(onLevelWeatherChange);
//# sourceMappingURL=levelevent.js.map