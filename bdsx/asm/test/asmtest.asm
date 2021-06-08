

export def retvalue:qword
export def retvalue2:qword
export def testfn2:qword
def temp:qword

const EXCEPTION_EXECUTE_HANDLER      1
const EXCEPTION_CONTINUE_SEARCH      0
const EXCEPTION_CONTINUE_EXECUTION   -1

proc testfn
    stack 18h
    xor eax, eax
    mov rax, retvalue
endp

export proc test
    call testfn
    call testfn2
endp

