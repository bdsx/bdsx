"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializedSkin = exports.TrustedSkinFlag = void 0;
const tslib_1 = require("tslib");
const mce_1 = require("../mce");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const connreq_1 = require("./connreq");
/** Mojang you serious? */
var TrustedSkinFlag;
(function (TrustedSkinFlag) {
    TrustedSkinFlag[TrustedSkinFlag["Unset"] = 0] = "Unset";
    TrustedSkinFlag[TrustedSkinFlag["False"] = 1] = "False";
    TrustedSkinFlag[TrustedSkinFlag["True"] = 2] = "True";
})(TrustedSkinFlag = exports.TrustedSkinFlag || (exports.TrustedSkinFlag = {}));
let SerializedSkin = class SerializedSkin extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SerializedSkin.prototype, "skinId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SerializedSkin.prototype, "playFabId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SerializedSkin.prototype, "resourcePatch", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SerializedSkin.prototype, "geometryName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SerializedSkin.prototype, "defaultGeometryName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(mce_1.mce.Image)
], SerializedSkin.prototype, "skinImage", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(mce_1.mce.Image, 0xC8)
], SerializedSkin.prototype, "capeImage", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(connreq_1.JsonValue, 0x108)
], SerializedSkin.prototype, "geometryData", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(connreq_1.JsonValue)
], SerializedSkin.prototype, "geometryDataMutable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SerializedSkin.prototype, "animationData", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SerializedSkin.prototype, "capeId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], SerializedSkin.prototype, "isPremium", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], SerializedSkin.prototype, "isPersona", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], SerializedSkin.prototype, "isCapeOnClassicSkin", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString, 0x188)
], SerializedSkin.prototype, "armSize", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int8_t, 0x1F8)
], SerializedSkin.prototype, "isTrustedSkin", void 0);
SerializedSkin = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SerializedSkin);
exports.SerializedSkin = SerializedSkin;
//# sourceMappingURL=skin.js.map