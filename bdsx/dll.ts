
import { abstract, RawTypeId } from './common';
import { cgate, StaticPointer, NativePointer, VoidPointer } from './core';
import { FunctionFromTypes_js, makefunc, MakeFuncOptions, ParamType } from './makefunc';

/**
 * Load external DLL
 * You can call native functions by name
 */
export class NativeModule extends VoidPointer {
    public name = '[undefined]';

    /**
     * @deprecated use NativeModule.load(moduleName)
     */
    constructor(moduleNameOrPtr?:string|VoidPointer) {
        super(moduleNameOrPtr !== undefined ? moduleNameOrPtr instanceof VoidPointer ? moduleNameOrPtr : dll.kernel32.LoadLibraryW(moduleNameOrPtr) : undefined);
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
     * @param returnType RawTypeId or *Pointer
     * @param this RawTypeId or *Pointer, if it's non-null, it passes this parameter as first parameter.
     * @param structureReturn if set it to true, it allocates first parameter with the returning class and returns it.
     * @param params RawTypeId or *Pointer
     */
    getFunction<RETURN extends ParamType, OPTS extends MakeFuncOptions<any>|null, PARAMS extends ParamType[]>(
        name: string, returnType: RETURN, opts?: OPTS|null, ...params: PARAMS):
        FunctionFromTypes_js<NativePointer, OPTS, PARAMS, RETURN>{
        const addr = this.getProcAddress(name);
        if (addr.isNull()) throw Error(this.name + ': Cannot find procedure, ' + name);
        return makefunc.js(addr, returnType, opts, ...params);
    }

    toString():string {
        return `[${this.name}: 0x${super.toString()}]`;
    }

    /**
     * get NativeModule by name
     * wrapper of GetModuleHandleW
     * @param name return exe module if null 
     */
    static get(name: string|null): NativeModule {
        const module = getModuleHandle(name);
        if (module.isNull()) throw Error(name + ': Cannot find module');
        module.name = name || '[exe]';
        return module;
    }

    /**
     * load NativeModule by name
     * wrapper of LoadLibraryW
     */
    static load(name: string): NativeModule {
        const module = dll.kernel32.LoadLibraryW(name);
        if (module.isNull()) {
            const err = dll.kernel32.GetLastError();
            throw Error(name + ': Cannot load module, errno='+err);
        }
        module.name = name;
        return module;
    }
}

const getModuleHandle = makefunc.js(cgate.GetModuleHandleW, NativeModule, null, RawTypeId.StringUtf16);

export class ThreadHandle extends VoidPointer {
    close():boolean {
        return dll.kernel32.CloseHandle(this);
    }
}

export class CriticalSection extends VoidPointer {
    private static readonly bytes = 40;
    
    constructor() {
        super(dll.ucrtbase.malloc(CriticalSection.bytes));
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
        dll.ucrtbase.free(this);
    }
}

NativeModule.prototype.getProcAddress = makefunc.js(cgate.GetProcAddress, NativePointer, { this: NativeModule }, RawTypeId.StringUtf8);
NativeModule.prototype.getProcAddressByOrdinal = makefunc.js(cgate.GetProcAddress, NativePointer, { this: NativeModule }, RawTypeId.Int32);

export namespace dll {
    export namespace ntdll {
        export const module = NativeModule.get('ntdll.dll');

