# bdsx-asm

# I ported it C++ to TS
# and now, I'm porting it TS to asm
# How ridiculous

# I love C++, but C++ is too slow at compiling
# And compilers are too heavy.
# I may have to make my own compiler
# It's also my own assembler compiler

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

export proc breakBeforeCallNativeFunction
    int3
    jmp callNativeFunction
    unwind
endp

;JsValueRef(JsValueRef callee, bool isConstructCall, JsValueRef *arguments, unsigned short argumentCount, void *callbackState)
export proc callNativeFunction
    ; rbp+18h ~ rbp+38h - temp space
    ; rbp+10h - rip
    keep rbp ; rbp+8h - rbp
    keep rbx ; rbp+0h - rbx
    setframe rbp, 0h

    sub rsp, 28h
    mov rbx, r8 ; rbx = arguments
    xor eax, eax

    ; arguments[1] to int, stacksize
    lea rdx, [rbp+28h] ; result
    mov [rdx], rax
    mov rcx, [rbx+8h] ; number = arguments[1]
    call JsNumberToInt
    sub rsp, [rbp+28h] ; stacksize

    ; make stack pointer
    lea r8, [rbp+38h] ; result = &args[1]
    mov rdx, rsp
    mov rcx, NativePointer
    call pointer_np2js
    test eax, eax
    jnz _fail

    ; call arguments[3]
    mov rcx, [rbx+18h] ; function = arguments[3]
    lea r9, [rbp+28h] ; returning value

    mov r8, js_undefined
    lea rdx, [rbp+30h] ; args
    mov [rbp+30h], r8 ; args[0] = js_undefined
    mov r8, 2 ; argumentCount = 2

    sub rsp, 0x20
    ;JsErrorCode JsCallFunction(JsValueRef function, JsValueRef *args, unsigned short argumentCount, JsValueRef *result)
    call JsCallFunction
    test eax, eax
    jnz _fail

    ; arguments[2] to pointer, function
    mov rcx, [rbx+10h] ; arguments[2]
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
    mov [rbp+18h], rax
    movsd [rbp+20h], xmm0

    ; call arguments[4]
    mov rcx, [rbx+20h] ; function = arguments[4]
    lea r9, [rbp+28h] ; returning value
    lea rdx, [rbp+30h] ; args
    mov r8, 2 ; argumentCount = 2

    sub rsp, 0x20
    ;JsErrorCode JsCallFunction(JsValueRef function, JsValueRef *args, unsigned short argumentCount, JsValueRef *result)
    call JsCallFunction
    test rax, rax
    jnz _fail
    mov rax, [rbp+28h]
    unwind
    ret
_fail:
    mov rax, js_undefined
    unwind
    ret
endp

; r10 = jsfunc, r11 = onError
export proc callJsFunction
    stack a8h
    mov [rsp+a0h], r11 ; onError

    mov [rsp+48h], rcx
    mov [rsp+50h], rdx
    mov [rsp+58h], r8
    mov [rsp+60h], r9

    movsd [rsp+68h], xmm0
    movsd [rsp+70h], xmm1
    movsd [rsp+78h], xmm2
    movsd [rsp+80h], xmm3

    mov [rsp+30h], r10 ; jsfunc

    ; make stack pointer
    lea r8, [rsp+40h] ; result = &args[1]
    lea rdx, [rsp+48h] ; stackptr
    mov rcx, NativePointer
    call pointer_np2js
    test eax, eax
    jnz _error

    mov rcx, [rsp+30h] ; function = jsfunc
    lea r9, [rsp+28h] ; result, ignored
    mov r8, 2
    mov rax, js_null
    lea rdx, [rsp+38h] ; args
    mov [rsp+38h], rax ; args[0] = null
    ;JsErrorCode JsCallFunction(JsValueRef function, JsValueRef *args, unsigned short argumentCount, JsValueRef *result)
    call JsCallFunction
    test eax, eax
    jnz _error
    mov rax, [rsp+90h]
    movsd xmm0, [rsp+98h]

    unwind
    ret
_error:
    mov rcx, [rsp+48h]
    mov rdx, [rsp+50h]
    mov r8, [rsp+58h]
    mov r9, [rsp+60h]
    movsd xmm0, [rsp+68h]
    movsd xmm1, [rsp+70h]
    movsd xmm2, [rsp+78h]
    movsd xmm3, [rsp+80h]
    unwind
    jmp [rsp-8h] ; onError, -a8h + a0h
endp

export def jshook_fireError:qword

export def CreateEventW:qword
export def CloseHandle:qword
export def SetEvent:qword
export def WaitForSingleObject:qword

