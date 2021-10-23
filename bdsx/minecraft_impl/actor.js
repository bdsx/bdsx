"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asmcode = require("../asm/asmcode");
const core_1 = require("../core");
const hook_1 = require("../hook");
const makefunc_1 = require("../makefunc");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const ready_1 = require("./ready");
minecraft_1.Actor.abstract({
    vftable: core_1.VoidPointer,
    identifier: [nativetype_1.CxxString, 0x458], // minecraft:player
});
const actorMap = new Map();
const typeMap = new Map();
minecraft_1.Actor.registerType = function (type) {
    typeMap.set(type.__vftable.getAddressBin(), type);
};
minecraft_1.Actor.registerType(minecraft_1.ServerPlayer);
minecraft_1.Actor.registerType(minecraft_1.ItemActor);
function _singletoning(ptr) {
    if (ptr === null)
        return null;
    const binptr = ptr.getAddressBin();
    let actor = actorMap.get(binptr);
    if (actor == null) {
        const vftable = ptr.getBin64();
        actor = ptr.as(typeMap.get(vftable) || minecraft_1.Actor);
        actorMap.set(vftable, actor);
    }
    return actor;
}
minecraft_1.Actor.all = function () {
    return actorMap.values();
};
minecraft_1.Actor[nativetype_1.NativeType.getter] = function (ptr, offset) {
    return _singletoning(ptr.add(offset, offset >> 31));
};
minecraft_1.Actor[makefunc_1.makefunc.getFromParam] = function (stackptr, offset) {
    return _singletoning(stackptr.getNullablePointer(offset));
};
function _removeActor(actor) {
    actorMap.delete(actor.getAddressBin());
}
ready_1.minecraftTsReady.promise.then(() => {
    const Level$removeEntityReferences = (0, hook_1.hook)(minecraft_1.Level, 'removeEntityReferences').call(function (actor, b) {
        _removeActor(actor);
        return Level$removeEntityReferences.call(this, actor, b);
    });
    asmcode.removeActor = makefunc_1.makefunc.np(_removeActor, nativetype_1.void_t, null, minecraft_1.Actor);
    (0, hook_1.hook)(minecraft_1.Actor, nativetype_1.NativeType.dtor).options({ callOriginal: true }).raw(asmcode.actorDestructorHook);
});
//# sourceMappingURL=actor.js.map