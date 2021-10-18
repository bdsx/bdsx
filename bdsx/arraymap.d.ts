export declare class ArrayMap<KEY, T> implements Iterable<[KEY, T[]]> {
    private readonly map;
    has(key: KEY): boolean;
    count(key: KEY): number;
    push(key: KEY, value: T): void;
    pop(key: KEY): T | undefined;
    delete(key: KEY): boolean;
    clear(): void;
    keys(): IterableIterator<KEY>;
    values(): IterableIterator<T[]>;
    /**
     * @deprecated Typo!
     */
    entires(): IterableIterator<[KEY, T[]]>;
    entries(): IterableIterator<[KEY, T[]]>;
    [Symbol.iterator](): IterableIterator<[KEY, T[]]>;
}