proc crosscall_on_gamethread
    keep rbx
    stack 20h
    mov rbx, [rcx+asyncSize] ; stackptr

    ; make stack pointer
    lea r8, [rbx+40h] ; result = &args[1]
    lea rdx, [rbx+48h] ; stackptr
    mov rcx, NativePointer
    call pointer_np2js
    test eax, eax
    jnz _error

    mov rcx, [rbx+30h] ; function = jsfunc
    lea r9, [rbx+28h] ; result, ignored
    mov r8, 2
    mov rax, js_null
    lea rdx, [rbx+38h] ; args
    mov [rbx+38h], rax ; args[0] = null
    ;JsErrorCode JsCallFunction(JsValueRef function, JsValueRef *args, unsigned short argumentCount, JsValueRef *result)
    call JsCallFunction
    test eax, eax
    jnz _error
    mov rcx, [rbx+20h] ; event
    call SetEvent
    unwind
    ret

_error:
    unwind
    jmp jsend_crash
endp

export proc jsend_crossthread
    const JsErrorNoCurrentContext 0x10003
    stack a8h

    cmp eax, JsErrorNoCurrentContext
    jne _crash

    xor ecx, ecx
    xor edx, edx
    xor r8, r8
    xor r9, r9
    call CreateEventW
    mov [rsp+20h], rax ; event

    lea rcx, crosscall_on_gamethread
    mov rdx, 8
    call uv_async_alloc

    mov [rsp+18h], rax ; AsyncTask
    mov rcx, rax
    call uv_async_post

    mov rax, [rsp+18h] ; AsyncTask
    mov rdx, rsp ; stackptr
    mov rcx, [rsp+20h] ; event
    mov [rax+asyncSize], rdx
    mov edx, -1
    call WaitForSingleObject

    mov rcx, [rsp+20h]
    call CloseHandle

    mov rax, [rsp+90h]
    movsd xmm0, [rsp+98h]
    unwind
    ret
_crash:
endp

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

    lea r8, [sizeofEXCEPTION_RECORD-4]
    lea rcx, [rdx+4] ; ExceptionRecord+4
    xor edx, edx
    call memset

    lea rcx, [rsp+8] ; exception_ptrs
    call runtimeErrorRaise
endp

export proc debugBreak
    int3
endp

export proc returnRcx
    mov rax, rcx
endp

export proc returnZero
    xor eax, eax
endp

; BDS hooks
export def CommandOutputSenderHookCallback:qword
export proc CommandOutputSenderHook
    stack 28h
    lea rcx,[rbp+7]
    call CommandOutputSenderHookCallback
endp

export def commandQueue:qword
export def MultiThreadQueueTryDequeue:qword
export proc ConsoleInputReader_getLine_hook
    mov rcx, commandQueue
    jmp MultiThreadQueueTryDequeue
endp

def gamelambdaptr:qword
export def gameThreadStart:qword;
export def gameThreadFinish:qword;
export def gameThreadInner:qword ; void gamethread(void* lambda);
export def free:qword
export def evWaitGameThreadEnd:qword
proc gameThreadEntry
    stack 28h
    call gameThreadStart
    mov rcx, gamelambdaptr
    call gameThreadInner
    call gameThreadFinish
    mov rcx, evWaitGameThreadEnd
    call SetEvent
endp

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
    call cgateNodeLoop ; void cgateNodeLoop(uint64_t time) ; time = count of high_resolution_clock::time_point::time_since_epoch()
    unwind
    mov rax, updateEvTargetFire
    test rax, rax
    jz _ret
    jmp updateEvTargetFire
_ret:
    ret
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
export def createPacketRaw:qword
export def enabledPacket:byte[PACKET_ID_COUNT]
export def lastSenderNetId:qword

export proc packetRawHook
    ; dword ptr[rbp+0x1C0] - packetId
    mov lastSenderNetId, r14 ; NetworkConnection

    mov edx, dword ptr[rbp+0x1C0]
    lea rax, enabledPacket
    mov al, byte ptr[rax+rdx]
    unwind
    test al, 0x01
    jz _skipEvent
    mov rcx, rbp ; rbp
    mov rdx, r14 ; NetworkConnection
    jmp onPacketRaw
 _skipEvent:
    ; rdx - packetId
    lea rcx, [rbp+0x1C8] ; packet
    jmp createPacketRaw
endp

