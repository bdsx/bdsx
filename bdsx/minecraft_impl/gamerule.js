"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.GameRule.Value.define({
    boolVal: [nativetype_1.bool_t, { ghost: true }],
    intVal: [nativetype_1.int32_t, { ghost: true }],
    floatVal: nativetype_1.float32_t,
});
//# sourceMappingURL=gamerule.js.map