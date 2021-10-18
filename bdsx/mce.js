"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mce = void 0;
const tslib_1 = require("tslib");
const proc_1 = require("./bds/proc");
const bin_1 = require("./bin");
const nativeclass_1 = require("./nativeclass");
const nativetype_1 = require("./nativetype");
const pointer_1 = require("./pointer");
/** @deprecated */
var mce;
(function (mce) {
    /** @deprecated */
    mce.UUID = nativetype_1.bin128_t.extends({
        v1(uuid) {
            return uuid.charCodeAt(0) | (uuid.charCodeAt(1) << 16);
        },
        v2(uuid) {
            return uuid.charCodeAt(2);
        },
        v3(uuid) {
            return uuid.charCodeAt(3);
        },
        v4(uuid) {
            return uuid.substr(4);
        },
        generate() {
            return generateUUID().value;
        },
        toString(uuid) {
            const hex = bin_1.bin.hex(uuid);
            const u1 = hex.substr(0, 8);
            const u2 = hex.substr(8, 4);
            const u3 = hex.substr(12, 4);
            const u4 = hex.substr(16, 4);
            const u5 = hex.substr(20);
            return `${u1}-${u2}-${u3}-${u4}-${u5}`;
        },
    }, 'UUID');
    mce.UUIDWrapper = pointer_1.Wrapper.make(mce.UUID);
    /** @deprecated */
    let Blob = class Blob extends nativeclass_1.NativeClass {
    };
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativeclass_1.MantleClass.ref())
    ], Blob.prototype, "bytes", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.uint64_as_float_t)
    ], Blob.prototype, "size", void 0);
    Blob = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)()
    ], Blob);
    mce.Blob = Blob;
    /** @deprecated */
    let Image = class Image extends nativeclass_1.NativeClass {
    };
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
    ], Image.prototype, "imageFormat", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
    ], Image.prototype, "width", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
    ], Image.prototype, "height", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
    ], Image.prototype, "usage", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(mce.Blob, 0x10)
    ], Image.prototype, "blob", void 0);
    Image = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)()
    ], Image);
    mce.Image = Image;
})(mce = exports.mce || (exports.mce = {}));
const generateUUID = proc_1.procHacker.js("Crypto::Random::generateUUID", mce.UUIDWrapper, { structureReturn: true });
//# sourceMappingURL=mce.js.map