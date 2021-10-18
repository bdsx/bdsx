"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashSet = void 0;
const hashkey = Symbol('hash');
const nextlink = Symbol('hash_next');
const INITIAL_CAP = 16;
class HashSet {
    constructor() {
        this.array = new Array(INITIAL_CAP);
        this.size = 0;
        for (let i = 0; i < INITIAL_CAP; i++) {
            this.array[i] = null;
        }
    }
    _resetCap(n) {
        const narray = new Array(n);
        for (let i = 0; i < n; i++) {
            narray[i] = null;
        }
        for (let item of this.array) {
            for (;;) {
                if (item === null)
                    break;
                const next = item[nextlink];
                const idx = item[hashkey] % narray.length;
                item[nextlink] = narray[idx];
                narray[idx] = item;
                item = next;
            }
        }
        this.array.length = 0;
        this.array = narray;
    }
    [Symbol.iterator]() {
        return this.keys();
    }
    keys() {
        return this.values();
    }
    *values() {
        for (let item of this.array) {
            for (;;) {
                if (item === null)
                    break;
                yield item;
                item = item[nextlink];
            }
        }
    }
    get(item) {
        let hash = item[hashkey];
        if (hash == null)
            hash = item[hashkey] = item.hash() >>> 0;
        const idx = hash % this.array.length;
        let found = this.array[idx];
        for (;;) {
            if (found === null)
                return null;
            if (found[hashkey] === hash)
                return found;
            found = found[nextlink];
        }
    }
    has(item) {
        let hash = item[hashkey];
        if (hash == null)
            hash = item[hashkey] = item.hash() >>> 0;
        const idx = hash % this.array.length;
        let found = this.array[idx];
        for (;;) {
            if (found === null)
                return false;
            if (found[hashkey] === hash)
                return true;
            found = found[nextlink];
        }
    }
    delete(item) {
        let hash = item[hashkey];
        if (hash == null)
            hash = item[hashkey] = item.hash() >>> 0;
        const idx = hash % this.array.length;
        let found = this.array[idx];
        if (found === null)
            return false;
        if (found[hashkey] === hash && item.equals(found)) {
            this.array[idx] = found[nextlink];
            found[nextlink] = null;
            this.size--;
            return true;
        }
        for (;;) {
            const next = found[nextlink];
            if (next === null)
                return false;
            if (next[hashkey] === hash && next.equals(found)) {
                found[nextlink] = next[nextlink];
                next[nextlink] = null;
                this.size--;
                return true;
            }
            found = next;
        }
    }
    add(item) {
        this.size++;
        const cap = this.array.length;
        if (this.size > (cap * 3 >> 2)) {
            this._resetCap(cap * 3 >> 1);
        }
        let hash = item[hashkey];
        if (hash == null)
            hash = item[hashkey] = item.hash() >>> 0;
        const idx = hash % cap;
        item[nextlink] = this.array[idx];
        this.array[idx] = item;
        return this;
    }
}
exports.HashSet = HashSet;
//# sourceMappingURL=hashset.js.map