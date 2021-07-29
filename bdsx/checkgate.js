"use strict";

const path = require("path");
const fs = require("fs");

/**
 * @param {string} modulepath
 */
function checkJsCache(modulepath) {
    const pathname = path.join(__dirname, modulepath);
    try {
        const jspath = pathname+'.js';
        const js_stat = fs.statSync(jspath);
        const ts_stat = fs.statSync(pathname+'.ts');
        if (ts_stat.mtimeMs > js_stat.mtimeMs) {
            try {
                fs.unlinkSync(jspath);
            }
            catch (err) { }
            try {
                fs.unlinkSync(pathname+'.js.map');
            }
            catch (err) { }
        }
    }
    catch (err) {
    }
}

checkJsCache('./installer/installer');
checkJsCache('./installer/installerapi');
checkJsCache('./fsutil');
checkJsCache('./pluginmgr/index');
checkJsCache('./pluginmgr/new');

const importTarget = process.argv.splice(2, 1)[0];
require(importTarget);
