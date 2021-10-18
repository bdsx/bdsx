/**
 * it defines the getter property.
 * and stores and freezes the value after calling the getter
 */
export declare function defineConstGetter<T, K extends keyof T>(base: T, key: K, getter: () => T[K]): void;
