
export class Singleton<T> extends WeakMap<any, T> {
    newInstance<P>(param:P, allocator:()=>T):T {
        let instance = this.get(param);
        if (instance) return instance;
        instance = allocator();
        return instance;
    }
}
