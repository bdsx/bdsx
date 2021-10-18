declare const hashkey: unique symbol;
declare const nextlink: unique symbol;
export interface Hashable {
    [hashkey]?: number;
    [nextlink]?: Hashable | null;
    hash(): number;
    equals(other: this): boolean;
}
export declare class HashSet<T extends Hashable> implements Iterable<T> {
    private array;
    size: number;
    constructor();
    private _resetCap;
    [Symbol.iterator](): IterableIterator<T>;
    keys(): IterableIterator<T>;
    values(): IterableIterator<T>;
    get(item: T): T | null;
    has(item: T): boolean;
    delete(item: T): boolean;
    add(item: T): this;
}
export {};
