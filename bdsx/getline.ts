import { capi } from ".";
import { asm, Register } from "./assembler";
import { proc2 } from "./bds/proc";
import { RawTypeId } from "./common";
import { makefunc, StaticPointer, uv_async, VoidPointer } from "./core";
import { dll, ThreadHandle } from "./dll";
import { CxxString, NativeType } from "./nativetype";
import { CxxStringWrapper } from "./pointer";

let getLineThreadPointer:VoidPointer|null = null;

type GetLineCallback = (line:string|null)=>void;

function createGetLineThreadFunction():VoidPointer {
    const getline = proc2["??$getline@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@YAAEAV?$basic_istream@DU?$char_traits@D@std@@@0@$$QEAV10@AEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@0@D@Z"];
    const string_ctor:VoidPointer = (CxxString[NativeType.ctor] as any).pointer;
    const string_dtor:VoidPointer = (CxxString[NativeType.dtor] as any).pointer;
    const string_size = CxxString[NativeType.size];

    if (!string_ctor || !string_dtor) {
        throw Error('cannot find the constructor and the destructor of std::string');
    }

    const processTask = makefunc.np((asyncTask:StaticPointer)=>{
        const str = asyncTask.addAs(CxxStringWrapper, uv_async.sizeOfTask);
        const value = str.value;
        str[NativeType.dtor]();
        const cb:GetLineCallback = asyncTask.getJsValueRef(uv_async.sizeOfTask+string_size);
        cb(value);
    }, RawTypeId.Void, null, StaticPointer);

    const endTask = makefunc.np((asyncTask:StaticPointer)=>{
        const cb:GetLineCallback = asyncTask.getJsValueRef(uv_async.sizeOfTask);
        cb(null);
    }, RawTypeId.Void, null, StaticPointer);

    const addr = asm()
    // stack start
    .push_r(Register.rbx)
    .push_r(Register.rsi)
    .sub_r_c(Register.rsp, 0x18)
    .mov_r_r(Register.rbx, Register.rcx)

    .label('_loop')

    // task = new AsyncTask
    .mov_r_c(Register.rcx, processTask)
    .mov_r_c(Register.rdx, string_size+8)
    .call64(uv_async.alloc, Register.rax)
    .mov_rp_r(Register.rax, uv_async.sizeOfTask+string_size, Register.rbx) // task.cb = cb
    .mov_r_r(Register.rsi, Register.rax)

    // task.string.constructor();
    .lea_r_rp(Register.rcx, Register.rsi, uv_async.sizeOfTask)
    .call64(string_ctor, Register.rax)

    // std::getline(cin, task.string, '\n');
    .mov_r_c(Register.rcx, dll.msvcp140.std_cin)
    .mov_r_r(Register.rdx, Register.rax)
    .mov_r_c(Register.r8, 10) // LF, \n
    .call64(getline, Register.rax)

    // task.post();
    .mov_r_r(Register.rcx, Register.rsi)
    .call64(uv_async.post, Register.rax)

    // goto _loop;
    .jmp_label('_loop')

    // stack end
    .add_r_c(Register.rsp, 0x18)
    .pop_r(Register.rsi)
    .pop_r(Register.rbx)
    .ret()

    .label('_catch')

    // stack begin
    .mov_rp_r(Register.rsp, 8, Register.rcx) 
    .sub_r_c(Register.rsp, 0x18)

    // task = new AsyncTask
    .mov_r_c(Register.rcx, endTask)
    .mov_r_c(Register.rdx, 8)
    .call64(uv_async.alloc, Register.rax)

    // task.cb = cb
    .mov_r_rp(Register.rcx, Register.rsp, 0x20) 
    .mov_rp_r(Register.rax, uv_async.sizeOfTask, Register.rcx)

    // task.post();
    .mov_r_r(Register.rcx, Register.rax)
    .call64(uv_async.post, Register.rax)

    // stack end
    .add_r_c(Register.rsp, 0x18)
    .ret()
    .alloc();

    return addr;
}

export class GetLine {
    private readonly thread:ThreadHandle;
    constructor(private readonly online:(line:string)=>void) {
        if (getLineThreadPointer === null) {
            getLineThreadPointer = createGetLineThreadFunction();
        }

        dll.ChakraCore.JsAddRef(this.online, null);
    
        uv_async.open();
        const [handle] = capi.createThread(getLineThreadPointer, makefunc.asJsValueRef(this.online));
        this.thread = handle;
    }

    close():void {
        dll.kernel32.TerminateThread(this.thread, 0);
        dll.ChakraCore.JsRelease(this.online, null);
        uv_async.close();
    }
}
