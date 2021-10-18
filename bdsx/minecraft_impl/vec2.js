"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.Vec2.define({
    x: nativetype_1.float32_t,
    y: nativetype_1.float32_t,
});
minecraft_1.Vec2.create = function (x, y) {
    const v = new minecraft_1.Vec2(true);
    v.x = x;
    v.y = y;
    return v;
};
minecraft_1.Vec2.prototype.toJSON = function () {
    return { x: this.x, y: this.y };
};
//# sourceMappingURL=vec2.js.map