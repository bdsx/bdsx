import { asm, FloatRegister, Register, X64Assembler } from "./assembler";
import { StaticPointer, VoidPointer } from "./core";
import { dll } from "./dll";

export namespace hacktool
{
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
        newcode.saveAndCall(to, keepRegister, keepFloatRegister);
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