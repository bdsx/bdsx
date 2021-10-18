"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const minecraft_1 = require("../minecraft");
minecraft_1.RakNetInstance.define({
    vftable: core_1.VoidPointer,
    peer: [minecraft_1.RakNet.RakPeer.ref(), 0x1e8],
});
//# sourceMappingURL=raknetinstance.js.map