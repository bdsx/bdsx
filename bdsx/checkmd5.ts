import { bedrock_server_exe } from "./core";
import colors = require('colors');

const TARGET_MD5 = 'ECB1583B1E68650436DA0C8D2673CB20';
if (bedrock_server_exe.md5 !== TARGET_MD5) {
    console.error(colors.red('[BDSX] MD5 Hash does not Matched'));
    console.error(colors.red(`[BDSX] target MD5 = ${TARGET_MD5}`));
    console.error(colors.red(`[BDSX] current MD5 = ${bedrock_server_exe.md5}`));
}
