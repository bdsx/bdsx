"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const makefunc_1 = require("../makefunc");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.CommandFlag[makefunc_1.makefunc.registerDirect] = true;
minecraft_1.CommandFlag.define({
    value: nativetype_1.int32_t,
});
minecraft_1.CommandFlag.create = function (value) {
    const flag = new minecraft_1.CommandFlag(true);
    flag.value = value;
    return flag;
};
//# sourceMappingURL=commandflag.js.map