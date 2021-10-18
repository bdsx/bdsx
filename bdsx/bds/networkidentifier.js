"use strict";
var NetworkIdentifier_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkIdentifier = exports.ServerNetworkHandler = exports.NetworkHandler = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const core_1 = require("../core");
const dll_1 = require("../dll");
const event_1 = require("../event");
const makefunc_1 = require("../makefunc");
const mcglobal_1 = require("../mcglobal");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const source_map_support_1 = require("../source-map-support");
const util_1 = require("../util");
const v3_1 = require("../v3");
const raknet_1 = require("./raknet");
const minecraft = require("../minecraft");
const legacyLink = Symbol('legacy-ni');
/** @deprecated */
class NetworkHandler extends nativeclass_1.NativeClass {
    send(ni, packet, senderSubClientId) {
        (0, common_1.abstract)();
    }
    sendInternal(ni, packet, data) {
        (0, common_1.abstract)();
    }
    getConnectionFromId(ni) {
        (0, common_1.abstract)();
    }
}
exports.NetworkHandler = NetworkHandler;
/** @deprecated */
(function (NetworkHandler) {
    class Connection extends nativeclass_1.NativeClass {
    }
    NetworkHandler.Connection = Connection;
})(NetworkHandler = exports.NetworkHandler || (exports.NetworkHandler = {}));
let ServerNetworkHandler$Client = class ServerNetworkHandler$Client extends nativeclass_1.NativeClass {
};
ServerNetworkHandler$Client = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ServerNetworkHandler$Client);
/** @deprecated */
let ServerNetworkHandler = class ServerNetworkHandler extends nativeclass_1.NativeClass {
    _disconnectClient(client, unknown, message, skipMessage) {
        (0, common_1.abstract)();
    }
    disconnectClient(client, message = "disconnectionScreen.disconnected", skipMessage = false) {
        this._disconnectClient(client, 0, message, skipMessage);
    }
    /**
     * Alias of allowIncomingConnections
     */
    setMotd(motd) {
        this.allowIncomingConnections(motd, true);
    }
    /**
     * @deprecated
     */
    setMaxPlayers(count) {
        this.setMaxNumPlayers(count);
    }
    allowIncomingConnections(motd, b) {
        (0, common_1.abstract)();
    }
    updateServerAnnouncement() {
        (0, common_1.abstract)();
    }
    setMaxNumPlayers(n) {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], ServerNetworkHandler.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString, 0x260)
], ServerNetworkHandler.prototype, "motd", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t, 0x2D8)
], ServerNetworkHandler.prototype, "maxPlayers", void 0);
ServerNetworkHandler = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ServerNetworkHandler);
exports.ServerNetworkHandler = ServerNetworkHandler;
/** @deprecated */
let NetworkIdentifier = NetworkIdentifier_1 = class NetworkIdentifier extends nativeclass_1.NativeClass {
    constructor(allocate) {
        super(allocate);
    }
    assignTo(target) {
        dll_1.dll.vcruntime140.memcpy(target, this, NetworkIdentifier_1[nativeclass_1.NativeClass.contentSize]);
    }
    equals(other) {
        (0, common_1.abstract)();
    }
    hash() {
        (0, common_1.abstract)();
    }
    getActor() {
        (0, common_1.abstract)();
    }
    getAddress() {
        const idx = this.address.GetSystemIndex();
        const rakpeer = exports.networkHandler.instance.peer;
        return rakpeer.GetSystemAddressFromIndex(idx).toString();
    }
    toString() {
        return this.getAddress();
    }
    static fromPointer(ptr) {
        return NetworkIdentifier_1.fromNewNi(minecraft.NetworkIdentifier.fromPointer(ptr));
    }
    static fromNewNi(ptr) {
        const legacy = ptr[legacyLink];
        if (legacy != null)
            return legacy;
        return ptr[legacyLink] = ptr.as(NetworkIdentifier_1);
    }
    static [nativetype_1.NativeType.getter](ptr, offset) {
        const newni = minecraft.NetworkIdentifier[nativetype_1.NativeType.getter](ptr, offset);
        return NetworkIdentifier_1.fromNewNi(newni);
    }
    static [makefunc_1.makefunc.getFromParam](ptr, offset) {
        const newni = minecraft.NetworkIdentifier[makefunc_1.makefunc.getFromParam](ptr, offset);
        return NetworkIdentifier_1.fromNewNi(newni);
    }
    static *all() {
        for (const newid of minecraft.NetworkIdentifier.all()) {
            yield NetworkIdentifier_1.fromNewNi(newid);
        }
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(raknet_1.RakNet.AddressOrGUID)
], NetworkIdentifier.prototype, "address", void 0);
NetworkIdentifier = NetworkIdentifier_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], NetworkIdentifier);
exports.NetworkIdentifier = NetworkIdentifier;
Object.defineProperty(exports, 'networkHandler', {
    get() {
        const networkHandler = mcglobal_1.mcglobal.networkHandler.as(NetworkHandler);
        Object.defineProperty(exports, 'networkHandler', { value: networkHandler });
        return networkHandler;
    },
    configurable: true
});
v3_1.bdsx.events.playerDisconnect.on(ev => {
    try {
        event_1.events.networkDisconnected.fire(NetworkIdentifier.fromNewNi(ev.player.getRawNetworkIdentifier()));
        (0, util_1._tickCallback)();
    }
    catch (err) {
        (0, source_map_support_1.remapAndPrintError)(err);
    }
});
//# sourceMappingURL=networkidentifier.js.map