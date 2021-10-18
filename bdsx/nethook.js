"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nethook = void 0;
const networkidentifier_1 = require("./bds/networkidentifier");
const event_1 = require("./event");
const minecraft_1 = require("./minecraft");
const util_1 = require("./util");
const minecraft = require("./minecraft");
var nethook;
(function (nethook) {
    /**
     * Write all packets to console
     */
    function watchAll(exceptions = [
        minecraft_1.MinecraftPacketIds.ClientCacheBlobStatus,
        minecraft_1.MinecraftPacketIds.LevelChunk,
        minecraft_1.MinecraftPacketIds.ClientCacheMissResponse,
        minecraft_1.MinecraftPacketIds.MoveActorDelta,
        minecraft_1.MinecraftPacketIds.SetActorMotion,
        minecraft_1.MinecraftPacketIds.SetActorData,
    ]) {
        const ex = new Set(exceptions);
        for (let i = 1; i <= 0xa3; i++) {
            if (ex.has(i))
                continue;
            event_1.events.packetBefore(i).on((ptr, ni, id) => {
                console.log(`R ${minecraft_1.MinecraftPacketIds[id]}(${id}) ${(0, util_1.hex)(ptr.getBuffer(0x10, 0x28))}`);
            });
        }
        for (let i = 1; i <= 0xa3; i++) {
            if (ex.has(i))
                continue;
            event_1.events.packetSend(i).on((ptr, ni, id) => {
                console.log(`S ${minecraft_1.MinecraftPacketIds[id]}(${id}) ${(0, util_1.hex)(ptr.getBuffer(0x10, 0x28))}`);
            });
        }
    }
    nethook.watchAll = watchAll;
})(nethook = exports.nethook || (exports.nethook = {}));
Object.defineProperty(nethook, 'lastSender', {
    get() {
        const sender = minecraft.NetworkIdentifier.lastSender;
        return networkidentifier_1.NetworkIdentifier.fromNewNi(sender);
    }
});
//# sourceMappingURL=nethook.js.map