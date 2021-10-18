import { VoidPointer, VoidPointerConstructor } from "./core";
import { FunctionFromTypes_js_without_pointer, makefunc, MakeFuncOptions, ParamType } from "./makefunc";
import { NativeClass } from "./nativeclass";
import { NativeType, Type } from "./nativetype";
export declare class NativeTemplateClass extends NativeClass {
    static readonly templates: any[];
    static make(this: {
        new (): NativeTemplateClass;
    }, ...items: any[]): any;
}
export declare class NativeFunctionType<T extends (...args: any[]) => any> extends NativeType<T> {
    parameterTypes: ParamType[];
    returnType: ParamType;
    options: MakeFuncOptions<any> | null;
    static make<OPTS extends MakeFuncOptions<any> | null, RETURN extends makefunc.Paramable, PARAMS extends makefunc.Paramable[]>(returnType: RETURN, opts?: OPTS, ...params: PARAMS): NativeFunctionType<FunctionFromTypes_js_without_pointer<OPTS, PARAMS, RETURN>>;
}
export interface MemberPointerType<B, T> extends VoidPointerConstructor {
}
export declare class MemberPointer<B, T> extends VoidPointer {
    base: Type<B>;
    type: Type<T>;
    static make<B, T>(base: Type<B>, type: Type<T>): MemberPointerType<B, T>;
}
export declare const NativeVarArgs: NativeType<any[], any[]>;
export declare type NativeVarArgs = any[];
export declare class EnumType<T> extends NativeType<T> {
    private constructor();
    static make<T>(enumtype: T): EnumType<T[keyof T]>;
}
