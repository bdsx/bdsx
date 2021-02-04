
// Low Level - Writing Machine Codes
import { RawTypeId } from "bdsx";
import { asm, Register } from "bdsx/assembler";
import { proc } from "bdsx/bds/proc";

const asmmain = asm()
.sub_r_c(Register.rsp, 0x28) // make stack frame
.mov_r_c(Register.rcx, asm.const_str('Hello World!\n')) // rcx = "Hello World!\n";
.call64(proc['printf'], Register.rax) // printf(rcx);
.add_r_c(Register.rsp, 0x28) // remove stack frame
.ret() // return
.make(RawTypeId.Void); // make as the js function

asmmain();