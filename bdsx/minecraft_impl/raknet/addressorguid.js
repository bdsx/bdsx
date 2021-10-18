"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../../minecraft");
require("./raknetguid");
require("./systemaddress");
minecraft_1.RakNet.AddressOrGUID.define({
    rakNetGuid: minecraft_1.RakNet.RakNetGUID,
    systemAddress: minecraft_1.RakNet.SystemAddress,
});
minecraft_1.RakNet.AddressOrGUID.prototype.GetSystemIndex = function () {
    const rakNetGuid = this.rakNetGuid;
    if (rakNetGuid.g !== minecraft_1.RakNet.UNASSIGNED_RAKNET_GUID.g) {
        return rakNetGuid.systemIndex;
    }
    else {
        return this.systemAddress.systemIndex;
    }
};
//# sourceMappingURL=addressorguid.js.map