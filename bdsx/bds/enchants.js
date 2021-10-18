"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnchantUtils = exports.ItemEnchants = exports.EnchantmentInstance = exports.EnchantmentNames = exports.Enchant = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const cxxvector_1 = require("../cxxvector");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const minecraft = require("../minecraft");
/** @deprecated */
var Enchant;
(function (Enchant) {
    /** @deprecated */
    Enchant.Type = minecraft.Enchant.Type;
})(Enchant = exports.Enchant || (exports.Enchant = {}));
/** @deprecated */
exports.EnchantmentNames = minecraft.Enchant.Type;
let EnchantmentInstance = class EnchantmentInstance extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], EnchantmentInstance.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], EnchantmentInstance.prototype, "level", void 0);
EnchantmentInstance = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], EnchantmentInstance);
exports.EnchantmentInstance = EnchantmentInstance;
let ItemEnchants = class ItemEnchants extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ItemEnchants.prototype, "slot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(EnchantmentInstance), 0x08)
], ItemEnchants.prototype, "enchants1", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(EnchantmentInstance))
], ItemEnchants.prototype, "enchants2", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(EnchantmentInstance))
], ItemEnchants.prototype, "enchants3", void 0);
ItemEnchants = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], ItemEnchants);
exports.ItemEnchants = ItemEnchants;
var EnchantUtils;
(function (EnchantUtils) {
    function applyEnchant(itemStack, enchant, level, allowUnsafe) {
        (0, common_1.abstract)();
    }
    EnchantUtils.applyEnchant = applyEnchant;
    function getEnchantLevel(enchant, itemStack) {
        (0, common_1.abstract)();
    }
    EnchantUtils.getEnchantLevel = getEnchantLevel;
    function hasCurse(itemStack) {
        (0, common_1.abstract)();
    }
    EnchantUtils.hasCurse = hasCurse;
    function hasEnchant(enchant, itemStack) {
        (0, common_1.abstract)();
    }
    EnchantUtils.hasEnchant = hasEnchant;
})(EnchantUtils = exports.EnchantUtils || (exports.EnchantUtils = {}));
//# sourceMappingURL=enchants.js.map