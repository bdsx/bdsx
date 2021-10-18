"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.Vec3.define({
    x: nativetype_1.float32_t,
    y: nativetype_1.float32_t,
    z: nativetype_1.float32_t,
});
minecraft_1.Vec3.create = function (x, y, z) {
    const v = new minecraft_1.Vec3(true);
    v.x = x;
    v.y = y;
    v.z = z;
    return v;
};
minecraft_1.Vec3.prototype.toJSON = function () {
    return { x: this.x, y: this.y, z: this.z };
};
//# sourceMappingURL=vec3.js.map