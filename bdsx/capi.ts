import { asm, Register } from "./assembler";
import { RawTypeId } from "./common";
import { dll, ThreadHandle } from "./dll";
import { FunctionFromTypes_js, makefunc, NativePointer, ParamType, ReturnType, runtimeError, VoidPointer } from "./core";

export namespace capi
{
    export const debugBreak = asm().debugBreak().ret().make(RawTypeId.Void, null, false);

    export const getJsValueRef:(value:any)=>VoidPointer = makefunc.js(
        asm().mov_r_r(Register.rax, Register.rcx).ret().alloc(), VoidPointer, null, false, RawTypeId.JsValueRef);

    export function createThread(functionPointer:VoidPointer, param:VoidPointer|null = null):[ThreadHandle, number]
    {
        const out = new Uint32Array(1);
        const handle = dll.kernel32.CreateThread(null, 0, functionPointer, param, 0, out);
        return [handle, out[0]];
    }
    
    export function beginThreadEx(functionPointer:VoidPointer, param:VoidPointer|null = null):[ThreadHandle, number]
    {
        const out = new Uint32Array(1);
        const handle = dll.ucrtbase._beginthreadex(null, 0, functionPointer, param, 0, out);
        return [handle, out[0]];
    }

    /**
     * memory allocate by native c
     */
    export const malloc:(size:number)=>NativePointer = dll.ucrtbase.malloc;
    /**
     * memory release by native c
     */
    export const free:(ptr:VoidPointer)=>void = dll.ucrtbase.free;
}

export function makefunc_vf<R extends ReturnType, PARAMS extends ParamType[]>(
    vftableOffset:number, vfuncOffset:number, returnType:R, structureReturn:boolean, ...params:PARAMS):FunctionFromTypes_js<VoidPointer, typeof VoidPointer, PARAMS, R>
{
	return makefunc.js(asm()
	.mov_r_rp(Register.rax, Register.rcx, vftableOffset)
	.jmp_rp(Register.rax, vfuncOffset)
	.alloc(), returnType, VoidPointer, structureReturn, ...params);
}
