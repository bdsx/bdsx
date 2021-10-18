/// <reference types="node" />
import { CxxLess } from "./cxxfunctional";
import { CxxPair, CxxPairType } from "./cxxpair";
import { NativeClass, NativeClassType } from "./nativeclass";
import { int8_t, NativeType } from "./nativetype";
import util = require('util');
declare enum _Redbl {
    _Red = 0,
    _Black = 1
}
interface CxxTreeNodeType<T extends NativeClass> extends NativeClassType<CxxTreeNode<T>> {
}
declare abstract class CxxTreeNode<T extends NativeClass> extends NativeClass {
    _Left: CxxTreeNode<T>;
    _Parent: CxxTreeNode<T>;
    _Right: CxxTreeNode<T>;
    _Color: _Redbl;
    _Isnil: int8_t;
    _Myval: T;
    next(): CxxTreeNode<T>;
    previous(): CxxTreeNode<T>;
    static make<T extends NativeClass>(type: NativeClassType<T>): CxxTreeNodeType<T>;
}
export interface CxxMapType<K, V> extends NativeClassType<CxxMap<K, V>> {
    readonly componentType: CxxPairType<K, V>;
    readonly key_comp: (a: K, b: K) => boolean;
}
export declare abstract class CxxMap<K, V> extends NativeClass {
    private get _Myhead();
    size(): number;
    abstract readonly key_comp: CxxLess<K>;
    abstract readonly componentType: CxxPairType<K, V>;
    static readonly key_comp: CxxLess<any>;
    static readonly componentType: CxxPairType<any, any>;
    protected abstract readonly nodeType: CxxTreeNodeType<CxxPair<K, V>>;
    [NativeType.ctor](): void;
    [NativeType.dtor](): void;
    /**
     * @return [node, isRight]
     */
    private _search;
    private _Lrotate;
    private _Rrotate;
    private _insert;
    private _Extract;
    private _Eqrange;
    private _delete;
    private _deleteAll;
    private _Erase_tree;
    has(key: K): boolean;
    get(key: K): V | null;
    /**
     * it returns the [pair, boolean].
     * - first item (pair)
     * it's std::pair<K, V>, and it can be modified
     * - second item (boolean)
     * if it insert new, return true for second item.
     * if the item is already there, return false for second item.
     */
    insert(key: K, value?: V): [CxxPair<K, V>, boolean];
    set(key: K, value: V): void;
    delete(key: K): boolean;
    clear(): void;
    /**
     * @deprecated Typo!
     */
    entires(): IterableIterator<[K, V]>;
    entries(): IterableIterator<[K, V]>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    static make<K, V>(key: {
        prototype: K;
    }, value: {
        prototype: V;
    }): CxxMapType<K, V>;
    toArray(): [K, V][];
    [util.inspect.custom](depth: number, options: Record<string, any>): unknown;
}
export {};
