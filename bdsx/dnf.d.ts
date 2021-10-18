import { FloatRegister, Register } from "./assembler";
import { AnyFunction } from "./common";
import { NativePointer } from "./core";
import { FunctionFromTypes_js, makefunc, MakeFuncOptions, ParamType } from "./makefunc";
import type { Type, UnwrapTypeArrayToArray } from "./nativetype";
declare global {
    interface Function {
        overloads?: AnyFunction[];
        overloadInfo?: dnf.OverloadInfo;
        isNativeFunction?: boolean;
        [nativeCall]?: AnyFunction;
    }
}
declare const nativeCall: unique symbol;
export declare function dnf<T>(cls: Type<T>, key: keyof T): dnf.Tool<T>;
export declare function dnf(nf: AnyFunction): dnf.Tool<void>;
export declare namespace dnf {
    class Tool<THIS> {
        readonly nf: AnyFunction;
        readonly name: string;
        readonly thisType: Type<THIS> | null;
        constructor(nf: AnyFunction, name: string, thisType: Type<THIS> | null);
        /**
         * search overloads with types
         */
        get(thisv: unknown | null, paramTypes: Type<any>[], templates?: unknown[]): AnyFunction | null;
        /**
         * search overloads with templates
         */
        getByTemplates(thisType?: Type<any> | null, ...args: unknown[]): AnyFunction | null;
        /**
         * search overloads with values
         */
        getByValues<ARGS extends any[]>(thisv: unknown, ...args: ARGS): ((...args: any[]) => any) | null;
        getByTypes<ARGS extends Type<any>[]>(thisType?: null, ...args: ARGS): ((this: THIS, ...args: UnwrapTypeArrayToArray<ARGS>) => any) | null;
        getByTypes<THIS, ARGS extends Type<any>[]>(thisType: Type<THIS>, ...args: ARGS): ((this: THIS, ...args: UnwrapTypeArrayToArray<ARGS>) => any) | null;
        getAddress(): NativePointer;
        getInfo(): OverloadInfo;
        getRegistersForParameters(): [Register[], FloatRegister[]];
        overload(func: (this: THIS, ...args: any[]) => any, ...paramTypes: Type<any>[]): void;
        /**
         * ignore original features.
         */
        overwrite(func: (this: THIS, ...args: any[]) => any): void;
        reform<OPTS extends MakeFuncOptions<any> | null, RETURN extends ParamType, PARAMS extends ParamType[]>(returnType: RETURN, opts?: OPTS, ...params: PARAMS): FunctionFromTypes_js<NativePointer, OPTS, PARAMS, RETURN>;
    }
    type OverloadInfo = [number, makefunc.Paramable[], makefunc.Paramable, MakeFuncOptions<any> | null, unknown[]?];
    function makeOverload(): AnyFunction;
    function getAddressOf(nf: AnyFunction): NativePointer;
    function getOverloadInfo(nf: AnyFunction): OverloadInfo;
    /**
     * make a deferred native function
     */
    function make(): AnyFunction;
}
export {};
