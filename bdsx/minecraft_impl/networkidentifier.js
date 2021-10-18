"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dll_1 = require("../dll");
const hashset_1 = require("../hashset");
const hook_1 = require("../hook");
const makefunc_1 = require("../makefunc");
const minecraft_1 = require("../minecraft");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const util_1 = require("../util");
const events_1 = require("../v3/events");
const playerevent_1 = require("../v3/events/playerevent");
const player_1 = require("../v3/player");
require("./raknet/addressorguid");
const ready_1 = require("./ready");
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
ready_1.minecraftTsReady.promise.then(() => {
    (0, hook_1.hook)(minecraft_1.NetworkHandler, 'onConnectionClosed').call(ni => {
        const player = player_1.Player.fromNetworkIdentifier(ni);
        if (player !== null) {
            const ev = new playerevent_1.PlayerDisconnectEvent(player);
            events_1.events.playerDisconnect.fire(ev);
            (0, util_1._tickCallback)();
        }
        // ni is used after onConnectionClosed. on some message processings.
        // timeout for avoiding the re-allocation
        setTimeout(() => {
            identifiers.delete(ni);
        }, 3000);
    }, { callOriginal: true });
});
//# sourceMappingURL=networkidentifier.js.map