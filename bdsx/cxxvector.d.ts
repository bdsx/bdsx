/// <reference types="node" />
import { NativePointer, VoidPointer } from "./core";
import { NativeClass, NativeClassType } from "./nativeclass";
import { NativeType, Type } from "./nativetype";
import util = require('util');
export interface CxxVectorType<T> extends NativeClassType<CxxVector<T>> {
    new (address?: VoidPointer | boolean): CxxVector<T>;
    componentType: Type<any>;
}
/**
 * std::vector<T>
 * C++ standard dynamic array class
 */
export declare abstract class CxxVector<T> extends NativeClass implements Iterable<T> {
    abstract readonly componentType: Type<T>;
    static readonly componentType: Type<any>;
    [NativeType.ctor](): void;
    [NativeType.dtor](): void;
    [NativeType.ctor_copy](from: CxxVector<T>): void;
    [NativeType.ctor_move](from: CxxVector<T>): void;
    protected abstract _move_alloc(allocated: NativePointer, oldptr: VoidPointer, movesize: number): void;
    protected abstract _get(ptr: NativePointer, index: number): T;
    protected abstract _ctor(ptr: NativePointer, index: number): void;
    protected abstract _dtor(ptr: NativePointer, index: number): void;
    protected abstract _copy(to: NativePointer, from: T, index: number): void;
    protected _resizeCache(n: number): void;
    private _resize;
    set(idx: number, component: T): void;
    get(idx: number): T;
    back(): T | null;
    pop(): boolean;
    push(...component: T[]): void;
    splice(start: number, deleteCount: number, ...items: T[]): void;
    resize(newSize: number): void;
    size(): number;
    sizeBytes(): number;
    capacity(): number;
    toArray(): T[];
    setFromArray(array: T[]): void;
    [Symbol.iterator](): IterableIterator<T>;
    static make<T>(type: {
        prototype: T;
    }): CxxVectorType<T>;
    [util.inspect.custom](depth: number, options: Record<string, any>): unknown;
}
export declare namespace CxxVectorToArray {
    function make<T>(compType: Type<T>): NativeType<T[]>;
}
export declare type CxxVectorToArray<T> = T[];
