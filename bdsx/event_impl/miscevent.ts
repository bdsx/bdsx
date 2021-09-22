import { procHacker } from "../bds/proc";
import { Objective, ObjectiveCriteria, PlayerScoreSetFunction, Scoreboard, ScoreboardIdentityRef } from "../bds/scoreboard";
import { serverInstance } from "../bds/server";
import { CANCEL } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { events } from "../event";
import { bedrockServer } from "../launcher";
import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, int32_t, uint8_t } from "../nativetype";
import { _tickCallback } from "../util";

interface IQueryRegenerateEvent {
    motd: string,
    levelname: string,
    currentPlayers: number,
    maxPlayers: number,
    isJoinableThroughServerScreen: boolean,

}
export class QueryRegenerateEvent implements IQueryRegenerateEvent {
    constructor(
        public motd: string,
        public levelname: string,
        public currentPlayers: number,
        public maxPlayers: number,
        public isJoinableThroughServerScreen: boolean,
    ) {
    }
}

@nativeClass()
class AnnounceServerData extends NativeClass {
    @nativeField(CxxString)
    motd:CxxString;
    @nativeField(CxxString)
    levelname:CxxString;
    @nativeField(int32_t)
    currentPlayers:int32_t;
    @nativeField(int32_t)
    maxPlayers:int32_t;
    @nativeField(bool_t)
    isJoinableThroughServerScreen:bool_t;
}

// CxxStringWrapper, CxxStringWrapper, VoidPointer, int32_t, int32_t, bool_t
//  motd: CxxStringWrapper, levelname: CxxStringWrapper, gameType: VoidPointer, currentPlayers: number, maxPlayers: number, isJoinableThroughServerScreen: boolean

const _onQueryRegenerate = procHacker.hooking("RakNetServerLocator::_announceServer", bin64_t, null, VoidPointer, AnnounceServerData)(onQueryRegenerate);
function onQueryRegenerate(rakNetServerLocator: VoidPointer, data:AnnounceServerData):bin64_t {
    const event = new QueryRegenerateEvent(data.motd, data.levelname, data.currentPlayers, data.maxPlayers, data.isJoinableThroughServerScreen);
    events.queryRegenerate.fire(event);
    data.motd = event.motd;
    data.levelname = event.levelname;
    _tickCallback();
    return _onQueryRegenerate(rakNetServerLocator, data);
}
bedrockServer.afterOpen().then(() => serverInstance.minecraft.getServerNetworkHandler().updateServerAnnouncement());

interface IScoreResetEvent {
    identityRef:ScoreboardIdentityRef;
    objective:Objective;
}
export class ScoreResetEvent implements IScoreResetEvent {
    constructor(
        public identityRef:ScoreboardIdentityRef,
        public objective:Objective,
    ) {
    }
}

const _onScoreReset = procHacker.hooking("ScoreboardIdentityRef::removeFromObjective", bool_t, null, ScoreboardIdentityRef, Scoreboard, Objective)(onScoreReset);
function onScoreReset(identityRef: ScoreboardIdentityRef, scoreboard: Scoreboard, objective: Objective): boolean {
    const event = new ScoreResetEvent(identityRef, objective);
    const canceled = events.scoreReset.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        scoreboard.sync(identityRef.scoreboardId, objective);
        return false;
    }
    return _onScoreReset(event.identityRef, scoreboard, event.objective);
}

interface IScoreSetEvent {
    identityRef:ScoreboardIdentityRef;
    objective:Objective;
    score:number;
}
export class ScoreSetEvent implements IScoreSetEvent {
    constructor(
        public identityRef:ScoreboardIdentityRef,
        public objective:Objective,
        /** The score to be set */
        public score:number,
    ) {
    }
}
export class ScoreAddEvent extends ScoreSetEvent {
    constructor(
        public identityRef:ScoreboardIdentityRef,
        public objective:Objective,
        /** The score to be added */
        public score:number,
    ) {
        super(identityRef, objective, score);
    }
}
export class ScoreRemoveEvent extends ScoreSetEvent {
    constructor(
        public identityRef:ScoreboardIdentityRef,
        public objective:Objective,
        /** The score to be removed */
        public score:number,
    ) {
        super(identityRef, objective, score);
    }
}

const _onScoreModify = procHacker.hooking("ScoreboardIdentityRef::modifyScoreInObjective", bool_t, null, ScoreboardIdentityRef, StaticPointer, Objective, int32_t, uint8_t)(onScoreModify);
function onScoreModify(identityRef: ScoreboardIdentityRef, result: StaticPointer, objective: Objective, score: int32_t, mode: PlayerScoreSetFunction): bool_t {
    let event: ScoreSetEvent;
    let canceled: boolean;
    switch (mode) {
    case PlayerScoreSetFunction.Set:
        event = new ScoreSetEvent(identityRef, objective, score);
        canceled = events.scoreSet.fire(event) === CANCEL;
        break;
    case PlayerScoreSetFunction.Add:
        event = new ScoreAddEvent(identityRef, objective, score);
        canceled = events.scoreAdd.fire(event) === CANCEL;
        break;
    case PlayerScoreSetFunction.Subtract:
        event = new ScoreRemoveEvent(identityRef, objective, score);
        canceled = events.scoreRemove.fire(event) === CANCEL;
        break;
    }
    _tickCallback();
    if (canceled) {
        return false;
    }
    return _onScoreModify(event.identityRef, result, event.objective, event.score, mode);
}

interface IObjectiveCreateEvent {
    name:string;
    displayName:string;
    criteria:ObjectiveCriteria;
}
export class ObjectiveCreateEvent implements IObjectiveCreateEvent {
    constructor(
        public name:string,
        public displayName:string,
        public criteria:ObjectiveCriteria,
    ) {
    }
}

const _onObjectiveCreate = procHacker.hooking("Scoreboard::addObjective", Objective, null, Scoreboard, CxxString, CxxString, ObjectiveCriteria)(onObjectiveCreate);
function onObjectiveCreate(scoreboard: Scoreboard, name: CxxString, displayName: CxxString, criteria: ObjectiveCriteria): Objective {
    const event = new ObjectiveCreateEvent(name, displayName, criteria);
    const canceled = events.objectiveCreate.fire(event) === CANCEL;
    _tickCallback();
    if (canceled) {
        return VoidPointer as any;
    }
    return _onObjectiveCreate(scoreboard, event.name, event.displayName, event.criteria);
}
