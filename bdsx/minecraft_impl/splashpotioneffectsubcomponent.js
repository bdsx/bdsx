"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
require("./onhitsubcomponent");
minecraft_1.SplashPotionEffectSubcomponent.setExtends(minecraft_1.OnHitSubcomponent);
minecraft_1.SplashPotionEffectSubcomponent.abstract({
    potionEffect: nativetype_1.int32_t,
});
//# sourceMappingURL=splashpotioneffectsubcomponent.js.map