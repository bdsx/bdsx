
import * as colors from 'colors';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';

const packagejsonPath = path.resolve(process.cwd(), process.argv[1], 'package.json');
const packagejson = JSON.parse(fs.readFileSync(packagejsonPath, 'utf-8'));

let needUpdate = false;

const requiredDeps = packagejson.dependencies;
for (const [name, requiredVersion] of Object.entries<string>(requiredDeps)) {
    if (/^file:(?:\.[\\/])?plugins[\\/]/.test(requiredVersion)) continue;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const installed = require(`${name}/package.json`);
        const installedVersion = installed.version;
        if (semver.validRange(requiredVersion)) { // filter URI syntaxes (ex. file:, http:, git)
            if (!semver.satisfies(installedVersion, requiredVersion)) {
                console.error(colors.red(`${name}: version does not match (installed=${installedVersion}, required=${requiredVersion})`));
                needUpdate = true;
            }
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
