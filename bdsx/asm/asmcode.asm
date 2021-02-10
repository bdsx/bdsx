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
const JsArrayBuffer = 10
const JsTypedArray = 11
const JsDataView = 12

externconst fn_asyncSize:byte
externconst fn_runtimeErrorFire:byte
externconst fn_getout:byte
externconst fn_np2js_wrapper_nullable:byte
externconst fn_np2js_wrapper:byte
externconst fn_wrapper_js2np:byte
externconst fn_stack_free_all:byte
externconst fn_stack_ansi:byte
externconst fn_stack_utf8:byte
externconst fn_js2np_utf16:byte
externconst fn_pointer_js2np:byte
externconst fn_bin64:byte
externconst fn_JsNumberToInt:byte
externconst fn_JsBoolToBoolean:byte
externconst fn_JsBooleanToBool:byte
externconst fn_getout_invalid_parameter:byte
externconst fn_JsIntToNumber:byte
externconst fn_JsNumberToDouble:byte
externconst fn_buffer_to_pointer:byte
externconst fn_JsDoubleToNumber:byte
externconst fn_JsPointerToString:byte
externconst fn_np2js_ansi:byte
externconst fn_np2js_utf8:byte
externconst fn_np2js_utf16:byte
externconst fn_pointer_np2js:byte
externconst fn_pointer_np2js_nullable:byte
externconst fn_getout_invalid_parameter_count:byte
externconst fn_JsCallFunction:byte
externconst fn_pointer_js_new:byte
externconst fn_returnPoint:byte

exportdef GetCurrentThreadId:qword
exportdef bedrockLogNp:qword
exportdef memcpy:qword
exportdef asyncAlloc:qword
exportdef asyncPost:qword
exportdef sprintf:qword
exportdef JsHasException:qword
exportdef runtimeError.fire:qword
exportdef JsSetException:qword
exportdef JsCreateError:qword
exportdef JsGetValueType:qword
exportdef JsStringToPointer:qword
exportdef JsGetArrayBufferStorage:qword
exportdef JsGetTypedArrayStorage:qword
exportdef JsGetDataViewStorage:qword
exportdef stackutil.alloc:qword
exportdef stackutil.from_ansi:qword
exportdef strlen16:qword
exportdef JsConstructObject:qword

def :qword[16]
def data:void
def :qword[16]
def js_undefined:qword
def js_null:qword
def js_true:qword
def nodeThreadId:dword

proc logHookAsyncCb
    mov r8, [rcx + asyncSize + 8]
    lea rdx, [rcx + asyncSize + 10h]
    mov rcx, [rcx + asyncSize]
    jmp bedrockLogNp
endp

proc logHook
    call GetCurrentThreadId
    cmp eax, nodeThreadId
    jne async_post
    lea rdx, [rsp + 58h]
    mov rcx, rdi
    mov r8, rbx
    jmp bedrockLogNp
async_post:
    sub rsp, 28h
    lea rdx, [rbx + 11h]
    lea rcx, logHookAsyncCb
    call asyncAlloc
    mov [rax + asyncSize], rdi
    lea r8, [rbx + 1]
    mov [rax + asyncSize + 8], r8
    lea rcx, [rax + asyncSize + 10h]
    lea rdx, [rsp + 80h]
    mov [rsp + 0x20], rax
    call memcpy
    mov rcx, [rsp + 0x20]
    add rsp, 0x28
    jmp asyncPost
endp

proc getJsValueRef
    mov rax, rcx    
    ret
endp

# [[noreturn]]] makefunc_getout()
proc makefunc_getout
    mov rsp, [rdi + returnPoint]
    and rsp, -2
    pop rcx
    pop rbp
    pop rsi
    mov [rdi + returnPoint], rcx
    pop rdi
    xor eax, eax
    ret
endp

# JsValueRef makeError(char16_t* string, size_t size)
proc makeError
    sub rsp, 28h
    lea r8, [rsp, 18h]
    call [rdi + fn_JsPointerToString]
    mov rcx, [rsp + 18h]
    lea_r_rp(rdx, rsp, 18h)
    call_rp(rdi, fn_JsCreateError)
    mov_r_rp(rax, rsp, 18h)
    add_r_c(rsp, 28h)
    ret()
endp

