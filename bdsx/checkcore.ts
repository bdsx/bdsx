
import version = require('bdsx/version.json');
import { cgate } from './core';
import colors = require('colors');

if (cgate.bdsxCoreVersion !== version.coreVersion) {
    console.error(colors.red('BDSX Core Version is unmatched'));
    console.error(colors.red(`Old: ${cgate.bdsxCoreVersion || '1.0.0.1'}`));
    console.error(colors.red(`New: ${version.coreVersion}`));
    console.log("Please use 'npm i' to update it");
    process.exit(0);
}