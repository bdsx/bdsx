
import path = require('path');
import fs = require('fs');
import colors = require('colors');


function checkVersion(pkgname:string, installed:string, required:string|undefined):boolean {
    if (required === '*') return true;
    if (required === undefined) return true;

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

function comparePackageLock(packagejson:any, locked:any):boolean {
    let needUpdate = false;
    const deps = packagejson.dependencies;
    for (const pkgname in deps) {
        let installed = locked.packages[pkgname];
        if (!installed) {
            console.error(colors.red(`${pkgname}: not installed`));
            needUpdate = true;
            continue;
        }
        while (installed.link) {
            installed = locked.packages[installed.resolved];
            if (!installed) {
                console.error(colors.red(`${pkgname}: Linked package (${installed.resolved}) not found`));
                needUpdate = true;
                continue;
            }
        }

        const required = deps[pkgname];
        if (!checkVersion(pkgname, installed.version, required.version)) {
            console.error(colors.red(`${pkgname}: Outdated, (required=${required.version}, installed=${installed.version})`));
            needUpdate = true;
            continue;
        }

    }
    return needUpdate;
}

const bdsxPath = path.join(__dirname, '..')+path.sep;

const packagejson = JSON.parse(fs.readFileSync(bdsxPath+'package.json', 'utf-8'));
const locked = JSON.parse(fs.readFileSync(bdsxPath+'package-lock.json', 'utf-8'));

let needUpdate = false;

const installedDeps = locked.packages[''].dependencies;
const requiredDeps = packagejson.dependencies;

for (const name in requiredDeps) {
    const installedVersion = installedDeps[name];
    const requiredVersion = requiredDeps[name];
    if (installedVersion === undefined) {
        console.error(colors.red(`${name}: not installed`));
        needUpdate = true;
    }
    if (installedVersion !== requiredVersion) {
        console.error(colors.red(`${name}: version is not matched (installed=${installedVersion}, required=${requiredVersion})`));
        needUpdate = true;
    }
}

if (needUpdate) {
    console.error(colors.yellow(`Please use 'npm i' to update it`));
    process.exit(-1);
}
