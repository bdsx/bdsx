//@ts-check
/**
 * @deprecated
 */
"use strict";

const { analyzer } = require("./analyzer");
exports.analyzer = analyzer;
const { Actor, DimensionId } = require("./bds/actor");
exports.Actor = Actor;
exports.DimensionId = DimensionId;
exports.AttributeId = require("./bds/attribute").AttributeId;
exports.NetworkIdentifier = require("./bds/networkidentifier").NetworkIdentifier;
const { MinecraftPacketIds } = require("./bds/packetids");
exports.MinecraftPacketIds = MinecraftPacketIds;
exports.ServerPlayer = require("./bds/player").ServerPlayer;
const server = require("./bds/server");
exports.bin = require("./bin").bin;
exports.capi = require("./capi").capi;
exports.command = require("./command").command;
const dll_1 = require("./dll");
exports.NativeModule = dll_1.NativeModule;
exports.bedrockServer = require("./launcher").bedrockServer;
const { nethook } = require("./nethook");
exports.nethook = nethook;
exports.serverControl = require("./servercontrol").serverControl;
exports.SharedPtr = require("./sharedpointer").SharedPtr;
const { hex } = require("./util");
const common = require("./common");
const makefunc = require("./makefunc");
const core = require("./core");
exports.netevent = require("./netevent");
exports.chat = require("./chat");
exports.nativetype = require("./nativetype");
const native = require("./native");
exports.native = native;
exports.VoidPointer = core.VoidPointer;
exports.StaticPointer = core.StaticPointer;
exports.NativePointer = core.NativePointer;
exports.ipfilter = core.ipfilter;
exports.jshook = core.jshook;
//@ts-ignore
exports.createPacket = nethook.createPacket;
//@ts-ignore
exports.sendPacket = nethook.sendPacket;
exports.CANCEL = common.CANCEL;
//@ts-ignore
exports.RawTypeId = makefunc.RawTypeId;
exports.PacketId = MinecraftPacketIds;
//@ts-ignore
exports.NativePointer.prototype.readHex = function (size, nextLinePer = 16) {
    return hex(this.readBuffer(size), nextLinePer);
};
//@ts-ignore
exports.NativePointer.prototype.analyze = function () {
    return analyzer.analyze(this);
};
exports.setOnRuntimeErrorListener = require("./legacy").legacy.setOnRuntimeErrorListener;
exports.setOnErrorListener = native.setOnErrorListener;
exports.loadMap = analyzer.loadMap;
Object.defineProperties(exports, {
    serverInstance: {
        get(){
            return server.serverInstance;
        }
    }
});
