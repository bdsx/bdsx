declare const singleton: unique symbol;
export declare class Singleton<T> extends WeakMap<any, T> {
    newInstance<P>(param: P, allocator: () => T): T;
    static newInstance<T>(base: {
        prototype: any;
        [singleton]?: Singleton<any>;
    }, param: unknown, mapper: () => T): T;
}
export {};
