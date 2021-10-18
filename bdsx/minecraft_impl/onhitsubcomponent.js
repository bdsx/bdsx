"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const makefunc_1 = require("../makefunc");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.OnHitSubcomponent.define({
    vftable: core_1.VoidPointer,
});
minecraft_1.OnHitSubcomponent.prototype.readfromJSON = makefunc_1.makefunc.js([0x08], nativetype_1.void_t, { this: minecraft_1.OnHitSubcomponent }, minecraft_1.Json.Value);
minecraft_1.OnHitSubcomponent.prototype.writetoJSON = makefunc_1.makefunc.js([0x10], nativetype_1.void_t, { this: minecraft_1.OnHitSubcomponent }, minecraft_1.Json.Value);
minecraft_1.OnHitSubcomponent.prototype.getName = makefunc_1.makefunc.js([0x20], makefunc_1.makefunc.Utf8, { this: minecraft_1.OnHitSubcomponent, structureReturn: true });
//# sourceMappingURL=onhitsubcomponent.js.map