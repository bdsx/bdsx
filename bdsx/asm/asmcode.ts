
import { asm } from 'bdsx/assembler';
import { StaticPointer } from 'bdsx/core';
import { makefuncDefines } from 'bdsx/makefunc_defines';
import { ParsingError } from 'bdsx/textparser';
import path = require('path');
import "../codealloc";

let loaded:Record<string, StaticPointer>;

try {
    loaded = asm.loadFromFile(path.join(__dirname, '../bdsx/asm/asmcode.asm'), makefuncDefines, true).allocs();
} catch (err) {
    if (err instanceof ParsingError) {
        process.exit(-1);
    }
    throw err;
}

export = loaded as {
    logHookAsyncCb:StaticPointer,
    logHook:StaticPointer,
    getJsValueRef:StaticPointer,
    getout:StaticPointer
};