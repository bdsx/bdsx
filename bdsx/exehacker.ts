
import { Register, X64Assembler } from './assembler';
import { proc } from "./bds/proc";
import { NativePointer, StaticPointer, VoidPointer } from "./core";
import { dll } from "./dll";
import { MemoryUnlocker } from "./unlocker";
import { hex, memdiff, memdiff_contains } from "./util";
import colors = require('colors');
import { disasm } from './disassembler';

export namespace exehacker
{
    /**
     * @param subject name of hooking
     * @param key target symbol
     * @param offset offset from target
     * @param ptr target pointer
     * @param originalCode old codes
     * @param ignoreArea pairs of offset, ignores partial bytes.
     */
    function check(subject:string, key:keyof proc, offset:number, ptr:StaticPointer, originalCode:number[], ignoreArea:number[]):boolean
    {
        const buffer = ptr.getBuffer(originalCode.length);
        const diff = memdiff(buffer, originalCode);
        if (!memdiff_contains(ignoreArea, diff))
        {
            console.error(colors.red(`${subject}: ${key}+0x${offset.toString(16)}: code unmatch`));
            console.error(colors.red(`[${hex(buffer)}] != [${hex(originalCode)}]`));
            console.error(colors.red(`diff: ${JSON.stringify(diff)}`));
            console.error(colors.red(`${subject}: skip `));
            return false;
        }
        else
        {
            return true;
        }
    }
    
    /**
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    export function nopping(subject:string, key:keyof proc, offset:number, originalCode:number[], ignoreArea:number[]):void
    {
        const ptr = proc[key].add(offset);
        if (!ptr)
        {
            console.error(colors.red(`${subject}: skip, ${key} symbol not found`));
            return;
        }
        const size = originalCode.length;
        const unlock = new MemoryUnlocker(ptr, size);
        if (check(subject, key, offset, ptr, originalCode, ignoreArea))
        {
            dll.vcruntime140.memset(ptr, 0x90, size);
        }
        unlock.done();
    }

    /**
     * @param subject for printing on error
     * @param key target symbol name
     * @param to call address
     */
    export function hooking(subject:string, key:keyof proc, to: VoidPointer, dummy_for_backward_compatible?:any, dummy2?:any):void
    {
        const ptr = proc[key];
        if (!ptr)
        {
            console.error(colors.red(`${subject}: skip, ${key} symbol not found`));
            return;
        }

        const code = disasm.process(ptr, 12);
        const unlock = new MemoryUnlocker(ptr, code.size);
        X64Assembler.hook(ptr, to, code.size);
        unlock.done();
    }

    /**
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param newCode call address
     * @param tempRegister using register to call
     * @param call true - call, false - jump
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    export function patching(subject:string, key:keyof proc, offset:number, newCode:VoidPointer, tempRegister:Register, call:boolean, originalCode:number[], ignoreArea:number[]):void
    {
        let ptr = proc[key];
        if (!ptr)
        {
            console.error(colors.red(`${subject}: skip, ${key} symbol not found`));
            return;
        }
        ptr = ptr.add(offset);
        if (!ptr)
        {
            console.error(colors.red(`${subject}: skip`));
            return;
        }
        const size = originalCode.length;
        const unlock = new MemoryUnlocker(ptr, size);
        if (check(subject, key, offset, ptr, originalCode, ignoreArea))
        {
            X64Assembler.patch(ptr, newCode, tempRegister, size, call);
        }
        unlock.done();
    }
    
    /**
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param jumpTo jump address
     * @param tempRegister using register to jump
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    export function jumping(subject:string, key:keyof proc, offset:number, jumpTo:VoidPointer, tempRegister:Register, originalCode:number[], ignoreArea:number[]):void
    {
        let ptr = proc[key];
        if (!ptr)
        {
            console.error(colors.red(`${subject}: skip, ${key} symbol not found`));
            return;
        }
        ptr = ptr.add(offset);
        const size = originalCode.length;
        const unlock = new MemoryUnlocker(ptr, size);
        if (check(subject, key, offset, ptr, originalCode, ignoreArea))
        {
            X64Assembler.jump(ptr, jumpTo, tempRegister, size);
        }
        unlock.done();
    }

    export function write(key:keyof proc, offset:number, asm:X64Assembler):void
    {
        const buffer = asm.buffer();
        const ptr = proc[key].add(offset);
        const unlock = new MemoryUnlocker(ptr, buffer.length);
        ptr.writeBuffer(buffer);
        unlock.done();
    }
}
