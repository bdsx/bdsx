import asmcode = require("./asm/asmcode");
import { proc2 } from "./bds/proc";
import { capi } from "./capi";
import { chakraUtil, StaticPointer, uv_async, VoidPointer } from "./core";
import { dll, ThreadHandle } from "./dll";
import { makefunc, RawTypeId } from "./makefunc";
import { CxxString, NativeType } from "./nativetype";
import { CxxStringWrapper } from "./pointer";

type GetLineCallback = (line:string|null)=>void;

const getline = proc2["??$getline@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@YAAEAV?$basic_istream@DU?$char_traits@D@std@@@0@$$QEAV10@AEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@0@D@Z"];
const string_ctor:VoidPointer = (CxxString[NativeType.ctor] as any).pointer;
const string_dtor:VoidPointer = (CxxString[NativeType.dtor] as any).pointer;
const string_size = CxxString[NativeType.size];

if (!string_ctor || !string_dtor) {
    throw Error('cannot find the constructor and the destructor of std::string');
}

asmcode.std_cin = dll.msvcp140.std_cin;
asmcode.uv_async_alloc = uv_async.alloc;
asmcode.getLineProcessTask = makefunc.np((asyncTask:StaticPointer)=>{
    const str = asyncTask.addAs(CxxStringWrapper, uv_async.sizeOfTask);
    const value = str.value;
    str[NativeType.dtor]();
    const cb:GetLineCallback = asyncTask.getJsValueRef(uv_async.sizeOfTask+string_size);
    cb(value);
}, RawTypeId.Void, null, StaticPointer);
asmcode.std_getline = getline;
asmcode.uv_async_post = uv_async.post;
asmcode.std_string_ctor = string_ctor;

// const endTask = makefunc.np((asyncTask:StaticPointer)=>{
//     const cb:GetLineCallback = asyncTask.getJsValueRef(uv_async.sizeOfTask);
//     cb(null);
// }, RawTypeId.Void, null, StaticPointer);

export class GetLine {
    private readonly thread:ThreadHandle;
    constructor(private readonly online:(line:string)=>void) {
        chakraUtil.JsAddRef(this.online);
    
        uv_async.open();
        const [handle] = capi.createThread(asmcode.getline, makefunc.asJsValueRef(this.online));
        this.thread = handle;
    }

    close():void {
        dll.kernel32.TerminateThread(this.thread, 0);
        chakraUtil.JsRelease(this.online);
        uv_async.close();
    }
}
