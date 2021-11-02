"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNetworkIdentifierReference = void 0;
const dll_1 = require("../dll");
const hashset_1 = require("../hashset");
const makefunc_1 = require("../makefunc");
const minecraft_1 = require("../minecraft");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
require("./raknet/addressorguid");
const identifiers = new hashset_1.HashSet();
minecraft_1.NetworkIdentifier.define({
    address: minecraft_1.RakNet.AddressOrGUID
});
minecraft_1.NetworkIdentifier.prototype.assignTo = function (target) {
    dll_1.dll.vcruntime140.memcpy(target, this, minecraft_1.NetworkIdentifier[nativeclass_1.NativeClass.contentSize]);
};
minecraft_1.NetworkIdentifier.prototype.getAddress = function () {
    const idx = this.address.GetSystemIndex();
    const rakpeer = minecraft_1.networkHandler.instance.peer;
    return rakpeer.GetSystemAddressFromIndex(idx).toString();
};
minecraft_1.NetworkIdentifier.prototype.toString = function () {
    return this.getAddress();
};
minecraft_1.NetworkIdentifier.fromPointer = function (ptr) {
    return identifiers.get(ptr.as(minecraft_1.NetworkIdentifier));
};
minecraft_1.NetworkIdentifier[nativetype_1.NativeType.getter] = function (ptr, offset) {
    return _singletoning(ptr.addAs(minecraft_1.NetworkIdentifier, offset, offset >> 31));
};
minecraft_1.NetworkIdentifier[makefunc_1.makefunc.getFromParam] = function (ptr, offset) {
    return _singletoning(ptr.getPointerAs(minecraft_1.NetworkIdentifier, offset));
};
minecraft_1.NetworkIdentifier.all = function () {
    return identifiers.values();
};
function _singletoning(ptr) {
    let ni = identifiers.get(ptr);
    if (ni != null)
        return ni;
    ni = new minecraft_1.NetworkIdentifier(true);
    ptr.assignTo(ni);
    identifiers.add(ni);
    return ni;
}
/**
 * @internal
 */
function removeNetworkIdentifierReference(ni) {
    setTimeout(() => {
        identifiers.delete(ni);
    }, 3000).unref();
}
exports.removeNetworkIdentifierReference = removeNetworkIdentifierReference;
//# sourceMappingURL=networkidentifier.js.map