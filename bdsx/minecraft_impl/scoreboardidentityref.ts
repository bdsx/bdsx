import { ScoreboardId, ScoreboardIdentityRef } from "../minecraft";
import { int32_t, uint32_t } from "../nativetype";
import { Wrapper } from "../pointer";

declare module "../minecraft" {
    interface ScoreboardIdentityRef {
        objectiveReferences:uint32_t;
        scoreboardId:ScoreboardId;

        modifyScoreInObjective(result:Wrapper<int32_t>, objective:Objective, score:number, action:PlayerScoreSetFunction):boolean;
    }
}
ScoreboardIdentityRef.define({
    objectiveReferences:uint32_t,
    scoreboardId:ScoreboardId,
});
