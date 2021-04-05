
import nversion = require('./version-bdsx.json');
import { cgate } from './core';
import colors = require('colors');

if (cgate.bdsxCoreVersion !== nversion) {
    const oversion = cgate.bdsxCoreVersion || '1.0.0.1';
    console.error(colors.red('[BDSX] BDSX Core Version is unmatched'));
    console.error(colors.red(`[BDSX] Current: ${oversion}`));
    console.error(colors.red(`[BDSX] Require: ${nversion}`));
    console.log("[BDSX] Please use 'npm i' to update it");
    process.exit(0);
}
