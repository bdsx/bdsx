"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchedNetworkPeer = exports.CompressedNetworkPeer = exports.EncryptedNetworkPeer = exports.RaknetNetworkPeer = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const core_1 = require("../core");
const nativeclass_1 = require("../nativeclass");
const sharedpointer_1 = require("../sharedpointer");
const raknet_1 = require("./raknet");
const stream_1 = require("./stream");
let RaknetNetworkPeer = class RaknetNetworkPeer extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], RaknetNetworkPeer.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], RaknetNetworkPeer.prototype, "u1", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], RaknetNetworkPeer.prototype, "u2", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(raknet_1.RakNet.RakPeer.ref())
], RaknetNetworkPeer.prototype, "peer", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(raknet_1.RakNet.AddressOrGUID)
], RaknetNetworkPeer.prototype, "addr", void 0);
RaknetNetworkPeer = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], RaknetNetworkPeer);
exports.RaknetNetworkPeer = RaknetNetworkPeer;
let EncryptedNetworkPeer = class EncryptedNetworkPeer extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(sharedpointer_1.SharedPtr.make(RaknetNetworkPeer))
], EncryptedNetworkPeer.prototype, "peer", void 0);
EncryptedNetworkPeer = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], EncryptedNetworkPeer);
exports.EncryptedNetworkPeer = EncryptedNetworkPeer;
let CompressedNetworkPeer = class CompressedNetworkPeer extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(EncryptedNetworkPeer.ref(), 0x48)
], CompressedNetworkPeer.prototype, "peer", void 0);
CompressedNetworkPeer = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CompressedNetworkPeer);
exports.CompressedNetworkPeer = CompressedNetworkPeer;
let BatchedNetworkPeer = class BatchedNetworkPeer extends nativeclass_1.NativeClass {
    sendPacket(data, reliability, n, n2, compressibility) {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], BatchedNetworkPeer.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(CompressedNetworkPeer.ref())
], BatchedNetworkPeer.prototype, "peer", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(stream_1.BinaryStream)
], BatchedNetworkPeer.prototype, "stream", void 0);
BatchedNetworkPeer = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], BatchedNetworkPeer);
exports.BatchedNetworkPeer = BatchedNetworkPeer;
//# sourceMappingURL=peer.js.map