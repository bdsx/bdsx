
// launcher.ts is the launcher for BDS
// These scripts are run before launching BDS
// So there are no 'server' variable yet
// launcher.ts will import ./index.ts after launching BDS.

import { install as installSourceMapSupport, remapAndPrintError } from "bdsx/source-map-support";
installSourceMapSupport();

import 'bdsx/common';
import 'bdsx/checkcore';
import 'bdsx/checkmd5';
import 'bdsx/checkmodules';
import 'bdsx/asm/checkasm';
require('bdsx/legacy');

import { installMinecraftAddons } from 'bdsx/addoninstaller';
import { bedrockServer } from "bdsx/launcher";
import { loadAllPlugins } from "bdsx/plugins";
import 'colors';
import { events } from "bdsx/event";

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

    await Promise.all([
        loadAllPlugins(),
        installMinecraftAddons()
    ]);

    // launch BDS
    console.log('[BDSX] bedrockServer is launching...');
    await bedrockServer.launch();

    /**
     * send stdin to bedrockServer.executeCommandOnConsole
     * without this, you need to control stdin manually
     */
    bedrockServer.DefaultStdInHandler.install();

    // run index
    require('./index');
})().catch(remapAndPrintError);
