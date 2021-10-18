"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryUnlocker = void 0;
const dll_1 = require("./dll");
const windows_h_1 = require("./windows_h");
const int32buffer = new Int32Array(1);
class MemoryUnlocker {
    constructor(ptr, size) {
        this.ptr = ptr;
        this.size = size;
        if (!dll_1.dll.kernel32.VirtualProtect(ptr, size, windows_h_1.PAGE_EXECUTE_WRITECOPY, int32buffer))
            throw Error(`${ptr}: ${size} bytes, Failed to unprotect memory`);
        this.oldprotect = int32buffer[0];
    }
    done() {
        if (!dll_1.dll.kernel32.VirtualProtect(this.ptr, this.size, this.oldprotect, int32buffer))
            throw Error(`${this.ptr}: ${this.size} bytes, Failed to re-protect memory`);
    }
}
exports.MemoryUnlocker = MemoryUnlocker;
//# sourceMappingURL=unlocker.js.map