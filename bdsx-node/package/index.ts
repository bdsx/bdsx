
import fs = require('fs');
import child_process = require('child_process');

// update version
import bdsx_package_json = require("../package.json");
import { copy, zip, mkdir, targz, delfile } from './util';
import { homedir } from 'os';
import { sep } from 'path';
import archiver = require('archiver');

import 'source-map-support';

const BDSX_VERSION = bdsx_package_json.version;

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

function run(cmd:string):void
{
    console.log(cmd);
    child_process.execSync(cmd, {stdio: 'inherit'});
}



type FileMap = [string, string][];
const EXAMPLE_FILE_MAP:FileMap = [
    ['./bdsx-example/examples.ts', 'examples.ts'],
    ['./bdsx-example/examples.js', 'examples.js'],
    ['./bdsx-example/test.ts', 'test.ts'],
    ['./bdsx-example/test.js', 'test.js'],
    ['./bdsx-example/index.ts', 'index.ts'],
    ['./bdsx-example/index.js', 'index.js'],
    ['./bdsx-node/package/package-example.json', 'package.json'],
    ['./bdsx-example/tsconfig.json', 'tsconfig.json']
];

function copyFiles(map:FileMap, targetdir:string):void
{
    for (const [from, to] of map)
    {
        copy(from, targetdir + to);
    }
}

function putToArchive(map:FileMap, archive:archiver.Archiver, dirname:string):void
{
    for (const [from, to] of map)
    {
        archive.file(from, {name: dirname+to});
    }
}

(async()=>{
    process.chdir('..');

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
        archive.file(`${outdir}/bdsx_node.dll`, {name: `bdsx_node.dll`});
        archive.file(`./INSTALL/vcruntime140_1.dll`, {name: `vcruntime140_1.dll`});
    });

    // zip example
    await zip(`./bdsx-node/bdsx-example.zip`, archive=>{
        putToArchive(EXAMPLE_FILE_MAP, archive, '');
    });

    // publish
    process.chdir('./bdsx-node');

    if (updateJson('./package/pkg/package.json', pkg_package_json=>{
        if (pkg_package_json.version === BDSX_VERSION) return false;
        pkg_package_json.version = BDSX_VERSION;
        pkg_package_json.dependencies = bdsx_package_json.dependencies;
        pkg_package_json.devDependencies = bdsx_package_json.devDependencies;
        return true;
    }))
    {
        run('npm publish');
        process.chdir('./package/pkg');
        run('npm i');
        process.chdir('../..');
    }
    
    // copy files to pkg dir
    copy('./ii_unknown.json', './package/pkg/ii_unknown.json');
    copy('./cli.js', './package/pkg/index.js');
    copy('./bdsx-bin.zip', './package/pkg/bdsx-bin.zip');
    copy('./bdsx-example.zip', './package/pkg/bdsx-example.zip');
    delfile('./package/pkg/vcruntime140_1.dll');
    mkdir('./package/pkg/gen');
    copy('./gen/version.json', './package/pkg/gen/version.json');
    process.chdir('..');
    
    // pkg
    run('pkg ./bdsx-node/package/pkg --out-path=./release/bin');
    
    // copy example
    mkdir('./release/bdsx');
    copyFiles(EXAMPLE_FILE_MAP, './release/bdsx/');
    process.chdir('./release/bdsx');
    run('npm i');
    process.chdir('../..');

    // zip for release
    mkdir('./release-zip');

    const ZIP = `./release-zip/bdsx-${BDSX_VERSION}-win.zip`;
    await zip(ZIP, archive=>{
        archive.directory('release/bdsx', 'bdsx');
        archive.file('release/bin/bdsx-win.exe', { name: 'bin/bdsx-win.exe' });
        archive.file('release/bdsx.bat', { name: 'bdsx.bat' });
    });
    
    await targz('./release', `./release-zip/bdsx-${BDSX_VERSION}-linux.tar.gz`, new Map([
        [`bdsx.bat`, 0], // ignore
        [`bin${sep}bdsx-win.exe`, 0], // ignore
        [`bin${sep}bdsx-macos`, 0], // ignore
        [`bin${sep}bdsx-linux`, 0o755],
        [`bdsx.sh`, 0o755],
    ]));

    // make docker image
    const dockerfile = `
FROM alpine

RUN apk update
RUN apk add freetype nodejs npm wine
RUN npm i -g bdsx@${BDSX_VERSION} -g
RUN echo ${BDSX_VERSION}&bdsx i -y
RUN echo ${BDSX_VERSION}&bdsx example ~/bdsx
WORKDIR ~/bdsx
EXPOSE 19132

ENTRYPOINT /usr/bin/bdsx ~/bdsx
`;
    await fs.promises.writeFile('docker/Dockerfile', dockerfile);
    try { run(`docker image rm -f karikera/bdsx`); } catch (err) {}
    run(`docker build ./docker -t karikera/bdsx:${BDSX_VERSION}`);
    run(`docker push karikera/bdsx:${BDSX_VERSION}`);

})().catch(err=>{
    console.error(err.stack || err.toString());
});
