"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const makefunc_1 = require("../makefunc");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.RelativeFloat[makefunc_1.makefunc.registerDirect] = true;
minecraft_1.RelativeFloat.define({
    value: nativetype_1.float32_t,
    is_relative: nativetype_1.bool_t,
    bin_value: [nativetype_1.bin64_t, 0],
});
minecraft_1.RelativeFloat.create = function (value, is_relative) {
    const v = new minecraft_1.RelativeFloat(true);
    v.value = value;
    v.is_relative = is_relative;
    return v;
};
//# sourceMappingURL=relativefloat.js.map