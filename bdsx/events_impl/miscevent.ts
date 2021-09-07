import { CANCEL, unreachable } from "../common";
import { VoidPointer } from "../core";
import { events } from "../events";
import { hook } from "../hook";
import { bedrockServer } from "../launcher";
import { GameType, Objective, ObjectiveCriteria, PlayerScoreSetFunction, RakNetServerLocator, Scoreboard, ScoreboardIdentityRef, serverInstance } from "../minecraft";
import { bin64_t, bool_t, CxxString, int32_t } from "../nativetype";
import { Wrapper } from "../pointer";
import { _tickCallback } from "../util";

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

events.queryRegenerate.setInstaller(()=>{
    function onQueryRegenerate(this: RakNetServerLocator, motd: string, levelname: string, gameType: GameType, currentPlayers: number, maxPlayers: number, isJoinableThroughServerScreen: boolean):bin64_t {
        const event = new QueryRegenerateEvent(motd, levelname, currentPlayers, maxPlayers, isJoinableThroughServerScreen);
        events.queryRegenerate.fire(event);
        _tickCallback();
        return _onQueryRegenerate.call(this, event.motd, event.levelname, gameType, event.currentPlayers, event.maxPlayers, event.isJoinableThroughServerScreen);
    }
    const _onQueryRegenerate = hook(RakNetServerLocator, 'announceServer').call(onQueryRegenerate);
    bedrockServer.afterOpen().then(() => serverInstance.minecraft.getServerNetworkHandler().updateServerAnnouncement());
});

export class ScoreResetEvent {
    constructor(
        public identityRef:ScoreboardIdentityRef,
        public objective:Objective,
    ) {
    }
}

events.queryRegenerate.setInstaller(()=>{
    function onScoreReset(this: ScoreboardIdentityRef, scoreboard: Scoreboard, objective: Objective): boolean {
        const event = new ScoreResetEvent(this, objective);
        const canceled = events.scoreReset.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            scoreboard.sync(this.scoreboardId, objective);
            return false;
        }
        return _onScoreReset.call(event.identityRef, scoreboard, event.objective);
    }
    const _onScoreReset = hook(ScoreboardIdentityRef, 'removeFromObjective').call(onScoreReset);
});

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

const Int32Wrapper = Wrapper.make(int32_t);
type Int32Wrapper = Wrapper<int32_t>;

let scoreModifyHooked = false;
function hookScoreModify():void {
    if (scoreModifyHooked) return;
    scoreModifyHooked = true;
    function onScoreModify(this: ScoreboardIdentityRef, result: Int32Wrapper, objective: Objective, score: int32_t, mode: PlayerScoreSetFunction): bool_t {
        let event: ScoreSetEvent;
        let canceled: boolean;
        switch (mode) {
        case PlayerScoreSetFunction.Set:
            event = new ScoreSetEvent(this, objective, score);
            canceled = events.scoreSet.fire(event) === CANCEL;
            break;
        case PlayerScoreSetFunction.Add:
            event = new ScoreAddEvent(this, objective, score);
            canceled = events.scoreAdd.fire(event) === CANCEL;
            break;
        case PlayerScoreSetFunction.Subtract:
            event = new ScoreRemoveEvent(this, objective, score);
            canceled = events.scoreRemove.fire(event) === CANCEL;
            break;
        default:
            unreachable();
        }
        _tickCallback();
        if (canceled) {
            return false;
        }
        return _onScoreModify.call(event.identityRef, result, event.objective, event.score, mode);
    }
    const _onScoreModify = hook(ScoreboardIdentityRef, 'modifyScoreInObjective').call(onScoreModify);
}
events.scoreSet.setInstaller(hookScoreModify);
events.scoreAdd.setInstaller(hookScoreModify);
events.scoreRemove.setInstaller(hookScoreModify);

export class ObjectiveCreateEvent {
    constructor(
        public name:string,
        public displayName:string,
        public criteria:ObjectiveCriteria,
    ) {
    }
}

events.objectiveCreate.setInstaller(()=>{
    function onObjectiveCreate(this: Scoreboard, name: CxxString, displayName: CxxString, criteria: ObjectiveCriteria): Objective {
        const event = new ObjectiveCreateEvent(name, displayName, criteria);
        const canceled = events.objectiveCreate.fire(event) === CANCEL;
        _tickCallback();
        if (canceled) {
            return VoidPointer as any;
        }
        return _onObjectiveCreate.call(this, event.name, event.displayName, event.criteria);
    }
    const _onObjectiveCreate = hook(Scoreboard, "addObjective").call(onObjectiveCreate);
});