export def packetBeforeOriginal:qword
export def onPacketBefore:qword
export proc packetBeforeHook
    ; dword ptr[rbp+0x1C0] - packetId
    stack 28h
    lea rdx,qword ptr[rbp+0x80] ; original code
    lea rcx,qword ptr[rbp+0x30] ; original code
    call packetBeforeOriginal ; original code
    unwind
    lea rcx, enabledPacket
    mov r8d, dword ptr[rbp+0x1C0] ; packetId
    movzx ecx, byte ptr[rcx+r8]
    test cl, 0x02
    jz _skipEvent
    mov rcx, rbp
    mov rdx, rsp
    ; r8 - packetId
    mov [rbp+0x280], 0x1 ; assigns the correct value manually to bypass crashes - 1.20.61
    jmp onPacketBefore
_skipEvent:
    ret
endp

export def onPacketAfter:qword
export def handlePacket:qword
export def __guard_dispatch_icall_fptr:qword

export proc packetAfterHook
    ; dword ptr[rbp+0x1C0] - packetId
    stack 28h

    ; orignal codes
    mov r8, rsi ; callback
    mov rdx, r14 ; NetworkConnection
    mov rax, [rax+8]
    call __guard_dispatch_icall_fptr ; ServerNetworkHandler::handle()

    lea r10, enabledPacket
    mov r8d, dword ptr[rbp+0x1C0] ; packetId
    movzx eax, byte ptr[r10+r8]
    unwind
    test al, 0x04
    jz _skipEvent
    mov rcx,[rbp+0x1C8] ; packet
    mov rdx, r14 ; ni
    ; r8 - packetId
    jmp onPacketAfter
_skipEvent:
    ret
endp

export def sendOriginal:qword
export def onPacketSend:qword
export proc packetSendHook
    stack 48h

    mov rax, [r8] ; packet.vftable
    call [rax+8] ; packet.getId(), just constant return

    lea r10, enabledPacket
    mov r10b, byte ptr[rax+r10]
    test r10b, 0x08
    jz _skipEvent

    mov [rsp+20h], rcx
    mov ecx, eax ; packetId
    mov [rsp+28h], rdx
    mov [rsp+30h], r8 ; packet
    mov [rsp+38h], r9
    ; ecx = packetId
    call onPacketSend
    mov rcx, [rsp+20h]
    mov rdx, [rsp+28h]
    mov r8, [rsp+30h]
    mov r9, [rsp+38h]
    test eax, eax
    jnz _skipSend
_skipEvent:
    unwind
    jmp sendOriginal
_skipSend:
    unwind
    ret
endp

export def sendInternalOriginal:qword
export def packetSendAllCancelPoint:qword

export proc packetSendAllHook
    stack 28h
    ; r12 - packet
    ; rbx - ni

    mov rax, [r12]
    call [rax+8] ; packet.getId(), just constant return

    lea r10, enabledPacket
    mov ecx, eax
    mov al, byte ptr[rax+r10]
    test al, 0x08
    jz _pass

    mov r8, r12 ; packet
    mov rdx, rbx ; ni
    ; rcx = packetId
    call onPacketSend

    test eax, eax
    jz _pass
    unwind
    pop rax
    jmp packetSendAllCancelPoint
_pass:

    unwind
    ; original codes
    mov rax, [r12]
    mov rcx, r12
    movzx edi, byte ptr[rbx+0xa0]
    movzx esi, byte ptr[rcx+0x10]
    mov rax, qword ptr[rax+0x8]
    jmp __guard_dispatch_icall_fptr
endp

export def onPacketSendInternal:qword
export proc packetSendInternalHook
    stack 48h

    mov rax, [r8] ; packet.vftable
    call [rax+8] ; packet.getId(), just constant return

    lea r10, enabledPacket
    mov r10b, byte ptr[rax+r10]
    test r10b, 0x10
    jz _skipEvent

    mov [rsp+20h], rcx
    mov ecx, eax ; packetId
    mov [rsp+28h], rdx
    mov [rsp+30h], r8
    mov [rsp+38h], r9
    call onPacketSendInternal
    mov rcx, [rsp+20h]
    mov rdx, [rsp+28h]
    mov r8, [rsp+30h]
    mov r9, [rsp+38h]
    test eax, eax
    jnz _skipSend
_skipEvent:
    unwind
    jmp sendInternalOriginal
_skipSend:
    unwind
    ret
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

export def terminate:qword
export def ExitThread:qword
export def bdsMainThreadId:dword

export proc terminateHook
    stack 28h
    call GetCurrentThreadId
    cmp eax, bdsMainThreadId
    jne _originalTerminate
    mov rcx, finishCallback
    call uv_async_call
    xor ecx, ecx
    call ExitThread
_originalTerminate:
    unwind
    jmp terminate
endp
