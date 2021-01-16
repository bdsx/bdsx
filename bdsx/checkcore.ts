
import version = require('bdsx/version.json');
import { cgate } from './core';
import colors = require('colors');

if (cgate.bdsxCoreVersion !== version.coreVersion)
{
    console.error(colors.red('BDSX Core Version is unmatched'));
    console.error(colors.red(`Old: ${cgate.bdsxCoreVersion}`));
    console.error(colors.red(`New: ${version.coreVersion}`));
    console.log("Please use 'npm run install_bds' to update it");
    process.exit(0);
}