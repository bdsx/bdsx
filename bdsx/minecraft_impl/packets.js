"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.UpdateAttributesPacket.AttributeData.define({
    current: nativetype_1.float32_t,
    min: nativetype_1.float32_t,
    max: nativetype_1.float32_t,
    default: nativetype_1.float32_t,
    name: minecraft_1.HashedString,
}, 0x40);
minecraft_1.UpdateAttributesPacket.AttributeData[nativetype_1.NativeType.ctor] = function () {
    this.min = 0;
    this.max = 0;
    this.current = 0;
    this.default = 0;
};
//# sourceMappingURL=packets.js.map