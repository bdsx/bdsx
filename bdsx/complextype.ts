import { VoidPointer, VoidPointerConstructor } from "./core";
import { FunctionFromTypes_js, makefunc, MakeFuncOptions, ParamType } from "./makefunc";
import { NativeClass, NativeClassType } from "./nativeclass";
import { Type } from "./nativetype";


export interface OverloadedFunction {
    (...args:any[]):any;
    overload(fn:(...args:any[])=>any, opts?:{this?:Type<any>}|null, ...type:Type<any>[]):this;
}

class OverloadedEntry {
    constructor(
        public readonly thisType:Type<any>|null,
        public readonly args:Type<any>[],
        public readonly func:(...args:any[])=>any
    ) {
    }

    check(thisv:unknown, args:unknown[]):boolean {
        if (this.thisType !== null) {
            if (!this.thisType.isTypeOf(thisv)) return false;
        }
        for (let i=0;i<args.length;i++) {
            if (this.args[i].isTypeOf(args[i])) return false;
        }
        return true;
    }
}

export namespace OverloadedFunction {
    export function make():OverloadedFunction {
        const overloads:OverloadedEntry[] = [];
        const tfunc = function(this:unknown, ...args:any[]):void {
            for (const entry of overloads) {
                if (!entry.check(this, args)) continue;
                return entry.func.apply(this, args);
            }
            throw Error(`template function not found`);
        } as OverloadedFunction;
        tfunc.overload = function(this:OverloadedFunction, fn:(...args:any[])=>any, opts:{this?:Type<any>} = {}, ...args:Type<any>[]):OverloadedFunction {
            overloads.push(new OverloadedEntry(opts.this || null, args, fn));
            return this;
        };
        return tfunc;
    }
}

export class NativeTemplateClass extends NativeClass {
    static make<This extends {new():NativeTemplateClass}, Class extends NativeClass>(this:This, ...items:any[]):NativeClassType<Class>&This {
        class SpecializedTemplateClass extends (this as {new():NativeTemplateClass}) {
        }
        Object.defineProperty(SpecializedTemplateClass, 'name', {value: `${this.name}<${items.map(item=>item.name || item.toString()).join(',')}>`});
        return SpecializedTemplateClass as any;
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

export interface MemberPointerType<B, T> extends VoidPointerConstructor {
}

export class MemberPointer<B, T> extends VoidPointer {
    base:Type<B>;
    type:Type<T>;

    static make<B, T>(base:Type<B>, type:Type<T>):MemberPointerType<B, T> {
        class MemberPointerImpl extends MemberPointer<B, T> {
        }
        MemberPointerImpl.prototype.base = base;
        MemberPointerImpl.prototype.type = type;
        return MemberPointerImpl;
    }
}
