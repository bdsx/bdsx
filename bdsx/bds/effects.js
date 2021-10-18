"use strict";
var MobEffectInstance_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobEffectInstance = exports.MobEffect = exports.MobEffectIds = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const minecraft = require("../minecraft");
const enums = require("../enums");
/** @deprecated import it from bdsx/enums */
exports.MobEffectIds = enums.MobEffectIds;
/** @deprecated import it from bdsx/minecraft */
exports.MobEffect = minecraft.MobEffect;
let MobEffectInstance = MobEffectInstance_1 = class MobEffectInstance extends nativeclass_1.NativeClass {
    /**
     * @param duration How many ticks will the effect last (one tick = 0.05s)
     */
    static create(id, duration = 600, amplifier = 0, ambient = false, showParticles = true, displayAnimation = false) {
        const effect = new MobEffectInstance_1(true);
        effect._create(id, duration, amplifier, ambient, showParticles, displayAnimation);
        return effect;
    }
    _create(id, duration, amplifier, ambient, showParticles, displayAnimation) {
        (0, common_1.abstract)();
    }
    getSplashDuration() {
        return this.duration * 0.75;
    }
    getLingerDuration() {
        return this.duration * 0.25;
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], MobEffectInstance.prototype, "id", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], MobEffectInstance.prototype, "duration", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], MobEffectInstance.prototype, "durationEasy", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], MobEffectInstance.prototype, "durationNormal", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], MobEffectInstance.prototype, "durationHard", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], MobEffectInstance.prototype, "amplifier", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], MobEffectInstance.prototype, "displayAnimation", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], MobEffectInstance.prototype, "ambient", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], MobEffectInstance.prototype, "noCounter", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], MobEffectInstance.prototype, "showParticles", void 0);
MobEffectInstance = MobEffectInstance_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], MobEffectInstance);
exports.MobEffectInstance = MobEffectInstance;
//# sourceMappingURL=effects.js.map