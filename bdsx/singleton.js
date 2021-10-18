"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Singleton = void 0;
const singleton = Symbol();
class Singleton extends WeakMap {
    newInstance(param, allocator) {
        let instance = this.get(param);
        if (instance)
            return instance;
        instance = allocator();
        return instance;
    }
    static newInstance(base, param, mapper) {
        let map = base[singleton];
        if (map == null)
            base[singleton] = map = new Singleton;
        return map.newInstance(param, mapper);
    }
}
exports.Singleton = Singleton;
//# sourceMappingURL=singleton.js.map