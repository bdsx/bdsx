
import fs = require('fs');
import child_process = require('child_process');

// update version
import bdsx_pkg = require("../package.json");
import { copy, zip, mkdir, targz } from './util';
import { homedir } from 'os';
import { sep } from 'path';

const BDSX_VERSION = bdsx_pkg.version;

function updatePackageJsonVersion(path:string, version:string)
{
    const pkgjson = fs.readFileSync(path, 'utf-8');
    const cli_pkg = JSON.parse(pkgjson);
    if (cli_pkg.version !== version)
    {
        cli_pkg.version = version;
        fs.writeFileSync(path, JSON.stringify(cli_pkg, null, 2));
        return true;
    }
    return false;
}

(async()=>{
    // npm update for example
    process.chdir('../release/bdsx');
    child_process.execSync('npm update', {stdio: 'inherit'});
    child_process.execSync('tsc', {stdio: 'inherit'});
    process.chdir('../..');

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

    if (process.argv[2] === '--no-publish') return;

    // publish
    process.chdir('./bdsx-node');
    if (updatePackageJsonVersion('./package/pkg/package.json', BDSX_VERSION))
    {
        child_process.execSync('npm publish', {stdio: 'inherit'});
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
    child_process.execSync('pkg ./bdsx-node/package/pkg --out-path=./release/bin', {stdio: 'inherit'});
    
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
