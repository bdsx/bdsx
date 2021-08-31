
import path = require('path');
import fs = require('fs');
import colors = require('colors');


function checkVersion(installed:number[], required:string):boolean {
    let ifGreater = false;
    let ifEqual = false;
    let ifLess = false;
    let updateMinorVersion = false;
    let updatePatchVersion = false;

    const comparison = required.match(/^~|\^|>=?|<=?/);
    if (comparison !== null) {
        switch (comparison[0]) {
        case '^':
            updateMinorVersion = true;
            ifEqual = true;
            break;
        case '~':
            updatePatchVersion = true;
            ifEqual = true;
            break;
        case '>=':
            ifGreater = true;
            ifEqual = true;
            break;
        case '>':
            ifGreater = true;
            break;
        case '<=':
            ifLess = true;
            ifEqual = true;
            break;
        case '<':
            ifLess = true;
            break;
        }
        required = required.substr(comparison[0].length);
    } else {
        ifEqual = true;
    }

    const requiredNums = required.split('.');
    if (comparison === null && !/^[0-9]+$/.test(requiredNums[0])) return true;

    let last = requiredNums[requiredNums.length-1];
    if (last === 'x') {
        for (;;) {
            requiredNums.pop();
            if (requiredNums.length === 0) return true;
            last = requiredNums[requiredNums.length-1];
            if (last === 'x') continue;
            break;
        }
    }
    for (let i=0;i<requiredNums.length;i++) {
        const diff = installed[i] - +requiredNums[i];
        if (diff > 0) {
            if (updateMinorVersion && i >= 1) return true;
            if (updatePatchVersion && i >= 2) return true;
            return ifGreater;
        }
        if (diff < 0) return ifLess;
    }
    return ifEqual;
}

function checkVersionSyntax(pkgname:string, installed:string, requireds:string):boolean {
    const installedSplited = installed.match(/^([0-9]+)\.([0-9]+)\.([0-9]+)$/);
    if (installedSplited === null) {
        throw Error(`${pkgname}: Invalid installed version string (${installed})`);
    }
    installedSplited.shift();
    const installedNums = installedSplited.map(str=>+str);

    for (const reqs of requireds.split(/ *\|\| */)) {
        const [req1, req2] = reqs.split(/ *- */, 2);
        if (req2 != null) {
            if (checkVersion(installedNums, req1) && checkVersion(installedNums, '<='+req2)) return true;
        } else {
            if (checkVersion(installedNums, req1)) return true;
        }
    }
    return false;
}

const packagejsonPath = path.resolve(process.cwd(), process.argv[1], 'package.json');
const packagejson = JSON.parse(fs.readFileSync(packagejsonPath, 'utf-8'));

let needUpdate = false;

const requiredDeps = packagejson.dependencies;
(requiredDeps as any).__proto__ = null;

for (const name in requiredDeps) {
    const requiredVersion = requiredDeps[name];
    if (/^file:(?:\.[\\/])?plugins[\\/]/.test(requiredVersion)) continue;
    try {
        const installed = require(`${name}/package.json`);
        const installedVersion = installed.version;
        if (installedVersion == null) continue;
        if (!checkVersionSyntax(name, installedVersion, requiredVersion)) {
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
