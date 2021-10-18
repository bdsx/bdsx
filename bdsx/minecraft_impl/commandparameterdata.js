"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.CommandParameterData.define({
    tid: minecraft_1.typeid_t,
    parser: core_1.VoidPointer,
    name: nativetype_1.CxxString,
    desc: core_1.VoidPointer,
    unk56: nativetype_1.int32_t,
    type: nativetype_1.int32_t,
    offset: nativetype_1.int32_t,
    flag_offset: nativetype_1.int32_t,
    optional: nativetype_1.bool_t,
    pad73: nativetype_1.bool_t,
});
//# sourceMappingURL=commandparameterdata.js.map