"use strict";
/**
 * @deprecated bdsx/index.ts will be deleted
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bedrockServer = exports.analyzer = exports.capi = exports.SharedPtr = exports.AttributeId = exports.DimensionId = exports.bin = exports.NativeModule = exports.nativetype = exports.serverInstance = exports.native = exports.netevent = exports.chat = exports.serverControl = exports.command = exports.nethook = exports.MinecraftPacketIds = exports.ServerPlayer = exports.Actor = exports.NetworkIdentifier = exports.loadMap = exports.setOnErrorListener = exports.setOnRuntimeErrorListener = exports.PacketId = exports.RawTypeId = exports.CANCEL = exports.sendPacket = exports.createPacket = exports.jshook = exports.ipfilter = exports.NativePointer = exports.StaticPointer = exports.VoidPointer = void 0;
const analyzer_1 = require("./analyzer");
Object.defineProperty(exports, "analyzer", { enumerable: true, get: function () { return analyzer_1.analyzer; } });
const actor_1 = require("./bds/actor");
Object.defineProperty(exports, "Actor", { enumerable: true, get: function () { return actor_1.Actor; } });
Object.defineProperty(exports, "DimensionId", { enumerable: true, get: function () { return actor_1.DimensionId; } });
const attribute_1 = require("./bds/attribute");
Object.defineProperty(exports, "AttributeId", { enumerable: true, get: function () { return attribute_1.AttributeId; } });
require("./bds/enumfiller");
const networkidentifier_1 = require("./bds/networkidentifier");
Object.defineProperty(exports, "NetworkIdentifier", { enumerable: true, get: function () { return networkidentifier_1.NetworkIdentifier; } });
const packetids_1 = require("./bds/packetids");
Object.defineProperty(exports, "MinecraftPacketIds", { enumerable: true, get: function () { return packetids_1.MinecraftPacketIds; } });
const player_1 = require("./bds/player");
Object.defineProperty(exports, "ServerPlayer", { enumerable: true, get: function () { return player_1.ServerPlayer; } });
const server_1 = require("./bds/server");
Object.defineProperty(exports, "serverInstance", { enumerable: true, get: function () { return server_1.serverInstance; } });
const bin_1 = require("./bin");
Object.defineProperty(exports, "bin", { enumerable: true, get: function () { return bin_1.bin; } });
const capi_1 = require("./capi");
Object.defineProperty(exports, "capi", { enumerable: true, get: function () { return capi_1.capi; } });
const command_1 = require("./command");
Object.defineProperty(exports, "command", { enumerable: true, get: function () { return command_1.command; } });
const dll_1 = require("./dll");
Object.defineProperty(exports, "NativeModule", { enumerable: true, get: function () { return dll_1.NativeModule; } });
const launcher_1 = require("./launcher");
Object.defineProperty(exports, "bedrockServer", { enumerable: true, get: function () { return launcher_1.bedrockServer; } });
const legacy_1 = require("./legacy");
const nethook_1 = require("./nethook");
Object.defineProperty(exports, "nethook", { enumerable: true, get: function () { return nethook_1.nethook; } });
require("./polyfill");
const servercontrol_1 = require("./servercontrol");
Object.defineProperty(exports, "serverControl", { enumerable: true, get: function () { return servercontrol_1.serverControl; } });
const sharedpointer_1 = require("./sharedpointer");
Object.defineProperty(exports, "SharedPtr", { enumerable: true, get: function () { return sharedpointer_1.SharedPtr; } });
const util_1 = require("./util");
const common = require("./common");
const makefunc = require("./makefunc");
const makefuncModule = require("./makefunc");
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
/** @deprecated use MinecraftPacketIds, matching to the original name  */
exports.PacketId = packetids_1.MinecraftPacketIds;
common.RawTypeId = makefunc.RawTypeId;
exports.NativePointer.prototype.readHex = function (size, nextLinePer = 16) {
    return util_1.hex(this.readBuffer(size), nextLinePer);
};
exports.NativePointer.prototype.analyze = function () {
    return analyzer_1.analyzer.analyze(this);
};
core.makefunc = makefuncModule.makefunc;
/**
 * @deprecated use bedrockServer.close.on
 */
exports.setOnRuntimeErrorListener = legacy_1.legacy.setOnRuntimeErrorListener;
/**
 * Catch global errors.
 * the default error printing is disabled if cb returns false.
 * @deprecated use bedrockServer.error.on
 */
exports.setOnErrorListener = native.setOnErrorListener;
/**
 * @deprecated use analyzer.loadMap
 */
