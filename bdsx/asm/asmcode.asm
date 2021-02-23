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

def GetCurrentThreadId:qword
def bedrockLogNp:qword
def memcpy:qword
def asyncAlloc:qword
def asyncPost:qword
def sprintf:qword
def JsHasException:qword
def JsCreateTypeError:qword
def JsGetValueType:qword
def JsStringToPointer:qword
def JsGetArrayBufferStorage:qword
def JsGetTypedArrayStorage:qword
def JsGetDataViewStorage:qword
def JsConstructObject:qword
def js_null:qword
def js_true:qword
def nodeThreadId:dword
def JsGetAndClearException:qword
def runtimeErrorFire:qword

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
    mov [rsp + 20h], rax
    call memcpy
    mov rcx, [rsp + 20h]
    add rsp, 0x28
    jmp asyncPost
endp

# [[noreturn]]] makefunc_getout()
proc makefunc_getout
    mov rsp, [rdi + fn_returnPoint]
    and rsp, -2
    pop rcx
    pop rbp
    pop rsi
    mov [rdi + fn_returnPoint], rcx
    pop rdi
    xor eax, eax
    ret
endp

# it uses rax, rdx only
# size_t strlen(const char* string)
proc strlen
    lea rax, [rcx-1]
_next:
    add rax, 1
    movzx edx, byte ptr[rax]
    test rdx, rdx
    jnz _next

    sub rax, rcx
endp

# JsValueRef makeError(char* string, size_t size)
proc makeError
    sub rsp, 88h
    
    lea r8, [rcx+rdx]
    lea r9, [rsp+20h]
_copy:
    movzx eax, byte ptr[rcx]
    mov word ptr[r9], ax
    add rcx, 1
    add r9, 2
    cmp rcx, r8
    jne _copy

    lea rcx, [rsp+20h]
    lea r8, [rsp+18h]
    call [rdi+fn_JsPointerToString]
    mov rcx, [rsp+18h]
    lea rdx, [rsp+10h]
    call JsCreateTypeError
    mov rax, [rsp+10h]
    add rsp, 88h
    ret
endp

# [[noreturn]] getout_jserror(JsValueRef error)
proc getout_jserror
    sub rsp, 28h
    call [rdi + fn_JsSetException]
    call [rdi + fn_stack_free_all]
    mov rax, [rdi + fn_returnPoint]
    and rax, 1
    jz runtimeError
    call makefunc_getout
runtimeError:
    call runtimeErrorFire
endp

# [[noreturn]] getout_invalid_parameter(uint32_t paramNum)
proc getout_invalid_parameter
    sub rsp, 48h
    test ecx, ecx
    jg paramNum_is_number
    lea rcx, "Invalid parameter at this"
    call strlen
    jmp paramNum_is_this
paramNum_is_number:
    mov r8, rcx
    lea rdx, "Invalid parameter at %d"
    lea rcx, [rsp + 20h]
    call sprintf
    lea rcx, [rsp + 20h]
paramNum_is_this:
    mov rdx, rax
    call makeError
    mov rcx, rax
    call getout_jserror
endp

# [[noreturn]] getout_invalid_parameter_count(uint32_t actual, uint32_t expected)
proc getout_invalid_parameter_count
    sub rsp, 68h
    mov r9, rcx
    mov r8, rdx
    lea rdx, "Invalid parameter count (expected=%d, actual=%d)"
    lea rcx, [rsp + 20h]
    call sprintf
    lea rcx, [rsp + 20h]
    mov rdx, rax
    call makeError
    mov rcx, rax
    add rsp, 68h
    jmp getout_jserror
endp

# [[noreturn]] getout(JsErrorCode err)
proc getout
    sub rsp, 48h
    mov [rsp + 0x28], rcx
    mov rax, [rdi + fn_returnPoint]
    and rax, 1
    jz _crash
    lea rcx, [rsp + 20h]
    call JsHasException
    test eax, eax
    jnz _codeerror
    movzx eax, byte ptr[rsp + 20h]
    test eax, eax
    jz _codeerror
    call [rdi + fn_stack_free_all]
    call makefunc_getout
