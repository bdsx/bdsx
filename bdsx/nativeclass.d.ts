/// <reference types="node" />
import { AnyFunction, Bufferable, Encoding, TypeFromEncoding } from "./common";
import { NativePointer, PrivatePointer, StaticPointer, StructurePointer, VoidPointer } from "./core";
import { makefunc } from "./makefunc";
import { NativeDescriptorBuilder, NativeType, Type } from "./nativetype";
import util = require('util');
export declare type KeysFilter<T, FILTER> = {
    [key in keyof T]: T[key] extends FILTER ? key : never;
}[keyof T];
declare type AnyToUnknown<T> = 0 extends (1 & T) ? unknown : T;
export declare type KeysWithoutFunction<T> = {
    [key in keyof T]: AnyToUnknown<T[key]> extends AnyFunction ? never : key;
}[keyof T];
declare type StructureFields<T> = {
    [key in KeysWithoutFunction<T>]?: Type<T[key]> | [Type<T[key]>, number | NativeFieldOptions];
};
declare const isNativeClass: unique symbol;
declare const isSealed: unique symbol;
declare const fieldmap: unique symbol;
export interface NativeClassType<T extends NativeClass> extends Type<T> {
    new (alloc?: boolean): T;
    prototype: T;
    [StructurePointer.contentSize]: number | null;
    [fieldmap]: Record<keyof any, NativeFieldInfo>;
    [isSealed]: boolean;
    [isNativeClass]: true;
    construct<T extends NativeClass>(this: {
        new (v?: boolean): T;
    }, copyFrom?: T | null): T;
    allocate<T>(this: {
        new (): T;
    }, copyFrom?: T | null): T;
    define(fields: StructureFields<T>, defineSize?: number | null, defineAlign?: number | null, abstract?: boolean): void;
    offsetOf(key: KeysWithoutFunction<T>): number;
    typeOf<KEY extends KeysWithoutFunction<T>>(field: KEY): Type<T[KEY]>;
    ref<T extends NativeClass>(this: Type<T>): NativeType<T>;
}
interface NativeFieldInfo extends NativeDescriptorBuilder.Info {
    type: Type<any>;
}
export declare class NativeClass extends StructurePointer {
    static readonly [NativeType.size]: number;
    static readonly [NativeType.align]: number;
    static readonly [StructurePointer.contentSize]: number;
    static readonly [fieldmap]: Record<keyof any, NativeFieldInfo>;
    static readonly [isNativeClass] = true;
    static readonly [isSealed] = true;
    /** @deprecated */
    static readonly symbol?: string;
    static isNativeClassType(type: Record<string, any>): type is typeof NativeClass;
    [NativeType.size]: number;
    [NativeType.ctor](): void;
    [NativeType.dtor](): void;
    [NativeType.ctor_copy](from: this): void;
    [NativeType.ctor_move](from: this): void;
    [NativeType.setter](from: this): void;
    static [NativeType.ctor](ptr: StaticPointer): void;
    static [NativeType.dtor](ptr: StaticPointer): void;
    static [NativeType.ctor_copy](to: StaticPointer, from: StaticPointer): void;
    static [NativeType.ctor_move](to: StaticPointer, from: StaticPointer): void;
    static [NativeType.setter](ptr: VoidPointer, value: NativeClass, offset?: number): void;
    static [NativeType.getter](ptr: VoidPointer, offset?: number): any;
    static [NativeType.descriptor](builder: NativeDescriptorBuilder, key: string | number, info: NativeDescriptorBuilder.Info): void;
    /**
     * call the constructor
     * @alias [NativeType.ctor]
     */
    construct(copyFrom?: this | null): void;
    /**
     * call the destructor
     * @alias [NativeType.dtor]
     */
    destruct(): void;
    /**
     * Combiation of allocating and constructing.
     *
     * const inst = new Class(true);
     * inst.construct();
     */
    static construct<T extends NativeClass>(this: {
        new (v?: boolean): T;
    }, copyFrom?: T | null): T;
    /**
     * allocating with malloc and constructing.
     *
     * const inst = capi.malloc(size).as(Class);
     * inst.construct();
     */
    static allocate<T>(this: {
        new (): T;
    }, copyFrom?: T | null): T;
    static next<T extends NativeClass>(this: {
        new (): T;
    }, ptr: T, count: number): T;
    /**
     * Cannot construct & Unknown size
     */
    static abstract<T extends NativeClass>(this: {
        new (): T;
    }, fields: StructureFields<T>, defineSize?: number, defineAlign?: number | null): void;
    static define<T extends NativeClass>(this: {
        new (): T;
    }, fields: StructureFields<T>, defineSize?: number | null, defineAlign?: number | null, abstract?: boolean): void;
    static defineAsUnion<T extends NativeClass>(this: {
        new (): T;
    }, fields: StructureFields<T>, abstract?: boolean): void;
    static ref<T extends NativeClass>(this: Type<T>): NativeType<T>;
    static offsetOf<T extends NativeClass>(this: {
        new (): T;
    }, field: KeysWithoutFunction<T>): number;
    static typeOf<T extends NativeClass, KEY extends KeysWithoutFunction<T>>(this: {
        new (): T;
    }, field: KEY): Type<T[KEY]>;
    static keys(): IterableIterator<string>;
    /**
     * call the destructor and capi.free
     *
     * inst.destruct();
     * capi.free(inst);
     */
    static delete(item: NativeClass): void;
    protected _toJsonOnce(allocator: () => Record<string, any>): Record<string, any>;
    static setExtends<T extends NativeClass, THIS extends T>(this: {
        prototype: THIS;
    }, supercls: NativeClassType<T>): void;
    toJSON(): Record<string, any>;
    [util.inspect.custom](depth: number, options: Record<string, any>): unknown;
}
export interface NativeFieldOptions {
    offset?: number;
    /**
     * offset is a relative offset
     */
    relative?: boolean;
    bitMask?: number;
    /**
     * Set it as not a actual field, just for accessing.
     * Does not increase the size of the class.
     * also does not increase the next field offset.
     * And does not call the constructor and the destructor.
     *
     * It's noInitialize with the zero space
     */
    ghost?: boolean;
    /**
     * Don't initialize
     * But it has space unlike ghost
     */
    noInitialize?: boolean;
}
export declare function nativeField<T>(type: Type<T>, fieldOffset?: NativeFieldOptions | number | null, bitMask?: number | null): <K extends string>(obj: NativeClass & Record<K, T | null>, key: K) => void;
export declare function nativeClass(size?: number | null, align?: number | null): <T extends NativeClass>(clazz: NativeClassType<T>) => void;
export interface NativeArrayType<T> extends Type<NativeArray<T>> {
    new (ptr?: VoidPointer): NativeArray<T>;
}
export declare abstract class NativeArray<T> extends PrivatePointer implements Iterable<T> {
    abstract length: number;
    abstract componentType: Type<T>;
    static [NativeType.getter]<THIS extends VoidPointer>(this: {
        new (): THIS;
    }, ptr: StaticPointer, offset?: number): THIS;
    static [NativeType.setter]<THIS extends VoidPointer>(this: {
        new (): THIS;
    }, ptr: StaticPointer, value: THIS, offset?: number): void;
    static [makefunc.getFromParam]<THIS extends VoidPointer>(this: {
        new (): THIS;
    }, stackptr: StaticPointer, offset?: number): THIS;
    static [makefunc.setToParam]<THIS extends VoidPointer>(this: {
        new (): THIS;
    }, stackptr: StaticPointer, value: THIS, offset?: number): void;
    static [NativeType.descriptor](builder: NativeDescriptorBuilder, key: string | number, info: NativeDescriptorBuilder.Info): void;
    static readonly [NativeType.align]: number;
    static ref<T>(this: Type<NativeArray<T>>): NativeType<NativeArray<T>>;
    set(value: T, i: number): void;
    get(i: number): T;
    toArray(): T[];
    [Symbol.iterator](): IterableIterator<T>;
    static make<T>(itemType: Type<T>, count: number): NativeArrayType<T>;
}
export declare class MantleClass extends NativeClass {
    getBoolean(offset?: number): boolean;
    getUint8(offset?: number): number;
    getUint16(offset?: number): number;
    getUint32(offset?: number): number;
    getUint64AsFloat(offset?: number): number;
    getInt8(offset?: number): number;
    getInt16(offset?: number): number;
    getInt32(offset?: number): number;
    getInt64AsFloat(offset?: number): number;
    getFloat32(offset?: number): number;
    getFloat64(offset?: number): number;
    getNullablePointer(offset?: number): NativePointer | null;
    getNullablePointerAs<T extends VoidPointer>(ctor: {
        new (): T;
    }, offset?: number): T | null;
    getPointer(offset?: number): NativePointer;
    getPointerAs<T extends VoidPointer>(ctor: {
        new (): T;
    }, offset?: number): T;
    fill(bytevalue: number, bytes: number, offset?: number): void;
    copyFrom(from: VoidPointer, bytes: number, this_offset?: number, from_offset?: number): void;
    setBoolean(value: boolean, offset?: number): void;
    setUint8(value: number, offset?: number): void;
    setUint16(value: number, offset?: number): void;
    setUint32(value: number, offset?: number): void;
    setUint64WithFloat(value: number, offset?: number): void;
    setInt8(value: number, offset?: number): void;
    setInt16(value: number, offset?: number): void;
    setInt32(value: number, offset?: number): void;
    setInt64WithFloat(value: number, offset?: number): void;
    setFloat32(value: number, offset?: number): void;
    setFloat64(value: number, offset?: number): void;
    setPointer(value: VoidPointer | null, offset?: number): void;
    /**
     * get C++ std::string
     * @param encoding default = Encoding.Utf8
     */
    getCxxString<T extends Encoding = Encoding.Utf8>(offset?: number, encoding?: T): TypeFromEncoding<T>;
    /**
     * set C++ std::string
     * Need to target pointer to string
     * It will call string::assign method to pointer
     * @param encoding default = Encoding.Utf8
     */
    setCxxString(str: string | Bufferable, offset?: number, encoding?: Encoding): void;
    /**
     * get string
     * @param bytes if it's not provided, It will read until reach null character
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call getBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    getString<T extends Encoding = Encoding.Utf8>(bytes?: number, offset?: number, encoding?: T): TypeFromEncoding<T>;
    /**
     * set string with null character
     * @param encoding default = Encoding.Utf8
     * @return written bytes without null character
     * if encoding is Encoding.Buffer it will call setBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    setString(text: string, offset?: number, encoding?: Encoding): number;
    getBuffer(bytes: number, offset?: number): Uint8Array;
    setBuffer(buffer: Bufferable, offset?: number): void;
    /**
     * Read memory as binary string.
     * It stores 2bytes per character
     * @param words 2bytes per word
     */
    getBin(words: number, offset?: number): string;
    /**
     * is same with getBin(4).
     * It stores 2bytes per character for 64bits.
     */
    getBin64(offset?: number): string;
    /**
     * Write memory with binary string.
     * It reads 2bytes per character
     * @param words 2bytes per word
     */
    setBin(v: string, offset?: number): void;
    interlockedIncrement16(offset?: number): number;
    interlockedIncrement32(offset?: number): number;
    interlockedIncrement64(offset?: number): number;
    interlockedDecrement16(offset?: number): number;
    interlockedDecrement32(offset?: number): number;
    interlockedDecrement64(offset?: number): number;
    interlockedCompareExchange8(exchange: number, compare: number, offset?: number): number;
    interlockedCompareExchange16(exchange: number, compare: number, offset?: number): number;
    interlockedCompareExchange32(exchange: number, compare: number, offset?: number): number;
    interlockedCompareExchange64(exchange: string, compare: string, offset?: number): string;
    getJsValueRef(offset?: number): any;
    setJsValueRef(value: unknown, offset?: number): void;
}
export declare namespace nativeClassUtil {
    function bindump(object: NativeClass): void;
}
export {};
