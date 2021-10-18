"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const dll_1 = require("../dll");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const util_1 = require("../util");
minecraft_1.mce.UUID.define({
    v1: nativetype_1.int32_t,
    v2: nativetype_1.uint16_t,
    v3: nativetype_1.uint16_t,
    v4: nativetype_1.bin64_t,
});
minecraft_1.mce.UUID.prototype.toString = function () {
    const ptr = this;
    const n1 = util_1.hex.format(ptr.getInt32(0), 8);
    const n2 = util_1.hex.format(ptr.getInt32(4), 8);
    const n3 = util_1.hex.format(ptr.getInt32(8), 8);
    const n4 = util_1.hex.format(ptr.getInt32(12), 8);
    const u2 = n2.substr(0, 4);
    const u3 = n2.substr(4, 4);
    const u4 = n3.substr(0, 4);
    const u5 = n3.substr(4, 4) + n4;
    return `${n1}-${u2}-${u3}-${u4}-${u5}`;
};
minecraft_1.mce.Blob.define({
    bytes: core_1.StaticPointer,
    size: nativetype_1.uint64_as_float_t,
});
minecraft_1.mce.UUID.prototype.equals = function (other) {
    return dll_1.dll.vcruntime140.memcmp(this, other, 16) === 0;
};
minecraft_1.mce.UUID.generate = function () {
    return minecraft_1.Crypto.Random.generateUUID();
};
minecraft_1.mce.Image.define({
    imageFormat: nativetype_1.uint32_t,
    width: nativetype_1.uint32_t,
    height: nativetype_1.uint32_t,
    usage: nativetype_1.uint8_t,
    blob: minecraft_1.mce.Blob,
});
//# sourceMappingURL=mce.js.map