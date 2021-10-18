"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.AttributeInstance.abstract({
    vftable: core_1.VoidPointer,
    u1: core_1.VoidPointer,
    u2: core_1.VoidPointer,
    currentValue: [nativetype_1.float32_t, 0x84],
    minValue: [nativetype_1.float32_t, 0x7C],
    maxValue: [nativetype_1.float32_t, 0x80],
    defaultValue: [nativetype_1.float32_t, 0x78],
});
//# sourceMappingURL=attributeinstance.js.map