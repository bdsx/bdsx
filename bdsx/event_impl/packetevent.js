"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const asmcode = require("../asm/asmcode");
const assembler_1 = require("../assembler");
const networkidentifier_1 = require("../bds/networkidentifier");
const packet_1 = require("../bds/packet");
const packets_1 = require("../bds/packets");
const proc_1 = require("../bds/proc");
const common_1 = require("../common");
const core_1 = require("../core");
const event_1 = require("../event");
const launcher_1 = require("../launcher");
const makefunc_1 = require("../makefunc");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const nethook_1 = require("../nethook");
const pointer_1 = require("../pointer");
const sharedpointer_1 = require("../sharedpointer");
const source_map_support_1 = require("../source-map-support");
const util_1 = require("../util");
let ReadOnlyBinaryStream = class ReadOnlyBinaryStream extends nativeclass_1.NativeClass {
    read(dest, size) {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(pointer_1.CxxStringWrapper.ref(), 0x38)
], ReadOnlyBinaryStream.prototype, "data", void 0);
ReadOnlyBinaryStream = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ReadOnlyBinaryStream);
ReadOnlyBinaryStream.prototype.read = makefunc_1.makefunc.js([0x8], nativetype_1.bool_t, { this: ReadOnlyBinaryStream }, core_1.VoidPointer, nativetype_1.int64_as_float_t);
let OnPacketRBP = class OnPacketRBP extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(sharedpointer_1.SharedPtr.make(packet_1.Packet), 0x78)
], OnPacketRBP.prototype, "packet", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(ReadOnlyBinaryStream, 0xc0)
], OnPacketRBP.prototype, "stream", void 0);
OnPacketRBP = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], OnPacketRBP);
let sendInternalOriginal;
function onPacketRaw(rbp, packetId, conn) {
    try {
        const target = event_1.events.packetEvent(event_1.events.PacketEventType.Raw, packetId);
        const ni = conn.networkIdentifier;
        nethook_1.nethook.lastSender = ni;
        if (target !== null && !target.isEmpty()) {
            const s = rbp.stream;
            const data = s.data;
            const rawpacketptr = data.valueptr;
            for (const listener of target.allListeners()) {
                try {
                    const ptr = rawpacketptr.add();
                    if (listener(ptr, data.length, ni, packetId) === common_1.CANCEL) {
                        (0, util_1._tickCallback)();
                        return null;
                    }
                }
                catch (err) {
                    event_1.events.errorFire(err);
                }
            }
            (0, util_1._tickCallback)();
        }
        return (0, packet_1.createPacketRaw)(rbp.packet, packetId);
    }
    catch (err) {
        (0, source_map_support_1.remapAndPrintError)(err);
        return null;
    }
}
function onPacketBefore(result, rbp, packetId) {
    try {
        if (result.streamReadResult !== packet_1.StreamReadResult.Pass)
            return result;
        const target = event_1.events.packetEvent(event_1.events.PacketEventType.Before, packetId);
        if (target !== null && !target.isEmpty()) {
            const packet = rbp.packet.p;
            const ni = nethook_1.nethook.lastSender;
            const TypedPacket = packets_1.PacketIdToType[packetId] || packet_1.Packet;
            const typedPacket = packet.as(TypedPacket);
            for (const listener of target.allListeners()) {
                try {
                    if (listener(typedPacket, ni, packetId) === common_1.CANCEL) {
                        result.streamReadResult = packet_1.StreamReadResult.Ignore;
                        (0, util_1._tickCallback)();
                        return result;
                    }
                }
                catch (err) {
                    event_1.events.errorFire(err);
                }
            }
            (0, util_1._tickCallback)();
        }
    }
    catch (err) {
        (0, source_map_support_1.remapAndPrintError)(err);
    }
    return result;
}
function onPacketAfter(rbp) {
    try {
        const packet = rbp.packet.p;
        const packetId = packet.getId();
        const target = event_1.events.packetEvent(event_1.events.PacketEventType.After, packetId);
        if (target !== null && !target.isEmpty()) {
            const ni = nethook_1.nethook.lastSender;
            const TypedPacket = packets_1.PacketIdToType[packetId] || packet_1.Packet;
            const typedPacket = packet.as(TypedPacket);
            for (const listener of target.allListeners()) {
                try {
                    if (listener(typedPacket, ni, packetId) === common_1.CANCEL)
                        break;
                }
                catch (err) {
                    event_1.events.errorFire(err);
                }
            }
            (0, util_1._tickCallback)();
        }
    }
    catch (err) {
        (0, source_map_support_1.remapAndPrintError)(err);
    }
}
function onPacketSend(handler, ni, packet) {
    try {
        const packetId = packet.getId();
        const target = event_1.events.packetEvent(event_1.events.PacketEventType.Send, packetId);
        if (target !== null && !target.isEmpty()) {
            const TypedPacket = packets_1.PacketIdToType[packetId] || packet_1.Packet;
            const typedPacket = packet.as(TypedPacket);
            for (const listener of target.allListeners()) {
                try {
                    if (listener(typedPacket, ni, packetId) === common_1.CANCEL) {
                        (0, util_1._tickCallback)();
                        return;
                    }
                }
                catch (err) {
                    event_1.events.errorFire(err);
                }
            }
        }
    }
    catch (err) {
        (0, source_map_support_1.remapAndPrintError)(err);
    }
}
function onPacketSendInternal(handler, ni, packet, data) {
    try {
        const packetId = packet.getId();
        const target = event_1.events.packetEvent(event_1.events.PacketEventType.SendRaw, packetId);
        if (target !== null && !target.isEmpty()) {
            for (const listener of target.allListeners()) {
                try {
                    if (listener(data.valueptr, data.length, ni, packetId) === common_1.CANCEL) {
                        (0, util_1._tickCallback)();
                        return;
                    }
                }
                catch (err) {
                    event_1.events.errorFire(err);
                }
            }
        }
    }
    catch (err) {
        (0, source_map_support_1.remapAndPrintError)(err);
    }
    sendInternalOriginal(handler, ni, packet, data);
}
launcher_1.bedrockServer.withLoading().then(() => {
    // hook raw
    asmcode.onPacketRaw = makefunc_1.makefunc.np(onPacketRaw, packet_1.PacketSharedPtr, null, OnPacketRBP, nativetype_1.int32_t, networkidentifier_1.NetworkHandler.Connection);
    proc_1.procHacker.patching('hook-packet-raw', 'NetworkHandler::_sortAndPacketizeEvents', 0x240, asmcode.packetRawHook, assembler_1.Register.rax, true, [
        0x8B, 0xD6,
        0x48, 0x8D, 0x4D, 0x78,
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,
        0x90 // nop
    ], [7, 11]);
    // hook before
    asmcode.onPacketBefore = makefunc_1.makefunc.np(onPacketBefore, packet_1.ExtendedStreamReadResult, null, packet_1.ExtendedStreamReadResult, OnPacketRBP, nativetype_1.int32_t);
    proc_1.procHacker.patching('hook-packet-before', 'NetworkHandler::_sortAndPacketizeEvents', 0x328, asmcode.packetBeforeHook, // original code depended
    assembler_1.Register.rax, true, [
        0x48, 0x8B, 0x01,
        0x4C, 0x8D, 0x85, 0xC0, 0x00, 0x00, 0x00,
        0x48, 0x8D, 0x55, 0xA0,
        0xFF, 0x50, 0x20, // call qword ptr ds:[rax+20]
    ], []);
    // skip packet when result code is 0x7f
    const packetViolationOriginalCode = [
        0x48, 0x89, 0x5C, 0x24, 0x10,
        0x55,
        0x56,
        0x57,
        0x41, 0x54,
        0x41, 0x55,
        0x41, 0x56, // push r14
    ];
    asmcode.PacketViolationHandlerHandleViolationAfter = proc_1.proc['PacketViolationHandler::_handleViolation'].add(packetViolationOriginalCode.length);
    proc_1.procHacker.patching('hook-packet-before-skip', 'PacketViolationHandler::_handleViolation', 0, asmcode.packetBeforeCancelHandling, assembler_1.Register.rax, false, packetViolationOriginalCode, [3, 7, 21, 24]);
    // hook after
    asmcode.onPacketAfter = makefunc_1.makefunc.np(onPacketAfter, nativetype_1.void_t, null, OnPacketRBP, nativetype_1.int32_t);
    proc_1.procHacker.patching('hook-packet-after', 'NetworkHandler::_sortAndPacketizeEvents', 0x48d, asmcode.packetAfterHook, // original code depended
    assembler_1.Register.rax, true, [
        0x48, 0x8B, 0x01,
        0x4C, 0x8D, 0x4D, 0x78,
        0x4C, 0x8B, 0xC6,
        0x49, 0x8B, 0xD6,
        0xFF, 0x50, 0x08, // call qword ptr ds:[rax+8]
    ], []);
    const onPacketSendNp = makefunc_1.makefunc.np(onPacketSend, nativetype_1.void_t, null, networkidentifier_1.NetworkHandler, networkidentifier_1.NetworkIdentifier, packet_1.Packet);
    asmcode.onPacketSend = onPacketSendNp;
    proc_1.procHacker.hookingRawWithCallOriginal('NetworkHandler::send', onPacketSendNp, [assembler_1.Register.rcx, assembler_1.Register.rdx, assembler_1.Register.r8, assembler_1.Register.r9], []);
    proc_1.procHacker.patching('hook-packet-send-all', 'LoopbackPacketSender::sendToClients', 0x90, asmcode.packetSendAllHook, // original code depended
    assembler_1.Register.rax, true, [
        0x49, 0x8B, 0x07,
        0x49, 0x8D, 0x96, 0x20, 0x02, 0x00, 0x00,
        0x49, 0x8B, 0xCF,
        0xFF, 0x50, 0x18, // call qword ptr ds:[rax+18]
    ], []);
    sendInternalOriginal = proc_1.procHacker.hooking('NetworkHandler::_sendInternal', nativetype_1.void_t, null, networkidentifier_1.NetworkHandler, networkidentifier_1.NetworkIdentifier, packet_1.Packet, pointer_1.CxxStringWrapper)(onPacketSendInternal);
});
//# sourceMappingURL=packetevent.js.map