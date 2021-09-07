import { DisplaySlot } from "../enums";
import { Objective, PlayerScoreSetFunction, Scoreboard, ScoreboardId } from "../minecraft";
import { int32_t } from "../nativetype";
import { Wrapper } from "../pointer";

declare module "../minecraft" {
    interface Scoreboard {
        sync(id:ScoreboardId, objective:Objective):void;
        addObjective(name:string, displayName:string, criteria:ObjectiveCriteria):Objective;

        /**
         *  @param name currently only 'dummy'
         */
        getCriteria(name:string):ObjectiveCriteria|null;
        getDisplayObjective(displaySlot:DisplaySlot):DisplayObjective|null;
        getObjective(name:string):Objective|null;

        /**
         * @deprecated use getScoreboardId, follow original name
         */
        getActorScoreboardId(actor:Actor):ScoreboardId;

        /**
         * @deprecated use getScoreboardId, follow original name
         */
        getFakePlayerScoreboardId(name:string):ScoreboardId;

        /**
         * @deprecated use getScoreboardId, follow original name
         */
        getPlayerScoreboardId(player:Player):ScoreboardId;

        removeObjective(objective:Objective):boolean;

        clearDisplayObjective(displaySlot:string):Objective|null;

        setDisplayObjective(displaySlot:DisplaySlot, objective:Objective, order:ObjectiveSortOrder):DisplayObjective|null;

        resetPlayerScore(id:ScoreboardId, objective:Objective):void;

        getPlayerScore(id:ScoreboardId, objective:Objective):number|null;

        setPlayerScore(id:ScoreboardId, objective:Objective, value:number):number|null;

        addPlayerScore(id:ScoreboardId, objective:Objective, value:number):number|null;

        removePlayerScore(id:ScoreboardId, objective:Objective, value:number):number|null;
    }
}

Scoreboard.prototype.getPlayerScore = function(id:ScoreboardId, objective:Objective):number|null {
    const score = objective.getPlayerScore(id);
    if (score.valid) {
        const retval = score.value;
        score.destruct();
        return retval;
    }
    score.destruct();
    return null;
};

const Int32Wrapper = Wrapper.make(int32_t);

Scoreboard.prototype.setPlayerScore = function(id:ScoreboardId, objective:Objective, value:number):number|null {
    const result = new Int32Wrapper(true);
    const success = this.getScoreboardIdentityRef(id).modifyScoreInObjective(result, objective, value, PlayerScoreSetFunction.Set);
    this.sync(id, objective);
    return success ? result.value : null;
};

Scoreboard.prototype.addPlayerScore = function(id:ScoreboardId, objective:Objective, value:number):number|null {
    const result = new Int32Wrapper(true);
    const success = this.getScoreboardIdentityRef(id).modifyScoreInObjective(result, objective, value, PlayerScoreSetFunction.Add);
    this.sync(id, objective);
    return success ? result.value : null;
};

Scoreboard.prototype.removePlayerScore = function(id:ScoreboardId, objective:Objective, value:number):number|null {
    const result = new Int32Wrapper(true);
    const success = this.getScoreboardIdentityRef(id).modifyScoreInObjective(result, objective, value, PlayerScoreSetFunction.Subtract);
    this.sync(id, objective);
    return success ? result.value : null;
};
