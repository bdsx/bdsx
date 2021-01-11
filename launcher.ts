import { TextPacket } from "bdsx/bds/packets";
import { bedrock_server_exe } from "bdsx/core";
import { bedrockServer } from "bdsx/launcher";
import { remapStack } from "bdsx/source-map-support";
import colors = require('colors');
console.log(colors.rainbow('       ///////////////'));
console.log(colors.rainbow('       //// BDSX2 ////'));
console.log(colors.rainbow('       ///////////////'));

const HASH_1_16_200_02 = '5C9351D3BB8FCDA6D7037F9911A5F03E';
if (bedrock_server_exe.md5 != HASH_1_16_200_02)
{
    console.error('[BDSX] MD5 Hash does not Matched');
    console.error(`[BDSX] target MD5 = ${HASH_1_16_200_02}`);
    console.error(`[BDSX] current MD5 = ${bedrock_server_exe.md5}`);
}

(async()=>{
    // Log Listener
    // bedrockServer.log.on((err, color)=>{
    //     console.log(color(err));
    //     return CANCEL;
    // });

    /**
     * send stdin to bedrockServer.executeCommandOnConsole
     * without this, you can control stdin manually
     */
    bedrockServer.DefaultStdInHandler.install();

    bedrockServer.close.on(()=>{
        console.log('[BDSX] bedrockServer is Closed');
        setTimeout(()=>{
            console.log('[BDSX] node.js is processing...');
        }, 3000).unref();
    });

    // launch BDS
    console.log('[BDSX] bedrockServer launching...');
    await bedrockServer.launch();
    
    require('./index');
})().catch(err=>{
    console.error(remapStack(err.stack));
});
