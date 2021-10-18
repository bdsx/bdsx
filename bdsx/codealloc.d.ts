/// <reference types="node" />
import { StaticPointer, VoidPointer } from "./core";
declare module "./assembler" {
    interface X64Assembler {
        alloc(name?: string | null): StaticPointer;
        allocs(): Record<string, StaticPointer>;
    }
    namespace asm {
        function const_str(str: string, encoding?: BufferEncoding): Buffer;
        function getFunctionName(address: VoidPointer): string | null;
        function setFunctionNames(base: VoidPointer, labels: Record<string, number>): void;
    }
}
