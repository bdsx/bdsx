
import fs = require('fs');
import child_process = require('child_process');

// update version
import bdsx_pkg = require("../package.json");
import { copy, zip, mkdir, targz } from './util';
import { homedir } from 'os';
import { sep } from 'path';

const BDSX_VERSION = bdsx_pkg.version;

function updateJson(path:string, cb:(obj:any)=>boolean):boolean
{
    const pkgjson = fs.readFileSync(path, 'utf-8');
    const pkg = JSON.parse(pkgjson);
    if (cb(pkg))
    {
        fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
        return true;
    }
    return false;
}

function updatePackageJsonVersion(path:string, version:string):boolean
{
    return updateJson(path, cli_pkg=>{
        if (cli_pkg.version === version) return false;
        cli_pkg.version = version;
        return true;
    });
}

function run(cmd:string):void
{
    child_process.execSync(cmd, {stdio: 'inherit'});
}

(async()=>{
    // npm update for example
    process.chdir('../release/bdsx');
    run('npm update');
    run('tsc');
    process.chdir('../..');

    // update bdsx version in package-example.json
    updateJson('./bdsx-node/package/package-example.json', pkg=>{
        pkg.dependencies['bdsx'] = BDSX_VERSION;
        return true;
    });

    // zip bin
    await zip(`./bdsx-node/bdsx-bin.zip`, archive=>{
        const outdir = './bin/x64/Release';
        archive.directory(`${homedir()}/.bds/mods/predefined`, 'predefined');
        archive.file(`${outdir}/bdsx.dll`, {name: `bdsx.dll`});
        archive.file(`${outdir}/bdsx.pdb`, {name: `bdsx.pdb`});
        archive.file(`${outdir}/libcurl.dll`, {name: `libcurl.dll`});
        archive.file(`${outdir}/libmariadb.dll`, {name: `libmariadb.dll`});
        archive.file(`${outdir}/zlib.dll`, {name: `zlib.dll`});
        archive.file(`${outdir}/node.dll`, {name: `node.dll`});
    });

    // zip example
    await zip(`./bdsx-node/bdsx-example.zip`, archive=>{
        archive.file('./release/bdsx/examples.ts', {name: 'examples.ts'});
        archive.file('./release/bdsx/examples.js', {name: 'examples.js'});
        archive.file('./release/bdsx/test.ts', {name: 'test.ts'});
        archive.file('./release/bdsx/test.js', {name: 'test.js'});
        archive.file('./release/bdsx/index.ts', {name: 'index.ts'});
        archive.file('./release/bdsx/index.js', {name: 'index.js'});
        archive.file('./bdsx-node/package/package-example.json', {name: 'package.json'});
        archive.file('./release/bdsx/tsconfig.json', {name: 'tsconfig.json'});
    });

    // publish
    process.chdir('./bdsx-node');
    if (updatePackageJsonVersion('./package/pkg/package.json', BDSX_VERSION))
    {
        run('npm publish');
        
        // install published bdsx to example
        process.chdir('../release/bdsx');
        run('npm i bdsx@'+BDSX_VERSION);
        process.chdir('../../bdsx-node');
    }
    
    // copy files to pkg dir
    copy('./ii_unknown.json', './package/pkg/ii_unknown.json');
    copy('./cli.js', './package/pkg/index.js');
    copy('./bdsx-bin.zip', './package/pkg/bdsx-bin.zip');
    copy('./bdsx-example.zip', './package/pkg/bdsx-example.zip');
    copy('./vcruntime140_1.dll', './package/pkg/vcruntime140_1.dll');
    mkdir('./package/pkg/gen');
    copy('./gen/version.json', './package/pkg/gen/version.json');
    process.chdir('..');
    
    // pkg
    run('pkg ./bdsx-node/package/pkg --out-path=./release/bin');
    
    // zip for release
    mkdir('./release-zip');

    const ZIP = `./release-zip/bdsx-${BDSX_VERSION}-win.zip`;
    await zip(ZIP, archive=>{        
        archive.directory('release/bdsx', 'bdsx');
        archive.file('release/bin/bdsx-cli-win.exe', { name: 'bin/bdsx-cli-win.exe' });
        archive.file('release/bdsx.bat', { name: 'bdsx.bat' });
    });
    
    await targz('./release', `./release-zip/bdsx-${BDSX_VERSION}-linux.tar.gz`, new Map([
        [`bdsx.bat`, 0],
        [`bin${sep}bdsx-cli-win.exe`, 0],
        [`bin${sep}bdsx-cli-macos`, 0],
        [`bin${sep}bdsx-cli-linux`, 0o755],
        [`bdsx.sh`, 0o755],
    ]));
})().catch(err=>{
    console.error(err.stack || err.toString());
});
