/// <reference types="node" />
import { Encoding, TypeFromEncoding } from "./common";
import { NativePointer, StaticPointer } from "./core";
import { NativeClass, NativeClassType } from "./nativeclass";
import { int64_as_float_t, NativeDescriptorBuilder, NativeType, Type } from "./nativetype";
import util = require('util');
export interface WrapperType<T> extends NativeClassType<Wrapper<T>> {
    new (ptr?: boolean): Wrapper<T>;
    readonly type: Type<any>;
}
export interface PtrType<T> extends WrapperType<T> {
}
export declare abstract class Wrapper<T> extends NativeClass {
    abstract value: T;
    readonly abstract type: Type<T>;
    static readonly type: Type<unknown>;
    static make<T>(type: Type<T>): WrapperType<T>;
    static [NativeType.ctor_copy](to: StaticPointer, from: StaticPointer): void;
    static [NativeType.ctor_move](to: StaticPointer, from: StaticPointer): void;
    static [NativeType.descriptor](this: {
        new (): Wrapper<any>;
    }, builder: NativeDescriptorBuilder, key: string, info: NativeDescriptorBuilder.Info): void;
}
export declare type Pointer = any;
export declare const Pointer: any;
export declare abstract class Ptr<T> extends Wrapper<T> {
    get(index: number): T;
    set(value: T, index: number): void;
    static create<T>(this: PtrType<T>, count: number): Ptr<T>;
    static make<T>(type: Type<T>): PtrType<T>;
}
export declare class CxxStringWrapper extends NativeClass {
    length: int64_as_float_t;
    capacity: int64_as_float_t;
    [NativeType.ctor](): void;
    [NativeType.dtor](): void;
    [NativeType.ctor_copy](other: CxxStringWrapper): void;
    get value(): string;
    set value(str: string);
    get valueptr(): NativePointer;
    valueAs<T extends Encoding>(encoding: T): TypeFromEncoding<T>;
    reserve(nsize: number): void;
    resize(nsize: number): void;
    [util.inspect.custom](depth: number, options: Record<string, any>): unknown;
}
