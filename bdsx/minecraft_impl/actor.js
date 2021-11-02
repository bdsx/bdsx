"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeActorReference = void 0;
const core_1 = require("../core");
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
    if (type.addressof_vftable == null)
        throw Error(`${type.name} does not have addressof_vftable`);
    typeMap.set(type.addressof_vftable.getAddressBin(), type);
};
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
/** @internal */
function removeActorReference(actor) {
    actorMap.delete(actor.getAddressBin());
}
exports.removeActorReference = removeActorReference;
(0, ready_1.minecraftTsReady)(() => {
    minecraft_1.Actor.registerType(minecraft_1.ServerPlayer);
    minecraft_1.Actor.registerType(minecraft_1.ItemActor);
});
//# sourceMappingURL=actor.js.map