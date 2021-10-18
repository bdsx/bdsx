"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerCommandOrigin = exports.ScriptCommandOrigin = exports.PlayerCommandOrigin = exports.CommandOrigin = void 0;
const tslib_1 = require("tslib");
const capi_1 = require("../capi");
const common_1 = require("../common");
const core_1 = require("../core");
const makefunc_1 = require("../makefunc");
const mce_1 = require("../mce");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const actor_1 = require("./actor");
const blockpos_1 = require("./blockpos");
const connreq_1 = require("./connreq");
const dimension_1 = require("./dimension");
const level_1 = require("./level");
const symbols_1 = require("./symbols");
const minecraft = require("../minecraft");
/** @deprecated */
let CommandOrigin = class CommandOrigin extends nativeclass_1.NativeClass {
    constructWith(vftable, level) {
        this.vftable = vftable;
        this.level = level;
        this.uuid = mce_1.mce.UUID.generate();
    }
    isServerCommandOrigin() {
        return this.vftable.equals(ServerCommandOrigin_vftable);
    }
    isScriptCommandOrigin() {
        return this.vftable.equals(ScriptCommandOrigin_vftable);
    }
    getRequestId() {
        (0, common_1.abstract)();
    }
    getName() {
        (0, common_1.abstract)();
    }
    getBlockPosition() {
        (0, common_1.abstract)();
    }
    getWorldPosition() {
        (0, common_1.abstract)();
    }
    getLevel() {
        (0, common_1.abstract)();
    }
    /**
     * actually, it's nullable when the server is just started without any joining
     */
    getDimension() {
        (0, common_1.abstract)();
    }
    /**
     * it returns null if the command origin is the console
     */
    getEntity() {
        (0, common_1.abstract)();
    }
    /**
     * return the command result
     */
    handleCommandOutputCallback(value) {
        const v = capi_1.capi.malloc(connreq_1.JsonValue[nativetype_1.NativeType.size]).as(connreq_1.JsonValue);
        v.constructWith(value);
        handleCommandOutputCallback.call(this, v);
        v.destruct();
        capi_1.capi.free(v);
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], CommandOrigin.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(mce_1.mce.UUID)
], CommandOrigin.prototype, "uuid", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(level_1.ServerLevel.ref())
], CommandOrigin.prototype, "level", void 0);
CommandOrigin = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CommandOrigin);
exports.CommandOrigin = CommandOrigin;
let PlayerCommandOrigin = class PlayerCommandOrigin extends CommandOrigin {
};
PlayerCommandOrigin = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerCommandOrigin);
exports.PlayerCommandOrigin = PlayerCommandOrigin;
let ScriptCommandOrigin = class ScriptCommandOrigin extends PlayerCommandOrigin {
};
ScriptCommandOrigin = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ScriptCommandOrigin);
exports.ScriptCommandOrigin = ScriptCommandOrigin;
/** @deprecated */
let ServerCommandOrigin = class ServerCommandOrigin extends CommandOrigin {
    constructWith(str, serverLevel, commandPermissionLevel, dim) {
        (0, common_1.abstract)();
    }
};
ServerCommandOrigin = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x58)
], ServerCommandOrigin);
exports.ServerCommandOrigin = ServerCommandOrigin;
const ServerCommandOrigin_vftable = symbols_1.proc["ServerCommandOrigin::`vftable'"];
const ScriptCommandOrigin_vftable = symbols_1.proc["ScriptCommandOrigin::`vftable'"];
ServerCommandOrigin.prototype.constructWith = minecraft.ServerCommandOrigin.prototype.constructWith;
// void destruct(CommandOrigin* origin);
CommandOrigin.prototype.destruct = makefunc_1.makefunc.js([0x00], nativetype_1.void_t, { this: CommandOrigin });
// std::string CommandOrigin::getRequestId();
CommandOrigin.prototype.getRequestId = makefunc_1.makefunc.js([0x08], nativetype_1.CxxString, { this: CommandOrigin, structureReturn: true });
// std::string CommandOrigin::getName();
CommandOrigin.prototype.getName = makefunc_1.makefunc.js([0x10], nativetype_1.CxxString, { this: CommandOrigin, structureReturn: true });
// BlockPos CommandOrigin::getBlockPosition();
CommandOrigin.prototype.getBlockPosition = makefunc_1.makefunc.js([0x18], blockpos_1.BlockPos, { this: CommandOrigin, structureReturn: true });
// Vec3 getWorldPosition(CommandOrigin* origin);
CommandOrigin.prototype.getWorldPosition = makefunc_1.makefunc.js([0x20], blockpos_1.Vec3, { this: CommandOrigin, structureReturn: true });
// Level* getLevel(CommandOrigin* origin);
CommandOrigin.prototype.getLevel = makefunc_1.makefunc.js([0x28], level_1.Level, { this: CommandOrigin });
// Dimension* (*getDimension)(CommandOrigin* origin);
CommandOrigin.prototype.getDimension = makefunc_1.makefunc.js([0x30], dimension_1.Dimension, { this: CommandOrigin });
// Actor* getEntity(CommandOrigin* origin);
CommandOrigin.prototype.getEntity = makefunc_1.makefunc.js([0x38], actor_1.Actor, { this: CommandOrigin });
// void handleCommandOutputCallback(Json::Value &&);
const handleCommandOutputCallback = makefunc_1.makefunc.js([0xc0], nativetype_1.void_t, { this: CommandOrigin }, connreq_1.JsonValue);
//# sourceMappingURL=commandorigin.js.map