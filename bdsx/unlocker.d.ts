import { VoidPointer } from "./core";
export declare class MemoryUnlocker {
    private readonly ptr;
    private readonly size;
    private readonly oldprotect;
    constructor(ptr: VoidPointer, size: number);
    done(): void;
}
