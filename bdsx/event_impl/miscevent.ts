import { procHacker } from "../bds/proc";
import { Objective, PlayerScoreSetFunction, Scoreboard, ScoreboardIdentityRef } from "../bds/scoreboard";
import { serverInstance } from "../bds/server";
import { CANCEL } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { events } from "../event";
import { bedrockServer } from "../launcher";
import { bin64_t, bool_t, int32_t, uint8_t } from "../nativetype";
import { CxxStringWrapper } from "../pointer";
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

const _onQueryRegenerate = procHacker.hooking("RakNetServerLocator::announceServer", bin64_t, null, VoidPointer, CxxStringWrapper, CxxStringWrapper, VoidPointer, int32_t, int32_t, bool_t)(onQueryRegenerate);
function onQueryRegenerate(rakNetServerLocator: VoidPointer, motd: CxxStringWrapper, levelname: CxxStringWrapper, gameType: VoidPointer, currentPlayers: number, maxPlayers: number, isJoinableThroughServerScreen: boolean):bin64_t {
    const event = new QueryRegenerateEvent(motd.value, levelname.value, currentPlayers, maxPlayers, isJoinableThroughServerScreen);
    events.queryRegenerate.fire(event);
    motd.value = event.motd;
    levelname.value = event.levelname;
    _tickCallback();
    return _onQueryRegenerate(rakNetServerLocator, motd, levelname, gameType, event.currentPlayers, event.maxPlayers, event.isJoinableThroughServerScreen);
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
