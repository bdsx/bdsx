"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayMap = void 0;
class ArrayMap {
    constructor() {
        this.map = new Map();
    }
    has(key) {
        const arr = this.map.get(key);
        if (arr == null)
            return false;
        return arr.length !== 0;
    }
    count(key) {
        const arr = this.map.get(key);
        if (arr == null)
            return 0;
        return arr.length;
    }
    push(key, value) {
        const array = this.map.get(key);
        if (array != null)
            array.push(value);
        else
            this.map.set(key, [value]);
    }
    pop(key) {
        const array = this.map.get(key);
        if (array == null)
            return undefined;
        const out = array.pop();
        if (array.length === 0) {
            this.map.delete(key);
        }
        return out;
    }
    delete(key) {
        return this.map.delete(key);
    }
    clear() {
        this.map.clear();
    }
    keys() {
        return this.map.keys();
    }
    values() {
        return this.map.values();
    }
    /**
     * @deprecated Typo!
     */
    entires() {
        return this.map.entries();
    }
    entries() {
        return this.map.entries();
    }
    [Symbol.iterator]() {
        return this.map.entries();
    }
}
exports.ArrayMap = ArrayMap;
//# sourceMappingURL=arraymap.js.map