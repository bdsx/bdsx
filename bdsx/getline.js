"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLine = void 0;
const asmcode = require("./asm/asmcode");
const proc_1 = require("./bds/proc");
const capi_1 = require("./capi");
const common_1 = require("./common");
const core_1 = require("./core");
const dll_1 = require("./dll");
const makefunc_1 = require("./makefunc");
const nativetype_1 = require("./nativetype");
const pointer_1 = require("./pointer");
const getline = proc_1.proc2["??$getline@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@YAAEAV?$basic_istream@DU?$char_traits@D@std@@@0@$$QEAV10@AEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@0@D@Z"];
const string_ctor = nativetype_1.CxxString[nativetype_1.NativeType.ctor].pointer;
const string_dtor = nativetype_1.CxxString[nativetype_1.NativeType.dtor].pointer;
const string_size = nativetype_1.CxxString[nativetype_1.NativeType.size];
if (string_ctor == null || string_dtor == null) {
    throw Error('cannot find the constructor and the destructor of std::string');
}
let inputEncoding = common_1.Encoding.Ansi;
asmcode.std_cin = dll_1.dll.msvcp140.std_cin;
asmcode.getLineProcessTask = makefunc_1.makefunc.np((asyncTask) => {
    const str = asyncTask.addAs(pointer_1.CxxStringWrapper, core_1.uv_async.sizeOfTask);
    const value = str.valueAs(inputEncoding);
    str[nativetype_1.NativeType.dtor]();
    const cb = asyncTask.getJsValueRef(core_1.uv_async.sizeOfTask + string_size);
    cb(value);
}, nativetype_1.void_t, null, core_1.StaticPointer);
asmcode.std_getline = getline;
asmcode.std_string_ctor = string_ctor;
// const endTask = makefunc.np((asyncTask:StaticPointer)=>{
//     const cb:GetLineCallback = asyncTask.getJsValueRef(uv_async.sizeOfTask);
//     cb(null);
// }, void_t, null, StaticPointer);
class GetLine {
    constructor(online) {
        this.online = online;
        core_1.chakraUtil.JsAddRef(this.online);
        core_1.uv_async.open();
        const [handle] = capi_1.capi.createThread(asmcode.getline, makefunc_1.makefunc.asJsValueRef(this.online));
        this.thread = handle;
    }
    static setEncoding(encoding) {
        if (encoding < common_1.Encoding.Utf8)
            throw TypeError(`${common_1.Encoding[encoding]} is not supported for GetLine.setEncoding`);
        inputEncoding = encoding;
    }
    close() {
        dll_1.dll.kernel32.TerminateThread(this.thread, 0);
        core_1.chakraUtil.JsRelease(this.online);
        core_1.uv_async.close();
    }
}
exports.GetLine = GetLine;
//# sourceMappingURL=getline.js.map