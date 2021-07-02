
import { asmcode } from './asm/asmcode';
import { abstract } from './common';
import { AllocatedPointer, cgate, NativePointer, VoidPointer, VoidPointerConstructor } from './core';
import { dllraw } from './dllraw';
import { FunctionFromTypes_js, makefunc, MakeFuncOptions, ParamType } from './makefunc';
import { bool_t, int32_t, int64_as_float_t, void_t } from './nativetype';

interface VoidPointerConstructorEx extends VoidPointerConstructor {
    new(param?:VoidPointer|null):VoidPointer;
}

const VoidPointerEx:VoidPointerConstructorEx = VoidPointer;

/**
 * Load external DLL
 * You can call native functions by name
 */
export class NativeModule extends VoidPointerEx {
    public name = '[undefined]';

    constructor() {
        super(arguments[0] != null ? arguments[0] instanceof VoidPointer ? arguments[0] : dll.kernel32.LoadLibraryW(arguments[0]) : undefined);
    }

    getProcAddress(name: string): NativePointer {
        abstract();
    }
    getProcAddressByOrdinal(ordinal: number): NativePointer {
        abstract();
    }

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
    getFunction<RETURN extends ParamType, OPTS extends MakeFuncOptions<any>|null, PARAMS extends ParamType[]>(
        name: string, returnType: RETURN, opts?: OPTS|null, ...params: PARAMS):
        FunctionFromTypes_js<NativePointer, OPTS, PARAMS, RETURN>{
        const addr = this.getProcAddress(name);
        if (addr === null) throw Error(`${this.name}: Cannot find procedure, ${name}`);
        return makefunc.js(addr, returnType, opts, ...params);
    }

    toString():string {
        return `[${this.name}: ${super.toString()}]`;
    }

    /**
     * get NativeModule by name
     * wrapper of GetModuleHandleW
     * if you want to load the new module. Please use NativeModule.load instead
     * @param name return exe module if null
     */
    static get(name: string|null): NativeModule {
        const module = getModuleHandle(name);
        if (module === null) throw Error(`${name}: Cannot find module`);
        module.name = name || '[exe]';
        return module;
    }

    /**
     * load NativeModule by name
     * wrapper of LoadLibraryW
     */
    static load(name: string): NativeModule {
        const module = dll.kernel32.LoadLibraryW(name);
        if (module === null) {
            const errno = dll.kernel32.GetLastError();
            const errobj:NodeJS.ErrnoException = Error(`${name}: Cannot load module, errno=${errno}`);
            errobj.errno = errno;
            throw errobj;
        }
        module.name = name;
        return module;
    }
}

const getModuleHandle = makefunc.js(cgate.GetModuleHandleWPtr, NativeModule, null, makefunc.Utf16);

export class ThreadHandle extends VoidPointer {
    close():boolean {
        return dll.kernel32.CloseHandle(this);
    }
}

export class CriticalSection extends AllocatedPointer {
    private static readonly bytes = 40;

    constructor() {
        super(CriticalSection.bytes);
        dll.kernel32.InitializeCriticalSection(this);
    }

    enter():void {
        dll.kernel32.EnterCriticalSection(this);
    }

    leave():void {
        dll.kernel32.LeaveCriticalSection(this);
    }

    tryEnter():boolean {
        return dll.kernel32.TryEnterCriticalSection(this);
    }

    dispose():void {
        dll.kernel32.DeleteCriticalSection(this);
    }
}

NativeModule.prototype.getProcAddress = makefunc.js(cgate.GetProcAddressPtr, NativePointer, { this: NativeModule }, makefunc.Utf8);
NativeModule.prototype.getProcAddressByOrdinal = makefunc.js(cgate.GetProcAddressPtr, NativePointer, { this: NativeModule }, int32_t);

export namespace dll {
    export const current = NativeModule.get(null); // get the exe module, it's the address base of RVA
    export namespace ntdll {
        export const module = NativeModule.get('ntdll.dll');

