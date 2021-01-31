import Event, { CapsuledEvent } from "krevent";
import { asm, OperationSize, Register } from "./assembler";
import { hookingForActor } from "./bds/actor";
import { proc, procHacker } from "./bds/proc";
import { capi } from "./capi";
import { hookingForCommand } from "./command";
import { CANCEL, Encoding, RawTypeId } from "./common";
import { AllocatedPointer, bedrock_server_exe, cgate, ipfilter, jshook, makefunc, MultiThreadQueue, runtimeError, StaticPointer, uv_async, VoidPointer } from "./core";
import { dll } from "./dll";
import { GetLine } from "./getline";
import { CxxString, NativeType } from "./nativetype";
import { nethook } from "./nethook";
import { remapAndPrintError, remapError, remapStack } from "./source-map-support";
import { hex, _tickCallback } from "./util";
import { EXCEPTION_BREAKPOINT } from "./windows_h";

import readline = require("readline");
import colors = require('colors');
import bd_server = require("./bds/server");
import nimodule = require("./bds/networkidentifier");

declare module 'colors'
{
    
    export const brightRed:Color;
    export const brightGreen:Color;
    export const brightYellow:Color;
    export const brightBlue:Color;
    export const brightMagenta:Color;
    export const brightCyan:Color;
    export const brightWhite:Color;

}

class Liner
{
    private remaining = '';
    write(str:string):string|null
    {
        const lastidx = str.lastIndexOf('\n');
        if (lastidx === -1)
        {
            this.remaining += str;
            return null;
        }
        else
        {
            const out = this.remaining + str.substr(0, lastidx);
            this.remaining = str.substr(lastidx + 1);
            return out;
        }
    }
}

// default runtime error handler
runtimeError.setHandler(err=>{
    remapError(err);

    const lastSender = ipfilter.getLastSender();
    console.error('[ Runtime Error ]');
    console.error(`Last Sender IP: ${lastSender}`);
    console.error('[ Native Stack ]');
    console.error(err.nativeStack);
    console.error('[ JS Stack ]');
    console.error(err.stack!);
});

export namespace bedrockServer
{
    let launched = false;
    
    const bedrockLogLiner = new Liner;
    const cmdOutputLiner = new Liner;

    const openEvTarget = new Event<()=>void>();
    const updateEvTarget = new Event<()=>void>();
    const errorEvTarget = new Event<(err:Error)=>CANCEL|void>();
    const closeEvTarget = new Event<()=>void>();
    const logEvTarget = new Event<(log:string, color:colors.Color)=>CANCEL|void>();
    const commandOutputEvTarget = new Event<(log:string)=>CANCEL|void>();

