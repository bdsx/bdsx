

import fs = require('fs');
import path = require('path');
import colors = require('colors');
import child_process = require('child_process');
import os = require('os');

if (process.argv[2] === undefined) {
    console.error(colors.red(`[BDSX-Plugins] Please provide an argument for the target path of the new plugin`));
    process.exit(-1);
}
const targetPath = path.resolve(process.argv[2]);
if (fs.existsSync(targetPath)) {
    console.error(colors.red(`[BDSX-Plugins] '${targetPath}' directory already exists`));
    console.error(colors.red(`[BDSX-Plugins] Please execute it with a new path`));
    process.exit(0);
}

function mkdirRecursiveSync(dirpath:string):void {
    try {
        fs.mkdirSync(dirpath);
        return;
    } catch (err) {
        if (err.code === 'EEXIST') return;
        if (['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) !== -1) throw err;
    }
    mkdirRecursiveSync(path.dirname(dirpath));
    fs.mkdirSync(dirpath);
}

mkdirRecursiveSync(targetPath);
const basename = path.basename(targetPath);
const targetdir = targetPath+path.sep;

// index.ts
{
    const clsname = camelize(basename);
    const exampleSource = `
import { events } from "bdsx/event";

console.log('[plugin:${clsname}] allocated');

events.serverOpen.on(()=>{
    console.log('[plugin:${clsname}] launching');
});

events.serverClose.on(()=>{
    console.log('[plugin:${clsname}] closed');
});

`;
    fs.writeFileSync(`${targetdir}index.ts`, exampleSource, 'utf-8');
}

// package.json
{
    const bdsxPath = path.join(__dirname, '..');
    const examplejson = {
        "name": `@bdsx/${basename}`,
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "keywords": [] as string[],
        "author": "",
        "license": "ISC",
        "bdsxPlugin": true,
        "scripts": {
            "build": "tsc",
            "watch": "tsc -w",
            "prepare": "tsc"
        },
        "devDependencies": {
            "bdsx": `file:${path.relative(targetPath, bdsxPath).replace(/\\/g, '/')}`,
            "@types/node": "^12.20.5",
            "typescript": "^4.2.3"
        }
    };
    fs.writeFileSync(`${targetdir}package.json`, JSON.stringify(examplejson, null, 2).replace(/\n/g, os.EOL), 'utf-8');
}

// tsconfig.json
{
    const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf-8'));
    delete tsconfig.exclude;
    tsconfig.declaration = true;
    fs.writeFileSync(`${targetdir}tsconfig.json`, JSON.stringify(tsconfig, null, 2).replace(/\n/g, os.EOL), 'utf-8');
}

// .npmignore
{
    const npmignore = `
/.git
*.ts
!*.d.ts
`;
    fs.writeFileSync(`${targetdir}.npmignore`, npmignore, 'utf-8');
}

// .gitignore
{
    const gitignore = `
/node_modules
*.js
*.d.ts
`;
    fs.writeFileSync(`${targetdir}.gitignore`, gitignore, 'utf-8');
}

// README.md
{
    const readme = `
# ${basename} Plugin
The plugin for bdsx
`;
    fs.writeFileSync(`${targetdir}README.md`, readme, 'utf-8');
}

function camelize(context:string):string {
    const reg = /[a-zA-Z]+/g;
    let out = '';
    for (;;) {
        const matched = reg.exec(context);
        if (matched === null) return out;
        const word = matched[0];
        out += word.charAt(0).toLocaleUpperCase() + word.substr(1);
    }
}

const currentdir = process.cwd();
process.chdir(targetdir);
child_process.execSync('npm i', {stdio:'inherit'});

process.chdir(currentdir);
let rpath = path.relative(currentdir, targetdir).replace(/\\/g, '/');
if (!rpath.startsWith('.')) rpath = `./${rpath}`;
child_process.execSync(`npm i "${rpath}"`, {stdio:'inherit'});

console.log(`[BDSX-Plugins] Generated at ${targetPath}`);
