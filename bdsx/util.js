"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeferPromise = exports.inheritMultiple = exports.printOnProgress = exports.filterToIdentifierableString = exports.numberWithFillZero = exports.intToVarString = exports.checkPowOf2 = exports.makeSignature = exports.arraySame = exports.arrayEquals = exports.str2array = exports.str2set = exports.anyToString = exports.isBaseOf = exports.getLineAt = exports.removeLine = exports.indexOfLine = exports._tickCallback = exports.unhex = exports.hex = exports.memcheck = exports.memdiff_contains = exports.memdiff = void 0;
const util = require("util");
function memdiff(dst, src) {
    const size = src.length;
    if (dst.length !== size)
        throw Error(`size unmatched(dst[${dst.length}] != src[${src.length}])`);
    const diff = [];
    let needEnd = false;
    for (let i = 0; i !== size; i++) {
        if (src[i] === dst[i]) {
            if (!needEnd)
                continue;
            diff.push(i);
            needEnd = false;
        }
        else {
            if (needEnd)
                continue;
            diff.push(i);
            needEnd = true;
        }
    }
    if (needEnd)
        diff.push(size);
    return diff;
}
exports.memdiff = memdiff;
function memdiff_contains(larger, smaller) {
    let small_i = 0;
    const smaller_size = smaller.length;
    const larger_size = larger.length;
    if (larger_size === 0) {
        return smaller_size === 0;
    }
    for (let i = 0; i < larger_size;) {
        const large_from = larger[i++];
        const large_to = larger[i++];
        for (;;) {
            if (small_i === smaller_size)
                return true;
            const small_from = smaller[small_i];
            if (small_from < large_from)
                return false;
            if (small_from > large_to)
                break;
            if (small_from === large_to)
                return false;
            const small_to = smaller[small_i + 1];
            if (small_to > large_to)
                return false;
            if (small_to === large_to) {
                small_i += 2;
                break;
            }
            small_i += 2;
        }
    }
    return true;
}
exports.memdiff_contains = memdiff_contains;
function memcheck(code, originalCode, skip) {
    const diff = memdiff(code, originalCode);
    if (skip != null) {
        if (memdiff_contains(skip, diff))
            return null;
    }
    return diff;
}
exports.memcheck = memcheck;
function hex(values, nextLinePer) {
    const size = values.length;
    if (size === 0)
        return '';
    if (nextLinePer == null)
        nextLinePer = size;
    const out = [];
    for (let i = 0; i < size;) {
        if (i !== 0 && (i % nextLinePer) === 0)
            out.push(10);
        const v = values[i++];
        const n1 = (v >> 4);
        if (n1 < 10)
            out.push(n1 + 0x30);
        else
            out.push(n1 + (0x41 - 10));
        const n2 = (v & 0x0f);
        if (n2 < 10)
            out.push(n2 + 0x30);
        else
            out.push(n2 + (0x41 - 10));
        out.push(0x20);
    }
    out.pop();
    const LIMIT = 1024; // it's succeeded with 1024*8 but used a less number for safety
    let offset = LIMIT;
    if (out.length <= LIMIT) {
        return String.fromCharCode(...out);
    }
    // split for stack space
    let outstr = '';
    do {
        outstr += String.fromCharCode(...out.slice(offset - 1024, offset));
        offset += LIMIT;
    } while (offset < out.length);
    outstr += String.fromCharCode(...out.slice(offset - 1024));
    return outstr;
}
exports.hex = hex;
(function (hex) {
    function format(n, chrwidth) {
        const str = (n >>> 0).toString(16);
        return '0'.repeat(chrwidth - str.length) + str;
    }
    hex.format = format;
})(hex = exports.hex || (exports.hex = {}));
function unhex(hex) {
    const hexes = hex.split(/[ \t\r\n]+/g);
    const out = new Uint8Array(hexes.length);
    for (let i = 0; i < hexes.length; i++) {
        out[i] = parseInt(hexes[i], 16);
    }
    return out;
}
exports.unhex = unhex;
exports._tickCallback = process._tickCallback;
/**
 * @param lineIndex first line is zero
 */
function indexOfLine(context, lineIndex, p = 0) {
    for (;;) {
        if (lineIndex === 0)
            return p;
        const idx = context.indexOf('\n', p);
        if (idx === -1)
            return -1;
        p = idx + 1;
        lineIndex--;
    }
}
exports.indexOfLine = indexOfLine;
/**
 * removeLine("a \n b \n c", 1, 2) === "a \n c"
 * @param lineFrom first line is zero
 * @param lineTo first line is one
 */
function removeLine(context, lineFrom, lineTo) {
    const idx = indexOfLine(context, lineFrom);
    if (idx === -1)
        return context;
    const next = indexOfLine(context, lineTo - lineFrom, idx);
    if (next === -1)
        return context.substr(0, idx - 1);
    else
        return context.substr(0, idx) + context.substr(next);
}
exports.removeLine = removeLine;
/**
 * @param lineIndex first line is zero
 */