    function patchForStdio():void
    {
        // hook bedrock log
        const bedrockLogNp = makefunc.np((severity, msgptr, size)=>{
            // void(*callback)(int severity, const char* msg, size_t size)
            const line = bedrockLogLiner.write(msgptr.getString(size, 0, Encoding.Utf8));
            if (line === null) return;

            let color:colors.Color;
            switch (severity)
            {
            case 1:
                color = colors.white;
                break;
            case 2:
                color = colors.brightWhite;
                break;
            case 4:
                color = colors.brightYellow;
                break;
            default:
                color = colors.brightRed;
                break;
            }
            if (logEvTarget.fire(line, color) === CANCEL) return;
            console.log(color(line));
        }, RawTypeId.Void, null, RawTypeId.Int32, StaticPointer, RawTypeId.FloatAsInt64);

        const logHookAsyncCb = asm()
        .mov_r_rp(Register.r8, Register.rcx, uv_async.sizeOfTask+8)
        .lea_r_rp(Register.rdx, Register.rcx, uv_async.sizeOfTask+0x10)
        .mov_r_rp(Register.rcx, Register.rcx, uv_async.sizeOfTask+0)
        .jmp64(bedrockLogNp, Register.rax)
        .alloc();

        console.log('node thread id: '+capi.nodeThreadId);
        const logHook = asm()
        .call64(dll.kernel32.GetCurrentThreadId.pointer, Register.rax)
        .cmp_r_c(Register.rax, capi.nodeThreadId)
        .jne_label('async_post')
        .lea_r_rp(Register.rdx, Register.rsp, 0x58)
        .mov_r_r(Register.rcx, Register.rdi)
        .mov_r_r(Register.r8, Register.rbx)
        .jmp64(bedrockLogNp, Register.rax)
        .label('async_post')
        .sub_r_c(Register.rsp, 0x28)
        .lea_r_rp(Register.rdx, Register.rbx, 0x11)
        .mov_r_c(Register.rcx, logHookAsyncCb)
        .call64(uv_async.alloc, Register.rax)
        .mov_rp_r(Register.rax, uv_async.sizeOfTask+0, Register.rdi)
        .lea_r_rp(Register.r8, Register.rbx, 1)
        .mov_rp_r(Register.rax, uv_async.sizeOfTask+8, Register.r8)
        .lea_r_rp(Register.rcx, Register.rax, uv_async.sizeOfTask+0x10)
        .lea_r_rp(Register.rdx, Register.rsp, 0x80)
        .mov_rp_r(Register.rsp, 0x20, Register.rax)
        .call64(dll.vcruntime140.memcpy.pointer, Register.rax)
        .mov_r_rp(Register.rcx, Register.rsp, 0x20)
        .add_r_c(Register.rsp, 0x28)
        .jmp64(uv_async.post, Register.rax)
        .alloc();
        
        procHacker.patching('hook-logging', 'BedrockLogOut', 0x8A, logHook, Register.rdx, true, [
            0xB9, 0xF5, 0xFF, 0xFF, 0xFF,			//	| mov ecx,FFFFFFF5                                                    |
            0xFF, 0x15, 0x33, 0x1B, 0xE4, 0x00,		//	| call qword ptr ds:[<&GetStdHandle>]                                 |
            0x83, 0xFF, 0x01,						//	| cmp edi,1                                                           |
            0x75, 0x05,								//	| jne bedrock_server.7FF786A2273F                                     |
            0x8D, 0x55, 0x08, 						//	| lea edx,qword ptr ss:[rbp+8]                                        |
            0xEB, 0x19,								//	| jmp bedrock_server.7FF786A22758                                     |
            0x83, 0xFF, 0x02, 						//	| cmp edi,2                                                           |
            0x75, 0x05,								//	| jne bedrock_server.7FF786A22749                                     |
            0x8D, 0x57, 0x0D, 						//	| lea edx,qword ptr ds:[rdi+D]                                        |
            0xEB, 0x0F,								//	| jmp bedrock_server.7FF786A22758                                     |
            0xBA, 0x0E, 0x00, 0x00, 0x00,			//	| mov edx,E                                                           |
            0x83, 0xFF, 0x04,						//	| cmp edi,4                                                           |
            0x74, 0x05,								//	| je bedrock_server.7FF786A22758                                      |
            0xBA, 0x0C, 0x00, 0x00, 0x00,			//	| mov edx,C                                                           | C:'\f'
            0x48, 0x8B, 0xC8, 						//	| mov rcx,rax                                                         |
            0xFF, 0x15, 0x0F, 0x1B, 0xE4, 0x00,		//	| call qword ptr ds:[<&SetConsoleTextAttribute>]                      |
            0x48, 0x8D, 0x54, 0x24, 0x50,			//	| lea rdx,qword ptr ss:[rsp+50]                                       | [rsp+50]:"LdrpInitializeProcess"
            0x48, 0x8D, 0x0D, 0xC7, 0xF6, 0xEF, 0x00, // | lea rcx,qword ptr ds:[7FF787921E34]                                 | 00007FF787921E34:"%s"
            0xE8, 0x3E, 0x86, 0xFC, 0xFF,			//	| call <bedrock_server.printf>                                        |
            0x48, 0x8D, 0x4C, 0x24, 0x50,			//	| lea rcx,qword ptr ss:[rsp+50]                                       | [rsp+50]:"LdrpInitializeProcess"
            0xFF, 0x15, 0x83, 0x1A, 0xE4, 0x00,		//	| call qword ptr ds:[<&OutputDebugStringA>]                           |
        ], [7, 11,  51, 55,  63, 67,  68, 72,  79, 83]);

        // void(*callback)(const char* log, size_t size)

        procHacker.patching('hook-command-output', 'CommandOutputSender::send', 0x1b3, asm()
        .sub_r_c(Register.rsp, 0x28)
        .mov_r_r(Register.rcx, Register.r8)
        .call64(makefunc.np((bytes, ptr)=>{
            const line = cmdOutputLiner.write(ptr.getString(bytes));
            if (line === null) return;
            if (commandOutputEvTarget.fire(line) !== CANCEL)
            {
                console.log(line);
            }
        }, RawTypeId.Void, null, RawTypeId.FloatAsInt64, StaticPointer), Register.rax)
        .add_r_c(Register.rsp, 0x28)
        .ret()
        .alloc(), Register.rax, true, [
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF,               // call <bedrock_server.class std::basic_ostream<char,struct std::char_traits<char> > & __ptr64 __cdecl std::_Insert_string<char,struct std::char_traits<char>,unsigned __int64>(class std::basic_ostream<char,struct std::char_traits<char> > & __ptr64,char const * __ptr64 const,uns>
            0x48, 0x8D, 0x15, 0xFF, 0xFF, 0xFF, 0xFF,   // lea rdx,qword ptr ds:[<class std::basic_ostream<char,struct std::char_traits<char> > & __ptr64 __cdecl std::flush<char,struct std::char_traits<char> >(class std::basic_ostream<char,struct std::char_traits<char> > & __ptr64)>]
            0x48, 0x8B, 0xC8,                           // mov rcx,rax
            0xFF, 0x15, 0xFF, 0xFF, 0xFF, 0xFF,         // call qword ptr ds:[<&??5?$basic_istream@DU?$char_traits@D@std@@@std@@QEAAAEAV01@P6AAEAV01@AEAV01@@Z@Z>]

        ], [1, 5,  8, 12,  17, 21]);

    
        // hook stdin
        const stdin_launchpad = 'std::_LaunchPad<std::unique_ptr<std::tuple<<lambda_cab8a9f6b80f4de6ca3785c051efa45e> >,std::default_delete<std::tuple<<lambda_cab8a9f6b80f4de6ca3785c051efa45e> > > > >::_Execute<0>';
        procHacker.patching('hook-stdin-command', stdin_launchpad, 0x5f, asm()
        .lea_r_rp(Register.rdx, Register.rsp, 0x30)
        .sub_r_c(Register.rsp, 0x28)
        .mov_r_c(Register.rcx, commandQueue)
        .call64(MultiThreadQueue.dequeue, Register.rax)
        .add_r_c(Register.rsp, 0x28)
        .ret()
        .alloc(), Register.rax, true, [
            0x48, 0x8B, 0x1D, 0x00, 0x00, 0x00, 0x00,	// mov rbx,qword ptr ds:[<&?cin@std@@3V?$basic_istream@DU?$char_traits@D@std@@@1@A>]  
            0x48, 0x8B, 0x03,							// mov rax,qword ptr ds:[rbx]                                                         
            0x48, 0x63, 0x48, 0x04,						// movsxd rcx,dword ptr ds:[rax+4]                                                    
            0x48, 0x03, 0xCB,							// add rcx,rbx                                                                        
            0xB2, 0x0A,									// mov dl,A                                                                           
            0xFF, 0x15, 0x00, 0x00, 0x00, 0x00,			// call qword ptr ds:[<&?widen@?$basic_ios@DU?$char_traits@D@std@@@std@@QEBADD@Z>]    
            0x44, 0x0F, 0xB6, 0xC0,						// movzx r8d,al                                                                       
            0x48, 0x8D, 0x54, 0x24, 0x28,				// lea rdx,qword ptr ss:[rsp+28]                                                      
            0x48, 0x8B, 0xCB,							// mov rcx,rbx                                                                        
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF,				// call <bedrock_server.class std::basic_istream<char,struct std::char_traits<char> > 
            0x48, 0x8B, 0x08,							// mov rcx,qword ptr ds:[rax]
            0x48, 0x63, 0x51, 0x04,						// movsxd rdx,dword ptr ds:[rcx+4]
            0xF6, 0x44, 0x02, 0x10, 0x06,				// test byte ptr ds:[rdx+rax+10],6
            0x0F, 0x85, 0xB1, 0x00, 0x00, 0x00,			// jne bedrock_server.7FF6C7A743AC
        ], [3, 7, 21, 25, 38, 42]);

    }

