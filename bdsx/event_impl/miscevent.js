"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectiveCreateEvent = exports.ScoreRemoveEvent = exports.ScoreAddEvent = exports.ScoreSetEvent = exports.ScoreResetEvent = exports.QueryRegenerateEvent = void 0;
const proc_1 = require("../bds/proc");
const scoreboard_1 = require("../bds/scoreboard");
const server_1 = require("../bds/server");
const common_1 = require("../common");
const core_1 = require("../core");
const event_1 = require("../event");
const launcher_1 = require("../launcher");
const nativetype_1 = require("../nativetype");
const pointer_1 = require("../pointer");
const util_1 = require("../util");
/** @deprecated */
class QueryRegenerateEvent {
    constructor(motd, levelname, currentPlayers, maxPlayers, isJoinableThroughServerScreen) {
        this.motd = motd;
        this.levelname = levelname;
        this.currentPlayers = currentPlayers;
        this.maxPlayers = maxPlayers;
        this.isJoinableThroughServerScreen = isJoinableThroughServerScreen;
    }
}
exports.QueryRegenerateEvent = QueryRegenerateEvent;
event_1.events.queryRegenerate.setInstaller(() => {
    const _onQueryRegenerate = proc_1.procHacker.hooking("RakNetServerLocator::announceServer", nativetype_1.bin64_t, null, core_1.VoidPointer, pointer_1.CxxStringWrapper, pointer_1.CxxStringWrapper, core_1.VoidPointer, nativetype_1.int32_t, nativetype_1.int32_t, nativetype_1.bool_t)(onQueryRegenerate);
    function onQueryRegenerate(rakNetServerLocator, motd, levelname, gameType, currentPlayers, maxPlayers, isJoinableThroughServerScreen) {
        const event = new QueryRegenerateEvent(motd.value, levelname.value, currentPlayers, maxPlayers, isJoinableThroughServerScreen);
        event_1.events.queryRegenerate.fire(event);
        motd.value = event.motd;
        levelname.value = event.levelname;
        (0, util_1._tickCallback)();
        return _onQueryRegenerate(rakNetServerLocator, motd, levelname, gameType, event.currentPlayers, event.maxPlayers, event.isJoinableThroughServerScreen);
    }
    if (launcher_1.bedrockServer.isLaunched())
        return;
    event_1.events.serverOpen.onFirst(() => server_1.serverInstance.minecraft.getServerNetworkHandler().updateServerAnnouncement());
});
/** @deprecated */
class ScoreResetEvent {
    constructor(identityRef, objective) {
        this.identityRef = identityRef;
        this.objective = objective;
    }
}
exports.ScoreResetEvent = ScoreResetEvent;
const _onScoreReset = proc_1.procHacker.hooking("ScoreboardIdentityRef::removeFromObjective", nativetype_1.bool_t, null, scoreboard_1.ScoreboardIdentityRef, scoreboard_1.Scoreboard, scoreboard_1.Objective)(onScoreReset);
function onScoreReset(identityRef, scoreboard, objective) {
    const event = new ScoreResetEvent(identityRef, objective);
    const canceled = event_1.events.scoreReset.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (canceled) {
        scoreboard.sync(identityRef.scoreboardId, objective);
        return false;
    }
    return _onScoreReset(event.identityRef, scoreboard, event.objective);
}
/** @deprecated */
class ScoreSetEvent {
    constructor(identityRef, objective, 
    /** The score to be set */
    score) {
        this.identityRef = identityRef;
        this.objective = objective;
        this.score = score;
    }
}
exports.ScoreSetEvent = ScoreSetEvent;
/** @deprecated */
class ScoreAddEvent extends ScoreSetEvent {
    constructor(identityRef, objective, 
    /** The score to be added */
    score) {
        super(identityRef, objective, score);
        this.identityRef = identityRef;
        this.objective = objective;
        this.score = score;
    }
}
exports.ScoreAddEvent = ScoreAddEvent;
/** @deprecated */
class ScoreRemoveEvent extends ScoreSetEvent {
    constructor(identityRef, objective, 
    /** The score to be removed */
    score) {
        super(identityRef, objective, score);
        this.identityRef = identityRef;
        this.objective = objective;
        this.score = score;
    }
}
exports.ScoreRemoveEvent = ScoreRemoveEvent;
const _onScoreModify = proc_1.procHacker.hooking("ScoreboardIdentityRef::modifyScoreInObjective", nativetype_1.bool_t, null, scoreboard_1.ScoreboardIdentityRef, core_1.StaticPointer, scoreboard_1.Objective, nativetype_1.int32_t, nativetype_1.uint8_t)(onScoreModify);
function onScoreModify(identityRef, result, objective, score, mode) {
    let event;
    let canceled;
    switch (mode) {
        case scoreboard_1.PlayerScoreSetFunction.Set:
            event = new ScoreSetEvent(identityRef, objective, score);
            canceled = event_1.events.scoreSet.fire(event) === common_1.CANCEL;
            break;
        case scoreboard_1.PlayerScoreSetFunction.Add:
            event = new ScoreAddEvent(identityRef, objective, score);
            canceled = event_1.events.scoreAdd.fire(event) === common_1.CANCEL;
            break;
        case scoreboard_1.PlayerScoreSetFunction.Subtract:
            event = new ScoreRemoveEvent(identityRef, objective, score);
            canceled = event_1.events.scoreRemove.fire(event) === common_1.CANCEL;
            break;
        default:
            (0, common_1.unreachable)();
    }
    (0, util_1._tickCallback)();
    if (canceled) {
        return false;
    }
    return _onScoreModify(event.identityRef, result, event.objective, event.score, mode);
}
/** @deprecated */
class ObjectiveCreateEvent {
    constructor(name, displayName, criteria) {
        this.name = name;
        this.displayName = displayName;
        this.criteria = criteria;
    }
}
exports.ObjectiveCreateEvent = ObjectiveCreateEvent;
const _onObjectiveCreate = proc_1.procHacker.hooking("Scoreboard::addObjective", scoreboard_1.Objective, null, scoreboard_1.Scoreboard, nativetype_1.CxxString, nativetype_1.CxxString, scoreboard_1.ObjectiveCriteria)(onObjectiveCreate);
function onObjectiveCreate(scoreboard, name, displayName, criteria) {
    const event = new ObjectiveCreateEvent(name, displayName, criteria);
    const canceled = event_1.events.objectiveCreate.fire(event) === common_1.CANCEL;
    (0, util_1._tickCallback)();
    if (canceled) {
        return core_1.VoidPointer;
    }
    return _onObjectiveCreate(scoreboard, event.name, event.displayName, event.criteria);
}
//# sourceMappingURL=miscevent.js.map