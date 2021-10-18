"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = void 0;
const common_1 = require("./common");
const eventtarget_1 = require("./eventtarget");
const source_map_support_1 = require("./source-map-support");
const PACKET_ID_COUNT = 0x100;
const PACKET_EVENT_COUNT = 0x500;
function getNetEventTarget(type, packetId) {
    if ((packetId >>> 0) >= PACKET_ID_COUNT) {
        throw Error(`Out of range: packetId < 0x100 (packetId=${packetId})`);
    }
    const id = type * PACKET_ID_COUNT + packetId;
    let target = packetAllTargets[id];
    if (target !== null)
        return target;
    packetAllTargets[id] = target = new eventtarget_1.Event;
    return target;
}
const packetAllTargets = new Array(PACKET_EVENT_COUNT);
for (let i = 0; i < PACKET_EVENT_COUNT; i++) {
    packetAllTargets[i] = null;
}
/** @deprecated */
var events;
(function (events) {
    ////////////////////////////////////////////////////////
    // Block events
    /** @deprecated */
    events.blockDestroy = new eventtarget_1.Event();
    /** @deprecated */
    events.blockPlace = new eventtarget_1.Event();
    /** @deprecated */
    events.pistonMove = new eventtarget_1.Event();
    /** @deprecated */
    events.farmlandDecay = new eventtarget_1.Event();
    /** @deprecated */
    events.campfireLight = new eventtarget_1.Event();
    /** @deprecated */
    events.campfireDouse = new eventtarget_1.Event();
    ////////////////////////////////////////////////////////
    // Entity events
    /** @deprecated */
    events.entityHurt = new eventtarget_1.Event();
    /** @deprecated */
    events.entityHealthChange = new eventtarget_1.Event();
    /** @deprecated */
    events.entityDie = new eventtarget_1.Event();
    /** @deprecated */
    events.entitySneak = new eventtarget_1.Event();
    /** @deprecated */
    events.entityStartSwimming = new eventtarget_1.Event();
    /** @deprecated */
    events.entityStartRiding = new eventtarget_1.Event();
    /** @deprecated */
    events.entityStopRiding = new eventtarget_1.Event();
    /** @deprecated */
    events.playerAttack = new eventtarget_1.Event();
    /** @deprecated */
    events.playerDropItem = new eventtarget_1.Event();
    /** @deprecated */
    events.playerInventoryChange = new eventtarget_1.Event();
    /** @deprecated */
    events.playerRespawn = new eventtarget_1.Event();
    /** @deprecated */
    events.playerLevelUp = new eventtarget_1.Event();
    /** @deprecated */
    events.entityCreated = new eventtarget_1.Event();
    /** @deprecated */
    events.playerJoin = new eventtarget_1.Event();
    /** @deprecated */
    events.playerPickupItem = new eventtarget_1.Event();
    /** @deprecated */
    events.playerCrit = new eventtarget_1.Event();
    /** @deprecated */
    events.playerUseItem = new eventtarget_1.Event();
    /** @deprecated */
    events.splashPotionHit = new eventtarget_1.Event();
    ////////////////////////////////////////////////////////
    // Level events
    /** @deprecated */
    events.levelExplode = new eventtarget_1.Event();
    /** @deprecated */
    events.levelTick = new eventtarget_1.Event();
    /** Cancellable but you won't be able to stop the server */
    events.levelSave = new eventtarget_1.Event();
    /** @deprecated */
    events.levelWeatherChange = new eventtarget_1.Event();
    ////////////////////////////////////////////////////////
    // Server events
    /**
     * before launched. after execute the main thread of BDS.
     * BDS will be loaded on the separated thread. this event will be executed concurrently with the BDS loading
     */
    events.serverLoading = new eventtarget_1.Event();
    /**
     * after BDS launched
     */
    events.serverOpen = new eventtarget_1.Event();
    /**
     * on tick
     */
    events.serverUpdate = new eventtarget_1.Event();
    /**
     * before system.shutdown, Minecraft is alive yet
     */
    events.serverStop = new eventtarget_1.Event();
    /**
     * after BDS closed
     */
    events.serverClose = new eventtarget_1.Event();
    /**
     * server console outputs
     */
    events.serverLog = new eventtarget_1.Event();
    ////////////////////////////////////////////////////////
    // Packet events
    let PacketEventType;
    (function (PacketEventType) {
        PacketEventType[PacketEventType["Raw"] = 0] = "Raw";
        PacketEventType[PacketEventType["Before"] = 1] = "Before";
        PacketEventType[PacketEventType["After"] = 2] = "After";
        PacketEventType[PacketEventType["Send"] = 3] = "Send";
        PacketEventType[PacketEventType["SendRaw"] = 4] = "SendRaw";
    })(PacketEventType = events.PacketEventType || (events.PacketEventType = {}));
    function packetEvent(type, packetId) {
        if ((packetId >>> 0) >= PACKET_ID_COUNT) {
            console.error(`Out of range: packetId < 0x100 (type=${PacketEventType[type]}, packetId=${packetId})`);
            return null;
        }
        const id = type * PACKET_ID_COUNT + packetId;
        return packetAllTargets[id];
    }
    events.packetEvent = packetEvent;
    /** @deprecated */
    function packetRaw(id) {
        return getNetEventTarget(PacketEventType.Raw, id);
    }
    events.packetRaw = packetRaw;
    /** @deprecated */
    function packetBefore(id) {
        return getNetEventTarget(PacketEventType.Before, id);
    }
    events.packetBefore = packetBefore;
    /** @deprecated */
    function packetAfter(id) {
        return getNetEventTarget(PacketEventType.After, id);
    }
    events.packetAfter = packetAfter;
    /** @deprecated */
    function packetSend(id) {
        return getNetEventTarget(PacketEventType.Send, id);
    }
    events.packetSend = packetSend;
    /** @deprecated */
    function packetSendRaw(id) {
        return getNetEventTarget(PacketEventType.SendRaw, id);
    }
    events.packetSendRaw = packetSendRaw;
    ////////////////////////////////////////////////////////
    // Misc
    /** @deprecated */
    events.queryRegenerate = new eventtarget_1.Event();
    /** @deprecated */
    events.scoreReset = new eventtarget_1.Event();
    /** @deprecated */
    events.scoreSet = new eventtarget_1.Event();
    /** @deprecated */
    events.scoreAdd = new eventtarget_1.Event();
    /** @deprecated */
    events.scoreRemove = new eventtarget_1.Event();
    /** @deprecated */
    events.objectiveCreate = new eventtarget_1.Event();
    /** @deprecated */
    events.error = eventtarget_1.Event.errorHandler;
    /** @deprecated */
    function errorFire(err) {
        if (err instanceof Error) {
            err.stack = (0, source_map_support_1.remapStack)(err.stack);
        }
        if (events.error.fire(err) !== common_1.CANCEL) {
            console.error(err && (err.stack || err));
        }
    }
    events.errorFire = errorFire;
    /** @deprecated */
    events.commandOutput = new eventtarget_1.Event();
    /** @deprecated */
    events.command = new eventtarget_1.Event();
    /** @deprecated */
    events.networkDisconnected = new eventtarget_1.Event();
})(events = exports.events || (exports.events = {}));
//# sourceMappingURL=event.js.map