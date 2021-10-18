import { FloatRegister, Register } from "./assembler";
import { StaticPointer, VoidPointer } from "./core";
export declare namespace hacktool {
    /**
     * @param keepRegister
     * @param keepFloatRegister
     * @param tempRegister
     */
    function hookWithCallOriginal(from: StaticPointer, to: VoidPointer, originalCodeSize: number, keepRegister: Register[], keepFloatRegister: FloatRegister[], tempRegister?: Register | null): void;
    function patch(from: StaticPointer, to: VoidPointer, tmpRegister: Register, originalCodeSize: number, call: boolean): void;
    function jump(from: StaticPointer, to: VoidPointer, tmpRegister: Register, originalCodeSize: number): void;
}
