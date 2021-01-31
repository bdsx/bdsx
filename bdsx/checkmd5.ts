import { analyzer } from "bdsx";
import { bedrock_server_exe } from "./core";
import colors = require('colors');

const MD5_HASH = '43F9F2C959B37F5601504CFC3C018B5F';
if (bedrock_server_exe.md5 !== MD5_HASH) {
    console.error(colors.red('[BDSX] MD5 Hash does not Matched'));
    console.error(colors.red(`[BDSX] target MD5 = ${MD5_HASH}`));
    console.error(colors.red(`[BDSX] current MD5 = ${bedrock_server_exe.md5}`));
} else {
    analyzer.setTotalCount(252092); // predefined total symbol count
}
