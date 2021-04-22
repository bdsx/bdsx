
import path = require('path');
import fs = require('fs');
import colors = require('colors');


function checkVersion(pkgname:string, installed:string, required:string|undefined):boolean {
    if (required === '*') return true;
    if (required === undefined) return true;

    switch (required.charAt(0)) {
    case '~': case '^':
        required = required.substr(1);
        break;
    }
    const matched = installed.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)$/);
    if (matched === null) {
        throw Error(`${pkgname}: Invalid installed version string (${installed})`);
    }
    matched.shift();

    const requiredArray = required.split('.');
    let last = requiredArray[requiredArray.length-1];
    if (requiredArray.length > 3) {
        throw Error(`${pkgname}: Invalid version string (${required})`);
    }

    if (last === 'x') {
        for (;;) {
            requiredArray.pop();
            if (requiredArray.length === 0) return true;
            last = requiredArray[requiredArray.length-1];
            if (last === 'x') continue;
            break;
        }
    }
    for (let i=0;i<requiredArray.length;i++) {
        const diff = +matched[i] - +requiredArray[i];
        if (diff > 0) return true;
        if (diff < 0) return false;
    }
    return true;
}

const bdsxPath = path.join(__dirname, '..')+path.sep;
const packagejson = JSON.parse(fs.readFileSync(bdsxPath+'package.json', 'utf-8'));

let needUpdate = false;

const requiredDeps = packagejson.dependencies;

for (const name in requiredDeps) {
    try {
        const installed = require(`${name}/package.json`);
        const installedVersion = installed.version;
        const requiredVersion = requiredDeps[name];
        if (!checkVersion(name, installedVersion, requiredVersion)) {
            console.error(colors.red(`${name}: version does not match (installed=${installedVersion}, required=${requiredVersion})`));
            needUpdate = true;
        }
    } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
            throw err;
        }
        console.error(colors.red(`${name}: not installed`));
        needUpdate = true;
    }
}

if (needUpdate) {
    console.error(colors.yellow(`Please use 'npm i' or '${process.platform === 'win32' ? "update.bat" : "update.sh"}' to update`));
    process.exit(-1);
}
