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
    breakBlocks: boolean;
}
export class LevelExplodeEvent implements ILevelExplodeEvent {
    constructor(
        public level: Level,
        public blockSource: BlockSource,
        public entity: Actor,
        public position: Vec3,
        public power: number,
        public breakBlocks: boolean,
    ) {
    }
}

function onLevelExplode(level:Level, blockSource:BlockSource, entity:Actor, position:Vec3, power:float32_t, v2:bool_t, breakBlocks:bool_t, v4:float32_t, v5:bool_t):void {
    const event = new LevelExplodeEvent(level, blockSource, entity, position, power, breakBlocks);
    if (events.levelExplode.fire(event) !== CANCEL) {
        return _onLevelExplode(event.level, event.blockSource, event.entity, event.position, event.power, v2, event.breakBlocks, v4, v5);
    }
}
const _onLevelExplode = procHacker.hooking("?explode@Level@@UEAAXAEAVBlockSource@@PEAVActor@@AEBVVec3@@M_N3M3@Z", void_t, null, Level, BlockSource, Actor, Vec3, float32_t, bool_t, bool_t, float32_t, bool_t)(onLevelExplode);
