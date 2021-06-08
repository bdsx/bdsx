import { bedrock_server_exe } from "./core";
import colors = require('colors');

const TARGET_MD5 = '1A795A0B8302EB28D68510B2CF8BFDDC';
if (bedrock_server_exe.md5 !== TARGET_MD5) {
    console.error(colors.red('[BDSX] MD5 Hash does not match'));
    console.error(colors.red(`[BDSX] target MD5 = ${TARGET_MD5}`));
    console.error(colors.red(`[BDSX] current MD5 = ${bedrock_server_exe.md5}`));
}
