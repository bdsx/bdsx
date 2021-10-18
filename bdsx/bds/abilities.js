"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ability = exports.AbilitiesIndex = exports.Abilities = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const minecraft = require("../minecraft");
let Abilities = class Abilities extends nativeclass_1.NativeClass {
    _setAbility(abilityIndex, value) {
        (0, common_1.abstract)();
    }
    getCommandPermissionLevel() {
        (0, common_1.abstract)();
    }
    getPlayerPermissionLevel() {
        (0, common_1.abstract)();
    }
    setCommandPermissionLevel(commandPermissionLevel) {
        (0, common_1.abstract)();
    }
    setPlayerPermissionLevel(playerPermissionLevel) {
        (0, common_1.abstract)();
    }
    getAbility(abilityIndex) {
        (0, common_1.abstract)();
    }
    setAbility(abilityIndex, value) {
        switch (typeof value) {
            case "boolean":
                this._setAbility(abilityIndex, value);
                break;
            case "number":
                this.getAbility(abilityIndex).setFloat(value);
                break;
        }
    }
    static getAbilityName(abilityIndex) {
        (0, common_1.abstract)();
    }
    static nameToAbilityIndex(name) {
        (0, common_1.abstract)();
    }
};
Abilities = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x140)
], Abilities);
exports.Abilities = Abilities;
/** @deprecated */
exports.AbilitiesIndex = minecraft.AbilitiesIndex;
class Ability extends nativeclass_1.NativeClass {
    getBool() {
        (0, common_1.abstract)();
    }
    getFloat() {
        (0, common_1.abstract)();
    }
    setBool(value) {
        (0, common_1.abstract)();
    }
    setFloat(value) {
        this.type = Ability.Type.Float;
        this.setFloat32(value, 0x04);
    }
    getValue() {
        switch (this.type) {
            case Ability.Type.Unset:
                return undefined;
            case Ability.Type.Bool:
                return this.getBool();
            case Ability.Type.Float:
                return this.getFloat();
        }
    }
    setValue(value) {
        switch (typeof value) {
            case "boolean":
                this.setBool(value);
                break;
            case "number":
                this.setFloat(value);
                break;
        }
    }
}
exports.Ability = Ability;
(function (Ability) {
    /** @deprecated */
    Ability.Type = minecraft.Ability.Type;
    /** @deprecated */
    Ability.Options = minecraft.Ability.Options;
    let Value = class Value extends nativeclass_1.NativeClass {
    };
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.bool_t, { ghost: true })
    ], Value.prototype, "boolVal", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
    ], Value.prototype, "floatVal", void 0);
    Value = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)()
    ], Value);
    Ability.Value = Value;
})(Ability = exports.Ability || (exports.Ability = {}));
//# sourceMappingURL=abilities.js.map