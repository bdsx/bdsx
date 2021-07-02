
import { asm } from '../assembler';
import { makefuncDefines } from '../makefunc_defines';
import { remapAndPrintError } from '../source-map-support';
import { ParsingError } from '../textparser';
import path = require('path');
import fs = require('fs');

try {
    console.log(`[bdsx-asm] start`);
    const code = asm();
    const asmpath = path.join(__dirname, './asmcode.asm');
    code.compile(fs.readFileSync(asmpath, 'utf8'), makefuncDefines, asmpath);
    fs.writeFileSync(path.join(__dirname, './asmcode.ts'), code.toTypeScript('asmcode'));
    console.log(`[bdsx-asm] done. no errors`);
} catch (err) {
    if (!(err instanceof ParsingError)) {
        remapAndPrintError(err);
    } else {
        console.log(`[bdsx-asm] failed`);
    }
}
