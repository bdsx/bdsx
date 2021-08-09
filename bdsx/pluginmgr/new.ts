

import fs = require('fs');
import path = require('path');
import colors = require('colors');
import child_process = require('child_process');
import { fsutil } from '../fsutil';

if (process.argv[2] == null) {
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
    const mainPackageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    const bdsxPath = path.resolve('./bdsx');

    const srcdeps = mainPackageJson.devDependencies;
    const destdeps:Record<string, string> = {};
    const inherites = [
        '@types/node',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'eslint',
        'typescript',
    ];

    for (const dep of inherites) {
        const version = srcdeps[dep];
        if (version == null) {
            console.error(colors.red(`[BDSX-Plugins] package.json/devDependencies does not have '${dep}'`));
        } else {
            destdeps[dep] = srcdeps[dep];
        }
    }
    destdeps.bdsx = `file:${path.relative(targetPath, bdsxPath).replace(/\\/g, '/')}`;

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
            "prepare": "tsc || exit 0"
        },
        "devDependencies": destdeps
    };
    fsutil.writeJsonSync(`${targetdir}package.json`, examplejson);
}

// tsconfig.json
{
    const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf-8'));
    delete tsconfig.exclude;
    tsconfig.declaration = true;
    fsutil.writeJsonSync(`${targetdir}tsconfig.json`, tsconfig);
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

// .eslintrc.json
{
    const eslint = {
        "root": true,
        "parser": "@typescript-eslint/parser",
        "parserOptions": {
            "ecmaVersion": 2017,
            "sourceType": "module"
        },
        "ignorePatterns": ["**/*.js"],
        "plugins": [
            "@typescript-eslint",
            "import"
        ],
        "rules": {
            "no-restricted-imports": ["error", {
                "patterns": [{
                    "group": ["**/bdsx/*", "!/bdsx/*"],
                    "message": "Please use the absolute path for bdsx libraries."
                }]
            }]
        }
    };
    fsutil.writeJsonSync(`${targetdir}.eslintrc.json`, eslint);
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
