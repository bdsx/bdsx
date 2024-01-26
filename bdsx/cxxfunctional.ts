import { VoidPointer } from "./core";
import { dll } from "./dll";
import { CallablePointer, ParamType, TypeFrom_np2js, TypesFromParamIds_np2js, makefunc } from "./makefunc";
import { nativeClass, NativeClass, NativeClassType, nativeField, NativeStruct } from "./nativeclass";
import { CxxString, Type } from "./nativetype";
import { CxxStringWrapper } from "./pointer";

const lesses = new WeakMap<Type<any>, (a: any, b: any) => boolean>();

/**
 * std::less
 */
export const CxxLess = {
    /**
     * get defined std::less<type>
     *
     * it's just a kind of getter but uses 'make' for consistency.
     */
    make<T>(type: Type<T>): (a: T, b: T) => boolean {
        const fn = lesses.get(type);
        if (fn == null) throw Error(`std::less<${type.name}> not found`);
        return fn;
    },

    /**
     * define std::less<type>
     */
    define<T>(type: Type<T>, less: (a: T, b: T) => boolean): void {
        const fn = lesses.get(type);
        if (fn != null) throw Error(`std::less<${type.name}> is already defined`);
        lesses.set(type, less);
    },
};

export type CxxLess<T> = (a: T, b: T) => boolean;

function compare(a: VoidPointer, alen: number, b: VoidPointer, blen: number): number {
    const diff = dll.vcruntime140.memcmp(a, b, Math.min(alen, blen));
    if (diff !== 0) return diff;
    if (alen < blen) return -1;
    if (alen > blen) return 1;
    return 0;
}

CxxLess.define(CxxStringWrapper, (a, b) => compare(a, a.length, b, b.length) < 0);
CxxLess.define(CxxString, (a, b) => a < b);

@nativeClass()
class CxxFunctionImpl$VFTable extends NativeStruct {
    @nativeField(VoidPointer)
    _Copy: VoidPointer;
    @nativeField(VoidPointer)
    _Move: VoidPointer;
    @nativeField(VoidPointer)
    _Do_call: VoidPointer;
    @nativeField(VoidPointer)
    _Target_type: VoidPointer;
    @nativeField(VoidPointer)
    _Delete_this: VoidPointer;
    @nativeField(VoidPointer)
    _Get: VoidPointer;
}

@nativeClass()
class CxxFunctionImpl extends NativeClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    @nativeField(VoidPointer)
    callee: VoidPointer;
}

@nativeClass(0x40)
class CxxFunctionBase extends NativeClass {
    @nativeField(VoidPointer, 0x38)
    public impl: CxxFunctionImpl;
}

/**
 * Experimental support of std::function, its interface may change after makefunc.np could be destructed.
 */
export interface CxxFunctionType<RETURN, PARAMS extends any[]> extends NativeClassType<CxxFunction<RETURN, PARAMS>> {
    wrapNative(ptr: VoidPointer): CxxFunction<RETURN, PARAMS>;
    wrap(f: (...params: PARAMS) => RETURN): CxxFunction<RETURN, PARAMS>;
    delegate(delegee: (...params: PARAMS) => RETURN): CxxFunctionDelegator<RETURN, PARAMS>;
}

export interface CxxFunction<RETURN, PARAMS extends any[]> extends NativeClass {
    call(...params: PARAMS): RETURN;
}

export interface CxxFunctionDelegator<RETURN, PARAMS extends any[]> extends CxxFunction<RETURN, PARAMS> {
    delegee: ((...params: PARAMS) => RETURN)[];
    clone: () => CxxFunctionDelegator<RETURN, PARAMS>;
}

export const CxxFunction = {
    make<RETURN extends ParamType, PARAMS extends ParamType[]>(
        implVFTAddr: VoidPointer,
        returnType: RETURN,
        ...params: PARAMS
    ): CxxFunctionType<TypeFrom_np2js<RETURN>, TypesFromParamIds_np2js<PARAMS>> {
        type ReturnType = TypeFrom_np2js<RETURN>;
        type ParamsType = TypesFromParamIds_np2js<PARAMS>;
        const implVFT = implVFTAddr.as(CxxFunctionImpl$VFTable);
        const implVFT_Do_call = implVFT._Do_call.as(CallablePointer.make(returnType, { this: CxxFunctionImpl }, ...params));
        class CxxFunction_Impl extends CxxFunctionBase implements CxxFunction<ReturnType, ParamsType> {
            call(...params: ParamsType): ReturnType {
                return implVFT_Do_call.invoker.call(this.impl, ...params);
            }

            static wrapNative(ptr: VoidPointer): CxxFunction_Impl {
                const func = new CxxFunction_Impl(true);
                const impl = func.as(CxxFunctionImpl);
                impl.vftable = implVFT;
                impl.callee = ptr;
                func.impl = impl;
                return func;
            }

            static wrap(f: (...params: ParamsType) => ReturnType): CxxFunction_Impl {
                const ptr = makefunc.np(f, returnType, null, ...params);
                return this.wrapNative(ptr);
            }

            static delegate(delegee: (...params: ParamsType) => ReturnType): CxxFunctionDelegator_Impl {
                let delegeeStack: ((...params: ParamsType) => ReturnType)[] = [delegee];
                const ptr = makefunc.np((...params: ParamsType) => delegeeStack[delegeeStack.length - 1].call(null, ...params), returnType, null, ...params);
                const construct = (): CxxFunctionDelegator_Impl => {
                    const func = new CxxFunctionDelegator_Impl(true);
                    const impl = func.as(CxxFunctionImpl);
                    impl.vftable = implVFTAddr;
                    impl.callee = ptr;
                    func.impl = impl;
                    Object.defineProperty(func, "delegee", {
                        get: () => delegeeStack,
                        set: v => (delegeeStack = v),
                    });
                    func.clone = construct;
                    return func;
                };
                return construct();
            }
        }
        class CxxFunctionDelegator_Impl extends CxxFunction_Impl {
            delegee: ((...params: ParamsType) => ReturnType)[];
            clone: () => CxxFunctionDelegator_Impl;
        }
        return CxxFunction_Impl as unknown as CxxFunctionType<ReturnType, ParamsType>;
    },
};
