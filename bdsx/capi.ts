import { asm, Register } from "./assembler";
import { RawTypeId } from "./common";
import { AllocatedPointer, makefunc, NativePointer, VoidPointer } from "./core";
import { dll, NativeModule, ThreadHandle } from "./dll";

export namespace capi
{
    export const nodeThreadId = dll.kernel32.GetCurrentThreadId();
    export const debugBreak = asm().debugBreak().ret().make(RawTypeId.Void);

    export const getJsValueRef:(value:any)=>VoidPointer = makefunc.js(
        asm().mov_r_r(Register.rax, Register.rcx).ret().alloc(), VoidPointer, null, RawTypeId.JsValueRef);

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

    export function isRunningOnWine():boolean
    {
        return dll.ntdll.wine_get_version !== null;
    }

    // if (isRunningOnWine())
    {
        const str = new AllocatedPointer(100);
        str.setString("abc");

        const value = makefunc.js(asm()
            .sub_r_c(Register.rsp, 0x38)
            .mov_rp_c(Register.rsp, 0x28, 0)
            .mov_rp_c(Register.rsp, 0x20, 0)
            .mov_r_c(Register.rcx, 0)
            .mov_r_c(Register.rdx, 0)
            .mov_r_c(Register.r8, 0)
            .mov_r_c(Register.r9, str)
            .call64(dll.ucrtbase.__stdio_common_vsprintf, Register.rax)
            .add_r_c(Register.rsp, 0x38)
            .ret()
            .alloc(), RawTypeId.Int32)();
        console.log(value);

        //__stdio_common_vsprintf
    }
}
