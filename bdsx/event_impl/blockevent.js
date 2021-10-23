"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampfireTryDouseFire = exports.CampfireTryLightFire = exports.FarmlandDecayEvent = exports.PistonMoveEvent = exports.PistonAction = exports.BlockPlaceEvent = exports.BlockDestroyEvent = void 0;
const actor_1 = require("../bds/actor");
const block_1 = require("../bds/block");
const player_1 = require("../bds/player");
const event_1 = require("../event");
const v3_1 = require("../v3");
const enums = require("../enums");
/** @deprecated */
class BlockDestroyEvent {
    constructor(player, blockPos) {
        this.player = player;
        this.blockPos = blockPos;
    }
}
exports.BlockDestroyEvent = BlockDestroyEvent;
event_1.events.blockDestroy.pipe(v3_1.bdsx.events.blockDestroy, function (ev) {
    const event = new BlockDestroyEvent(ev.player.getRawEntity().as(player_1.Player), ev.blockPos);
    return this.fire(event);
});
/** @deprecated */
class BlockPlaceEvent {
    constructor(player, block, blockSource, blockPos) {
        this.player = player;
        this.block = block;
        this.blockSource = blockSource;
        this.blockPos = blockPos;
    }
}
exports.BlockPlaceEvent = BlockPlaceEvent;
event_1.events.blockPlace.pipe(v3_1.bdsx.events.blockPlace, function (ev) {
    const event = new BlockPlaceEvent(actor_1.Actor.fromNewActor(ev.player.getRawEntity()), ev.block.getRawBlock().as(block_1.Block), ev.getRawBlockSource().as(block_1.BlockSource), ev.blockPos);
    return this.fire(event);
});
/** @deprecated */
exports.PistonAction = enums.PistonAction;
/** @deprecated */
class PistonMoveEvent {
    constructor(blockPos, blockSource, action) {
        this.blockPos = blockPos;
        this.blockSource = blockSource;
        this.action = action;
    }
}
exports.PistonMoveEvent = PistonMoveEvent;
event_1.events.pistonMove.pipe(v3_1.bdsx.events.pistonMove, function (ev) {
    const event = new PistonMoveEvent(ev.blockPos, ev.getRawBlockSource().as(block_1.BlockSource), ev.action);
    return this.fire(event);
});
/** @deprecated */
class FarmlandDecayEvent {
    constructor(block, blockPos, blockSource, culprit) {
        this.block = block;
        this.blockPos = blockPos;
        this.blockSource = blockSource;
        this.culprit = culprit;
    }
}
exports.FarmlandDecayEvent = FarmlandDecayEvent;
event_1.events.farmlandDecay.pipe(v3_1.bdsx.events.farmlandDecay, function (ev) {
    const event = new FarmlandDecayEvent(ev.block.getRawBlock().as(block_1.Block), ev.blockPos, ev.getRawBlockSource().as(block_1.BlockSource), actor_1.Actor.fromNewActor(ev.culprit.getRawEntity()));
    return this.fire(event);
});
/** @deprecated */
class CampfireTryLightFire {
    constructor(blockPos, blockSource) {
        this.blockPos = blockPos;
        this.blockSource = blockSource;
    }
}
exports.CampfireTryLightFire = CampfireTryLightFire;
event_1.events.campfireLight.pipe(v3_1.bdsx.events.campfireLight, function (ev) {
    const event = new CampfireTryLightFire(ev.blockPos, ev.getRawBlockSource().as(block_1.BlockSource));
    return this.fire(event);
});
/** @deprecated */
class CampfireTryDouseFire {
    constructor(blockPos, blockSource) {
        this.blockPos = blockPos;
        this.blockSource = blockSource;
    }
}
exports.CampfireTryDouseFire = CampfireTryDouseFire;
event_1.events.campfireDouse.pipe(v3_1.bdsx.events.campfireDouse, function (ev) {
    const event = new CampfireTryDouseFire(ev.blockPos, ev.getRawBlockSource().as(block_1.BlockSource));
    return this.fire(event);
});
//# sourceMappingURL=blockevent.js.map