        const wine_get_version_ptr = module.getProcAddress('wine_get_version');
        export const wine_get_version:(()=>string)|null = wine_get_version_ptr.isNull() ? 
            null : makefunc.js(wine_get_version_ptr, RawTypeId.StringUtf8);
    }
    export namespace kernel32 {
        export const module = NativeModule.get('kernel32.dll');
        export const LoadLibraryW = module.getFunction('LoadLibraryW', NativeModule, null, RawTypeId.StringUtf16);
        export const VirtualProtect = module.getFunction('VirtualProtect', RawTypeId.Boolean, null, VoidPointer, RawTypeId.FloatAsInt64, RawTypeId.FloatAsInt64, RawTypeId.Buffer);
        export const Sleep = module.getFunction('Sleep', RawTypeId.Void, null, RawTypeId.Int32);
        export const SetCurrentDirectoryW = module.getFunction('SetCurrentDirectoryW', RawTypeId.Boolean, null, RawTypeId.StringUtf16);
        export const GetLastError = module.getFunction('GetLastError', RawTypeId.Int32);
        export const CreateThread = module.getFunction('CreateThread', ThreadHandle, null, VoidPointer, RawTypeId.FloatAsInt64, VoidPointer, VoidPointer, RawTypeId.Int32, RawTypeId.Buffer);
        export const TerminateThread = module.getFunction('TerminateThread', RawTypeId.Void, null, ThreadHandle, RawTypeId.Int32);
        export const CloseHandle = module.getFunction('CloseHandle', RawTypeId.Boolean, null, VoidPointer);
        export const WaitForSingleObject = module.getFunction('WaitForSingleObject', RawTypeId.Int32, null, VoidPointer, RawTypeId.Int32);
        export const CreateEventW = module.getFunction('CreateEventW', VoidPointer, null, VoidPointer, RawTypeId.Int32, RawTypeId.Int32, RawTypeId.StringUtf16);
        export const SetEvent = module.getFunction('SetEvent', RawTypeId.Boolean, null, VoidPointer);
        export const GetCurrentThreadId = module.getFunction('GetCurrentThreadId', RawTypeId.Int32);
        export const InitializeCriticalSection = module.getFunction('InitializeCriticalSection', RawTypeId.Void, null, CriticalSection);
        export const DeleteCriticalSection = module.getFunction('DeleteCriticalSection', RawTypeId.Void, null, CriticalSection);
        export const EnterCriticalSection = module.getFunction('EnterCriticalSection', RawTypeId.Void, null, CriticalSection);
        export const LeaveCriticalSection = module.getFunction('LeaveCriticalSection', RawTypeId.Void, null, CriticalSection);
        export const TryEnterCriticalSection = module.getFunction('TryEnterCriticalSection', RawTypeId.Boolean, null, CriticalSection);
        export const WaitForMultipleObjects = module.getProcAddress('WaitForMultipleObjects');
        export const FormatMessageW = module.getFunction('FormatMessageW', RawTypeId.Int32, null, RawTypeId.Int32, VoidPointer, RawTypeId.Int32, RawTypeId.Int32, VoidPointer, RawTypeId.Int32, VoidPointer);
        export const LocalFree = module.getFunction('LocalFree', VoidPointer, null, VoidPointer);
        export const SetDllDirectoryW = module.getFunction('SetDllDirectoryW', RawTypeId.Boolean, null, RawTypeId.StringUtf16);
        export const GetThreadContext = module.getFunction('GetThreadContext', RawTypeId.Boolean, null, VoidPointer, StaticPointer);
        export const SetThreadContext = module.getFunction('SetThreadContext', RawTypeId.Boolean, null, VoidPointer, StaticPointer);
        export const SuspendThread = module.getFunction('SuspendThread', RawTypeId.Int32, null, VoidPointer);
        export const ResumeThread = module.getFunction('ResumeThread', RawTypeId.Int32, null, VoidPointer);
        export const TlsAlloc = module.getFunction('TlsAlloc', RawTypeId.Int32);
        export const TlsFree = module.getFunction('TlsFree', RawTypeId.Boolean, null, RawTypeId.Int32);
    }
    export namespace ucrtbase {
        export const module = NativeModule.get('ucrtbase.dll');
        export const _get_initial_narrow_environment = module.getFunction('_get_initial_narrow_environment', StaticPointer);
        export const _beginthreadex = module.getFunction('_beginthreadex', ThreadHandle, null, VoidPointer, RawTypeId.FloatAsInt64, VoidPointer, VoidPointer, RawTypeId.Int32, RawTypeId.Buffer);

        export const free = module.getFunction('free', RawTypeId.Void, null, VoidPointer);
		export const malloc = module.getFunction('malloc', NativePointer, null, RawTypeId.FloatAsInt64);
        export const __stdio_common_vsprintf = module.getProcAddress('__stdio_common_vsprintf');
    }
    export namespace vcruntime140 {
        export const module = NativeModule.load('vcruntime140.dll');
        export const memset = module.getFunction('memset', RawTypeId.Void, null, VoidPointer, RawTypeId.Int32, RawTypeId.FloatAsInt64);
        export const memcmp = module.getFunction('memcmp', RawTypeId.Int32, null, VoidPointer, VoidPointer, RawTypeId.FloatAsInt64);
        export const memcpy = module.getFunction('memcpy', RawTypeId.Void, null, VoidPointer, VoidPointer, RawTypeId.FloatAsInt64);
        export const memchr = module.getFunction('memchr', NativePointer, null, VoidPointer, RawTypeId.Int32, RawTypeId.FloatAsInt64);
    }
    export namespace msvcp140 {
        export const module = NativeModule.load('msvcp140.dll');
        export const _Cnd_do_broadcast_at_thread_exit = module.getProcAddress("_Cnd_do_broadcast_at_thread_exit");
        export const std_cin = module.getProcAddress("?cin@std@@3V?$basic_istream@DU?$char_traits@D@std@@@1@A");
    }
}
