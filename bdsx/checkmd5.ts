import { bedrock_server_exe } from "./core";
import colors = require('colors');

const MD5_HASH = 'ECB1583B1E68650436DA0C8D2673CB20';
if (bedrock_server_exe.md5 !== MD5_HASH) {
    console.error(colors.red('[BDSX] MD5 Hash does not Matched'));
    console.error(colors.red(`[BDSX] target MD5 = ${MD5_HASH}`));
    console.error(colors.red(`[BDSX] current MD5 = ${bedrock_server_exe.md5}`));
}