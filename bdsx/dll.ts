'use strict';

import { RawTypeId } from './common';
import { cgate, makefunc, StaticPointer, NativePointer, ReturnType, ParamType, VoidPointer, FunctionFromTypes_js } from './core';

/**
 * Load external DLL
 * You can call native functions by name
 */
export class NativeModule extends VoidPointer {
    public name = '[undefined]';

    /**
     * @deprecated use NativeModule.load(moduleName)
     */
    constructor(moduleNameOrPtr?:string|VoidPointer)
    {
        super(moduleNameOrPtr !== undefined ? moduleNameOrPtr instanceof VoidPointer ? moduleNameOrPtr : getModuleHandle(moduleNameOrPtr) : undefined);
    }

    /**
     * @deprecated use module.getFunction
     */
	get(name:string):makefunc.NativeFunction|null
	{
        return makefunc.js_old(this.getProcAddress(name));
    }
    
    getProcAddress(name: string): NativePointer
    {
        throw 'abstract';
    }
    getProcAddressByOrdinal(ordinal: number): NativePointer
    {
        throw 'abstract';
    }

    /**
     * get the procedure from DLL as a javascript method
     * 
     * wrapper codes are not deleted permanently.
     * do not use it dynamically.
     * 
     * @param name name of procedure
     * @param returnType RawTypeId or *Pointer
     * @param thisType RawTypeId or *Pointer, if it's non-null, it passes this parameter as first parameter.
     * @param structureReturn if set it to true, it allocates first parameter with the returning class and returns it.
     * @param params RawTypeId or *Pointer
     */
    getFunction<RETURN extends ReturnType, THIS extends ParamType, PARAMS extends ParamType[]>(
        name: string, returnType: RETURN, thisType: THIS|null, structureReturn:boolean, ...params: PARAMS):
        FunctionFromTypes_js<NativePointer, THIS, PARAMS, RETURN>{
            const addr = this.getProcAddress(name);
            if (addr.isNull()) throw Error(this.name + ': Cannot find procedure, ' + name);
            return makefunc.js(addr, returnType, thisType, structureReturn, ...params);
        }

    toString()
    {
        return `[${this.name}: 0x${super.toString()}]`;
    }


    /**
     * @deprecated use makefunc.js
     */
    static pointerToFunction(ptr:StaticPointer):makefunc.NativeFunction
    {
        return makefunc.js_old(ptr);
    }

    static get(name: string|null): NativeModule {
        const module = getModuleHandle(name);
        if (module.isNull()) throw Error(name + ': Cannot find module');
        module.name = name || '[exe]';
        return module;
    }

    static load(name: string): NativeModule {
        const module = dll.kernel32.LoadLibraryW(name);
        if (module.isNull())
        {
            const err = dll.kernel32.GetLastError();
            throw Error(name + ': Cannot load module, errno='+err);
        }
        module.name = name;
        return module;
    }
}

const getModuleHandle = makefunc.js(cgate.GetModuleHandleW, NativeModule, null, false, RawTypeId.StringUtf16);

export class ThreadHandle extends VoidPointer {
    close():boolean
    {
        return dll.kernel32.CloseHandle(this);
    }
}

export class CriticalSection extends VoidPointer {
    private static readonly bytes = 40;
    
    constructor()
    {
        super(dll.ucrtbase.malloc(CriticalSection.bytes));
        dll.kernel32.InitializeCriticalSection(this);
    }

    enter():void
    {
        dll.kernel32.EnterCriticalSection(this);
    }

    leave():void
    {
        dll.kernel32.LeaveCriticalSection(this);
    }

    tryEnter():boolean
    {
        return dll.kernel32.TryEnterCriticalSection(this);
    }

    dispose():void
    {
        dll.kernel32.DeleteCriticalSection(this);
        dll.ucrtbase.free(this);
    }
}

NativeModule.prototype.getProcAddress = makefunc.js(cgate.GetProcAddress, NativePointer, NativeModule, false, RawTypeId.StringUtf8);
NativeModule.prototype.getProcAddressByOrdinal = makefunc.js(cgate.GetProcAddress, NativePointer, NativeModule, false, RawTypeId.Int32);

