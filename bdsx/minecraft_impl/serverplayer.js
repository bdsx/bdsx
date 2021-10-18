"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
minecraft_1.ServerPlayer.setExtends(minecraft_1.Player);
minecraft_1.ServerPlayer.abstract({
    networkIdentifier: [minecraft_1.NetworkIdentifier, 0xa98],
});
//# sourceMappingURL=serverplayer.js.map