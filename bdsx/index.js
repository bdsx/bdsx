//@ts-check
/**
 * @deprecated bdsx/index.ts will be deleted
 */
"use strict";

console.trace(colors.red(`[BDSX] bdsx/index.js will be deleted. please import from each modules`));

const { analyzer } = require("./analyzer");
exports.analyzer = analyzer;
const { Actor, DimensionId } = require("./bds/actor");
exports.Actor = Actor;
exports.DimensionId = DimensionId;
exports.AttributeId = require("./bds/attribute").AttributeId;
require("./bds/enumfiller");
exports.NetworkIdentifier = require("./bds/networkidentifier").NetworkIdentifier;
const { MinecraftPacketIds } = require("./bds/packetids");
exports.MinecraftPacketIds = MinecraftPacketIds;
exports.ServerPlayer = require("./bds/player").ServerPlayer;
exports.serverInstance = require("./bds/server").serverInstance;
exports.bin = require("./bin").bin;
exports.capi = require("./capi").capi;
const command_1 = require("./command");
exports.command = command_1.command;
const dll_1 = require("./dll");
exports.NativeModule = dll_1.NativeModule;
const launcher_1 = require("./launcher");
exports.bedrockServer = launcher_1.bedrockServer;
const legacy_1 = require("./legacy");
const nethook_1 = require("./nethook");
exports.nethook = nethook_1.nethook;
const servercontrol_1 = require("./servercontrol");
exports.serverControl = servercontrol_1.serverControl;
const sharedpointer_1 = require("./sharedpointer");
exports.SharedPtr = sharedpointer_1.SharedPtr;
const util_1 = require("./util");
const common = require("./common");
const makefunc = require("./makefunc");
const core = require("./core");
const netevent = require("./netevent");
exports.netevent = netevent;
const chat = require("./chat");
exports.chat = chat;
const nativetype = require("./nativetype");
exports.nativetype = nativetype;
const native = require("./native");
exports.native = native;
const colors = require("colors");
exports.VoidPointer = core.VoidPointer;
exports.StaticPointer = core.StaticPointer;
exports.NativePointer = core.NativePointer;
exports.ipfilter = core.ipfilter;
exports.jshook = core.jshook;
exports.createPacket = nethook_1.nethook.createPacket;
exports.sendPacket = nethook_1.nethook.sendPacket;
exports.CANCEL = common.CANCEL;
exports.RawTypeId = makefunc.RawTypeId;
exports.PacketId = MinecraftPacketIds;
require('./common')['RawTypeId'] = makefunc.RawTypeId;
exports.NativePointer.prototype['readHex'] = function (size, nextLinePer = 16) {
    return util_1.hex(this.readBuffer(size), nextLinePer);
};
exports.NativePointer.prototype['analyze'] = function () {
    return analyzer.analyze(this);
};
core['makefunc'] = makefunc.makefunc;
exports.setOnRuntimeErrorListener = legacy_1.legacy.setOnRuntimeErrorListener;
exports.setOnErrorListener = native.setOnErrorListener;
exports.loadMap = analyzer.loadMap;
