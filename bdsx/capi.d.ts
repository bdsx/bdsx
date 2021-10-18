import { NativePointer, VoidPointer } from "./core";
import { ThreadHandle } from "./dll";
export declare namespace capi {
    const nodeThreadId: number;
    const debugBreak: import("./makefunc").FunctionFromTypes_js<import("./core").StaticPointer, import("./makefunc").MakeFuncOptions<any> | null, [], import("./nativetype").NativeType<void, void>>;
    function createThread(functionPointer: VoidPointer, param?: VoidPointer | null, stackSize?: number): [ThreadHandle, number];
    function beginThreadEx(functionPointer: VoidPointer, param?: VoidPointer | null): [ThreadHandle, number];
    /**
     * memory allocate by native c
     */
    const malloc: (size: number) => NativePointer;
    /**
     * memory release by native c
     */
    const free: (ptr: VoidPointer) => void;
    function isRunningOnWine(): boolean;
    /**
     * Keep the object from GC
     */
    function permanent<T>(v: T): T;
}
