"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capi = void 0;
const asmcode = require("./asm/asmcode");
const core_1 = require("./core");
const dll_1 = require("./dll");
const makefunc_1 = require("./makefunc");
const nativetype_1 = require("./nativetype");
var capi;
(function (capi) {
    capi.nodeThreadId = dll_1.dll.kernel32.GetCurrentThreadId();
    capi.debugBreak = makefunc_1.makefunc.js(asmcode.debugBreak, nativetype_1.void_t);
    asmcode.nodeThreadId = capi.nodeThreadId;
    function createThread(functionPointer, param = null, stackSize = 0) {
        const out = new Uint32Array(1);
        const handle = dll_1.dll.kernel32.CreateThread(null, stackSize, functionPointer, param, 0, out);
        return [handle, out[0]];
    }
    capi.createThread = createThread;
    function beginThreadEx(functionPointer, param = null) {
        const out = new Uint32Array(1);
        const handle = dll_1.dll.ucrtbase._beginthreadex(null, 0, functionPointer, param, 0, out);
        return [handle, out[0]];
    }
    capi.beginThreadEx = beginThreadEx;
    /**
     * memory allocate by native c
     */
    capi.malloc = dll_1.dll.ucrtbase.malloc;
    /**
     * memory release by native c
     */
    capi.free = dll_1.dll.ucrtbase.free;
    function isRunningOnWine() {
        return dll_1.dll.ntdll.wine_get_version !== null;
    }
    capi.isRunningOnWine = isRunningOnWine;
    /**
     * Keep the object from GC
     */
    function permanent(v) {
        core_1.chakraUtil.JsAddRef(v);
        return v;
    }
    capi.permanent = permanent;
})(capi = exports.capi || (exports.capi = {}));
//# sourceMappingURL=capi.js.map