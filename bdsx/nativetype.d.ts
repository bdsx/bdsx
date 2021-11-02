import { Bufferable } from './common';
import { NativePointer, StaticPointer, VoidPointer } from './core';
import { makefunc, TypeIn } from './makefunc';
declare namespace NativeTypeFn {
    const align: unique symbol;
    const ctor: unique symbol;
    const ctor_copy: unique symbol;
    const isNativeClass: unique symbol;
    const descriptor: unique symbol;
    const bitGetter: unique symbol;
    const bitSetter: unique symbol;
}
/**
 * native type information
 */
export interface Type<T> extends TypeIn<T> {
    symbol?: string;
    isTypeOf<V>(this: Type<V>, v: unknown): v is V;
    ref(): NativeType<any>;
    [makefunc.getter](ptr: StaticPointer, offset?: number): any;
    [makefunc.setter](ptr: StaticPointer, value: any, offset?: number): void;
    [NativeTypeFn.ctor]: (ptr: StaticPointer) => void;
    [makefunc.dtor]: (ptr: StaticPointer) => void;
    [NativeTypeFn.ctor_copy]: (to: StaticPointer, from: StaticPointer) => void;
    [makefunc.ctor_move]: (to: StaticPointer, from: StaticPointer) => void;
    [NativeTypeFn.descriptor](builder: NativeDescriptorBuilder, key: string | number, info: NativeDescriptorBuilder.Info): void;
    /**
     * nullable actually
     */
    [NativeTypeFn.align]: number;
    [NativeTypeFn.isNativeClass]?: true;
}
export declare type GetFromType<T> = T extends Type<any> ? T extends {
    prototype: any;
} ? T['prototype'] : T extends {
    [makefunc.getter](ptr: StaticPointer, offset?: number): infer RET;
} ? RET : never : never;
export declare class NativeDescriptorBuilder {
    readonly desc: PropertyDescriptorMap;
    readonly params: unknown[];
    readonly imports: Map<unknown, string>;
    private readonly names;
    readonly ctor: NativeDescriptorBuilder.UseContextCtor;
    readonly dtor: NativeDescriptorBuilder.UseContextDtor;
    readonly ctor_copy: NativeDescriptorBuilder.UseContextCtorCopy;
    readonly ctor_move: NativeDescriptorBuilder.UseContextCtorCopy;
    importType(type: Type<any>): string;
    import(type: unknown, name: string): string;
}
export declare namespace NativeDescriptorBuilder {
    abstract class UseContext {
        code: string;
        used: boolean;
        offset: number;
        ptrUsed: boolean;
        setPtrOffset(offset: number): void;
    }
    class UseContextCtor extends UseContext {
    }
    class UseContextDtor extends UseContext {
    }
    class UseContextCtorCopy extends UseContext {
        setPtrOffset(offset: number): void;
    }
    interface Info {
        offset: number;
        bitmask: [number, number] | null;
        ghost: boolean;
        noInitialize: boolean;
    }
}
export declare class NativeType<T, InputType = T> extends makefunc.ParamableT<T, InputType> implements Type<T> {
    static readonly getter: typeof makefunc.getter;
    static readonly setter: typeof makefunc.setter;
    static readonly ctor: typeof NativeTypeFn.ctor;
    static readonly dtor: typeof makefunc.dtor;
    static readonly registerDirect: typeof makefunc.registerDirect;
    static readonly ctor_copy: typeof NativeTypeFn.ctor_copy;
    static readonly ctor_move: typeof makefunc.ctor_move;
    static readonly size: typeof makefunc.size;
    static readonly align: typeof NativeTypeFn.align;
    static readonly descriptor: typeof NativeTypeFn.descriptor;
    [makefunc.getter]: (this: NativeType<T, InputType>, ptr: StaticPointer, offset?: number) => T;
    [makefunc.setter]: (this: NativeType<T, InputType>, ptr: StaticPointer, v: InputType, offset?: number) => void;
    [NativeTypeFn.ctor]: (this: NativeType<T, InputType>, ptr: StaticPointer) => void;
    [makefunc.dtor]: (this: NativeType<T, InputType>, ptr: StaticPointer) => void;
    [makefunc.ctor_move]: (this: NativeType<T, InputType>, to: StaticPointer, from: StaticPointer) => void;
    [NativeTypeFn.ctor_copy]: (this: NativeType<T, InputType>, to: StaticPointer, from: StaticPointer) => void;
    [NativeTypeFn.align]: number;
    [NativeTypeFn.bitGetter]: (this: NativeType<T, InputType>, ptr: StaticPointer, shift: number, mask: number, offset?: number) => T;
    [NativeTypeFn.bitSetter]: (this: NativeType<T, InputType>, ptr: StaticPointer, value: InputType, shift: number, mask: number, offset?: number) => void;
    constructor(
    /**
     * pdb symbol name. it's used by type_id.pdbimport
     */
    name: string, size: number, align: number, 
    /**
     * js type checker for overloaded functions
     * and parameter checking
     */
    isTypeOf: (v: unknown) => boolean, 
    /**
     * isTypeOf but allo downcasting
     */
    isTypeOfWeak: ((v: unknown) => boolean) | undefined, 
    /**
     * getter with the pointer
     */
    get: (ptr: StaticPointer, offset?: number) => T, 
    /**
     * setter with the pointer
     */
    set: (ptr: StaticPointer, v: InputType, offset?: number) => void, 
    /**
     * assembly for casting the native value to the js value
     */
    getFromParam?: (stackptr: StaticPointer, offset?: number) => T | null, 
    /**
     * assembly for casting the js value to the native value
     */
    setToParam?: (stackptr: StaticPointer, param: InputType extends VoidPointer ? (InputType | null) : InputType, offset?: number) => void, 
    /**
     * constructor
     */
    ctor?: (ptr: StaticPointer) => void, 
    /**
     * destructor
     */
    dtor?: (ptr: StaticPointer) => void, 
    /**
     * copy constructor, https://en.cppreference.com/w/cpp/language/copy_constructor
     */
    ctor_copy?: (to: StaticPointer, from: StaticPointer) => void, 
    /**
     * move constructor, https://en.cppreference.com/w/cpp/language/move_constructor
     * it uses the copy constructor by default
     */
    ctor_move?: (to: StaticPointer, from: StaticPointer) => void);
    supportsBitMask(): boolean;
    extends<FIELDS>(fields?: FIELDS | null, name?: string | null): NativeType<T> & FIELDS;
    ref(): NativeType<T, InputType>;
    [NativeTypeFn.descriptor](builder: NativeDescriptorBuilder, key: string, info: NativeDescriptorBuilder.Info): void;
    static defaultDescriptor(this: Type<any>, builder: NativeDescriptorBuilder, key: string, info: NativeDescriptorBuilder.Info): void;
}
declare module './core' {
    interface VoidPointerConstructor {
        [NativeType.align]: number;
        [NativeType.ctor](ptr: StaticPointer): void;
        [NativeType.dtor](ptr: StaticPointer): void;
        [NativeType.ctor_copy](to: StaticPointer, from: StaticPointer): void;
        [NativeType.ctor_move](to: StaticPointer, from: StaticPointer): void;
        [NativeType.descriptor](builder: NativeDescriptorBuilder, key: string, info: NativeDescriptorBuilder.Info): void;
        ref(): NativeType<any>;
    }
}
export declare const nullptr_t: NativeType<void, void>;
export declare type nullptr_t = null;
export declare const void_t: NativeType<void, void>;
export declare type void_t = void;
export declare const bool_t: NativeType<boolean, boolean>;
export declare type bool_t = boolean;
export declare const uint8_t: NativeType<number, number>;
export declare type uint8_t = number;
export declare const uint16_t: NativeType<number, number>;
export declare type uint16_t = number;
export declare const uint32_t: NativeType<number, number>;
export declare type uint32_t = number;
export declare const ulong_t: NativeType<number, number>;
export declare type ulong_t = number;
export declare const uint64_as_float_t: NativeType<number, number>;
export declare type uint64_as_float_t = number;
export declare const int8_t: NativeType<number, number>;
export declare type int8_t = number;
export declare const int16_t: NativeType<number, number>;
export declare type int16_t = number;
export declare const int32_t: NativeType<number, number>;
export declare type int32_t = number;
export declare const long_t: NativeType<number, number>;
export declare type long_t = number;
export declare const int64_as_float_t: NativeType<number, number>;
export declare type int64_as_float_t = number;
export declare const float32_t: NativeType<number, number>;
export declare type float32_t = number;
export declare const float64_t: NativeType<number, number>;
export declare type float64_t = number;
export declare const CxxString: NativeType<string, string>;
export declare type CxxString = string;
export declare const GslStringSpan: NativeType<string, string>;
export declare type GslStringSpan = string;
export declare const bin64_t: NativeType<string, string> & {
    one: string;
    zero: string;
    minus_one: string;
};
export declare type bin64_t = string;
export declare const bin128_t: NativeType<string, string> & {
    one: string;
    zero: string;
    minus_one: string;
};
export declare type bin128_t = string;
export declare const StringAnsi: NativeType<string, string>;
export declare type StringAnsi = string;
export declare const StringUtf8: NativeType<string, string>;
export declare type StringUtf8 = string;
export declare const StringUtf16: NativeType<string, string>;
export declare type StringUtf16 = string;
export declare const PointerLike: NativeType<NativePointer, string | Bufferable | VoidPointer>;
export declare type PointerLike = VoidPointer | Bufferable;
export declare const AddressOfIt: NativeType<NativePointer, string | Bufferable | VoidPointer>;
export declare type AddressOfIt = VoidPointer;
export declare const JsValueRef: NativeType<any, any>;
export declare type JsValueRef = any;
export declare type WrapArrayToTypeArray<T extends any[]> = {
    [P in keyof T]: P extends keyof any[] ? T[P] : Type<T[P]>;
};
export declare type UnwrapTypeArrayToArray<T extends Type<any>[]> = {
    [P in keyof T]: T[P] extends Type<infer V> ? V : T[P];
};
export declare type UnwrapType<T> = T extends Type<infer V> ? V : T extends Type<any>[] ? UnwrapTypeArrayToArray<T> : T;
export declare function templateArgs<ARGS extends (string | number | Type<any>)[]>(...args: ARGS): ARGS;
/** @deprecated for legacy support */
export declare const CxxStringWith8Bytes: NativeType<string, string>;
export declare type CxxStringWith8Bytes = string;
export {};
