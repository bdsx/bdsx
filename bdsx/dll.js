"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dll = exports.CriticalSection = exports.ThreadHandle = exports.NativeModule = void 0;
const asmcode = require("./asm/asmcode");
const common_1 = require("./common");
const core_1 = require("./core");
const dllraw_1 = require("./dllraw");
const makefunc_1 = require("./makefunc");
const nativetype_1 = require("./nativetype");
const VoidPointerEx = core_1.VoidPointer;
/**
 * Load external DLL
 * You can call native functions by name
 */
class NativeModule extends VoidPointerEx {
    constructor() {
        super(arguments[0] != null ? arguments[0] instanceof core_1.VoidPointer ? arguments[0] : dll.kernel32.LoadLibraryW(arguments[0]) : undefined);
        this.name = '[undefined]';
    }
    getProcAddress(name) {
        (0, common_1.abstract)();
    }
    getProcAddressByOrdinal(ordinal) {
        (0, common_1.abstract)();
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
    getFunction(name, returnType, opts, ...params) {
        const addr = this.getProcAddress(name);
        if (addr === null)
            throw Error(`${this.name}: Cannot find procedure, ${name}`);
        return makefunc_1.makefunc.js(addr, returnType, opts, ...params);
    }
    toString() {
        return `[${this.name}: ${super.toString()}]`;
    }
    /**
     * get NativeModule by name
     * wrapper of GetModuleHandleW
     * if you want to load the new module. Please use NativeModule.load instead
     * @param name return exe module if null
     */
    static get(name) {
        const module = getModuleHandle(name);
        if (module === null)
            throw Error(`${name}: Cannot find module`);
        module.name = name || '[exe]';
        return module;
    }
    /**
     * load NativeModule by name
     * wrapper of LoadLibraryW
     */
    static load(name) {
        const module = dll.kernel32.LoadLibraryW(name);
        if (module === null) {
            const errno = dll.kernel32.GetLastError();
            const errobj = Error(`${name}: Cannot load module, errno=${errno}`);
            errobj.errno = errno;
            throw errobj;
        }
        module.name = name;
        return module;
    }
}
exports.NativeModule = NativeModule;
const getModuleHandle = makefunc_1.makefunc.js(core_1.cgate.GetModuleHandleWPtr, NativeModule, null, makefunc_1.makefunc.Utf16);
class ThreadHandle extends core_1.VoidPointer {
    close() {
        return dll.kernel32.CloseHandle(this);
    }
}
exports.ThreadHandle = ThreadHandle;
class CriticalSection extends core_1.AllocatedPointer {
    constructor() {
        super(CriticalSection.bytes);
        dll.kernel32.InitializeCriticalSection(this);
    }
    enter() {
        dll.kernel32.EnterCriticalSection(this);
    }
    leave() {
        dll.kernel32.LeaveCriticalSection(this);
    }
    tryEnter() {
        return dll.kernel32.TryEnterCriticalSection(this);
    }
    dispose() {
        dll.kernel32.DeleteCriticalSection(this);
    }
}
exports.CriticalSection = CriticalSection;
CriticalSection.bytes = 40;
NativeModule.prototype.getProcAddress = makefunc_1.makefunc.js(core_1.cgate.GetProcAddressPtr, core_1.NativePointer, { this: NativeModule }, makefunc_1.makefunc.Utf8);
NativeModule.prototype.getProcAddressByOrdinal = makefunc_1.makefunc.js(core_1.cgate.GetProcAddressPtr, core_1.NativePointer, { this: NativeModule }, nativetype_1.int32_t);
var dll;
(function (dll) {
    dll.current = NativeModule.get(null); // get the exe module, it's the address base of RVA
    dll.base = dll.current.as(core_1.StaticPointer);
    let ntdll;
    (function (ntdll) {
        ntdll.module = NativeModule.get('ntdll.dll');
        const wine_get_version_ptr = ntdll.module.getProcAddress('wine_get_version');
        ntdll.wine_get_version = wine_get_version_ptr === null ?
            null : makefunc_1.makefunc.js(wine_get_version_ptr, makefunc_1.makefunc.Utf8);
    })(ntdll = dll.ntdll || (dll.ntdll = {}));
    let kernel32;
    (function (kernel32) {
        kernel32.module = dllraw_1.dllraw.kernel32.module.as(NativeModule);
        kernel32.LoadLibraryW = kernel32.module.getFunction('LoadLibraryW', NativeModule, null, makefunc_1.makefunc.Utf16);
        kernel32.LoadLibraryExW = kernel32.module.getFunction('LoadLibraryExW', NativeModule, null, makefunc_1.makefunc.Utf16, core_1.VoidPointer, nativetype_1.int32_t);
        kernel32.FreeLibrary = kernel32.module.getFunction('FreeLibrary', nativetype_1.bool_t, null, NativeModule);
        kernel32.VirtualProtect = kernel32.module.getFunction('VirtualProtect', nativetype_1.bool_t, null, core_1.VoidPointer, nativetype_1.int64_as_float_t, nativetype_1.int64_as_float_t, makefunc_1.makefunc.Buffer);
        kernel32.GetLastError = kernel32.module.getFunction('GetLastError', nativetype_1.int32_t);
        kernel32.CreateThread = kernel32.module.getFunction('CreateThread', ThreadHandle, null, core_1.VoidPointer, nativetype_1.int64_as_float_t, core_1.VoidPointer, core_1.VoidPointer, nativetype_1.int32_t, makefunc_1.makefunc.Buffer);
        kernel32.TerminateThread = kernel32.module.getFunction('TerminateThread', nativetype_1.void_t, null, ThreadHandle, nativetype_1.int32_t);
        kernel32.CloseHandle = kernel32.module.getFunction('CloseHandle', nativetype_1.bool_t, null, core_1.VoidPointer);
        kernel32.WaitForSingleObject = kernel32.module.getFunction('WaitForSingleObject', nativetype_1.int32_t, null, core_1.VoidPointer, nativetype_1.int32_t);
        kernel32.CreateEventW = kernel32.module.getFunction('CreateEventW', core_1.VoidPointer, null, core_1.VoidPointer, nativetype_1.int32_t, nativetype_1.int32_t, makefunc_1.makefunc.Utf16);
        kernel32.SetEvent = kernel32.module.getFunction('SetEvent', nativetype_1.bool_t, null, core_1.VoidPointer);
        kernel32.GetCurrentThreadId = makefunc_1.makefunc.js(dllraw_1.dllraw.kernel32.GetCurrentThreadId, nativetype_1.int32_t);
        kernel32.InitializeCriticalSection = kernel32.module.getFunction('InitializeCriticalSection', nativetype_1.void_t, null, CriticalSection);
        kernel32.DeleteCriticalSection = kernel32.module.getFunction('DeleteCriticalSection', nativetype_1.void_t, null, CriticalSection);
        kernel32.EnterCriticalSection = kernel32.module.getFunction('EnterCriticalSection', nativetype_1.void_t, null, CriticalSection);
        kernel32.LeaveCriticalSection = kernel32.module.getFunction('LeaveCriticalSection', nativetype_1.void_t, null, CriticalSection);
        kernel32.TryEnterCriticalSection = kernel32.module.getFunction('TryEnterCriticalSection', nativetype_1.bool_t, null, CriticalSection);
        kernel32.LocalFree = kernel32.module.getFunction('LocalFree', core_1.VoidPointer, null, core_1.VoidPointer);
        kernel32.SetDllDirectoryW = kernel32.module.getFunction('SetDllDirectoryW', nativetype_1.bool_t, null, makefunc_1.makefunc.Utf16);
        kernel32.GetProcAddress = core_1.cgate.GetProcAddress;
        kernel32.GetModuleHandleW = core_1.cgate.GetModuleHandleW;
    })(kernel32 = dll.kernel32 || (dll.kernel32 = {}));
    let ucrtbase;
    (function (ucrtbase) {
        ucrtbase.module = dllraw_1.dllraw.ucrtbase.module.as(NativeModule);
        ucrtbase._beginthreadex = ucrtbase.module.getFunction('_beginthreadex', ThreadHandle, null, core_1.VoidPointer, nativetype_1.int64_as_float_t, core_1.VoidPointer, core_1.VoidPointer, nativetype_1.int32_t, makefunc_1.makefunc.Buffer);
        ucrtbase.free = ucrtbase.module.getFunction('free', nativetype_1.void_t, null, core_1.VoidPointer);
        ucrtbase.malloc = makefunc_1.makefunc.js(dllraw_1.dllraw.ucrtbase.malloc, core_1.NativePointer, null, nativetype_1.int64_as_float_t);
        ucrtbase.__stdio_common_vsprintf = ucrtbase.module.getProcAddress('__stdio_common_vsprintf');
    })(ucrtbase = dll.ucrtbase || (dll.ucrtbase = {}));
    let vcruntime140;
    (function (vcruntime140) {
        vcruntime140.module = dllraw_1.dllraw.vcruntime140.module.as(NativeModule);
        vcruntime140.memset = vcruntime140.module.getFunction('memset', nativetype_1.void_t, null, core_1.VoidPointer, nativetype_1.int32_t, nativetype_1.int64_as_float_t);
        vcruntime140.memcmp = vcruntime140.module.getFunction('memcmp', nativetype_1.int32_t, null, core_1.VoidPointer, core_1.VoidPointer, nativetype_1.int64_as_float_t);
        vcruntime140.memcpy = makefunc_1.makefunc.js(dllraw_1.dllraw.vcruntime140.memcpy, nativetype_1.void_t, null, core_1.VoidPointer, core_1.VoidPointer, nativetype_1.int64_as_float_t);
        vcruntime140.memchr = vcruntime140.module.getFunction('memchr', core_1.NativePointer, null, core_1.VoidPointer, nativetype_1.int32_t, nativetype_1.int64_as_float_t);
    })(vcruntime140 = dll.vcruntime140 || (dll.vcruntime140 = {}));
    let msvcp140;
    (function (msvcp140) {
        msvcp140.module = NativeModule.load('msvcp140.dll');
        msvcp140._Cnd_do_broadcast_at_thread_exit = msvcp140.module.getProcAddress("_Cnd_do_broadcast_at_thread_exit");
        msvcp140.std_cin = msvcp140.module.getProcAddress("?cin@std@@3V?$basic_istream@DU?$char_traits@D@std@@@1@A");
    })(msvcp140 = dll.msvcp140 || (dll.msvcp140 = {}));
})(dll = exports.dll || (exports.dll = {}));
core_1.pdb.close();
const RtlCaptureContext = dll.kernel32.module.getProcAddress('RtlCaptureContext');
asmcode.RtlCaptureContext = RtlCaptureContext;
asmcode.memset = dll.vcruntime140.memset.pointer;
//# sourceMappingURL=dll.js.map