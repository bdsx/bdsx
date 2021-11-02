"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hook_1 = require("../hook");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const sharedpointer_1 = require("../sharedpointer");
const ready_1 = require("./ready");
(0, ready_1.minecraftTsReady)(() => {
    minecraft_1.MinecraftPackets.createPacketRaw = (0, hook_1.hook)(minecraft_1.MinecraftPackets.createPacket).reform(nativetype_1.void_t, null, sharedpointer_1.SharedPtr.make(minecraft_1.Packet), nativetype_1.int32_t);
});
//# sourceMappingURL=minecraftpackets.js.map