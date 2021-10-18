"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopbackPacketSender = void 0;
const tslib_1 = require("tslib");
const nativeclass_1 = require("../nativeclass");
const networkidentifier_1 = require("./networkidentifier");
let LoopbackPacketSender = class LoopbackPacketSender extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(networkidentifier_1.NetworkHandler.ref(), 8)
], LoopbackPacketSender.prototype, "networkHandler", void 0);
LoopbackPacketSender = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LoopbackPacketSender);
exports.LoopbackPacketSender = LoopbackPacketSender;
//# sourceMappingURL=loopbacksender.js.map