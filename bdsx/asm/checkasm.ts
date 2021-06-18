

import path = require('path');
import { fsutil } from '../fsutil';

const src = path.join(__dirname, './asmcode.asm');
const obj = path.join(__dirname, './asmcode.ts');
if (fsutil.checkModifiedSync(src, obj)) {
    require('./compile');
}
