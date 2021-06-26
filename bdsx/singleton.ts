
const singleton = Symbol();

export class Singleton<T> extends WeakMap<any, T> {
    newInstance<P>(param:P, allocator:()=>T):T {
        let instance = this.get(param);
        if (instance) return instance;
        instance = allocator();
        return instance;
    }

    static newInstance<T>(base:{prototype:any,[singleton]?:Singleton<any>}, param:unknown, mapper:()=>T):T {
        let map = base[singleton];
        if (map == null) base[singleton] = map = new Singleton;
        return map.newInstance(param, mapper);
    }
}
