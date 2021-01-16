
// launcher.ts is the launcher for BDS
// These scripts are run before launching BDS
// So there are no 'server' variable yet
// launcher.ts will import ./index.ts after launching BDS.

import { bedrock_server_exe } from "bdsx/core";
import { bedrockServer } from "bdsx/launcher";
import { remapStack } from "bdsx/source-map-support";
import { analyzer } from "./bdsx";
import colors = require('colors');

// prank
console.log(colors.rainbow('       ///////////////'));
console.log(colors.rainbow('       //// BDSX2 ////'));
console.log(colors.rainbow('       ///////////////'));

const MD5_HASH = '43F9F2C959B37F5601504CFC3C018B5F';
if (bedrock_server_exe.md5 != MD5_HASH)
{
    console.error(colors.red('[BDSX] MD5 Hash does not Matched'));
    console.error(colors.red(`[BDSX] target MD5 = ${MD5_HASH}`));
    console.error(colors.red(`[BDSX] current MD5 = ${bedrock_server_exe.md5}`));
}
else
{
    analyzer.total = 252092; // predefined total symbol count
}

(async()=>{

    bedrockServer.close.on(()=>{
        console.log('[BDSX] bedrockServer is Closed');
        setTimeout(()=>{
            console.log('[BDSX] node.js is processing...');
        }, 3000).unref();
    });

    // launch BDS
    console.log('[BDSX] bedrockServer launching...');
    await bedrockServer.launch();

    /**
     * send stdin to bedrockServer.executeCommandOnConsole
     * without this, you need to control stdin manually
     */
    bedrockServer.DefaultStdInHandler.install();
    
    // run index
    require('./index');
})().catch(err=>{
    console.error(remapStack(err.stack));
});
