
import { asm } from 'bdsx/assembler';
import { StaticPointer } from 'bdsx/core';
import path = require('path');

let loaded:Record<string, StaticPointer>;

try {
    loaded = asm.loadFromFile(path.join(__dirname, '../bdsx/asm/asmcode.asm')).allocs();
} catch (err) {
    if (err instanceof asm.CompileError) {
        err.report();
        process.exit(-1);
    }
    throw err;
}

export = loaded as {
    logHookAsyncCb:StaticPointer,
    logHook:StaticPointer,
    getJsValueRef:StaticPointer,
    data:StaticPointer,
};