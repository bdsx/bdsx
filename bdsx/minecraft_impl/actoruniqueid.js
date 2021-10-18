"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.ActorUniqueID.define({
    value: nativetype_1.bin64_t,
    lowBits: [nativetype_1.int32_t, 0],
    highBits: [nativetype_1.int32_t, 0],
});
minecraft_1.ActorUniqueID.create = function (value, highBits) {
    const out = new minecraft_1.ActorUniqueID(true);
    if (highBits != null) {
        out.lowBits = +value;
        out.highBits = highBits;
    }
    else {
        out.value = value + '';
    }
    return out;
};
minecraft_1.ActorUniqueID.prototype.equals = function (other) {
    return this.lowBits === other.lowBits && this.highBits === other.highBits;
};
//# sourceMappingURL=actoruniqueid.js.map