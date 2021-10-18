"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.MobEffectInstance.define({
    id: nativetype_1.uint32_t,
    duration: nativetype_1.int32_t,
    durationEasy: nativetype_1.int32_t,
    durationNormal: nativetype_1.int32_t,
    durationHard: nativetype_1.int32_t,
    amplifier: nativetype_1.int32_t,
    displayAnimation: nativetype_1.bool_t,
    ambient: nativetype_1.bool_t,
    noCounter: nativetype_1.bool_t,
    showParticles: nativetype_1.bool_t,
}, 0x80);
//# sourceMappingURL=mobeffectinstance.js.map