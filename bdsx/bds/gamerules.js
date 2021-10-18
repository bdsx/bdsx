"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRule = exports.GameRules = exports.GameRuleId = void 0;
const common_1 = require("../common");
const nativeclass_1 = require("../nativeclass");
const minecraft = require("../minecraft");
var GameRuleId;
(function (GameRuleId) {
    GameRuleId[GameRuleId["CommandBlockOutput"] = 0] = "CommandBlockOutput";
    GameRuleId[GameRuleId["DoDaylightCycle"] = 1] = "DoDaylightCycle";
    GameRuleId[GameRuleId["DoEntityDrops"] = 2] = "DoEntityDrops";
    GameRuleId[GameRuleId["DoFireTick"] = 3] = "DoFireTick";
    GameRuleId[GameRuleId["DoMobLoot"] = 4] = "DoMobLoot";
    GameRuleId[GameRuleId["DoMobSpawning"] = 5] = "DoMobSpawning";
    GameRuleId[GameRuleId["DoTileDrops"] = 6] = "DoTileDrops";
    GameRuleId[GameRuleId["DoWeatherCycle"] = 7] = "DoWeatherCycle";
    GameRuleId[GameRuleId["DrowningDamage"] = 8] = "DrowningDamage";
    GameRuleId[GameRuleId["FallDamage"] = 9] = "FallDamage";
    GameRuleId[GameRuleId["FireDamage"] = 10] = "FireDamage";
    GameRuleId[GameRuleId["KeepInventory"] = 11] = "KeepInventory";
    GameRuleId[GameRuleId["MobGriefing"] = 12] = "MobGriefing";
    GameRuleId[GameRuleId["Pvp"] = 13] = "Pvp";
    GameRuleId[GameRuleId["ShowCoordinates"] = 14] = "ShowCoordinates";
    GameRuleId[GameRuleId["NaturalRegeneration"] = 15] = "NaturalRegeneration";
    GameRuleId[GameRuleId["TntExplodes"] = 16] = "TntExplodes";
    GameRuleId[GameRuleId["SendCommandFeedback"] = 17] = "SendCommandFeedback";
    GameRuleId[GameRuleId["MaxCommandChainLength"] = 18] = "MaxCommandChainLength";
    GameRuleId[GameRuleId["DoInsomnia"] = 19] = "DoInsomnia";
    GameRuleId[GameRuleId["CommandBlocksEnabled"] = 20] = "CommandBlocksEnabled";
    GameRuleId[GameRuleId["RandomTickSpeed"] = 21] = "RandomTickSpeed";
    GameRuleId[GameRuleId["DoImmediateRespawn"] = 22] = "DoImmediateRespawn";
    GameRuleId[GameRuleId["ShowDeathMessages"] = 23] = "ShowDeathMessages";
    GameRuleId[GameRuleId["FunctionCommandLimit"] = 24] = "FunctionCommandLimit";
    GameRuleId[GameRuleId["SpawnRadius"] = 25] = "SpawnRadius";
    GameRuleId[GameRuleId["ShowTags"] = 26] = "ShowTags";
    GameRuleId[GameRuleId["FreezeDamage"] = 27] = "FreezeDamage";
})(GameRuleId = exports.GameRuleId || (exports.GameRuleId = {}));
class GameRules extends nativeclass_1.NativeClass {
    getRule(id) {
        (0, common_1.abstract)();
    }
    hasRule(id) {
        (0, common_1.abstract)();
    }
    setRule(id, value, type) {
        this.getRule(id).setValue(value, type);
    }
    static nameToGameRuleIndex(name) {
        (0, common_1.abstract)();
    }
}
exports.GameRules = GameRules;
class GameRule extends nativeclass_1.NativeClass {
    getBool() {
        (0, common_1.abstract)();
    }
    getInt() {
        (0, common_1.abstract)();
    }
    getFloat() {
        (0, common_1.abstract)();
    }
    setBool(value) {
        this.type = GameRule.Type.Bool;
        this.value.boolVal = value;
    }
    setInt(value) {
        this.type = GameRule.Type.Int;
        this.value.intVal = value;
    }
    setFloat(value) {
        this.type = GameRule.Type.Float;
        this.value.floatVal = value;
    }
    getValue() {
        switch (this.type) {
            case GameRule.Type.Invalid:
                return undefined;
            case GameRule.Type.Bool:
                return this.getBool();
            case GameRule.Type.Int:
                return this.getInt();
            case GameRule.Type.Float:
                return this.getFloat();
        }
    }
    setValue(value, type) {
        switch (type) {
            case GameRule.Type.Bool:
                this.setBool(value);
                break;
            case GameRule.Type.Int:
                this.setInt(value);
                break;
            case GameRule.Type.Float:
                this.setFloat(value);
                break;
            default:
                switch (typeof value) {
                    case "boolean":
                        this.setBool(value);
                        break;
                    case "number":
                        if (Number.isInteger(value)) {
                            this.setInt(value);
                        }
                        else {
                            this.setFloat(value);
                        }
                        break;
                }
        }
    }
}
exports.GameRule = GameRule;
(function (GameRule) {
    /** @deprecated */
    GameRule.Type = minecraft.GameRule.Type;
    /** @deprecated */
    GameRule.Value = minecraft.GameRule.Value;
})(GameRule = exports.GameRule || (exports.GameRule = {}));
//# sourceMappingURL=gamerules.js.map