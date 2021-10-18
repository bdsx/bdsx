"use strict";
var IdentityDefinition_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreCommandOperator = exports.PlayerScoreSetFunction = exports.ObjectiveSortOrder = exports.DisplaySlot = exports.ScoreboardIdentityRef = exports.ScoreInfo = exports.ScoreboardId = exports.IdentityDefinition = exports.DisplayObjective = exports.Objective = exports.ObjectiveCriteria = exports.Scoreboard = void 0;
const tslib_1 = require("tslib");
const bin_1 = require("../bin");
const common_1 = require("../common");
const core_1 = require("../core");
const cxxvector_1 = require("../cxxvector");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const actor_1 = require("./actor");
const minecraft = require("../minecraft");
const enums = require("../enums");
/** @deprecated */
class Scoreboard extends nativeclass_1.NativeClass {
    sync(id, objective) {
        (0, common_1.abstract)();
    }
    addObjective(name, displayName, criteria) {
        (0, common_1.abstract)();
    }
    /**
     *  @param name currently only 'dummy'
     */
    getCriteria(name) {
        (0, common_1.abstract)();
    }
    getDisplayObjective(displaySlot) {
        (0, common_1.abstract)();
    }
    getObjectiveNames() {
        (0, common_1.abstract)();
    }
    getObjective(name) {
        (0, common_1.abstract)();
    }
    getObjectives() {
        (0, common_1.abstract)();
    }
    getActorScoreboardId(actor) {
        (0, common_1.abstract)();
    }
    getFakePlayerScoreboardId(name) {
        (0, common_1.abstract)();
    }
    getPlayerScoreboardId(player) {
        (0, common_1.abstract)();
    }
    getScoreboardIdentityRef(id) {
        (0, common_1.abstract)();
    }
    _getScoreboardIdentityRefs(retstr) {
        (0, common_1.abstract)();
    }
    getScoreboardIdentityRefs() {
        const arr = this._getScoreboardIdentityRefs(cxxvector_1.CxxVector.make(ScoreboardIdentityRef).construct());
        const retval = arr.toArray();
        arr.destruct();
        return retval;
    }
    _getTrackedIds(retstr) {
        (0, common_1.abstract)();
    }
    getTrackedIds() {
        const arr = this._getTrackedIds(cxxvector_1.CxxVector.make(ScoreboardId).construct());
        const retval = arr.toArray();
        arr.destruct();
        return retval;
    }
    removeObjective(objective) {
        (0, common_1.abstract)();
    }
    clearDisplayObjective(displaySlot) {
        (0, common_1.abstract)();
    }
    setDisplayObjective(displaySlot, objective, order) {
        (0, common_1.abstract)();
    }
    getPlayerScore(id, objective) {
        const score = objective.getPlayerScore(id);
        if (score.valid) {
            const retval = score.value;
            score.destruct();
            return retval;
        }
        score.destruct();
        return null;
    }
    resetPlayerScore(id, objective) {
        (0, common_1.abstract)();
    }
    setPlayerScore(id, objective, value) {
        const retval = this.getScoreboardIdentityRef(id).modifyScoreInObjective(objective, value, exports.PlayerScoreSetFunction.Set);
        this.sync(id, objective);
        return retval;
    }
    addPlayerScore(id, objective, value) {
        const retval = this.getScoreboardIdentityRef(id).modifyScoreInObjective(objective, value, exports.PlayerScoreSetFunction.Add);
        this.sync(id, objective);
        return retval;
    }
    removePlayerScore(id, objective, value) {
        const retval = this.getScoreboardIdentityRef(id).modifyScoreInObjective(objective, value, exports.PlayerScoreSetFunction.Subtract);
        this.sync(id, objective);
        return retval;
    }
}
exports.Scoreboard = Scoreboard;
/** @deprecated */
exports.ObjectiveCriteria = minecraft.ObjectiveCriteria;
/** @deprecated */
let Objective = class Objective extends nativeclass_1.NativeClass {
    getPlayers() {
        (0, common_1.abstract)();
    }
    getPlayerScore(id) {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString, 0x40)
], Objective.prototype, "name", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], Objective.prototype, "displayName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(exports.ObjectiveCriteria.ref())
], Objective.prototype, "criteria", void 0);
Objective = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], Objective);
exports.Objective = Objective;
let DisplayObjective = class DisplayObjective extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(Objective.ref())
], DisplayObjective.prototype, "objective", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], DisplayObjective.prototype, "order", void 0);
DisplayObjective = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], DisplayObjective);
exports.DisplayObjective = DisplayObjective;
/** @deprecated */
let IdentityDefinition = IdentityDefinition_1 = class IdentityDefinition extends nativeclass_1.NativeClass {
    getEntityId() {
        (0, common_1.abstract)();
    }
    getPlayerId() {
        (0, common_1.abstract)();
    }
    getFakePlayerName() {
        (0, common_1.abstract)();
    }
    getIdentityType() {
        (0, common_1.abstract)();
    }
    getName() {
        switch (this.getIdentityType()) {
            case IdentityDefinition_1.Type.Entity: {
                // BDSX reads int64 as uint64, so we have to manually handle it since ActorUniqueID is signed and negative
                const a = bin_1.bin.sub(bin_1.bin.make64(4294967295, 4294967295), this.getEntityId());
                const b = bin_1.bin.add(a, bin_1.bin.make64(1, 0));
                return "-" + bin_1.bin.toString(b);
            }
            case IdentityDefinition_1.Type.Player: {
                const actor = actor_1.Actor.fromUniqueIdBin(this.getPlayerId());
                if (actor) {
                    return actor.getName();
                }
                else {
                    // Player Offline
                    return null;
                }
            }
            case IdentityDefinition_1.Type.FakePlayer:
                return this.getFakePlayerName();
            default:
                return null;
        }
    }
};
IdentityDefinition = IdentityDefinition_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], IdentityDefinition);
exports.IdentityDefinition = IdentityDefinition;
/** @deprecated */
(function (IdentityDefinition) {
    /** @deprecated */
    IdentityDefinition.Type = minecraft.IdentityDefinition.Type;
})(IdentityDefinition = exports.IdentityDefinition || (exports.IdentityDefinition = {}));
exports.IdentityDefinition = IdentityDefinition;
/** @deprecated */
let ScoreboardId = class ScoreboardId extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
], ScoreboardId.prototype, "id", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int64_as_float_t, 0)
], ScoreboardId.prototype, "idAsNumber", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(IdentityDefinition.ref())
], ScoreboardId.prototype, "identityDef", void 0);
ScoreboardId = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], ScoreboardId);
exports.ScoreboardId = ScoreboardId;
let ScoreInfo = class ScoreInfo extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(Objective.ref())
], ScoreInfo.prototype, "objective", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], ScoreInfo.prototype, "valid", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t, 0x0C)
], ScoreInfo.prototype, "value", void 0);
ScoreInfo = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], ScoreInfo);
exports.ScoreInfo = ScoreInfo;
/** @deprecated */
let ScoreboardIdentityRef = class ScoreboardIdentityRef extends nativeclass_1.NativeClass {
    _modifyScoreInObjective(result, objective, score, action) {
        (0, common_1.abstract)();
    }
    modifyScoreInObjective(objective, score, action) {
        const result = new core_1.AllocatedPointer(4);
        this._modifyScoreInObjective(result, objective, score, action);
        const retval = result.getInt32();
        return retval;
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ScoreboardIdentityRef.prototype, "objectiveReferences", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(ScoreboardId, 0x08)
], ScoreboardIdentityRef.prototype, "scoreboardId", void 0);
ScoreboardIdentityRef = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], ScoreboardIdentityRef);
exports.ScoreboardIdentityRef = ScoreboardIdentityRef;
/** @deprecated  */
exports.DisplaySlot = enums.DisplaySlot;
/** @deprecated */
exports.ObjectiveSortOrder = minecraft.ObjectiveSortOrder;
/** @deprecated */
exports.PlayerScoreSetFunction = minecraft.PlayerScoreSetFunction;
var ScoreCommandOperator;
(function (ScoreCommandOperator) {
    ScoreCommandOperator[ScoreCommandOperator["Equals"] = 1] = "Equals";
    ScoreCommandOperator[ScoreCommandOperator["PlusEquals"] = 2] = "PlusEquals";
    ScoreCommandOperator[ScoreCommandOperator["MinusEquals"] = 3] = "MinusEquals";
    ScoreCommandOperator[ScoreCommandOperator["TimesEquals"] = 4] = "TimesEquals";
    ScoreCommandOperator[ScoreCommandOperator["DivideEquals"] = 5] = "DivideEquals";
    ScoreCommandOperator[ScoreCommandOperator["ModEquals"] = 6] = "ModEquals";
    ScoreCommandOperator[ScoreCommandOperator["MinEquals"] = 7] = "MinEquals";
    ScoreCommandOperator[ScoreCommandOperator["MaxEquals"] = 8] = "MaxEquals";
    ScoreCommandOperator[ScoreCommandOperator["Swap"] = 9] = "Swap";
})(ScoreCommandOperator = exports.ScoreCommandOperator || (exports.ScoreCommandOperator = {}));
//# sourceMappingURL=scoreboard.js.map