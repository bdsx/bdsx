"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashedString = void 0;
const tslib_1 = require("tslib");
const core_1 = require("../core");
const dnf_1 = require("../dnf");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const minecraft = require("../minecraft");
let HashedString = class HashedString extends nativeclass_1.NativeClass {
    [nativetype_1.NativeType.ctor]() {
        this.hash = null;
    }
    set(str) {
        this.str = str;
        this.hash = computeHash(this.add(str_offset));
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], HashedString.prototype, "hash", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], HashedString.prototype, "str", void 0);
HashedString = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], HashedString);
exports.HashedString = HashedString;
const str_offset = HashedString.offsetOf('str');
const computeHash = (0, dnf_1.dnf)(minecraft.HashedString.computeHash).reform(core_1.VoidPointer, null, core_1.VoidPointer);
//# sourceMappingURL=hashedstring.js.map