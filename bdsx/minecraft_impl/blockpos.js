"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.BlockPos.define({
    x: nativetype_1.int32_t,
    y: nativetype_1.uint32_t,
    z: nativetype_1.int32_t,
});
minecraft_1.BlockPos.create = function (x, y, z) {
    const v = new minecraft_1.BlockPos(true);
    v.x = x;
    v.y = y;
    v.z = z;
    return v;
};
minecraft_1.BlockPos.prototype.toJSON = function () {
    return { x: this.x, y: this.y, z: this.z };
};
//# sourceMappingURL=blockpos.js.map