function getLineAt(context, lineIndex) {
    const idx = indexOfLine(context, lineIndex);
    if (idx === -1)
        return context;
    const next = context.indexOf('\n', idx);
    if (next === -1)
        return context.substr(idx);
    else
        return context.substring(idx, next);
}
exports.getLineAt = getLineAt;
function isBaseOf(t, base) {
    if (typeof t !== 'function')
        return false;
    if (t === base)
        return true;
    return t.prototype instanceof base;
}
exports.isBaseOf = isBaseOf;
/**
 * @deprecated use util.inspect
 */
function anyToString(v) {
    return util.inspect(v);
}
exports.anyToString = anyToString;
function str2set(str) {
    const out = new Set();
    for (let i = 0; i < str.length; i++) {
        out.add(str.charCodeAt(i));
    }
    return out;
}
exports.str2set = str2set;
function str2array(str) {
    const out = new Array(str.length);
    for (let i = 0; i < str.length; i++) {
        out[i] = str.charCodeAt(i);
    }
    return out;
}
exports.str2array = str2array;
function arrayEquals(arr1, arr2, count) {
    if (count == null) {
        count = arr1.length;
        if (count !== arr2.length)
            return false;
    }
    for (let i = 0; i < count; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}
exports.arrayEquals = arrayEquals;
(function (arrayEquals) {
    function deep(arr1, arr2) {
        const count = arr1.length;
        if (count !== arr2.length)
            return false;
        for (let i = 0; i < count; i++) {
            if (!arr1[i].equals(arr2[i]))
                return false;
        }
        return true;
    }
    arrayEquals.deep = deep;
})(arrayEquals = exports.arrayEquals || (exports.arrayEquals = {}));
/**
 * check elements are same
 */
function arraySame(array) {
    if (array.length === 0)
        return true;
    const first = array[0];
    for (let i = 1; i < array.length; i++) {
        if (array[i] !== first)
            return false;
    }
    return true;
}
exports.arraySame = arraySame;
function makeSignature(sig) {
    if (sig.length > 4)
        throw Error('too long');
    let out = 0;
    for (let i = 0; i < 4; i++) {
        out += sig.charCodeAt(i) << (i * 8);
    }
    return out;
}
exports.makeSignature = makeSignature;
function checkPowOf2(n) {
    let mask = n - 1;
    mask |= (mask >> 16);
    mask |= (mask >> 8);
    mask |= (mask >> 4);
    mask |= (mask >> 2);
    mask |= (mask >> 1);
    mask++;
    if (mask !== n)
        throw Error(`${n} is not pow of 2`);
}
exports.checkPowOf2 = checkPowOf2;
function intToVarString(n) {
    // 0-9 A-Z a-z _ $
    const NUMBER_COUNT = 10;
    const ALPHABET_COUNT = 26;
    const TOTAL = NUMBER_COUNT + ALPHABET_COUNT * 2 + 2;
    const out = [];
    do {
        let v = n % TOTAL;
        n = n / TOTAL | 0;
        if (v < NUMBER_COUNT) {
            out.push(v + 0x30);
        }
        else {
            v -= NUMBER_COUNT;
            if (v < ALPHABET_COUNT) {
                out.push(v + 0x41);
            }
            else {
                v -= ALPHABET_COUNT;
                if (v < ALPHABET_COUNT) {
                    out.push(v + 0x61);
                }
                else {
                    v -= ALPHABET_COUNT;
                    switch (v) {
                        case 0:
                            out.push(0x24);
                            break; // '$'
                        case 1:
                            out.push(0x5f);
                            break; // '_'
                    }
                }
            }
        }
    } while (n !== 0);
    return String.fromCharCode(...out);
}
exports.intToVarString = intToVarString;
function numberWithFillZero(n, width, radix) {
    const text = (n >>> 0).toString(radix);
    if (text.length >= width)
        return text;
    return '0'.repeat(width - text.length) + text;
}
exports.numberWithFillZero = numberWithFillZero;
function filterToIdentifierableString(name) {
    name = name.replace(/[^a-zA-Z_$0-9]/g, '');
    return /^[0-9]/.test(name) ? '_' + name : name;
}
exports.filterToIdentifierableString = filterToIdentifierableString;
function printOnProgress(message) {
    process.stdout.cursorTo(0);
    process.stdout.write(message);
    process.stdout.clearLine(1);
    console.log();
}
exports.printOnProgress = printOnProgress;
function inheritMultiple(child, base) {
    const childp = child.prototype;
    const basep = base.prototype;
    for (const key of Object.getOwnPropertyNames(basep)) {
        if ((key in childp))
            continue;
        childp[key] = basep[key];
    }
    for (const key of Object.getOwnPropertyNames(base)) {
        if ((key in child))
            continue;
        child[key] = base[key];
    }
}
exports.inheritMultiple = inheritMultiple;
var DeferPromise;
(function (DeferPromise) {
    function make() {
        let resolve;
        let reject;
        const prom = new Promise((resolve_, reject_) => {
            resolve = resolve_;
            reject = reject_;
        });
        prom.resolve = resolve;
        prom.reject = reject;
        return prom;
    }
    DeferPromise.make = make;
})(DeferPromise = exports.DeferPromise || (exports.DeferPromise = {}));
//# sourceMappingURL=util.js.map