# bdsx-asm

# I ported it C++ to TS
# and now, I'm porting it TS to asm
# How ridiculous

# I love C++, but C++ is too slow at compiling
# And compilers are too heavy.
# I may have to make my own compiler
# It's also my own assembler compiler

const JsUndefined 0
const JsNull 1
const JsNumber 2
const JsString 3
const JsBoolean 4
const JsObject 5
const JsFunction 6
const JsError 7
const JsArray 8
const JsSymbol 9
const JsArrayBuffer 10
const JsTypedArray 11
const JsDataView 12
const EXCEPTION_BREAKPOINT:dword 80000003h
const EXCEPTION_NONCONTINUABLE_EXCEPTION:dword 0xC0000025

export def GetCurrentThreadId:qword
export def bedrockLogNp:qword
export def vsnprintf:qword
export def JsConstructObject:qword
export def JsGetAndClearException:qword
export def js_null:qword
export def nodeThreadId:dword
export def runtimeErrorRaise:qword
export def RtlCaptureContext:qword

export def JsNumberToInt:qword
export def JsCallFunction:qword
export def js_undefined:qword
export def pointer_js2class:qword
export def NativePointer:qword

export def memset:qword

export def uv_async_call:qword
export def uv_async_alloc:qword
export def uv_async_post:qword

; JsErrorCode pointer_np2js(JsValueRef ctor, void* ptr, JsValueRef* out)
export proc pointer_np2js
    stack 28h
    mov [rsp+38h], rdx
    mov [rsp+40h], r8

    lea r9, [rsp+20h]
    lea rdx, [rsp+30h]
    mov rax, js_null
    mov r8, 1
    mov [rdx], rax
    call JsConstructObject
    test eax, eax
    jnz _eof

    mov rdx, [rsp+40h]
    mov rcx, [rsp+20h]
    mov [rdx], rcx

    call pointer_js2class
    mov rcx, [rsp+38h]
    mov [rax+10h], rcx
    xor eax, eax
endp

export def raxValue:qword
export def xmm0Value:qword

export proc breakBeforeCallNativeFunction
    int3
    jmp callNativeFunction
    unwind
endp

;JsValueRef(JsValueRef callee, bool isConstructCall, JsValueRef *arguments, unsigned short argumentCount, void *callbackState)
export proc callNativeFunction
    ; prologue
    keep rbp
    keep rbx
    stack 28h
    setframe rbp, 0h
    mov rbx, r8 ; rbx = arguments
    xor eax, eax

    ; arguments[1] to int, stacksize
    lea rdx, [rbp+40h] ; result
    mov [rdx], rax
    mov rcx, [rbx+8h] ; number = arguments[1]
    call JsNumberToInt
    sub rsp, [rbp+40h] ; stacksize

    ; make stack pointer
    lea r8, [rbp+50h] ; result = &args[1]
    mov rdx, rsp
    mov rcx, NativePointer
    call pointer_np2js
    test eax, eax
    jnz _eof

    ; call second arg
    mov rcx, [rbx+10h] ; function = arguments[2]
    lea r9, [rbp+40h] ; returning value

    mov r8, js_undefined
    lea rdx, [rbp+48h] ; args
    mov [rbp+48h], r8 ; args[0] = js_undefined
    mov r8, 2 ; argumentCount = 2

    sub rsp, 0x20
    ;JsErrorCode JsCallFunction(JsValueRef function, JsValueRef *args, unsigned short argumentCount, JsValueRef *result)
    call JsCallFunction
    test eax, eax
    jnz _eof

    ; arguments[3] to pointer, function
    mov rcx, [rbx+18h] ; arguments[3]
    call pointer_js2class

    add rsp, 0x20

    ; call native function
    mov rcx, [rsp]
    mov rdx, [rsp+8h]
    mov r8, [rsp+10h]
    mov r9, [rsp+18h]
    movsd xmm0, qword ptr[rsp]
    movsd xmm1, qword ptr[rsp+8h]
    movsd xmm2, qword ptr[rsp+10h]
    movsd xmm3, qword ptr[rsp+18h]
    call [rax+10h]
    mov raxValue, rax
    movsd xmm0Value, xmm0

_eof:
    unwind
    mov rax, js_undefined
    ret
endp

; r10 = jsfunc, r11 = onError
export proc callJsFunction
    stack 88h
    mov [rsp+80h], r11 ; onError
    ; 78h is unused

    mov [rsp+38h], rcx
    mov [rsp+40h], rdx
    mov [rsp+48h], r8
    mov [rsp+50h], r9

    movsd [rsp+58h], xmm0
    movsd [rsp+60h], xmm1
    movsd [rsp+68h], xmm2
    movsd [rsp+70h], xmm3

    mov [rsp+20h], r10 ; jsfunc

    ; make stack pointer
    lea r8, [rsp+30h] ; result = &args[1]
    lea rdx, [rsp+38h] ; stackptr
    mov rcx, NativePointer
    call pointer_np2js
    test eax, eax
    jnz _error

    mov rcx, [rsp+20h] ; function = jsfunc
    lea r9, [rsp+20h] ; result, ignored
    mov r8, 2
    mov rax, js_null
    lea rdx, [rsp+28h] ; args
    mov [rsp+28h], rax ; args[0] = null
    ;JsErrorCode JsCallFunction(JsValueRef function, JsValueRef *args, unsigned short argumentCount, JsValueRef *result)
    call JsCallFunction
    test eax, eax
    jnz _error
    mov rax, raxValue
    movsd xmm0, xmm0Value

    unwind
    ret
