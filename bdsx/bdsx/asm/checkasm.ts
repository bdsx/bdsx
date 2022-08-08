
import * as path from 'path';
import { fsutil } from '../fsutil';

const asm = path.join(__dirname, './asmcode.asm');
const js = path.join(__dirname, './asmcode.js');
if (fsutil.checkModifiedSync(asm, js)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./compile');
}
