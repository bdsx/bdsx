
class CombinedKey {
}

const combinedKeyMap = Symbol('combinedKeyMap');

export function combineObjectKey(obj1:Record<any, any>, obj2:Record<any, any>):CombinedKey {
    const base:{[combinedKeyMap]:WeakMap<Record<any, any>, CombinedKey>} = obj1 as any;
    let map = base[combinedKeyMap];
    if (map == null) base[combinedKeyMap] = map = new WeakMap;

    let res = map.get(obj2);
    if (res == null) {
        map.set(obj2, res = new CombinedKey);
    }
    return res;
}
