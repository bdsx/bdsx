"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const pointer_1 = require("../pointer");
minecraft_1.Scoreboard.prototype.getPlayerScore = function (id, objective) {
    const score = objective.getPlayerScore(id);
    if (score.valid) {
        const retval = score.value;
        score.destruct();
        return retval;
    }
    score.destruct();
    return null;
};
const Int32Wrapper = pointer_1.Wrapper.make(nativetype_1.int32_t);
minecraft_1.Scoreboard.prototype.setPlayerScore = function (id, objective, value) {
    const result = new Int32Wrapper(true);
    const success = this.getScoreboardIdentityRef(id).modifyScoreInObjective(result, objective, value, minecraft_1.PlayerScoreSetFunction.Set);
    this.sync(id, objective);
    return success ? result.value : null;
};
minecraft_1.Scoreboard.prototype.addPlayerScore = function (id, objective, value) {
    const result = new Int32Wrapper(true);
    const success = this.getScoreboardIdentityRef(id).modifyScoreInObjective(result, objective, value, minecraft_1.PlayerScoreSetFunction.Add);
    this.sync(id, objective);
    return success ? result.value : null;
};
minecraft_1.Scoreboard.prototype.removePlayerScore = function (id, objective, value) {
    const result = new Int32Wrapper(true);
    const success = this.getScoreboardIdentityRef(id).modifyScoreInObjective(result, objective, value, minecraft_1.PlayerScoreSetFunction.Subtract);
    this.sync(id, objective);
    return success ? result.value : null;
};
//# sourceMappingURL=scoreboard.js.map