# [[noreturn]] getout_jserror(JsValueRef error)
proc getout_jserror
    sub rsp, 28h
    call JsSetException
    call [rdi + fn_stack_free_all]
    mov rax, [rdi + returnPoint]
    and rax, 1
    jz runtimeError
    call [rdi + fn_makefunc_getout]
runtimeError:
    call [rdi + fn_runtimeErrorFire]
endp

# [[noreturn]] getout_invalid_parameter(uint32_t paramNum)
proc getout_invalid_parameter
    sub rsp, 48h
    test rcx, rcx
    jg paramNum_is_number
    mov rcx, "Invalid parameter at this"
    call makeError
    jmp paramNum_is_this
paramNum_is_number:
    mov r8, paramNum
    mov rdx, "Invalid parameter at %d"
    lea rcx, [rsp + 20h]
    call sprintf
    lea rcx, [rsp + 0x20]
    call makeError
paramNum_is_this:
    call getout_jserror
endp

# [[noreturn]] getout_invalid_parameter_count(uint32_t actual, uint32_t expected)
proc getout_invalid_parameter_count
    sub rsp, 68h
    mov r9, rcx
    mov r8, rdx
    mov rdx, "Invalid parameter count (expected=%d, actual=%d)"
    lea rcx, [rsp + 20h]
    call makeError
    mov rcx, rax
    add rsp, 68h
    jmp getout_jserror
endp

# [[noreturn]] getout(JsErrorCode err)
proc getout
    sub rsp, 48h
    mov [rsp + 0x28], rcx
    mov rax, [rdi + returnPoint]
    and rax, 1
    jz nocatch
    lea rcx, [rsp + 0x20]
    call JsHasException
    test eax, eax
    jnz nocatch
    movzx eax, byte ptr[rsp + 0x20]
    test eax, eax
    jnz nocatch
    call stack_free_all
    call makefunc_getout
nocatch:
    lea rcx, [rsp + 0x20]
    call JsGetAndClearException
    jnz jserror
    call stack_free_all
    mov rcx, [rsp + 0x20]
    call runtimeError.fire
jserror:
    mov r8, [rsp + 0x28]
    mov rdx, "JsErrorCode: 0x%x"
    lea rcx, [rsp + 0x20]
    call sprintf
    lea rcx, [rsp + 0x20]
    call makeError
    mov rcx, rax
    call getout_jserror
endp

# char* str_js2np(JsValueRef value, uint32_t paramNum, char*(*converter)(const char16_t*, size_t))
proc str_js2np
    sub rsp, 28h
    mov [rsp+40h], r8
    mov [rsp+38h], rdx
    mov [rsp+30h], rcx
    lea rdx, [rsp+18h]
    call JsGetValueType
    test eax, eax
    jnz _failed
    mov rax, [rsp+18h]
    sub rax, JsNull
    jz _null
    sub rax, 2
    jnz _failed
    lea r8, [rsp+20h]
    lea rdx, [rsp+18h]
    mov rcx, [rsp+38h]
    call JsStringToPointer
    test eax, eax
    jz _failed
    mov rcx, [rsp+18h]
    mov rdx, [rcx+20h]
    call [rsp+40h]
    add rsp, 28h
    ret
_failed:
    mov rcx, [rsp+38h]
    call getout_invalid_parameter
_null:
    add rsp, 28h
    xor eax, eax
    ret
endp

# void* buffer_to_pointer(JsValueRef value, uint32_t paramNum)
proc buffer_to_pointer
    sub rsp, 38h
    mov [rsp+48h], rdx
    mov [rsp+40h], rcx
    lea rdx, [rsp+10h]
    call JsGetValueType
    test eax, eax
    jnz _failed
    mov rax, [rsp+10h]

    sub rax, JsNull ; JsNull 1
    jnz _null
    add rsp, 38h
    xor eax,eax
    ret
_null:

    sub rax, 4 ; JsObject 5
    jnz _object
    mov rcx, [rsp+40h]
    call [rdi+fn_pointer_js2np]
    add rsp, 38h
    ret
_object:

    sub rax, 5 ; JsArrayBuffer 10
    jnz _arrayBuffer
    lea r8, [rsp+18h]
    lea rdx, [rsp+10h]
    mov rcx, [rsp+40h]
    call JsGetArrayBufferStorage
    test eax, eax
    jnz _failed
    mov rax, [rsp+10h]
    add rsp, 38h
    ret