        const wine_get_version_ptr = module.getProcAddress('wine_get_version');
        export const wine_get_version:(()=>string)|null = wine_get_version_ptr === null ?
            null : makefunc.js(wine_get_version_ptr, makefunc.Utf8);
    }
    export namespace kernel32 {
        export const module = dllraw.kernel32.module.as(NativeModule);
        export const LoadLibraryW = module.getFunction('LoadLibraryW', NativeModule, null, makefunc.Utf16);
        export const LoadLibraryExW = module.getFunction('LoadLibraryExW', NativeModule, null, makefunc.Utf16, VoidPointer, int32_t);
        export const FreeLibrary = module.getFunction('FreeLibrary', bool_t, null, NativeModule);
        export const VirtualProtect = module.getFunction('VirtualProtect', bool_t, null, VoidPointer, int64_as_float_t, int64_as_float_t, makefunc.Buffer);
        export const GetLastError = module.getFunction('GetLastError', int32_t);
        export const CreateThread = module.getFunction('CreateThread', ThreadHandle, null, VoidPointer, int64_as_float_t, VoidPointer, VoidPointer, int32_t, makefunc.Buffer);
        export const TerminateThread = module.getFunction('TerminateThread', void_t, null, ThreadHandle, int32_t);
        export const CloseHandle = module.getFunction('CloseHandle', bool_t, null, VoidPointer);
        export const WaitForSingleObject = module.getFunction('WaitForSingleObject', int32_t, null, VoidPointer, int32_t);
        export const CreateEventW = module.getFunction('CreateEventW', VoidPointer, null, VoidPointer, int32_t, int32_t, makefunc.Utf16);
        export const SetEvent = module.getFunction('SetEvent', bool_t, null, VoidPointer);
        export const GetCurrentThreadId = makefunc.js(dllraw.kernel32.GetCurrentThreadId, int32_t);
        export const InitializeCriticalSection = module.getFunction('InitializeCriticalSection', void_t, null, CriticalSection);
        export const DeleteCriticalSection = module.getFunction('DeleteCriticalSection', void_t, null, CriticalSection);
        export const EnterCriticalSection = module.getFunction('EnterCriticalSection', void_t, null, CriticalSection);
        export const LeaveCriticalSection = module.getFunction('LeaveCriticalSection', void_t, null, CriticalSection);
        export const TryEnterCriticalSection = module.getFunction('TryEnterCriticalSection', bool_t, null, CriticalSection);
        export const LocalFree = module.getFunction('LocalFree', VoidPointer, null, VoidPointer);
        export const SetDllDirectoryW = module.getFunction('SetDllDirectoryW', bool_t, null, makefunc.Utf16);
        export import GetProcAddress = cgate.GetProcAddress;
        export import GetModuleHandleW = cgate.GetModuleHandleW;
    }
    export namespace ucrtbase {
        export const module = dllraw.ucrtbase.module.as(NativeModule);
        export const _beginthreadex = module.getFunction('_beginthreadex', ThreadHandle, null, VoidPointer, int64_as_float_t, VoidPointer, VoidPointer, int32_t, makefunc.Buffer);

        export const free = module.getFunction('free', void_t, null, VoidPointer);
		export const malloc = makefunc.js(dllraw.ucrtbase.malloc, NativePointer, null, int64_as_float_t);
        export const __stdio_common_vsprintf = module.getProcAddress('__stdio_common_vsprintf');
    }
    export namespace vcruntime140 {
        export const module = dllraw.vcruntime140.module.as(NativeModule);
        export const memset = module.getFunction('memset', void_t, null, VoidPointer, int32_t, int64_as_float_t);
        export const memcmp = module.getFunction('memcmp', int32_t, null, VoidPointer, VoidPointer, int64_as_float_t);
        export const memcpy = makefunc.js(dllraw.vcruntime140.memcpy, void_t, null, VoidPointer, VoidPointer, int64_as_float_t);
        export const memchr = module.getFunction('memchr', NativePointer, null, VoidPointer, int32_t, int64_as_float_t);
    }
    export namespace msvcp140 {
        export const module = NativeModule.load('msvcp140.dll');
        export const _Cnd_do_broadcast_at_thread_exit = module.getProcAddress("_Cnd_do_broadcast_at_thread_exit");
        export const std_cin = module.getProcAddress("?cin@std@@3V?$basic_istream@DU?$char_traits@D@std@@@1@A");
    }
}

const RtlCaptureContext = dll.kernel32.module.getProcAddress('RtlCaptureContext');
asmcode.RtlCaptureContext = RtlCaptureContext;
asmcode.memset = dll.vcruntime140.memset.pointer;