_error:
    mov rcx, [rsp+38h]
    mov rdx, [rsp+40h]
    mov r8, [rsp+48h]
    mov r9, [rsp+50h]
    movsd xmm0, [rsp+58h]
    movsd xmm1, [rsp+60h]
    movsd xmm2, [rsp+68h]
    movsd xmm3, [rsp+70h]
    unwind
    jmp [rsp-8h] ; onError, -88h + 80h
endp

export def jshook_fireError:qword

export proc jsend_crash
    mov ecx, eax
    or ecx, 0xE0000000
    jmp raise_runtime_error
endp

export proc jsend_returnZero
    stack 18h
    lea rcx, [rsp+10h]
    call JsGetAndClearException
    test eax, eax
    jnz _empty

    mov rcx, [rsp+10h]
    call jshook_fireError

_empty:
    xor eax, eax
endp

; codes for minecraft

export proc logHookAsyncCb
    mov r8, [rcx + asyncSize + 8h]
    lea rdx, [rcx + asyncSize + 10h]
    mov rcx, [rcx + asyncSize]
    jmp bedrockLogNp
endp

export proc logHook ; (int severity, char* format, ...)
    keep rbx
    stack 20h
    mov [rsp+30h],ecx ; severity
    mov [rsp+38h],rdx ; format
    mov [rsp+40h],r8 ; vl start
    mov [rsp+48h],r9

    ; get the length of vsnprintf
    lea r9, [rsp+40h] ; r9 = vl
    mov r8, rdx ; r8 = format
    xor edx, edx ; bufsize = null
    mov ecx, edx ; out = null
    call vsnprintf
    test rax, rax
    js _failed

    ; alloc AsyncTask
    mov rbx, rax
    lea rdx, [rax + 11h]
    lea rcx, logHookAsyncCb
    call uv_async_alloc
    mov rcx, [rsp+30h] ; severity
    mov [rax+asyncSize], rcx
    mov [rax+asyncSize+8], rbx ; length

    ; format with vsnprintf
    lea r9, [rsp+40h] ; vl
    mov r8, [rsp+38h] ; format
    lea rdx, [rbx+1] ; bufsize
    lea rcx, [rax+asyncSize+10h] ; text
    mov rbx, rax
    call vsnprintf

    ; thread check and call
    call GetCurrentThreadId
    mov rcx, rbx
    cmp eax, nodeThreadId
    jne async_post
    call logHookAsyncCb
    jmp _eof
async_post:
    call uv_async_post
    jmp _eof

_failed:
    mov rdx, 20h
    lea rcx, logHookAsyncCb
    call uv_async_alloc
    mov rdx, [rsp+30h] ; severity
    mov [rax+asyncSize], rdx
    mov [rax+asyncSize+8h], 15
    lea rcx, "[format failed]"
    mov rdx, [rcx]
    mov [rax+asyncSize+10h], rdx
    mov rdx, [rcx+8]
    mov [rax+asyncSize+18h], rdx

endp

; [[noreturn]] runtime_error(EXCEPTION_POINTERS* err)
export proc runtime_error
    mov rax, [rcx]
    cmp dword ptr[rax], EXCEPTION_BREAKPOINT
    je _ignore
    jmp runtimeErrorRaise
_ignore:
endp

; [[noreturn]] raise_runtime_error(int err)
export proc raise_runtime_error
    const sizeofEXCEPTION_RECORD 152
    const sizeofCONTEXT 1232
    const sizeofEXCEPTION_POINTERS 16
    const stackSize (sizeofEXCEPTION_RECORD + sizeofCONTEXT + sizeofEXCEPTION_POINTERS)
    const alignOffset 8
    const stackOffset ((stackSize + 15) & ~15)+alignOffset

    stack stackOffset ; exception_ptrs

    lea rdx, [rsp+sizeofEXCEPTION_POINTERS+alignOffset] ; ExceptionRecord
    mov dword ptr[rdx], ecx ; ExceptionRecord.ExceptionCode
    lea rcx, [rdx+sizeofEXCEPTION_RECORD] ; ContextRecord
    mov [rsp+alignOffset], rdx; exception_ptrs.ExceptionRecord
    mov [rsp+alignOffset+8], rcx; exception_ptrs.ContextRecord
    call RtlCaptureContext; RtlCaptureContext(&ContextRecord)

    lea r8, [sizeofEXCEPTION_RECORD-8]
    xor edx, edx
    lea rcx, [rsp+sizeofEXCEPTION_POINTERS+alignOffset+8] ; ExceptionRecord
    call memset

    lea rcx, [rsp+8] ; exception_ptrs
    call runtimeErrorRaise