export namespace dll {
    export namespace kernel32 {
        export const module = NativeModule.get('kernel32.dll');
        export const LoadLibraryW = module.getFunction('LoadLibraryW', NativeModule, null, false, RawTypeId.StringUtf16);
        export const VirtualProtect = module.getFunction('VirtualProtect', RawTypeId.Boolean, null, false, VoidPointer, RawTypeId.FloatAsInt64, RawTypeId.FloatAsInt64, RawTypeId.Buffer);
        export const Sleep = module.getFunction('Sleep', RawTypeId.Void, null, false, RawTypeId.Int32);
        export const SetCurrentDirectoryW = module.getFunction('SetCurrentDirectoryW', RawTypeId.Boolean, null, false, RawTypeId.StringUtf16);
        export const GetLastError = module.getFunction('GetLastError', RawTypeId.Int32, null, false);
        export const CreateThread = module.getFunction('CreateThread', ThreadHandle, null, false, VoidPointer, RawTypeId.FloatAsInt64, VoidPointer, VoidPointer, RawTypeId.Int32, RawTypeId.Buffer);
        export const CloseHandle = module.getFunction('CloseHandle', RawTypeId.Boolean, null, false, VoidPointer);
        export const WaitForSingleObject = module.getFunction('WaitForSingleObject', RawTypeId.Int32, null, false, VoidPointer, RawTypeId.Int32);
        export const CreateEventW = module.getFunction('CreateEventW', VoidPointer, null, false, VoidPointer, RawTypeId.Int32, RawTypeId.Int32, RawTypeId.StringUtf16);
        export const SetEvent = module.getFunction('SetEvent', RawTypeId.Boolean, null, false, VoidPointer);
        export const GetCurrentThreadId = module.getFunction('GetCurrentThreadId', RawTypeId.Int32, null, false);
        export const InitializeCriticalSection = module.getFunction('InitializeCriticalSection', RawTypeId.Void, null, false, CriticalSection);
        export const DeleteCriticalSection = module.getFunction('DeleteCriticalSection', RawTypeId.Void, null, false, CriticalSection);
        export const EnterCriticalSection = module.getFunction('EnterCriticalSection', RawTypeId.Void, null, false, CriticalSection);
        export const LeaveCriticalSection = module.getFunction('LeaveCriticalSection', RawTypeId.Void, null, false, CriticalSection);
        export const TryEnterCriticalSection = module.getFunction('TryEnterCriticalSection', RawTypeId.Boolean, null, false, CriticalSection);
        export const WaitForMultipleObjects = module.getProcAddress("WaitForMultipleObjects");
    }
    export namespace ucrtbase {
        export const module = NativeModule.get('ucrtbase.dll');
        export const _get_initial_narrow_environment = module.getFunction('_get_initial_narrow_environment', StaticPointer, null, false);
        export const _beginthreadex = module.getFunction('_beginthreadex', ThreadHandle, null, false, VoidPointer, RawTypeId.FloatAsInt64, VoidPointer, VoidPointer, RawTypeId.Int32, RawTypeId.Buffer);

        export const free = module.getFunction('free', RawTypeId.Void, null, false, VoidPointer);
		export const malloc = module.getFunction('malloc', NativePointer, null, false, RawTypeId.FloatAsInt64);

    }
    export namespace vcruntime140 {
        export const module = NativeModule.load('vcruntime140.dll');
        export const memset = module.getFunction('memset', RawTypeId.Void, null, false, VoidPointer, RawTypeId.Int32, RawTypeId.FloatAsInt64);
        export const memcmp = module.getFunction('memcmp', RawTypeId.Int32, null, false, VoidPointer, VoidPointer, RawTypeId.FloatAsInt64);
        export const memcpy = module.getFunction('memcpy', RawTypeId.Void, null, false, VoidPointer, VoidPointer, RawTypeId.FloatAsInt64);
        export const memchr = module.getFunction('memchr', NativePointer, null, false, VoidPointer, RawTypeId.Int32, RawTypeId.FloatAsInt64);
    }
    export namespace msvcp140 {

        export const module = NativeModule.load('msvcp140.dll');
        export const _Cnd_do_broadcast_at_thread_exit = module.getProcAddress("_Cnd_do_broadcast_at_thread_exit");
    }
    export namespace ChakraCore {
        export const module = NativeModule.get('ChakraCore.dll');
        export const JsAddRef = module.getFunction("JsAddRef", RawTypeId.Int32, null, false, RawTypeId.JsValueRef, RawTypeId.Buffer);
        export const JsRelease = module.getFunction("JsRelease", RawTypeId.Int32, null, false, RawTypeId.JsValueRef, RawTypeId.Buffer);
    }
}
