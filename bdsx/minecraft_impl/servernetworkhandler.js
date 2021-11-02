"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const dnf_1 = require("../dnf");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const ready_1 = require("./ready");
minecraft_1.ServerNetworkHandler.abstract({
    vftable: core_1.VoidPointer,
    motd: [nativetype_1.CxxString, 0x260],
    maxPlayers: [nativetype_1.int32_t, 0x2D8],
});
/**
 * Alias of allowIncomingConnections
 */
minecraft_1.ServerNetworkHandler.prototype.setMotd = function (motd) {
    this.allowIncomingConnections(motd, true);
};
(0, ready_1.minecraftTsReady)(() => {
    (0, dnf_1.dnf)(minecraft_1.ServerNetworkHandler, 'disconnectClient').overload(function (client) {
        this.disconnectClient(client, 0, 'disconnectionScreen.disconnected', false);
    }, minecraft_1.NetworkIdentifier);
});
//# sourceMappingURL=servernetworkhandler.js.map