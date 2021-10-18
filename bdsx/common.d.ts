import './polyfill';
export interface CANCEL {
    __CANCEL_OBJECT__?: void;
    toString(): 'CANCEL';
}
export declare const CANCEL: CANCEL;
export declare enum Encoding {
    Utf16 = -2,
    Buffer = -1,
    Utf8 = 0,
    None = 1,
    Ansi = 2
}
export declare type TypeFromEncoding<T extends Encoding> = T extends Encoding.Buffer ? Uint8Array : string;
export declare type TypedArrayBuffer = Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;
export declare type Bufferable = TypedArrayBuffer | ArrayBuffer | DataView;
export declare type AnyFunction = (this: any, ...args: any[]) => any;
export declare type NonNullableFields<T extends any[]> = {
    [key in keyof T]: NonNullable<T[key]>;
};
export declare type NonNullableParameters<THIS, T> = T extends (...args: infer ARGS) => infer RET ? (this: THIS, ...args: NonNullableFields<ARGS>) => RET : never;
export declare function emptyFunc(): void;
export declare function abstract(): never;
export declare function unreachable(): never;
export declare function notImplemented(): never;
export declare type AbstractClass<T> = Function & {
    prototype: T;
};