    export const open = openEvTarget as CapsuledEvent<()=>void>;
    export const close = closeEvTarget as CapsuledEvent<()=>void>;
    export const update = updateEvTarget as CapsuledEvent<()=>void>;

    /**
    * global error listeners
    * if returns CANCEL, then default error printing is disabled
    */
    export const error = errorEvTarget as CapsuledEvent<(err:Error)=>CANCEL|void>;
    export const bedrockLog = logEvTarget as CapsuledEvent<(log:string, color:colors.Color)=>CANCEL|void>;
    export const commandOutput = commandOutputEvTarget as CapsuledEvent<(log:string)=>CANCEL|void>;
    
    const commandQueue = new MultiThreadQueue(CxxString[NativeType.size]); 
    const commandQueueBuffer = new AllocatedPointer(0x20);
    CxxString[NativeType.ctor](commandQueueBuffer);
    
    function _launch(asyncResolve:()=>void):void
    {
        ipfilter.init(ip=>{
            console.error(`[BDSX] traffic overed: ${ip}`);
        });
        jshook.init(err=>{
            if (err instanceof Error)
            {
                err.stack = remapStack(err.stack);
                if (errorEvTarget.fire(err) !== CANCEL)
                {
                    console.error(err.stack);
                }
            }
            else
            {
                console.error(err);
            }
        });

        const evWaitGameThreadEnd = dll.kernel32.CreateEventW(null, 0, 0, null);

        const gamelambdaptr = dll.ucrtbase.malloc(8);

        uv_async.open();

        // uv async callback, when BDS closed perfectly
        function finishCallback()
        {
            uv_async.close();
            threadHandle.close();
            closeEvTarget.fire();
            _tickCallback();
        }

        // call game thread entry
        const gameThreadEntry = asm()
        .mov_r_c(Register.rcx, gamelambdaptr)
        .push_rp(Register.rcx, 0)
        .sub_r_c(Register.rsp, 0x20)
        .call64(dll.ucrtbase.free.pointer, Register.rax)
        .mov_r_rp(Register.rcx, Register.rsp, 0x20)
        .call64(proc["<lambda_85c8d3d148027f864c62d97cac0c7e52>::operator()"], Register.rax) // void gamethread(void* lambda);
        .mov_r_c(Register.rcx, evWaitGameThreadEnd)
        .call64(dll.kernel32.SetEvent.pointer, Register.rax)
        .add_r_c(Register.rsp, 0x28)
        .ret()
        .alloc();

        // hook game thread
        procHacker.patching(
            'hook-game-thread', 
            'std::_LaunchPad<std::unique_ptr<std::tuple<<lambda_85c8d3d148027f864c62d97cac0c7e52> >,std::default_delete<std::tuple<<lambda_85c8d3d148027f864c62d97cac0c7e52> > > > >::_Go',
            0x1b,
            asm()
            .sub_r_c(Register.rsp, 0x28)
            .mov_r_c(Register.r8, gamelambdaptr)
            .mov_rp_r(Register.r8, 0, Register.rbx)
            .call64(proc["std::_Pad::_Release"], Register.rax) // void std::_Pad::_Release(void* lambda);
            .mov_r_c(Register.rcx, gameThreadEntry)
            .call64(uv_async.call, Register.rax)
            .mov_r_c(Register.rcx, evWaitGameThreadEnd)
            .mov_r_c(Register.rdx, -1)
            .call64(dll.kernel32.WaitForSingleObject.pointer, Register.rax)
            .call64(dll.msvcp140._Cnd_do_broadcast_at_thread_exit, Register.rax)
            .add_r_c(Register.rsp, 0x28)
            .ret()
            .alloc(),
            Register.rax,
            true,
            [
                0xE8, 0xff, 0xff, 0xff, 0xff,	// call <bedrock_server.public: void __cdecl std::_Pad::_Release(void) __ptr64>
                0x48, 0x8B, 0xCB,				// mov rcx,rbx
                0xE8, 0xff, 0xff, 0xff, 0xff	// call <bedrock_server.> // gamethread
            ],
            [1, 5, 9, 13]    
        );

        // hook runtime error
        const runtime_error_asm = asm()
        .mov_r_rp(Register.rax, Register.rcx, 0)
        .cmp_rp_c(Register.rax, 0, EXCEPTION_BREAKPOINT, OperationSize.dword)
        .jne(1)
        .ret()
        .jmp64(runtimeError.raise, Register.rax)
        .alloc();
        procHacker.jumping('hook-runtime-error', 'google_breakpad::ExceptionHandler::HandleException', 0, runtime_error_asm, Register.rax, [
            0x48, 0x89, 0x5C, 0x24, 0x08,   // mov qword ptr ss:[rsp+8],rbx
            0x57,                           // push rdi
            0x48, 0x83, 0xEC, 0x20,         // sub rsp,20
            0x48, 0x8B, 0xF9,               // mov rdi,rcx
        ], []);
        // 	void (*onInvalidParameter)() = []() {
        // 		EXCEPTION_RECORD exception_record = {};
        // 		CONTEXT exception_context = {};
        // 		EXCEPTION_POINTERS exception_ptrs = { &exception_record, &exception_context };
        // 		::RtlCaptureContext(&exception_context);
        // 		exception_record.ExceptionCode = STATUS_INVALID_PARAMETER;

        // 		// We store pointers to the the expression and function strings,
        // 		// and the line as exception parameters to make them easy to
        // 		// access by the developer on the far side.
        // 		exception_record.NumberParameters = 3;
        // 		exception_record.ExceptionInformation[0] = 0;
        // 		exception_record.ExceptionInformation[1] = 0;
        // 		exception_record.ExceptionInformation[2] = 0;
        // 		s_callback(&exception_ptrs);
        // 	};
        // 	{
        // 		void* target = google_breakpad$ExceptionHandler$HandleInvalidParameter;
        // 		Unprotector unpro(target, 12);
        // 		CodeWriter code(target, 12);
        // 		code.jump(onInvalidParameter, RAX);
        // 	}
        // };


        // get server instance
        const serverInstanceDest = new AllocatedPointer(8);
        procHacker.hookingRawWithCallOriginal('ServerInstance::startServerThread', 
            asm()
            .mov_r_c(Register.rax, serverInstanceDest)
            .mov_rp_r(Register.rax, 0, Register.rcx)
            .ret()
            .alloc(), 
            [Register.rcx], []
        );

        // it removes errors when run commands on shutdown.
        procHacker.nopping('skip-command-list-destruction', 'ScriptEngine::~ScriptEngine', 435, [
            0x48, 0x8D, 0x4B, 0x78,			// lea         rcx,[rbx+78h]  
            0xE8, 0x00, 0x00, 0x00, 0x00,	// call        std::deque<ScriptCommand,std::allocator<ScriptCommand> >::_Tidy (07FF7ED6A00E0h)  
        ], [5, 9]);

        // enable script
        procHacker.nopping('force-enable-script', 'MinecraftServerScriptEngine::onServerThreadStarted', 0x42, [
            0xE8, 0xE9, 0x9F, 0xF3, 0xFF, 0x84, 0xC0, 0x0F, 
            0x84, 0x6A, 0x01, 0x00, 0x00, 0x48, 0x8B, 0x86, 
            0x28, 0x02, 0x00, 0x00, 0x48, 0x85, 0xC0, 0x75, 
            0x07, 0x48, 0x8D, 0x86, 0x30, 0x02, 0x00, 0x00,
            0x48, 0x8B, 0x80, 0x38, 0x01, 0x00, 0x00, 0xF6, 
            0x00, 0x04, 0x0F, 0x84, 0x47, 0x01, 0x00, 0x00
        ], [1, 5, 16, 20, 28, 32]);
        
        // skipChangeCurDir
        // BDS is change cwd to bedrock_server.exe
        // this code patchs to skip that.
        // but it's useless maybe
        // procHacker.nopping('skip-change-working-directory', 'main', 0x43a, [
        // 	0x48, 0x8D, 0x4D, 0x50, 0xE8, 0x9D, 0x56, 0xCB,
        // 	0x00, 0x48, 0x83, 0x78, 0x18, 0x10, 0x72, 0x03,
        // 	0x48, 0x8B, 0x00, 0x48, 0x8B, 0xC8, 0xFF, 0x15,
        // 	0xCA, 0xCE, 0x1C, 0x01, 0x48, 0x8B, 0x55, 0x68,
        // 	0x48, 0x83, 0xFA, 0x10, 0x72, 0x34, 0x48, 0xFF,
        // 	0xC2, 0x48, 0x8B, 0x4D, 0x50, 0x48, 0x8B, 0xC1,
        // 	0x48, 0x81, 0xFA, 0x00, 0x10, 0x00, 0x00, 0x72,
        // 	0x1C, 0x48, 0x83, 0xC2, 0x27, 0x48, 0x8B, 0x49,
        // 	0xF8, 0x48, 0x2B, 0xC1, 0x48, 0x83, 0xC0, 0xF8,
        // 	0x48, 0x83, 0xF8, 0x1F, 0x76, 0x07, 0xFF, 0x15,
        // 	0x3A, 0xDA, 0x1C, 0x01, 0xCC, 0xE8, 0x80, 0x55,
        // 	0x01, 0x01
        // ], [5, 9, 24, 28, 80, 84, 86, 90]);
        /* -- original code --
        lea rcx,qword ptr ss:[rbp+50]
        call <bedrock_server.getExecutableDir>
        cmp qword ptr ds:[rax+18],10
        jb bedrock_server.7FF6A8F741FD
        mov rax,qword ptr ds:[rax]
        mov rcx,rax
        call qword ptr ds:[<&SetCurrentDirectoryA>]
        mov rdx,qword ptr ss:[rbp+68]
        cmp rdx,10
        jb bedrock_server.7FF6A8F74244
        inc rdx
        mov rcx,qword ptr ss:[rbp+50]
        mov rax,rcx
        cmp rdx,1000
        jb bedrock_server.7FF6A8F7423F
        add rdx,27
        mov rcx,qword ptr ds:[rcx-8]
        sub rax,rcx
        add rax,FFFFFFFFFFFFFFF8
        cmp rax,1F
        jbe bedrock_server.7FF6A8F7423F
        call qword ptr ds:[<&_invalid_parameter_noinfo_noreturn>]
        int3
        call <bedrock_server.void __cdecl operator delete[](void * __ptr64,unsigned __int64)>
        */

        // seh wrapped main
        const wrapped_main = asm()
        .sub_r_c(Register.rsp, 0x28)
        .call64(runtimeError.beginHandler, Register.rax)
        .mov_r_c(Register.rcx, bedrock_server_exe.argc, OperationSize.dword)
        .mov_r_c(Register.rdx, bedrock_server_exe.args)
        .xor_r_r(Register.r8, Register.r8)
        .call64(bedrock_server_exe.main, Register.rax)
        .add_r_c(Register.rsp, 0x28)
        .mov_r_c(Register.rcx, makefunc.np(finishCallback, RawTypeId.Void, null))
        .jmp64(uv_async.call, Register.rax)
        .alloc();

        patchForStdio();

        // call main as a new thread
        // main will create a game thread.
        // and bdsx will hijack the game thread and run it on the node thread.
        const [threadHandle] = capi.createThread(wrapped_main, null);

        // skip to create the console of BDS
        procHacker.nopping('skip-bedrock-console-object', 'ScriptEngine::initialize', 0x287, [
            0x4C, 0x8D, 0x4D, 0xD8, 0x4C, 0x8D, 0x05, 0x36, // lea r9,qword ptr ss:[rbp-28]
            0x75, 0x19, 0x01, 0x48, 0x8D, 0x55, 0xE8, 0x41, // lea r8,qword ptr ds:[7FF76658D9E0]
            0xFF, 0xD2, 0x84, 0xC0, 0x74, 0xA6              // lea rdx,qword ptr ss:[rbp-18]
        ], [ 7, 11 ]);

        // hook on update
        const updateWithSleep = asm()
        .sub_r_c(Register.rsp, 0x28)
        .mov_r_r(Register.rcx, Register.rbx)
        .call64(cgate.nodeLoop, Register.rax)
        .add_r_c(Register.rsp, 0x28)
        .jmp64(makefunc.np(()=>updateEvTarget.fire(), RawTypeId.Void, null), Register.rax)
        .ret()
        .alloc();
        procHacker.patching('update-hook', '<lambda_85c8d3d148027f864c62d97cac0c7e52>::operator()', 0x69e, 
            updateWithSleep, Register.rcx, true, [
                0x7C, 0x4A, // jl bedrock_server.7FF7E450BB9A
                0xFF, 0x15, 0x92, 0xDA, 0xC1, 0x00, // call qword ptr ds:[<&_Query_perf_frequency>]
                0x48, 0x8B, 0xF8, // mov rdi,rax
                0xFF, 0x15, 0x81, 0xDA, 0xC1, 0x00, // call qword ptr ds:[<&_Query_perf_counter>]
                0x48, 0x99, // cqo
                0x48, 0xF7, 0xFF, // idiv rdi
                0x48, 0x69, 0xC8, 0x00, 0xCA, 0x9A, 0x3B, // imul rcx,rax,3B9ACA00
                0x48, 0x69, 0xC2, 0x00, 0xCA, 0x9A, 0x3B, // imul rax,rdx,3B9ACA00
                0x48, 0x99, // cqo
                0x48, 0xF7, 0xFF, // idiv rdi
                0x48, 0x8D, 0x14, 0x08, // lea rdx,qword ptr ds:[rax+rcx
                0x48, 0x89, 0x55, 0x38, // mov qword ptr ss:[rbp+38],rdx
                0x48, 0x89, 0x55, 0x40, // mov qword ptr ss:[rbp+40],rdx
                0x48, 0x89, 0x5D, 0x48, // mov qword ptr ss:[rbp+48],rbx
                0x48, 0x2B, 0xDA, // sub rbx,rdx
                0x48, 0x89, 0x5C, 0x24, 0x58, // mov qword ptr ss:[rsp+58],rbx
                0x48, 0x8D, 0x4C, 0x24, 0x58, // lea rcx,qword ptr ss:[rsp+58
                0xE8, 0x57, 0xDD, 0xA4, 0xFF, // call <bedrock_server.void __cdecl std::this_thread::sleep_for<__int64,struct std::ratio<1,1000000000> >(class std::chrono::duration<__int64,struct std::ratio<1,1000000000> > const & __ptr64)>
                0x90, // nop
            ], []);

        nethook.hooking(err=>{
            err.stack = remapStack(err.stack);
            if (errorEvTarget.fire(err) !== CANCEL)
            {
                console.error(err.stack);
            }
        });
        hookingForCommand();
        hookingForActor();

        // hook on script starting
        // this hooking point is slower than system.initlaize.
        procHacker.hookingRawWithCallOriginal('ScriptEngine::startScriptLoading', 
            makefunc.np((scriptEngine:VoidPointer)=>{
                try
                {
                    cgate.nodeLoopOnce();
                    
                    bd_server.serverInstance = serverInstanceDest.getPointerAs(bd_server.ServerInstance);
                    nimodule.networkHandler = bd_server.serverInstance.networkHandler;
                    openEvTarget.fire();
                    asyncResolve();
                    _tickCallback();
                    
                    procHacker.js('ScriptEngine::_processSystemInitialize', RawTypeId.Void, null, VoidPointer)(scriptEngine);
                    _tickCallback();
                    cgate.nodeLoopOnce();
                }
                catch (err)
                {
                    remapAndPrintError(err);
                }
            }, RawTypeId.Void, null, VoidPointer), 
            [Register.rcx], []);

        // keep ScriptEngine variables. idk why need it.
        procHacker.write('MinecraftServerScriptEngine::onServerUpdateEnd', 0, asm().ret());
    }

