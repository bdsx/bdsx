
import { asm } from '../assembler';
import { uv_async } from '../core';
import { remapAndPrintError } from '../source-map-support';
import { ParsingError } from '../textparser';
import path = require('path');
import fs = require('fs');

try {
    console.log(`[bdsx-asm] start`);
    const code = asm();
    const asmpath = path.join(__dirname, './asmcode.asm');
    const defines = {
        asyncSize: uv_async.sizeOfTask,
        sizeOfCxxString: 0x20,
    };
    code.compile(fs.readFileSync(asmpath, 'utf8'), defines, asmpath);
    const {js, dts} = code.toScript('..', 'asmcode');
    fs.writeFileSync(path.join(__dirname, './asmcode.js'), js);
    fs.writeFileSync(path.join(__dirname, './asmcode.d.ts'), dts);
    console.log(`[bdsx-asm] done. no errors`);
} catch (err) {
    if (!(err instanceof ParsingError)) {
        remapAndPrintError(err);
    } else {
        console.log(`[bdsx-asm] failed`);
    }
}
