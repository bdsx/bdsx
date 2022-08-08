import { Objective, ObjectiveCriteria, PlayerScoreSetFunction, Scoreboard, ScoreboardIdentityRef } from "../bds/scoreboard";
import { CANCEL } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { decay } from "../decay";
import { events } from "../event";
import { bedrockServer } from "../launcher";
import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, int32_t, uint8_t, void_t } from "../nativetype";
import { procHacker } from "../prochacker";

export class QueryRegenerateEvent {
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
    @nativeField(int32_t, {relative: true, offset: 4})
    currentPlayers:int32_t;
    @nativeField(int32_t)
    maxPlayers:int32_t;
    @nativeField(bool_t)
    isJoinableThroughServerScreen:bool_t;
}

// CxxStringWrapper, CxxStringWrapper, VoidPointer, int32_t, int32_t, bool_t
//  motd: CxxStringWrapper, levelname: CxxStringWrapper, gameType: VoidPointer, currentPlayers: number, maxPlayers: number, isJoinableThroughServerScreen: boolean

const _onQueryRegenerate = procHacker.hooking("?_announceServer@RakNetServerLocator@@AEAAXAEBUAnnounceServerData@1@@Z", void_t, null, VoidPointer, AnnounceServerData)(onQueryRegenerate);
function onQueryRegenerate(rakNetServerLocator: VoidPointer, data:AnnounceServerData):void {
    const event = new QueryRegenerateEvent(data.motd, data.levelname, data.currentPlayers, data.maxPlayers, data.isJoinableThroughServerScreen);
    events.queryRegenerate.fire(event);
    data.motd = event.motd;
    data.levelname = event.levelname;
    return _onQueryRegenerate(rakNetServerLocator, data);
}
bedrockServer.afterOpen().then(() => bedrockServer.serverNetworkHandler.updateServerAnnouncement());

export class ScoreResetEvent {
    constructor(
        public identityRef:ScoreboardIdentityRef,
        public objective:Objective,
    ) {
    }
}

const _onScoreReset = procHacker.hooking("?removeFromObjective@ScoreboardIdentityRef@@QEAA_NAEAVScoreboard@@AEAVObjective@@@Z", bool_t, null, ScoreboardIdentityRef, Scoreboard, Objective)(onScoreReset);
function onScoreReset(identityRef: ScoreboardIdentityRef, scoreboard: Scoreboard, objective: Objective): boolean {
    const event = new ScoreResetEvent(identityRef, objective);
    const canceled = events.scoreReset.fire(event) === CANCEL;
    decay(identityRef);
    decay(scoreboard);
    if (canceled) {
        scoreboard.sync(identityRef.scoreboardId, objective);
        return false;
    }
    return _onScoreReset(event.identityRef, scoreboard, event.objective);
}

export class ScoreSetEvent {
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

const _onScoreModify = procHacker.hooking("?modifyScoreInObjective@ScoreboardIdentityRef@@QEAA_NAEAHAEAVObjective@@HW4PlayerScoreSetFunction@@@Z", bool_t, null, ScoreboardIdentityRef, StaticPointer, Objective, int32_t, uint8_t)(onScoreModify);
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
    decay(identityRef);
    decay(objective);
    if (canceled) {
        return false;
    }
    return _onScoreModify(event.identityRef, result, event.objective, event.score, mode);
}

export class ObjectiveCreateEvent {
    constructor(
        public name:string,
        public displayName:string,
        public criteria:ObjectiveCriteria,
    ) {
    }
}

const _onObjectiveCreate = procHacker.hooking("?addObjective@Scoreboard@@QEAAPEAVObjective@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@0AEBVObjectiveCriteria@@@Z", Objective, null, Scoreboard, CxxString, CxxString, ObjectiveCriteria)(onObjectiveCreate);
function onObjectiveCreate(scoreboard: Scoreboard, name: CxxString, displayName: CxxString, criteria: ObjectiveCriteria): Objective|null {
    const event = new ObjectiveCreateEvent(name, displayName, criteria);
    const canceled = events.objectiveCreate.fire(event) === CANCEL;
    decay(criteria);
    if (canceled) {
        return null;
    }
    return _onObjectiveCreate(scoreboard, event.name, event.displayName, event.criteria);
}