_crash:
    lea rcx, [rsp + 20h]
    call JsGetAndClearException
    jnz _codeerror
    call [rdi + fn_stack_free_all]
    mov rcx, [rsp + 20h]
    call runtimeErrorFire
_codeerror:
    mov r8, [rsp + 0x28]
    lea rdx, "JsErrorCode: 0x%x"
    lea rcx, [rsp + 20h]
    call sprintf
    lea rcx, [rsp + 20h]
    mov rdx, rax
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
    lea rdx, [rsp+10h]
    call JsGetValueType
    test eax, eax
    jnz _failed
    mov eax, [rsp+10h]
    sub rax, JsNull
    jz _null
    sub rax, 2
    jnz _failed
    lea r8, [rsp+20h]
    lea rdx, [rsp+18h]
    mov rcx, [rsp+30h]
    call JsStringToPointer
    test eax, eax
    jnz _failed
    mov rcx, [rsp+18h]
    mov rdx, [rsp+20h]
    call [rsp+40h]
    add rsp, 28h
    ret
_failed:
    mov rcx, [rsp+38h]
    call [rdi+fn_getout_invalid_parameter]
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
    mov eax, [rsp+10h]
    sub rax, JsNull ; JsNull 1
    jz _null
    sub rax, 4 ; JsObject 5
    jz _object
    sub rax, 5 ; JsArrayBuffer 10
    jz _arrayBuffer
    sub rax, 1 ; JsTypedArray 11
    jz _typedArray
    sub rax, 1 ; JsDataView 12
    jz _dataView
_failed:
    mov rcx, [rsp+38h]
    call [rdi+fn_getout_invalid_parameter]

_null:
    add rsp, 38h
    xor eax, eax
    ret

_object:
    mov rcx, [rsp+40h]
    call [rdi+fn_pointer_js2class]
    test rax, rax
    jz _failed
    mov rax, [rax+10h]
    add rsp, 38h
    ret

_arrayBuffer:
    lea r8, [rsp+18h]
    lea rdx, [rsp+10h]
    mov rcx, [rsp+40h]
    call JsGetArrayBufferStorage
    test eax, eax
    jnz _failed
    mov rax, [rsp+10h]
    add rsp, 38h
    ret

_typedArray:
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

_dataView:
    lea r8, [rsp+18h]
    lea rdx, [rsp+10h]
    mov rcx, [rsp+40h]
    call JsGetDataViewStorage
    test eax, eax
    jnz _failed
    mov rax, [rsp+10h]
    add rsp, 38h
    ret
endp

; const char16_t* utf16_js2np(JsValueRef value, uint32_t paramNum)
proc utf16_js2np
    sub rsp, 28h
    mov [rsp+38h], rdx
    mov [rsp+30h], rcx
    lea rdx, [rsp+10h]
    call JsGetValueType
    test eax, eax
    jnz _failed
    mov eax, [rsp+10h]
    sub rax, 1
    jz _null
    sub rax, 2
    jnz _failed
    lea r8, [rsp+20h]
    lea rdx, [rsp+18h]
    mov rcx, [rsp+30h]
    call JsStringToPointer
    test eax, eax
    jnz _failed
    mov rax, [rsp+18h]
    add rsp, 28h
    ret
_null:
    add rsp, 28h
    xor eax, eax
    ret
_failed:
    mov rcx, [rsp+38h]
    call [rdi+fn_getout_invalid_parameter]
endp

; JsValueRef str_np2js(pcstr str, uint32_t paramNum, JsErrorCode(*converter)(const char*, JsValue))
proc str_np2js
    sub rsp, 28h
    mov [rsp+38h], rdx
    lea rdx, [rsp+10h]
    call r8
    test eax, eax
    jnz _failed
    mov rax, [rsp+10h]
    add rsp, 28h
    ret
_failed:
    mov rcx, [rsp+38h]
    call [rdi+fn_getout_invalid_parameter]
endp

