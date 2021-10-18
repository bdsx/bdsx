"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.ScoreInfo.define({
    objective: minecraft_1.Objective.ref(),
    valid: nativetype_1.bool_t,
    value: nativetype_1.int32_t,
});
//# sourceMappingURL=scoreinfo.js.map