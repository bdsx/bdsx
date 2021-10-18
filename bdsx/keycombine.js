"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineObjectKey = void 0;
class CombinedKey {
}
const combinedKeyMap = Symbol('combinedKeyMap');
function combineObjectKey(obj1, obj2) {
    const base = obj1;
    let map = base[combinedKeyMap];
    if (map == null)
        base[combinedKeyMap] = map = new WeakMap;
    let res = map.get(obj2);
    if (res == null) {
        map.set(obj2, res = new CombinedKey);
    }
    return res;
}
exports.combineObjectKey = combineObjectKey;
//# sourceMappingURL=keycombine.js.map