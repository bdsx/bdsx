import { VoidPointer } from "./core";
import { FunctionFromTypes_js, makefunc, MakeFuncOptions, ParamType } from "./makefunc";
import { NativeClass, NativeClassType } from "./nativeclass";
import { Type } from "./nativetype";


export interface OverloadedFunction {
    (...args:any[]):any;
    overload(fn:(...args:any[])=>any, ...type:Type<any>[]):this;
}

export namespace OverloadedFunction {
    export function make():OverloadedFunction {
        const overloads:[Type<any>[], (...args:any[])=>any][] = [];
        const tfunc = function(this:unknown, ...args:any[]):void {
            for (const [types, fn] of overloads) {
                for (let i=0;i<args.length;i++) {
                    types[i].isTypeOf(args[i]);
                }
                return fn.apply(this, args);
            }
            throw Error(`template function not found`);
        } as OverloadedFunction;
        tfunc.overload = function(this:OverloadedFunction, fn:(...args:any[])=>any, ...args:Type<any>[]):OverloadedFunction {
            overloads.push([args, fn]);
            return this;
        };
        return tfunc;
    }
}

export class NativeTemplateClass extends NativeClass {
    static make<T extends NativeTemplateClass, ITEMS extends any[]>(this:{new():T}, ...items:ITEMS):NativeClassType<T> {
        const base = this as NativeClassType<T>;
        class SpecializedTemplateClass extends (this as {new():NativeClass}) {
        }
        Object.defineProperty(SpecializedTemplateClass, 'name', {value: `${base.name}<${items.map(item=>item.name || item.toString()).join(',')}>`});
        return base;
    }
}

type ArrayParameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;
export class NativeFunctionType<T extends (...args:any[])=>any> extends NativeClass{
    parameterTypes:ParamType[];
    returnType:ParamType;
    options:MakeFuncOptions<any>|null;

    private func:T|null = null;

    call(...args:ArrayParameters<T>):ReturnType<T> {
        if (this.func === null) {
            console.log(`NativeFunctionType.call has potential for memory leaks.`);
            console.log(`a function(${this}) is allocated.`);
            this.func = makefunc.js(this, this.returnType, this.options, ...this.parameterTypes) as unknown as T;
        }
        return this.func(...args);
    }

    static make<OPTS extends MakeFuncOptions<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
        returnType:RETURN,
        opts?: OPTS,
        ...params: PARAMS):NativeClassType<NativeFunctionType<FunctionFromTypes_js<VoidPointer, OPTS, PARAMS, RETURN>>> {

        class NativeFunctionTypeImpl extends NativeFunctionType<FunctionFromTypes_js<VoidPointer, OPTS, PARAMS, RETURN>> {
        }
        NativeFunctionTypeImpl.prototype.parameterTypes = params;
        NativeFunctionTypeImpl.prototype.returnType = returnType;
        NativeFunctionTypeImpl.prototype.options = opts || null;
        return NativeFunctionTypeImpl;
    }
}


export class MemberPointer<B, T> {
    base:Type<B>;
    type:Type<T>;

    constructor(public readonly offset:number) {
    }

    static make<B, T>(base:Type<B>, type:Type<T>):{new(offset:number):MemberPointer<B, T>} {
        class MemberPointerImpl extends MemberPointer<B, T> {
        }
        MemberPointerImpl.prototype.base = base;
        MemberPointerImpl.prototype.type = type;
        return MemberPointerImpl;
    }
}
