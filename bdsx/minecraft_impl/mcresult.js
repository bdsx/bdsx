"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.MCRESULT.define({
    result: nativetype_1.int32_t
});
minecraft_1.MCRESULT.create = function (result) {
    const out = new minecraft_1.MCRESULT(true);
    out.result = result;
    return out;
};
//# sourceMappingURL=mcresult.js.map