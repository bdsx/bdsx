import { Actor } from "../bds/actor";
import { BlockSource } from "../bds/block";
import { Vec3 } from "../bds/blockpos";
import { Level } from "../bds/level";
import { procHacker } from "../bds/proc";
import { CANCEL } from "../common";
import { events } from "../event";
import { bool_t, float32_t, void_t } from "../nativetype";

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

function onLevelExplode(level:Level, blockSource:BlockSource, entity:Actor, position:Vec3, power:float32_t, causesFire:bool_t, breaksBlocks:bool_t, maxResistance:float32_t, allowUnderwater:bool_t):void {
    const event = new LevelExplodeEvent(level, blockSource, entity, position, power, causesFire, breaksBlocks, maxResistance, allowUnderwater);
    if (events.levelExplode.fire(event) !== CANCEL) {
        return _onLevelExplode(event.level, event.blockSource, event.entity, event.position, event.power, event.causesFire, event.breaksBlocks, event.maxResistance, event.allowUnderwater);
    }
}
const _onLevelExplode = procHacker.hooking("?explode@Level@@UEAAXAEAVBlockSource@@PEAVActor@@AEBVVec3@@M_N3M3@Z", void_t, null, Level, BlockSource, Actor, Vec3, float32_t, bool_t, bool_t, float32_t, bool_t)(onLevelExplode);
