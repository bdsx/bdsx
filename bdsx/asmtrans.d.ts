import { asm, Register, X64Assembler } from "./assembler";
import { VoidPointer } from "./core";
export declare class X64OpcodeTransporter extends X64Assembler {
    readonly origin: VoidPointer;
    readonly codesize: number;
    constructor(origin: VoidPointer, codesize: number);
    readonly freeregs: Set<Register>;
    inpos: number;
    getUnusing(): Register | null;
    asmFromOrigin(oper: asm.Operation): void;
    moveCode(codes: asm.Operations, key: keyof any, required: number): void;
    end(): void;
}
