"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../../minecraft");
const nativetype_1 = require("../../nativetype");
const portDelineator = '|'.charCodeAt(0);
minecraft_1.RakNet.SystemAddress.define({
    systemIndex: [nativetype_1.uint16_t, 130]
}, 136);
minecraft_1.RakNet.SystemAddress.toString = function () {
    const dest = Buffer.alloc(128);
    this.ToString(true, dest, portDelineator);
    const len = dest.indexOf(0);
    if (len === -1)
        throw Error('SystemAddress.ToString failed, null character not found');
    return dest.subarray(0, len).toString();
};
//# sourceMappingURL=systemaddress.js.map