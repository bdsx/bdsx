

import fs = require('fs');
import path = require('path');
import colors = require('colors');
import child_process = require('child_process');

if (process.argv[2] === undefined) {
    console.error(colors.red(`[BDSX-Plugins] Please provide the parameter for the target path`));
    process.exit(-1);
}
const targetPath = path.resolve(process.argv[2]);
if (fs.existsSync(targetPath)) {
    console.error(colors.red(`[BDSX-Plugins] '${targetPath}' already exists`));
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
import { bedrockServer } from "bdsx";

console.log('[plugin:${clsname}] allocated');

bedrockServer.open.on(()=>{
    console.log('[plugin:${clsname}] launching');
});

bedrockServer.close.on(()=>{
    console.log('[plugin:${clsname}] closed');
});

`;
    fs.writeFileSync(targetdir+'index.ts', exampleSource, 'utf-8');
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
        "devDependencies": {
            "bdsx": `file:${path.relative(targetPath, bdsxPath).replace(/\\/g, '/')}`
        }
    };
    fs.writeFileSync(targetdir+'package.json', JSON.stringify(examplejson, null, 2), 'utf-8');
}

// tsconfig.json
{
    const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf-8'));
    delete tsconfig.exclude;
    fs.writeFileSync(targetdir+'tsconfig.json', JSON.stringify(tsconfig, null, 2), 'utf-8');
}

// .npmignore
{
    const npmignore = `
/.git
!*.d.ts
*.ts
`;
    fs.writeFileSync(targetdir+'.npmignore', npmignore, 'utf-8');
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
child_process.execSync(`npm i "${path.relative(currentdir, targetdir).replace(/\\/g, '/')}"`, {stdio:'inherit'});

console.log(`[BDSX-Plugins] Generated at ${targetPath}`);
