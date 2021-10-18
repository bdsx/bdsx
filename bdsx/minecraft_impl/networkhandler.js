"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const minecraft_1 = require("../minecraft");
minecraft_1.NetworkHandler.abstract({
    vftable: core_1.VoidPointer,
    instance: [minecraft_1.RakNetInstance.ref(), 0x48]
});
//# sourceMappingURL=networkhandler.js.map