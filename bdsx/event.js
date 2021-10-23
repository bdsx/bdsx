"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = void 0;
const eventtarget_1 = require("./eventtarget");
const v3_1 = require("./v3");
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
/** @deprecated use bdsx.events */
var events;
(function (events) {
    ////////////////////////////////////////////////////////
    // Block events
    /** @deprecated use bdsx.events */
    events.blockDestroy = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.blockPlace = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.pistonMove = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.farmlandDecay = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.campfireLight = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.campfireDouse = new eventtarget_1.Event();
    ////////////////////////////////////////////////////////
    // Entity events
    /** @deprecated use bdsx.events */
    events.entityHurt = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.entityHealthChange = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.entityDie = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.entitySneak = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.entityStartSwimming = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.entityStartRiding = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.entityStopRiding = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.playerAttack = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.playerDropItem = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.playerInventoryChange = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.playerRespawn = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.playerLevelUp = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.entityCreated = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.playerJoin = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.playerPickupItem = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.playerCrit = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.playerUseItem = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.splashPotionHit = new eventtarget_1.Event();
    ////////////////////////////////////////////////////////
    // Level events
    /** @deprecated use bdsx.events */
    events.levelExplode = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.levelTick = new eventtarget_1.Event();
    /** Cancellable but you won't be able to stop the server */
    events.levelSave = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.levelWeatherChange = new eventtarget_1.Event();
    ////////////////////////////////////////////////////////
    // Server events
    /**
     * before launched. after execute the main thread of BDS.
     * BDS will be loaded on the separated thread. this event will be executed concurrently with the BDS loading
     */
    events.serverLoading = v3_1.bdsx.events.serverLoading;
    /**
     * after BDS launched
     * @deprecated use bdsx.events
     */
    events.serverOpen = v3_1.bdsx.events.serverOpen;
    /**
     * on tick
     * @deprecated use bdsx.events
     */
    events.serverUpdate = v3_1.bdsx.events.serverUpdate;
    /**
     * before system.shutdown, Minecraft is alive yet
     * @deprecated use bdsx.events
     */
    events.serverStop = v3_1.bdsx.events.serverStop;
    /**
     * after BDS closed
     * @deprecated use bdsx.events
     */
    events.serverClose = v3_1.bdsx.events.serverClose;
    /**
     * server console outputs
     */
    events.serverLog = v3_1.bdsx.events.serverLog;
    ////////////////////////////////////////////////////////
    // Packet events
    /** @deprecated use bdsx.events */
    let PacketEventType;
    (function (PacketEventType) {
        PacketEventType[PacketEventType["Raw"] = 0] = "Raw";
        PacketEventType[PacketEventType["Before"] = 1] = "Before";
        PacketEventType[PacketEventType["After"] = 2] = "After";
        PacketEventType[PacketEventType["Send"] = 3] = "Send";
        PacketEventType[PacketEventType["SendRaw"] = 4] = "SendRaw";
    })(PacketEventType = events.PacketEventType || (events.PacketEventType = {}));
    /** @deprecated use bdsx.events */
    function packetEvent(type, packetId) {
        if ((packetId >>> 0) >= PACKET_ID_COUNT) {
            console.error(`Out of range: packetId < 0x100 (type=${PacketEventType[type]}, packetId=${packetId})`);
            return null;
        }
        const id = type * PACKET_ID_COUNT + packetId;
        return packetAllTargets[id];
    }
    events.packetEvent = packetEvent;
    /** @deprecated use bdsx.events */
    function packetRaw(id) {
        return getNetEventTarget(PacketEventType.Raw, id);
    }
    events.packetRaw = packetRaw;
    /** @deprecated use bdsx.events */
    function packetBefore(id) {
        return getNetEventTarget(PacketEventType.Before, id);
    }
    events.packetBefore = packetBefore;
    /** @deprecated use bdsx.events */
    function packetAfter(id) {
        return getNetEventTarget(PacketEventType.After, id);
    }
    events.packetAfter = packetAfter;
    /** @deprecated use bdsx.events */
    function packetSend(id) {
        return getNetEventTarget(PacketEventType.Send, id);
    }
    events.packetSend = packetSend;
    /** @deprecated use bdsx.events */
    function packetSendRaw(id) {
        return getNetEventTarget(PacketEventType.SendRaw, id);
    }
    events.packetSendRaw = packetSendRaw;
    ////////////////////////////////////////////////////////
    // Misc
    /** @deprecated use bdsx.events */
    events.queryRegenerate = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.scoreReset = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.scoreSet = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.scoreAdd = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.scoreRemove = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.objectiveCreate = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.error = eventtarget_1.Event.errorHandler;
    /** @deprecated use bdsx.events */
    function errorFire(err) {
        v3_1.bdsx.events.errorFire(err);
    }
    events.errorFire = errorFire;
    /** @deprecated use bdsx.events */
    events.commandOutput = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.command = new eventtarget_1.Event();
    /** @deprecated use bdsx.events */
    events.networkDisconnected = new eventtarget_1.Event();
})(events = exports.events || (exports.events = {}));
//# sourceMappingURL=event.js.map