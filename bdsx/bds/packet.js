"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPacketRaw = exports.PacketSharedPtr = exports.Packet = exports.ExtendedStreamReadResult = exports.StreamReadResult = exports.PacketReadResult = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const sharedpointer_1 = require("../sharedpointer");
const minecraft = require("../minecraft");
const hook_1 = require("../hook");
/** @deprecated */
exports.PacketReadResult = nativetype_1.uint32_t.extends({
    PacketReadNoError: 0,
    PacketReadError: 1,
});
/** @deprecated */
exports.StreamReadResult = nativetype_1.int32_t.extends({
    Disconnect: 0,
    Pass: 1,
    Warning: 2,
    Ignore: 0x7f,
});
/** @deprecated */
let ExtendedStreamReadResult = class ExtendedStreamReadResult extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(exports.StreamReadResult)
], ExtendedStreamReadResult.prototype, "streamReadResult", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], ExtendedStreamReadResult.prototype, "dummy", void 0);
ExtendedStreamReadResult = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ExtendedStreamReadResult);
exports.ExtendedStreamReadResult = ExtendedStreamReadResult;
const sharedptr_of_packet = Symbol('sharedptr');
/** @deprecated */
let Packet = class Packet extends nativeclass_1.MantleClass {
    getId() {
        (0, common_1.abstract)();
    }
    getName() {
        (0, common_1.abstract)();
    }
    write(stream) {
        (0, common_1.abstract)();
    }
    read(stream) {
        (0, common_1.abstract)();
    }
    readExtended(read, stream) {
        (0, common_1.abstract)();
    }
    /**
     * same with target.send
     */
    sendTo(target, unknownarg) {
        (0, common_1.abstract)();
    }
    dispose() {
        this[sharedptr_of_packet].dispose();
        this[sharedptr_of_packet] = null;
    }
    static create() {
        const id = this.ID;
        if (id === undefined)
            throw Error('Packet class is abstract, please use named class instead (ex. LoginPacket)');
        const cls = sharedpointer_1.SharedPtr.make(this);
        const sharedptr = new cls(true);
        (0, exports.createPacketRaw)(sharedptr, id);
        const packet = sharedptr.p;
        if (packet === null)
            throw Error(`${this.name} is not created`);
        packet[sharedptr_of_packet] = sharedptr;
        return packet;
    }
};
Packet = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x30)
], Packet);
exports.Packet = Packet;
/** @deprecated */
exports.PacketSharedPtr = sharedpointer_1.SharedPtr.make(Packet);
/** @deprecated */
exports.createPacketRaw = (0, hook_1.hook)(minecraft.MinecraftPackets.createPacket).reform(exports.PacketSharedPtr, null, exports.PacketSharedPtr, nativetype_1.int32_t);
//# sourceMappingURL=packet.js.map