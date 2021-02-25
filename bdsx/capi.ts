import asmcode = require("./asm/asmcode");
import { chakraUtil, NativePointer, VoidPointer } from "./core";
import { dll, ThreadHandle } from "./dll";
import { makefunc, RawTypeId } from "./makefunc";

export namespace capi
{
    export const nodeThreadId = dll.kernel32.GetCurrentThreadId();
    
    export const debugBreak = makefunc.js(asmcode.debugBreak, RawTypeId.Void);

    asmcode.nodeThreadId = nodeThreadId;

    /**
     * @deprecated use chakraUtil.asJsValueRef
     */
    export const getJsValueRef:(value:any)=>VoidPointer = chakraUtil.asJsValueRef;

    export function createThread(functionPointer:VoidPointer, param:VoidPointer|null = null, stackSize:number = 0):[ThreadHandle, number] {
        const out = new Uint32Array(1);
        const handle = dll.kernel32.CreateThread(null, stackSize, functionPointer, param, 0, out);
        return [handle, out[0]];
    }
    
    export function beginThreadEx(functionPointer:VoidPointer, param:VoidPointer|null = null):[ThreadHandle, number] {
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

    export function isRunningOnWine():boolean {
        return dll.ntdll.wine_get_version !== null;
    }

    /**
     * Keep the object from GC
     */
    export function permanent<T>(v:T):T {
        chakraUtil.JsAddRef(v);
        return v;
    }
}
