import { X64Assembler } from "./assembler";
import { NativePointer } from "./core";


export namespace disasm
{
    export function walk(ptr:NativePointer):[(this:X64Assembler, ...args:any[])=>X64Assembler, any[]]|null
    {
        const v = ptr.readUint8();
        
        return null;
    }
}
