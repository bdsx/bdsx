
// launcher.ts is the launcher for BDS
// These scripts are run before launching BDS
// So there is no 'server' variable yet
// launcher.ts will import ./index.ts after launching BDS.

import 'bdsx/init';
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { remapAndPrintError } from 'bdsx/source-map-support';

console.log(
"  _____      _____ \n".green +
"  \\    \\    /    / \n".green +
"   \\".green + "___ ".white + "\\".green + "__".white + "/".green + " ___".white + "/  \n".green +
"   | _ )   \\/ __|  \n".white +
"   | _ \\ |) \\__ \\  \n".white +
"   |___/___/|___/  \n".white +
"   /    /  \\    \\  \n".green +
"  /____/    \\____\\ \n".green
);

(async()=>{
    events.serverClose.on(()=>{
        console.log('[BDSX] bedrockServer closed');
        setTimeout(()=>{
            console.log('[BDSX] node.js is processing...');
        }, 3000).unref();
    });

    // launch BDS
    console.log('[BDSX] bedrockServer is launching...');
    await bedrockServer.launch();

    // run index
    require('./index');
})().catch(remapAndPrintError);
