"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cxxvector_1 = require("../cxxvector");
const minecraft_1 = require("../minecraft");
require("./level");
minecraft_1.ServerLevel.setExtends(minecraft_1.Level);
minecraft_1.ServerLevel.abstract({
    actors: [cxxvector_1.CxxVector.make(minecraft_1.Actor.ref()), 0x1590],
});
//# sourceMappingURL=serverlevel.js.map