_arrayBuffer:

    sub rax, 1 ; JsTypedArray 11
    jnz _typedArray
    lea r9, [rsp+30h]
    mov [rsp+20h], r9
    mov r8, r9
    lea rdx, [rsp+28h]
    mov rcx, [rsp+40h]
    call JsGetTypedArrayStorage
    test eax, eax
    jnz _failed
    mov rax, [rsp+28h]
    add rsp, 38h
    ret
_typedArray:

    sub rax, 1 ; JsDataView 12
    jnz _dataView
    jnz _arrayBuffer
    lea r8, [rsp+18h]
    lea rdx, [rsp+10h]
    mov rcx, [rsp+40h]
    call JsGetDataViewStorage
    test eax, eax
    jnz _failed
    mov rax, [rsp+10h]
    add rsp, 38h
    ret
_dataView:
_failed:
    mov rcx, [rsp+38h]
    call getout_invalid_parameter
endp

; const char16_t* utf16_js2np(JsValueRef value, uint32_t paramNum)
proc utf16_js2np
    sub rsp, 28h
    mov [rsp+38], rdx
    mov [rsp+30], rcx
    lea rdx, [rsp+18h]
    call JsGetValueType
    test eax, eax
    jnz _failed

    mov rax, [rsp+18h]
    sub rax, 1
    jz _null
    sub rax, 2
    jnz _failed
    lea r8, [rsp+20h]
    lea rdx, [rsp+18h]
    mov rcx, [rsp+38h]
    call JsStringToPointer
    test eax, eax
    jz _failed
    mov eax, [rsp+18h]
    add rsp, 28h
    ret
_null:
    add rsp, 28h
    xor eax, eax
    ret
_failed:
    mov rcx, [rsp+38h]
    call getout_invalid_parameter
endp

; JsValueRef str_np2js(pcstr str, uint32_t paramNum, JsErrorCode(*converter)(const char*, JsValue))
proc str_np2js
    sub rsp, 28h
    mov [rsp+38], rdx
    lea rdx, [rsp+10h]
    call r8
    test eax, eax
    jnz _failed
    mov rax, [rsp+10h]
    add rsp, 28h
    ret
_failed:
    mov rcx, [rsp+38h]
    call getout_invalid_parameter
endp

; JsValueRef utf16_np2js(pcstr16 str, uint32_t paramNum)
proc utf16_np2js
    sub rsp, 28h
    mov [rsp+38h], rdx
    mov [rsp+30h], rcx
    call strlen16
    lea r8, [rsp+18h]
    mov rdx, rax
    mov rcx, [rsp+20h]
    call [rdi+fn_JsPointerToString]
    test eax, eax
    jz _failed
    mov rax, [rsp+18h]
    add rsp 28h
    ret
_failed:
    mov rcx, [rsp+38h]
    call getout_invalid_parameter
endp

; JsValueRef pointer_np2js(JsValueRef ctor, void* ptr)
proc pointer_np2js
    sub rsp, 38h
    mov [rsp+48h], rdx
    lea r9, [rsp+20h]
    mov r8, 1
    lea rdx, [rsp+28h]
    mov rax, js_undefined
    mov [rdx], rax
    call JsConstructObject
    test eax, eax
    jnz _failed
    mov rcx, [rsp+20h]
    call [rdi+fn_pointer_js2np]    
    mov rcx, [rsp+48h]
    mov [rax+8], rcx
    mov rax, [rsp+20h]
    add rsp, 38h
    ret
_failed:
    mov rcx, rax
    call getout
endp

; JsValueRef pointer_np2js_nullable(JsValueRef ctor, void* ptr) noexcept
proc pointer_np2js
    test rcx, rcx
    jz _null
    sub rsp, 38h
    mov [rsp+48h], rdx
    lea r9, [rsp+20h]
    mov r8, 1
    lea rdx, [rsp+28h]
    mov rax, js_undefined
    mov [rdx], rax
    call JsConstructObject
    test eax, eax
    jnz _failed
    mov rcx, [rsp+20h]
    call [rdi+fn_pointer_js2np]    
    mov rcx, [rsp+48h]
    mov [rax+8], rcx
    mov rax, [rsp+20h]
    add rsp, 38h
    ret
_null:
    mov rax, js_null
    ret
_failed:
    mov rcx, rax
    call getout
endp

