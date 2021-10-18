import { asm } from "./assembler";
import { NativePointer, VoidPointer } from "./core";
export declare namespace disasm {
    interface Options {
        /**
         * returns asm.Operator - it will assume the size from the moved distance.
         * returns number - it uses the number as the size.
         * returns null - failed.
         * returns void - it will assume the size from moved distance.
         */
        fallback?(ptr: NativePointer): asm.Operation | number | null | void;
        quiet?: boolean;
    }
    function walk(ptr: NativePointer, opts?: Options | null): asm.Operation | null;
    function process(ptr: VoidPointer, size: number, opts?: Options | null): asm.Operations;
    /**
     * @param opts it's a quiet option if it's boolean,
     */
    function check(hexstr: string | Uint8Array, opts?: boolean | Options | null): asm.Operations;
}
