"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const cxxvector_1 = require("../cxxvector");
const minecraft_1 = require("../minecraft");
minecraft_1.Level.abstract({
    vftable: core_1.VoidPointer,
    players: [cxxvector_1.CxxVector.make(minecraft_1.ServerPlayer.ref()), 0x58],
});
//# sourceMappingURL=level.js.map