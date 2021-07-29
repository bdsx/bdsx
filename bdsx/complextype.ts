import { VoidPointer, VoidPointerConstructor } from "./core";
import { FunctionFromTypes_js_without_pointer, makefunc, MakeFuncOptions, ParamType } from "./makefunc";
import { NativeClass } from "./nativeclass";
import { NativeType, Type } from "./nativetype";


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

let warned = false;
function warn():void {
    if (warned) return;
    warned = true;
    console.log(`NativeFunctionType has potential for memory leaks.`);
}
export class NativeFunctionType<T extends (...args:any[])=>any> extends NativeType<T>{
    parameterTypes:ParamType[];
    returnType:ParamType;
    options:MakeFuncOptions<any>|null;

    static make<OPTS extends MakeFuncOptions<any>|null, RETURN extends makefunc.Paramable, PARAMS extends makefunc.Paramable[]>(
        returnType:RETURN,
        opts?: OPTS,
        ...params: PARAMS):NativeFunctionType<FunctionFromTypes_js_without_pointer<OPTS, PARAMS, RETURN>> {

        const makefunc_np = Symbol();
        type Func = FunctionFromTypes_js_without_pointer<OPTS, PARAMS, RETURN> & {[makefunc_np]?:VoidPointer};
        function getNp(func:Func):VoidPointer {
            const ptr = func[makefunc_np];
            if (ptr != null) return ptr;
            warn();
            console.log(`a function(${ptr}) is allocated.`);
            return func[makefunc_np] = makefunc.np(func as any, returnType, opts, ...params);
        }
        function getJs(ptr:VoidPointer):Func {
            return makefunc.js(ptr, returnType, opts, ...params);
        }
        return new NativeFunctionType<Func>(
            `${returnType.name} (__cdecl*)(${params.map(param=>param.name).join(',')})`,
            8, 8,
            v=>v instanceof Function,
            undefined,
            (ptr, offset)=>getJs(ptr.add(offset, offset!>>31)),
            (ptr, value, offset)=>{
                const nativeproc = getNp(value);
                ptr.setPointer(nativeproc, offset);
                return nativeproc;
            },
            (stackptr, offset)=>getJs(stackptr.getPointer(offset)),
            (stackptr, param, offset)=>stackptr.setPointer(getNp(param), offset));
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
    ()=>{ throw Error('Not implemented'); },
    ()=>{ throw Error('Not implemented'); },
    ()=>{ throw Error('Unexpected usage'); },
    ()=>{ throw Error('Unexpected usage'); },
    ()=>{ throw Error('Unexpected usage'); },
    ()=>{ throw Error('Unexpected usage'); }
);
export type NativeVarArgs = any[];
