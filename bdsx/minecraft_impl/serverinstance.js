"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const minecraft_1 = require("../minecraft");
minecraft_1.ServerInstance.abstract({
    vftable: core_1.VoidPointer,
    server: [minecraft_1.DedicatedServer.ref(), 0x98],
    minecraft: [minecraft_1.Minecraft.ref(), 0xa0],
    networkHandler: [minecraft_1.NetworkHandler.ref(), 0xa8],
});
//# sourceMappingURL=serverinstance.js.map