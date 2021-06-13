

import fs = require('fs');
import path = require('path');

function checkModified(src:string, obj:string):boolean {
    const srcStat = fs.statSync(src);
    try {
        const objStat = fs.statSync(obj);
        if (objStat.mtimeMs < srcStat.mtimeMs) {
            return true;
        }
        return false;
    } catch (err) {
        return true;
    }
}

const src = path.join(__dirname, './asmcode.asm');
const obj = path.join(__dirname, './asmcode.ts');
if (checkModified(src, obj)) {
    require('./compile');
}
