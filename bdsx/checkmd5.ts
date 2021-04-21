import { bedrock_server_exe } from "./core";
import colors = require('colors');

const TARGET_MD5 = 'E1EC6B3D64A84D310D9F4C21F7FA45D4';
if (bedrock_server_exe.md5 !== TARGET_MD5) {
    console.error(colors.red('[BDSX] MD5 Hash does not match'));
    console.error(colors.red(`[BDSX] target MD5 = ${TARGET_MD5}`));
    console.error(colors.red(`[BDSX] current MD5 = ${bedrock_server_exe.md5}`));
}
