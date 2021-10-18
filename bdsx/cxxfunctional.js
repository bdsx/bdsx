"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CxxLess = void 0;
const core_1 = require("./core");
const dll_1 = require("./dll");
const nativetype_1 = require("./nativetype");
const pointer_1 = require("./pointer");
const lesses = new WeakMap();
/**
 * std::less
 */
exports.CxxLess = {
    /**
     * get defined std::less<type>
     *
     * it's just a kind of getter but uses 'make' for consistency.
     */
    make(type) {
        const fn = lesses.get(type);
        if (fn == null)
            throw Error(`std::less<${type.name}> not found`);
        return fn;
    },
    /**
     * define std::less<type>
     */
    define(type, less) {
        const fn = lesses.get(type);
        if (fn != null)
            throw Error(`std::less<${type.name}> is already defined`);
        lesses.set(type, less);
    }
};
function compare(a, alen, b, blen) {
    const diff = dll_1.dll.vcruntime140.memcmp(a, b, Math.min(alen, blen));
    if (diff !== 0)
        return diff;
    if (alen < blen)
        return -1;
    if (alen > blen)
        return 1;
    return 0;
}
function compareString(a, b) {
    const alen = a.length;
    const blen = b.length;
    const diff = dll_1.dll.vcruntime140.memcmp(core_1.VoidPointer.fromAddressString(a), core_1.VoidPointer.fromAddressString(b), Math.min(alen, blen) * 2);
    if (diff !== 0)
        return diff;
    if (alen < blen)
        return -1;
    if (alen > blen)
        return 1;
    return 0;
}
exports.CxxLess.define(pointer_1.CxxStringWrapper, (a, b) => compare(a, a.length, b, b.length) < 0);
exports.CxxLess.define(nativetype_1.CxxString, (a, b) => compareString(a, b) < 0);
//# sourceMappingURL=cxxfunctional.js.map