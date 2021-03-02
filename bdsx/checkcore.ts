
import nversion = require('./version-bdsx.json');
import { cgate } from './core';
import colors = require('colors');

if (cgate.bdsxCoreVersion !== nversion) {
    const oversion = cgate.bdsxCoreVersion || '1.0.0.1';
    console.error(colors.red('BDSX Core Version is unmatched'));
    console.error(colors.red(`Current: ${oversion}`));
    console.error(colors.red(`Require: ${nversion}`));
    console.log("Please use 'npm i' to update it");
    process.exit(0);
}