    export function launch():Promise<void>
    {
        return new Promise((resolve, reject)=>{
            if (launched)
            {
                reject(remapError(Error('Cannot launch BDS again')));
                return;
            }
            launched = true;
            _launch(resolve);
        });
    }

    export function executeCommandOnConsole(command:string):void
    {
        commandQueueBuffer.setCxxString(command);
        commandQueue.enqueue(commandQueueBuffer);
    }

    let stdInHandler:DefaultStdInHandler|null = null;

    export abstract class DefaultStdInHandler
    {
        protected online:(line:string)=>void = executeCommandOnConsole;
        protected readonly onclose = ()=>{
            this.close();
        };

        protected constructor()
        {
        }
    
        abstract close():void;

        static install():DefaultStdInHandler
        {
            if (stdInHandler !== null) throw remapError(Error('Already opened'));
            return stdInHandler = new DefaultStdInHandlerGetLine;
        }
    }

    /**
     * this handler has bugs on Linux+Wine
     */
    class DefaultStdInHandlerJs extends DefaultStdInHandler
    {
        private readonly rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
    
        constructor()
        {
            super();
            
            this.rl.on('line', line=>this.online(line));
            close.on(this.onclose);
        }

        close():void
        {
            if (stdInHandler === null) return;
            console.assert(stdInHandler !== null);
            stdInHandler = null;
            this.rl.close();
            this.rl.removeAllListeners();
            close.remove(this.onclose);
        }
    }

    class DefaultStdInHandlerGetLine extends DefaultStdInHandler
    {    
        private readonly getline = new GetLine(line=>this.online(line));
        constructor()
        {
            super();
            close.on(this.onclose);
        }

        close():void
        {
            if (stdInHandler === null) return;
            console.assert(stdInHandler !== null);
            stdInHandler = null;
            this.getline.close();
        }
    }
}


