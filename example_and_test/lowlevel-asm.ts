import { asm, Register } from "bdsx/assembler";
import { proc } from "bdsx/bds/symbols";
import { makefunc } from "bdsx/makefunc";
import { int16_t, int32_t, void_t } from "bdsx/nativetype";


// https://docs.microsoft.com/en-us/cpp/build/x64-calling-convention?view=msvc-160
// According to the calling convension
// rax = return value
// rcx = 1st parameter
// rdx = 2nd parameter
// r8 = 3rd parameter
// r9 = 4th parameter
// XMM0 = 1st parameter for float
// XMM1 = 2nd parameter for float
// XMM2 = 3nd parameter for float
// XMM3 = 4nd parameter for float
// stack frame must be aligned with 16 bytes

const printf = proc.printf;

// return value
// int func_return_1()
const func_return_1_raw = asm()
.mov_r_c(Register.rax, 1)  // mov rax, 1;   set rax to 1. it's treated as a return value
.ret()
.alloc();

const func_return_1_js = makefunc.js(func_return_1_raw, int32_t); // make it as js
console.assert(func_return_1_js() === 1);

// call printf
// void func_call_printf(char*)
const func_call_printf = asm()
.sub_r_c(Register.rsp, 0x28) // sub rsp, 0x28; make a stack frame, 0x20 for the parameters space and 8 for the alignment
.mov_r_r(Register.r8, Register.rdx) // mov rdx, rcx; set the 3rd parameter from the 2nd parameter
.mov_r_r(Register.rdx, Register.rcx) // mov rdx, rcx; set the 2nd parameter from the 1th parameter
.mov_r_c(Register.rcx, asm.const_str('[example/lowlevel-asm] %s, %s!\n')) // mov rcx, '...'; set the 1st parameter
.call64(printf, Register.rax)  // mov rax, printf; call rax;
.add_r_c(Register.rsp, 0x28) // add rsp, 0x28; remove a stack frame
.ret()
.alloc();

const func_call_printf_js = makefunc.js(func_call_printf, void_t, null, makefunc.Ansi, makefunc.Ansi); // make it as js
func_call_printf_js('Hello', 'World');

// 0xffff as short = -1
const ffff_as_short = asm()
.mov_r_c(Register.rax, 0xffff)
.ret()
.alloc();

const ffff_as_short_js = makefunc.js(ffff_as_short, int16_t);
console.assert(ffff_as_short_js() === -1);
