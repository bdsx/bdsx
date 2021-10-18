"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplashPotionEffectSubcomponent = exports.OnHitSubcomponent = exports.ProjectileComponent = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const core_1 = require("../core");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
let ProjectileComponent = class ProjectileComponent extends nativeclass_1.NativeClass {
};
ProjectileComponent = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ProjectileComponent);
exports.ProjectileComponent = ProjectileComponent;
/** @deprecated */
let OnHitSubcomponent = class OnHitSubcomponent extends nativeclass_1.NativeClass {
    readfromJSON(json) {
        (0, common_1.abstract)();
    }
    writetoJSON(json) {
        (0, common_1.abstract)();
    }
    _getName() {
        (0, common_1.abstract)();
    }
    getName() {
        return this._getName().getString();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], OnHitSubcomponent.prototype, "vftable", void 0);
OnHitSubcomponent = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x08)
], OnHitSubcomponent);
exports.OnHitSubcomponent = OnHitSubcomponent;
/** @deprecated */
let SplashPotionEffectSubcomponent = class SplashPotionEffectSubcomponent extends OnHitSubcomponent {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], SplashPotionEffectSubcomponent.prototype, "potionEffect", void 0);
SplashPotionEffectSubcomponent = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SplashPotionEffectSubcomponent);
exports.SplashPotionEffectSubcomponent = SplashPotionEffectSubcomponent;
//# sourceMappingURL=components.js.map