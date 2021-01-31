
import { Register, X64Assembler } from './assembler';
import { proc, procHacker } from "./bds/proc";
import { VoidPointer } from "./core";


/**
 * @deprecated use procHacker instead
 */
export namespace exehacker
{
    /**
     * @deprecated use procHacker.nopping instead
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    export function nopping(subject:string, key:keyof proc, offset:number, originalCode:number[], ignoreArea:number[]):void {
        procHacker.nopping(subject, key, offset, originalCode, ignoreArea);
    }

    /**
     * @deprecated use procHacker.hooking or procHacker.hookingRawWithCallOriginal instead
     * @param key target symbol name
     * @param to call address
     */
    export function hooking(dummy:string, key:keyof proc, to: VoidPointer, ignore?:unknown, ignore2?:unknown):void {
        procHacker.hookingRawWithCallOriginal(key, to, [Register.rcx, Register.rdx, Register.r8, Register.r9], []);
    }

    /**
     * @deprecated use procHacker.patching instead
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param newCode call address
     * @param tempRegister using register to call
     * @param call true - call, false - jump
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    export function patching(subject:string, key:keyof proc, offset:number, newCode:VoidPointer, tempRegister:Register, call:boolean, originalCode:number[], ignoreArea:number[]):void {
        procHacker.patching(subject, key, offset, newCode, tempRegister, call, originalCode, ignoreArea);
    }
    
    /**
     * @deprecated use procHacker.jumping instead
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param jumpTo jump address
     * @param tempRegister using register to jump
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    export function jumping(subject:string, key:keyof proc, offset:number, jumpTo:VoidPointer, tempRegister:Register, originalCode:number[], ignoreArea:number[]):void {
        procHacker.jumping(subject, key, offset, jumpTo, tempRegister, originalCode, ignoreArea);
    }

    /**
     * @deprecated use procHacker.write instead
     */
    export function write(key:keyof proc, offset:number, asm:X64Assembler):void {
        procHacker.write(key, offset, asm);
    }
}
