"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const dnf_1 = require("../dnf");
const makefunc_1 = require("../makefunc");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const ready_1 = require("./ready");
minecraft_1.CommandOrigin.abstract({
    vftable: core_1.VoidPointer,
    uuid: minecraft_1.mce.UUID,
    level: minecraft_1.ServerLevel.ref(),
});
minecraft_1.CommandOrigin.prototype.isServerCommandOrigin = function () {
    return this.vftable.equals(minecraft_1.ServerCommandOrigin.addressof_vftable);
};
minecraft_1.CommandOrigin.prototype.isScriptCommandOrigin = function () {
    return this.vftable.equals(minecraft_1.ScriptCommandOrigin.addressof_vftable);
};
// void destruct(CommandOrigin* origin);
minecraft_1.CommandOrigin.prototype.destruct = makefunc_1.makefunc.js([0x00], nativetype_1.void_t, { this: minecraft_1.CommandOrigin });
// std::string CommandOrigin::getRequestId();
minecraft_1.CommandOrigin.prototype.getRequestId = makefunc_1.makefunc.js([0x08], nativetype_1.CxxString, { this: minecraft_1.CommandOrigin, structureReturn: true });
// std::string CommandOrigin::getName();
minecraft_1.CommandOrigin.prototype.getName = makefunc_1.makefunc.js([0x10], nativetype_1.CxxString, { this: minecraft_1.CommandOrigin, structureReturn: true });
// BlockPos CommandOrigin::getBlockPosition();
minecraft_1.CommandOrigin.prototype.getBlockPosition = makefunc_1.makefunc.js([0x18], minecraft_1.BlockPos, { this: minecraft_1.CommandOrigin, structureReturn: true });
// Vec3 getWorldPosition(CommandOrigin* origin);
minecraft_1.CommandOrigin.prototype.getWorldPosition = makefunc_1.makefunc.js([0x20], minecraft_1.Vec3, { this: minecraft_1.CommandOrigin, structureReturn: true });
// Level* getLevel(CommandOrigin* origin);
minecraft_1.CommandOrigin.prototype.getLevel = makefunc_1.makefunc.js([0x28], minecraft_1.Level, { this: minecraft_1.CommandOrigin });
// Dimension* (*getDimension)(CommandOrigin* origin);
minecraft_1.CommandOrigin.prototype.getDimension = makefunc_1.makefunc.js([0x30], minecraft_1.Dimension, { this: minecraft_1.CommandOrigin });
// Actor* getEntity(CommandOrigin* origin);
minecraft_1.CommandOrigin.prototype.getEntity = makefunc_1.makefunc.js([0x38], minecraft_1.Actor, { this: minecraft_1.CommandOrigin });
(0, ready_1.minecraftTsReady)(() => {
    (0, dnf_1.dnf)(minecraft_1.CommandOrigin, 'constructWith').overload(function (vftable, level) {
        this.vftable = vftable;
        this.level = level;
        this.uuid = minecraft_1.mce.UUID.generate();
    }, core_1.VoidPointer, minecraft_1.ServerLevel);
});
//# sourceMappingURL=commandorigin.js.map