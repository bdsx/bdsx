"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.Objective.abstract({
    name: [nativetype_1.CxxString, 0x40],
    displayName: nativetype_1.CxxString,
    criteria: minecraft_1.ObjectiveCriteria.ref(),
});
//# sourceMappingURL=objective.js.map