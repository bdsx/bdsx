
import { VoidPointer } from "./core";
import { dll } from "./dll";
import { PAGE_EXECUTE_WRITECOPY } from "./windows_h";

const int32buffer = new Int32Array(1);

export class MemoryUnlocker {
    private readonly oldprotect:number;

    constructor(private readonly ptr:VoidPointer, private readonly size:number) {
        if (!dll.kernel32.VirtualProtect(ptr, size, PAGE_EXECUTE_WRITECOPY, int32buffer))
            throw Error(`${ptr}: ${size} bytes, Failed to unprotect memory`);
        this.oldprotect = int32buffer[0];
    }

    done():void {
        if (!dll.kernel32.VirtualProtect(this.ptr, this.size, this.oldprotect, int32buffer))
            throw Error(`${this.ptr}: ${this.size} bytes, Failed to re-protect memory`);
    }
}