; void* pointer_js_new(JsValueRef ctor, JsValueRef* out)
proc pointer_js_new
    sub rsp, 38h
    mov [rsp+48h], rdx
    lea r9, rdx
    mov r8, 1
    lea rdx, [rsp+28h]
    mov rax, js_undefined
    mov [rdx], rax
    mov rax, js_true
    mov [rdx+8], rax
    call JsConstructObject
    test eax, eax
    jnz _failed
    mov rax, [rsp+48h]
    mov rcx, [rax]
    call [rdi+fn_pointer_js2np]
    mov rax, [rax+8]
    add rsp, 38h
    ret
_failed:
    mov rcx, rax
    call getout
endp

; int64_t bin64(JsValueRef value, uint32_t paramNum)
proc bin64
    sub rsp, 28h
    mov [rsp+38h], rdx
    lea r8, [rsp+20h]
    lea rdx, [rsp+18h]
    call JsStringToPointer
    test eax, eax
    jnz _failed

    xor eax,eax
    mov r8, [rsp+20h]
    test r8, r8
    jz _done

    mov rcx, [rsp+18h]
    lea r8, [rcx+r8*2]
    
    movsx rax, word ptr[rcx]
    add rcx, 2
    cmp rcx, r8
    jz _done
    
    movsx rdx, word ptr[rcx]
    shl rdx, 16
    or rax, rdx
    add rcx, 2
    cmp rcx, r8
    jz _done

    movsx rdx, word ptr[rcx]
    shl rdx, 32
    or rax, rdx
    add rcx, 2
    cmp rcx, r8
    jz _done

    movsx rdx, word ptr[rcx]
    shl rdx, 48
    or rax, rdx
_done:
    add rsp, 28h
    ret
_failed:
    mov rcx, [rsp+38h]
    call getout_invalid_parameter
endp


; void* wrapper_js2np(JsValueRef func, JsValueRef ptr)
proc wrapper_js2np
    sub rsp, 38h
    mov [rsp+30h], rdx
    mov [rsp+28h], js_undefined
    lea r9, [rsp+20h]
    mov r8, 2
    lea rdx, [rsp+28h]
    call [rdi+fn_JsCallFunction]
    test eax, eax
    jnz _failed
    mov rcx, [rsp+20h]
    call [rdi+fn_pointer_js2np]
    add rsp, 38h
    ret
_failed:
    mov ecx, eax
    call getout
endp

; JsValueRef np2js_wrapper(void* ptr, JsValueRef func, JsValueRef ctor)
proc np2js_wrapper
    sub rsp, 38h
    mov [rsp+48h], rdx
    mov [rsp+50h], r8
    lea r9, [rsp+20h]
    mov r8, 1
    lea rdx, [rsp+28h]
    mov rax, js_undefined
    mov [rdx], rax
    call JsConstructObject
    test eax, eax
    jnz _failed
    mov rcx, [rsp+20h]
    mov [rsp+30h], rcx
    call [rdi+fn_pointer_js2np]    
    mov rcx, [rsp+48h]
    mov [rax+8], rcx
    lea r9, [rsp+20h]
    mov r8, 2
    lea rdx, [rsp+28h]
    mov rcx, [rsp+50h]
    call [rdi+fn_JsCallFunction]
    test eax, eax
    jnz _failed
    mov rax, [rsp+20h]
    add rsp, 38h
    ret
_failed:
    mov ecx, eax
    call getout
endp

; JsValueRef np2js_wrapper_nullable(void* ptr, JsValueRef func, JsValueRef ctor) noexcept
proc np2js_wrapper_nullable
    sub rsp, 38h
    mov [rsp+48h], rdx
    mov [rsp+50h], r8
    lea r9, [rsp+20h]
    mov r8, 1
    lea rdx, [rsp+28h]
    mov rax, js_undefined
    mov [rdx], rax
    call JsConstructObject
    test eax, eax
    jnz _failed
    mov rcx, [rsp+20h]
    mov [rsp+30h], rcx
    call [rdi+fn_pointer_js2np]    
    mov rcx, [rsp+48h]
    mov [rax+8], rcx
    lea r9, [rsp+20h]
    mov r8, 2
    lea rdx, [rsp+28h]
    mov rcx, [rsp+50h]
    call [rdi+fn_JsCallFunction]
    test eax, eax
    jnz _failed
    mov rax, [rsp+20h]
    add rsp, 38h
    ret
_failed:
    mov ecx, eax
    call getout
endp