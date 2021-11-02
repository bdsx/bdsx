"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const minecraft_1 = require("../minecraft");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
minecraft_1.Command.VFTable = class VFTable extends nativeclass_1.NativeClass {
};
minecraft_1.Command.VFTable.define({
    destructor: core_1.VoidPointer,
    execute: core_1.VoidPointer,
});
minecraft_1.Command.define({
    vftable: minecraft_1.Command.VFTable.ref(),
    u1: nativetype_1.int32_t,
    u2: core_1.VoidPointer,
    u3: nativetype_1.int32_t,
    u4: nativetype_1.int16_t, // 0x1c
});
//# sourceMappingURL=command.js.map