endp

export def serverInstance:qword

export proc ServerInstance_ctor_hook
    mov serverInstance, rcx
endp

export proc debugBreak
    int3
endp

export def CommandOutputSenderHookCallback:qword
export proc CommandOutputSenderHook
    stack 28h
    mov rcx, r8
    call CommandOutputSenderHookCallback
endp

export def commandQueue:qword
export def MultiThreadQueueTryDequeue:qword
export proc ConsoleInputReader_getLine_hook
    mov rcx, commandQueue
    jmp MultiThreadQueueTryDequeue
endp

def gamelambdaptr:qword
export def gameThreadInner:qword ; void gamethread(void* lambda);
export def free:qword
export def SetEvent:qword
export def evWaitGameThreadEnd:qword
proc gameThreadEntry
    stack 28h
    mov rcx, gamelambdaptr
    call gameThreadInner
    mov rcx, evWaitGameThreadEnd
    call SetEvent
endp

export def WaitForSingleObject:qword
export def _Cnd_do_broadcast_at_thread_exit:qword

export proc gameThreadHook
    stack 28h
    mov rbx, rcx
    mov gamelambdaptr, rcx
    lea rcx, gameThreadEntry
    call uv_async_call
    mov rcx, evWaitGameThreadEnd
    mov rdx, -1
    call WaitForSingleObject ; use over 20h bytes of stack?
    unwind
    jmp _Cnd_do_broadcast_at_thread_exit
endp

export def bedrock_server_exe_args:qword
export def bedrock_server_exe_argc:dword
export def bedrock_server_exe_main:qword
export def finishCallback:qword

export proc wrapped_main
    stack 28h
    mov ecx, bedrock_server_exe_argc
    mov rdx, bedrock_server_exe_args
    xor r8d, r8d
    call bedrock_server_exe_main
    unwind
    mov rcx, finishCallback
    jmp uv_async_call
endp

export def cgateNodeLoop:qword
export def updateEvTargetFire:qword

export proc updateWithSleep
    stack 28h
    mov rcx, [rsp+50h]
    call cgateNodeLoop
    unwind
    jmp updateEvTargetFire
endp


export def removeActor:qword

export proc actorDestructorHook
    stack 8
    call GetCurrentThreadId
    unwind
    cmp rax, nodeThreadId
    jne skip_dtor
    jmp removeActor
skip_dtor:
    ret
endp

export def onPacketRaw:qword
export proc packetRawHook
    stack 28h
    mov rcx, rbp ; rbp
    mov edx, esi ; packetId
    mov r8, r14 ; Connection
    call onPacketRaw
endp

export def onPacketBefore:qword
export proc packetBeforeHook
    stack 28h

    ; original codes
    mov rax,qword ptr[rcx]
    lea r8,qword ptr[rbp+100h]
    lea rdx,qword ptr[rbp-20h]
    call qword ptr[rax+20h]

    mov rcx, rax ; read result
    mov rdx, rbp ; rbp
    mov r8d, esi ; packetId
    call onPacketBefore
endp

export def PacketViolationHandlerHandleViolationAfter:qword
export proc packetBeforeCancelHandling
    unwind
    cmp r8, 7fh
    jne violation
    mov rax, [rsp+28h]
    mov byte ptr[rax], 0
    ret
violation:
    ; original codes
    mov qword ptr[rsp+10h],rbx
    push rbp
    push rsi
    push rdi
    push r12
    push r13
    push r14
    jmp PacketViolationHandlerHandleViolationAfter
endp

export def onPacketAfter:qword
export proc packetAfterHook
    stack 28h

    ; orignal codes
    mov rax,[rcx]
    lea r9,[rbp+b8h]
    mov r8,rsi
    mov rdx,r14
    call [rax+8]

    mov rcx, rbp ; rbp
    mov edx, esi ; packetId

    call onPacketAfter
endp

export def onPacketSend:qword
export proc packetSendAllHook
    stack 28h
    mov r8,r15
    mov rdx,rbx
    mov rcx,r14
    call onPacketSend
    unwind

    ; original codes
    mov rax, [r15]
    lea rdx, [r14+248h]
    mov rcx, r15
    jmp qword ptr[rax+18h]
endp

export def getLineProcessTask:qword
export def std_cin:qword
export def std_getline:qword
export def std_string_ctor:qword

export proc getline
    ; stack start
    keep rbx
    keep rsi
    stack 18h
    mov rbx, rcx

_loop:
    ; task = new AsyncTask
    mov rcx, getLineProcessTask
    lea rdx, [sizeOfCxxString+8]
    call uv_async_alloc
    mov [rax+asyncSize+sizeOfCxxString], rbx ; task.cb = cb
    mov rsi, rax

    ; task.string.constructor();
    lea rcx, [rsi+asyncSize]
    call std_string_ctor

    ; std::getline(cin, task.string, '\n');
    mov rcx, std_cin
    mov rdx, rax
    mov r8, 10; LF, \n
    call std_getline

    ; task.post();
    mov rcx, rsi
    call uv_async_post

    ; goto _loop;
    jmp _loop
endp
