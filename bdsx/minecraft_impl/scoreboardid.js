"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.ScoreboardId.define({
    id: nativetype_1.bin64_t,
    idAsNumber: nativetype_1.int64_as_float_t,
    identityDef: minecraft_1.IdentityDefinition.ref(),
});
//# sourceMappingURL=scoreboardid.js.map