exports.loadMap = analyzer_1.analyzer.loadMap;
console.trace(colors.red(`[BDSX] bdsx/index.ts will be deleted. please import directly`));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7O0dBRUc7OztBQUVILHlDQUFzQztBQWlKbEMseUZBakpLLG1CQUFRLE9BaUpMO0FBaEpaLHVDQUFpRDtBQStIN0Msc0ZBL0hLLGFBQUssT0ErSEw7QUFhTCw0RkE1SVksbUJBQVcsT0E0SVo7QUEzSWYsK0NBQThDO0FBNEkxQyw0RkE1SUssdUJBQVcsT0E0SUw7QUEzSWYsNEJBQTBCO0FBQzFCLCtEQUE0RDtBQTJIeEQsa0dBM0hLLHFDQUFpQixPQTJITDtBQTFIckIsK0NBQXFEO0FBNkhqRCxtR0E3SEssOEJBQWtCLE9BNkhMO0FBNUh0Qix5Q0FBNEM7QUEySHhDLDZGQTNISyxxQkFBWSxPQTJITDtBQTFIaEIseUNBQThDO0FBa0kxQywrRkFsSUssdUJBQWMsT0FrSUw7QUFqSWxCLCtCQUE0QjtBQW9JeEIsb0ZBcElLLFNBQUcsT0FvSUw7QUFuSVAsaUNBQThCO0FBdUkxQixxRkF2SUssV0FBSSxPQXVJTDtBQXRJUix1Q0FBb0M7QUEwSGhDLHdGQTFISyxpQkFBTyxPQTBITDtBQXpIWCwrQkFBcUM7QUFnSWpDLDZGQWhJSyxrQkFBWSxPQWdJTDtBQTlIaEIseUNBQTJDO0FBcUl2Qyw4RkFySUssd0JBQWEsT0FxSUw7QUFwSWpCLHFDQUFrQztBQUNsQyx1Q0FBb0M7QUFvSGhDLHdGQXBISyxpQkFBTyxPQW9ITDtBQW5IWCxzQkFBb0I7QUFDcEIsbURBQWdEO0FBb0g1Qyw4RkFwSEssNkJBQWEsT0FvSEw7QUFuSGpCLG1EQUE0QztBQTZIeEMsMEZBN0hLLHlCQUFTLE9BNkhMO0FBNUhiLGlDQUE2QjtBQUU3QixtQ0FBb0M7QUFDcEMsdUNBQXdDO0FBRXhDLDZDQUE4QztBQUM5QywrQkFBZ0M7QUFDaEMsdUNBQXdDO0FBNkdwQyw0QkFBUTtBQTVHWiwrQkFBZ0M7QUEyRzVCLG9CQUFJO0FBMUdSLDJDQUE0QztBQThHeEMsZ0NBQVU7QUE3R2QsbUNBQW9DO0FBMkdoQyx3QkFBTTtBQTFHVixpQ0FBa0M7QUFFcEIsUUFBQSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUMvQixRQUFBLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ25DLFFBQUEsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDbkMsUUFBQSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUN6QixRQUFBLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3JCLFFBQUEsWUFBWSxHQUFHLGlCQUFPLENBQUMsWUFBWSxDQUFDO0FBQ3BDLFFBQUEsVUFBVSxHQUFHLGlCQUFPLENBQUMsVUFBVSxDQUFDO0FBQ2hDLFFBQUEsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDdkIsUUFBQSxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQztBQUU3Qyx5RUFBeUU7QUFDM0QsUUFBQSxRQUFRLEdBQUcsOEJBQWtCLENBQUM7QUFZNUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO0FBOEN0QyxxQkFBYSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxJQUFXLEVBQUUsY0FBcUIsRUFBRTtJQUMzRSxPQUFPLFVBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ25ELENBQUMsQ0FBQztBQUNGLHFCQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRztJQUM5QixPQUFPLG1CQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQztBQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQztBQUN4Qzs7R0FFRztBQUNVLFFBQUEseUJBQXlCLEdBQUcsZUFBTSxDQUFDLHlCQUF5QixDQUFDO0FBRzFFOzs7O0dBSUc7QUFDVSxRQUFBLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztBQUU1RDs7R0FFRztBQUNVLFFBQUEsT0FBTyxHQUFHLG1CQUFRLENBQUMsT0FBTyxDQUFDO0FBMEJ4QyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsOERBQThELENBQUMsQ0FBQyxDQUFDIn0=