; JsValueRef utf16_np2js(pcstr16 str, uint32_t paramNum)
proc utf16_np2js
    sub rsp, 28h
    mov [rsp+38h], rdx

    mov rdx, rcx
_next:
    movzx eax, word ptr[rdx]
    add rdx, 2
    test eax, eax
    jnz _next

    sub rdx, rcx
    shr rdx, 2

    lea r8, [rsp+18h]
    call [rdi+fn_JsPointerToString]
    test eax, eax
    jz _failed
    mov rax, [rsp+18h]
    add rsp, 28h
    ret
_failed:
    mov rcx, [rsp+38h]
    call [rdi+fn_getout_invalid_parameter]
endp

; JsValueRef pointer_np2js_nullable(JsValueRef ctor, void* ptr) noexcept
proc pointer_np2js_nullable
    test rdx, rdx
    jnz pointer_np2js
    mov rax, js_null
    ret
endp

; JsValueRef pointer_np2js(JsValueRef ctor, void* ptr)
proc pointer_np2js
    sub rsp, 38h
    mov [rsp+48h], rdx
    lea r9, [rsp+20h]
    mov r8, 1
    lea rdx, [rsp+28h]
    mov rax, js_null
    mov [rdx], rax
    call JsConstructObject
    test eax, eax
    jnz _failed
    mov rcx, [rsp+20h]
    call [rdi+fn_pointer_js2class]
    test rax, rax
    jz _failed
    mov rcx, [rsp+48h]
    mov [rax+10h], rcx
    mov rax, [rsp+20h]
    add rsp, 38h
    ret
_failed:
    mov rcx, rax
    call getout
endp

; void* pointer_js_new(JsValueRef ctor, JsValueRef* out)
proc pointer_js_new
    sub rsp, 38h
    mov [rsp+48h], rdx
    mov r9, rdx
    mov r8, 2
    lea rdx, [rsp+28h]
    mov rax, js_null
    mov [rdx], rax
    mov rax, js_true
    mov [rdx+8], rax
    call JsConstructObject
    test eax, eax
    jnz _failed
    mov rax, [rsp+48h]
    mov rcx, [rax]
    call [rdi+fn_pointer_js2class]
    test rax, rax
    jz _failed
    mov rax, [rax+10h]
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

    xor eax, eax
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
    call [rdi+fn_getout_invalid_parameter]
endp


; void* wrapper_js2np(JsValueRef func, JsValueRef ptr)
proc wrapper_js2np
    sub rsp, 38h
    mov [rsp+30h], rdx
    mov rax, js_null
    mov [rsp+28h], rax
    lea r9, [rsp+20h]
    mov r8, 2
    lea rdx, [rsp+28h]
    call [rdi+fn_JsCallFunction]
    test eax, eax
    jnz _failed
    mov rcx, [rsp+20h]
    call [rdi+fn_pointer_js2class]
    test rax, rax
    jz _failed
    mov rax, [rax+10h]
    add rsp, 38h
    ret
_failed:
    mov ecx, eax
    call getout
endp

; JsValueRef wrapper_np2js_nullable(void* ptr, JsValueRef func, JsValueRef ctor)
proc wrapper_np2js_nullable
    test rcx, rcx
    jnz wrapper_np2js
    mov rax, js_null
    ret
endp

; JsValueRef wrapper_np2js(void* ptr, JsValueRef func, JsValueRef ctor)
proc wrapper_np2js
    sub rsp, 38h
    mov [rsp+50h], rcx
    mov [rsp+48h], rdx
    mov rcx, r8
    lea r9, [rsp+30h]
    mov r8, 1
    lea rdx, [rsp+28h]
    mov rax, js_null
    mov [rdx], rax
    call JsConstructObject
    test eax, eax
    jnz _failed
    mov rcx, [rsp+30h]
    call [rdi+fn_pointer_js2class]
    test rax, rax
    jz _failed
    mov rcx, [rsp+50h]
    mov [rax+10h], rcx
    lea r9, [rsp+20h]
    mov r8, 2
    lea rdx, [rsp+28h]
    mov rcx, [rsp+48h]
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
