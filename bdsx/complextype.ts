import { OperationSize, Register } from "./assembler";
import { chakraUtil, VoidPointer, VoidPointerConstructor } from "./core";
import { FunctionFromTypes_js_without_pointer, makefunc, MakeFuncOptions, ParamType } from "./makefunc";
import { NativeClass, NativeClassType } from "./nativeclass";
import { NativeType, Type } from "./nativetype";


export interface OverloadedFunction {
    (...args:any[]):any;
    overload(ptr:VoidPointer, returnType:makefunc.Paramable, opts?:{this?:Type<any>}|null, ...args:Type<any>[]):this;
    get(opts?:Type<any>|null, ...args:Type<any>[]):OverloadedEntry|null;
}

export class OverloadedEntry {
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
            if (!this.args[i].isTypeOf(args[i])) return false;
        }
        return true;
    }
    equals(thisv:Type<any>|null, args:Type<any>[]):boolean {
        if (this.thisType !== null) {
            if (this.thisType !== thisv) return false;
        }
        if (args.length !== this.args.length) return false;
        for (let i=0;i<args.length;i++) {
            if (this.args[i] !== args[i]) return false;
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
            throw Error(`overload not found`);
        } as OverloadedFunction;
        tfunc.overload = function(this:OverloadedFunction, ptr:VoidPointer, returnType:makefunc.Paramable, opts?:{this?:Type<any>}|null, ...args:Type<any>[]):OverloadedFunction {
            const fn = makefunc.js(ptr, returnType, opts, ...args);
            overloads.push(new OverloadedEntry(opts?.this || null, args, fn));
            return this;
        };
        tfunc.get = function(this:OverloadedFunction, thisType:Type<any>|null = null, ...args:Type<any>[]):OverloadedEntry|null {
            for (const overload of overloads) {
                if (overload.equals(thisType, args)) return overload;
            }
            return null;
        };
        return tfunc;
    }
}

export class NativeTemplateClass extends NativeClass {
    static readonly templates:any[] = [];
    static make(this:{new():NativeTemplateClass}, ...items:any[]):any{
        class SpecializedTemplateClass extends (this as {new():NativeTemplateClass}) {
            static readonly templates = items;
        }
        Object.defineProperty(SpecializedTemplateClass, 'name', {value: `${this.name}<${items.map(item=>item.name || item.toString()).join(',')}>`});
        return SpecializedTemplateClass as any;
    }
}


const makefunc_np = Symbol();



let warned = false;
function warn():void {
    if (warned) return;
    warned = true;
    console.log(`NativeFunctionType has potential for memory leaks.`);
}
let callJsSingleton:VoidPointer|null = null;
function makeCallJs():VoidPointer {
    if (callJsSingleton !== null) return callJsSingleton;
    return callJsSingleton = makefunc.np((jsfunc:any, source:any)=>jsfunc(source), VoidPointer, null, makefunc.JsValueRef, makefunc.JsValueRef);
}

let callNpSingleton:VoidPointer|null = null;
function makeCallNp():VoidPointer {
    if (callNpSingleton !== null) return callNpSingleton;
    return callNpSingleton = makefunc.np((jsfunc:any, source:VoidPointer)=>jsfunc(source), VoidPointer, null, makefunc.JsValueRef, VoidPointer);
}

export class NativeFunctionType<T extends (...args:any[])=>any> extends NativeType<T>{
    parameterTypes:ParamType[];
    returnType:ParamType;
    options:MakeFuncOptions<any>|null;

    static make<OPTS extends MakeFuncOptions<any>|null, RETURN extends makefunc.Paramable, PARAMS extends makefunc.Paramable[]>(
        returnType:RETURN,
        opts?: OPTS,
        ...params: PARAMS):NativeFunctionType<FunctionFromTypes_js_without_pointer<OPTS, PARAMS, RETURN>> {
        type Func = FunctionFromTypes_js_without_pointer<OPTS, PARAMS, RETURN> & {[makefunc_np]?:VoidPointer};
        function getNp(func:Func):VoidPointer {
            const ptr = func[makefunc_np];
            if (ptr != null) return ptr;
            warn();
            console.log(`a function(${ptr}) is allocated.`);
            return func[makefunc_np] = makefunc.np(func as any, returnType, opts, ...params);
        }
        function getJs(ptr:VoidPointer):Func {
            warn();
            console.log(`a function(${ptr}) is allocated.`);
            return makefunc.js(ptr, returnType, opts, ...params);
        }
        return new NativeFunctionType<Func>(
            `${returnType.name} (__cdecl*)(${params.map(param=>param.name).join(',')})`,
            8, 8,
            v=>v instanceof Function,
            (ptr, offset)=>getJs(ptr.add(offset, offset!>>31)),
            (ptr, value, offset)=>{
                const nativeproc = getNp(value);
                ptr.setPointer(nativeproc, offset);
                return nativeproc;
            },
            (asm, target, source)=>{
                const calljs = makeCallJs();
                chakraUtil.JsAddRef(getNp);
                const getNpRef = chakraUtil.asJsValueRef(getNp);
                asm.mov_t_t(makefunc.Target[1], source, OperationSize.qword);
                asm.mov_r_c(Register.rcx, getNpRef);
                asm.call64(calljs, Register.rax);
                asm.mov_t_t(target, makefunc.Target.return, OperationSize.qword);
            },
            (asm, target, source)=>{
                const callnp = makeCallNp();
                chakraUtil.JsAddRef(getJs);
                const getJsRef = chakraUtil.asJsValueRef(getJs);
                asm.mov_t_t(makefunc.Target[1], source, OperationSize.qword);
                asm.mov_r_c(Register.rcx, getJsRef);
                asm.call64(callnp, Register.rax);
                asm.mov_t_t(target, makefunc.Target.return, OperationSize.qword);
            },
            (asm, target, source)=>{
                asm.mov_t_t(target, source, OperationSize.qword);
            });
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

export const NativeVarArgs = new NativeType<any[]>(
    '...',
    0,
    0,
    ()=>{ throw Error('Unexpected usage'); },
    ()=>{ throw Error('Unexpected usage'); },
    ()=>{ throw Error('Unexpected usage'); },
    ()=>{ throw Error('Unimplemented'); },
    ()=>{ throw Error('Unimplemented'); },
    ()=>{ throw Error('Unimplemented'); },
    ()=>{ throw Error('Unexpected usage'); },
    ()=>{ throw Error('Unexpected usage'); },
    ()=>{ throw Error('Unexpected usage'); },
    ()=>{ throw Error('Unexpected usage'); }
);
export type NativeVarArgs = any[];
