import { asm, FloatRegister, Register } from "./assembler";
import { StaticPointer, VoidPointer } from "./core";
import { dll } from "./dll";

export namespace hacktool
{
    const registerOffsetMap:(number|null)[] = [
        null, // rax,
        -0x00, // rcx,
        -0x08, // rdx,
        null, // rbx,
        null, // rsp,
        null, // rbp,
        null, // rsi,
        null, // rdi,
        -0x10, // r8,
        -0x18, // r9,
    ];

    /**
     * @param keepRegister 
     * @param keepFloatRegister 
     * @param tempRegister 
     */
    export function hookWithCallOriginal(
        from:StaticPointer, to:VoidPointer, originalCodeSize:number, 
        keepRegister:Register[],
        keepFloatRegister:FloatRegister[],
        tempRegister?:Register|null):void {
        const newcode = asm();

        const fullsize = keepRegister.length * 8;
        for (const r of keepRegister) {
            const off = registerOffsetMap[r];
            if (off == null) throw Error(`${Register[r]} is not the register of arguments`);
            newcode.mov_rp_r(Register.rsp, off+fullsize, r);
        }
        if (keepFloatRegister.length !== 0) {
            newcode.sub_r_c(Register.rsp, 0x18);
            for (let i=0;i<keepFloatRegister.length;i++) {
                if (i !== 0) newcode.sub_r_c(Register.rsp, 0x10);
                newcode.movdqa_rp_f(Register.rsp, 0, keepFloatRegister[i]);
            }
    
            newcode
            .sub_r_c(Register.rsp, 0x30)
            .call64(to, Register.rax)
            .add_r_c(Register.rsp, 0x30);
    
            for (let i=keepFloatRegister.length-1;i>=0;i--) {
                newcode.movdqa_f_rp(keepFloatRegister[i], Register.rsp, 0);
                if (i !== 0) newcode.add_r_c(Register.rsp, 0x10);
            }
            newcode.sub_r_c(Register.rsp, 0x18);
        } else {
            newcode
            .sub_r_c(Register.rsp, 0x28)
            .call64(to, Register.rax)
            .add_r_c(Register.rsp, 0x28);
        }
        for (const r of keepRegister) {
            const off = registerOffsetMap[r]!;
            newcode.mov_r_rp(r, Register.rsp, off+fullsize);
        }
        newcode.write(...from.getBuffer(originalCodeSize));

        if (tempRegister != null) newcode.jmp64(from, tempRegister);
        else newcode.jmp64_notemp(from.add(originalCodeSize));
        
        const jumper = asm().jmp64(newcode.alloc(), Register.rax).buffer();
        if (jumper.length > originalCodeSize) throw Error(`Too small area to hook, needs=${jumper.length}, originalCodeSize=${originalCodeSize}`);

        from.setBuffer(jumper);
        dll.vcruntime140.memset(from.add(jumper.length), 0xcc, originalCodeSize - jumper.length); // fill int3 at remained
    }

    /**
     * @deprecated use ProcHacker. it cannot handle jump/call codes.
     */
    export function hook(
        from:StaticPointer, to:VoidPointer, originalCodeSize:number, 
        tempRegister?:Register|null):VoidPointer {
        const newcode = asm().write(...from.getBuffer(originalCodeSize));
        if (tempRegister != null) newcode.jmp64(from, tempRegister);
        else newcode.jmp64_notemp(from.add(originalCodeSize));
        const original = newcode.alloc();
        
        jump(from, to, Register.rax, originalCodeSize);
        return original;
    }

    export function patch(from:StaticPointer, to:VoidPointer, tmpRegister:Register, originalCodeSize:number, call:boolean):void {
        let jumper:Uint8Array;
        if (call) {
            jumper = asm()
            .call64(to, tmpRegister)
            .buffer();
        } else {
            jumper = asm()
            .jmp64(to, tmpRegister)
            .buffer();
        }

        if (jumper.length > originalCodeSize) throw Error(`Too small area to patch, require=${jumper.length}, actual=${originalCodeSize}`);

        from.setBuffer(jumper);
        dll.vcruntime140.memset(from.add(jumper.length), 0x90, originalCodeSize - jumper.length); // fill nop at remained
    }

    export function jump(from:StaticPointer, to:VoidPointer, tmpRegister:Register, originalCodeSize:number):void {
        const jumper = asm().jmp64(to, tmpRegister).buffer();
        if (jumper.length > originalCodeSize) throw Error(`Too small area to patch, require=${jumper.length}, actual=${originalCodeSize}`);
        from.setBuffer(jumper);
        dll.vcruntime140.memset(from.add(jumper.length), 0x90, originalCodeSize - jumper.length); // fill nop at remained
    }

}