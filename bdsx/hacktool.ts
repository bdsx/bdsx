import { asm, Register } from "./assembler";
import { RawTypeId } from "./common";
import { AllocatedPointer, makefunc, StaticPointer, VoidPointer } from "./core";
import { dll } from "./dll";

export namespace hacktool
{
    const registerSpaceSize = 0x30;
    const maxStackCount = 4;
    const saveForParamAndCallback = new AllocatedPointer(registerSpaceSize*maxStackCount + 8);
    saveForParamAndCallback.setPointer(saveForParamAndCallback.add(8-registerSpaceSize, -1));

    /**
     * make the hooked function to ignore the original task.
     * and apply the return value.
     * need to call it inside of the hooked function.
     * do not call it twice.
     */
    export const setReturn = makefunc.js(asm()
        .mov_r_c(Register.rcx, saveForParamAndCallback)
        .mov_r_rp(Register.rax, Register.rcx, 0)
        .mov_r_rp(Register.r10, Register.rax, 0x28)
        .mov_r_rp(Register.rdx, Register.rax, 0x00)
        .mov_rp_r(Register.rdx, 0, Register.r10)
        .sub_r_c(Register.rax, registerSpaceSize)
        .mov_rp_r(Register.rcx, 0, Register.rax)
        .ret()
        .alloc(),
        RawTypeId.Void);

    export function hook(from:StaticPointer, to:VoidPointer, originalCodeSize:number, tempRegister?:Register|null):void
    {
        let newcode = asm()
        .mov_r_c(Register.r10, saveForParamAndCallback)
        .mov_r_rp(Register.rax, Register.r10, 0)
        .add_r_c(Register.rax, registerSpaceSize)
        .mov_rp_r(Register.r10, 0, Register.rax)
        .mov_rp_r(Register.rax, 0x00, Register.rsp)
        .pop_r(Register.r10)
        .mov_rp_r(Register.rax, 0x08, Register.rcx)
        .mov_rp_r(Register.rax, 0x10, Register.rdx)
        .mov_rp_r(Register.rax, 0x18, Register.r8)
        .mov_rp_r(Register.rax, 0x20, Register.r9)
        .mov_rp_r(Register.rax, 0x28, Register.r10)
        .call64(to, Register.rax)
        .mov_r_c(Register.r10, saveForParamAndCallback)
        .mov_r_rp(Register.rax, Register.r10, 0)
        .mov_r_rp(Register.rcx, Register.rax, 0x08)
        .mov_r_rp(Register.rdx, Register.rax, 0x10)
        .mov_r_rp(Register.r8, Register.rax, 0x18)
        .mov_r_rp(Register.r9, Register.rax, 0x20)
        .mov_r_rp(Register.r11, Register.rax, 0x28)
        .sub_r_c(Register.rax, registerSpaceSize)
        .mov_rp_r(Register.r10, 0, Register.rax)
        .push_r(Register.r11)
        .write(...from.getBuffer(originalCodeSize));

        if (tempRegister != null) newcode=newcode.jmp64(from, tempRegister);
        else newcode=newcode.jmp64_notemp(from.add(originalCodeSize));

        const jumper = asm().jmp64(newcode.alloc(), Register.rax).buffer();
        if (jumper.length > originalCodeSize) throw Error(`Too small area to hook, needs=${jumper.length}, originalCodeSize=${originalCodeSize}`);

        from.setBuffer(jumper);
        dll.vcruntime140.memset(from.add(jumper.length), 0xcc, originalCodeSize - jumper.length); // fill int3 at remained
    }

    export function patch(from:StaticPointer, to:VoidPointer, tmpRegister:Register, originalCodeSize:number, call:boolean):void
    {
        let jumper:Uint8Array;
        if (call)
        {
            jumper = asm()
            .call64(to, tmpRegister)
            .buffer();
        }
        else
        {
            jumper = asm()
            .jmp64(to, tmpRegister)
            .buffer();
        }

        if (jumper.length > originalCodeSize) throw Error(`Too small area to patch, needs=${jumper.length}, originalCodeSize=${originalCodeSize}`);

        from.setBuffer(jumper);
        dll.vcruntime140.memset(from.add(jumper.length), 0x90, originalCodeSize - jumper.length); // fill nop at remained
    }

    export function jump(from:StaticPointer, to:VoidPointer, tmpRegister:Register, originalCodeSize:number):void
    {
        const jumper = asm()
        .jmp64(to, tmpRegister)
        .buffer();
        if (jumper.length > originalCodeSize) throw Error(`Too small area to patch, needs=${jumper.length}, originalCodeSize=${originalCodeSize}`);
        from.setBuffer(jumper);
        dll.vcruntime140.memset(from.add(jumper.length), 0x90, originalCodeSize - jumper.length); // fill nop at remained
    }

}