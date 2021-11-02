import { AllocatedPointer, cgate, NativePointer, StaticPointer, VoidPointer, VoidPointerConstructor } from './core';
import { FunctionFromTypes_js, makefunc, MakeFuncOptions, ParamType } from './makefunc';
interface VoidPointerConstructorEx extends VoidPointerConstructor {
    new (param?: VoidPointer | null): VoidPointer;
}
declare const VoidPointerEx: VoidPointerConstructorEx;
/**
 * Load external DLL
 * You can call native functions by name
 */
export declare class NativeModule extends VoidPointerEx {
    name: string;
    constructor();
    getProcAddress(name: string): NativePointer;
    getProcAddressByOrdinal(ordinal: number): NativePointer;
    /**
     * get the procedure from DLL as a javascript method
     *
     * wrapper codes are not deleted permanently.
     * do not use it dynamically.
     *
     * @param name name of procedure
     * @param returnType *_t or *Pointer
     * @param this *_t or *Pointer, if it's non-null, it passes this parameter as first parameter.
     * @param structureReturn if set it to true, it allocates first parameter with the returning class and returns it.
     * @param params *_t or *Pointer
     */
    getFunction<RETURN extends ParamType, OPTS extends MakeFuncOptions<any> | null, PARAMS extends ParamType[]>(name: string, returnType: RETURN, opts?: OPTS | null, ...params: PARAMS): FunctionFromTypes_js<NativePointer, OPTS, PARAMS, RETURN>;
    toString(): string;
    /**
     * get NativeModule by name
     * wrapper of GetModuleHandleW
     * if you want to load the new module. Please use NativeModule.load instead
     * @param name return exe module if null
     */
    static get(name: string | null): NativeModule;
    /**
     * load NativeModule by name
     * wrapper of LoadLibraryW
     */
    static load(name: string): NativeModule;
}
export declare class ThreadHandle extends VoidPointer {
    close(): boolean;
}
export declare class CriticalSection extends AllocatedPointer {
    private static readonly bytes;
    constructor();
    enter(): void;
    leave(): void;
    tryEnter(): boolean;
    dispose(): void;
}
export declare namespace dll {
    const current: NativeModule;
    const base: StaticPointer;
    namespace ntdll {
        const module: NativeModule;
        const wine_get_version: (() => string) | null;
    }
    namespace kernel32 {
        const module: NativeModule;
        const LoadLibraryW: FunctionFromTypes_js<NativePointer, null, [makefunc.ParamableT<string, string>], typeof NativeModule>;
        const LoadLibraryExW: FunctionFromTypes_js<NativePointer, null, [makefunc.ParamableT<string, string>, VoidPointerConstructor, import("./nativetype").NativeType<number, number>], typeof NativeModule>;
        const FreeLibrary: FunctionFromTypes_js<NativePointer, null, [typeof NativeModule], import("./nativetype").NativeType<boolean, boolean>>;
        const VirtualProtect: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor, import("./nativetype").NativeType<number, number>, import("./nativetype").NativeType<number, number>, makefunc.ParamableT<import("./common").Bufferable | VoidPointer, import("./common").Bufferable | VoidPointer>], import("./nativetype").NativeType<boolean, boolean>>;
        const GetLastError: FunctionFromTypes_js<NativePointer, MakeFuncOptions<any> | null, [], import("./nativetype").NativeType<number, number>>;
        const CreateThread: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor, import("./nativetype").NativeType<number, number>, VoidPointerConstructor, VoidPointerConstructor, import("./nativetype").NativeType<number, number>, makefunc.ParamableT<import("./common").Bufferable | VoidPointer, import("./common").Bufferable | VoidPointer>], typeof ThreadHandle>;
        const TerminateThread: FunctionFromTypes_js<NativePointer, null, [typeof ThreadHandle, import("./nativetype").NativeType<number, number>], import("./nativetype").NativeType<void, void>>;
        const CloseHandle: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor], import("./nativetype").NativeType<boolean, boolean>>;
        const WaitForSingleObject: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor, import("./nativetype").NativeType<number, number>], import("./nativetype").NativeType<number, number>>;
        const CreateEventW: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor, import("./nativetype").NativeType<number, number>, import("./nativetype").NativeType<number, number>, makefunc.ParamableT<string, string>], VoidPointerConstructor>;
        const SetEvent: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor], import("./nativetype").NativeType<boolean, boolean>>;
        const GetCurrentThreadId: FunctionFromTypes_js<VoidPointer, MakeFuncOptions<any> | null, [], import("./nativetype").NativeType<number, number>>;
        const InitializeCriticalSection: FunctionFromTypes_js<NativePointer, null, [typeof CriticalSection], import("./nativetype").NativeType<void, void>>;
        const DeleteCriticalSection: FunctionFromTypes_js<NativePointer, null, [typeof CriticalSection], import("./nativetype").NativeType<void, void>>;
        const EnterCriticalSection: FunctionFromTypes_js<NativePointer, null, [typeof CriticalSection], import("./nativetype").NativeType<void, void>>;
        const LeaveCriticalSection: FunctionFromTypes_js<NativePointer, null, [typeof CriticalSection], import("./nativetype").NativeType<void, void>>;
        const TryEnterCriticalSection: FunctionFromTypes_js<NativePointer, null, [typeof CriticalSection], import("./nativetype").NativeType<boolean, boolean>>;
        const LocalFree: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor], VoidPointerConstructor>;
        const SetDllDirectoryW: FunctionFromTypes_js<NativePointer, null, [makefunc.ParamableT<string, string>], import("./nativetype").NativeType<boolean, boolean>>;
        export import GetProcAddress = cgate.GetProcAddress;
        export import GetModuleHandleW = cgate.GetModuleHandleW;
    }
    namespace ucrtbase {
        const module: NativeModule;
        const _beginthreadex: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor, import("./nativetype").NativeType<number, number>, VoidPointerConstructor, VoidPointerConstructor, import("./nativetype").NativeType<number, number>, makefunc.ParamableT<import("./common").Bufferable | VoidPointer, import("./common").Bufferable | VoidPointer>], typeof ThreadHandle>;
        const free: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor], import("./nativetype").NativeType<void, void>>;
        const malloc: FunctionFromTypes_js<VoidPointer, null, [import("./nativetype").NativeType<number, number>], typeof NativePointer>;
        const __stdio_common_vsprintf: NativePointer;
    }
    namespace vcruntime140 {
        const module: NativeModule;
        const memset: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor, import("./nativetype").NativeType<number, number>, import("./nativetype").NativeType<number, number>], import("./nativetype").NativeType<void, void>>;
        const memcmp: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor, VoidPointerConstructor, import("./nativetype").NativeType<number, number>], import("./nativetype").NativeType<number, number>>;
        const memcpy: FunctionFromTypes_js<VoidPointer, null, [VoidPointerConstructor, VoidPointerConstructor, import("./nativetype").NativeType<number, number>], import("./nativetype").NativeType<void, void>>;
        const memchr: FunctionFromTypes_js<NativePointer, null, [VoidPointerConstructor, import("./nativetype").NativeType<number, number>, import("./nativetype").NativeType<number, number>], typeof NativePointer>;
    }
    namespace msvcp140 {
        const module: NativeModule;
        const _Cnd_do_broadcast_at_thread_exit: NativePointer;
        const std_cin: NativePointer;
    }
}
export {};
