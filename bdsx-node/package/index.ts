
import fs = require('fs');
import child_process = require('child_process');

// update version
import bdsx_pkg = require("../package.json");
import { copy, zip, mkdir } from './util';

(async()=>{    
    // zip bin
    await zip(`./bdsx-bin.zip`, archive=>{
        const outdir = '../bin/x64/Release';
        archive.file(`${outdir}/bdsx.dll`, {name: `bdsx.dll`});
        archive.file(`${outdir}/bdsx.pdb`, {name: `bdsx.pdb`});
        archive.file(`${outdir}/libcurl.dll`, {name: `libcurl.dll`});
        archive.file(`${outdir}/libmariadb.dll`, {name: `libmariadb.dll`});
        archive.file(`${outdir}/zlib.dll`, {name: `zlib.dll`});
        archive.file(`${outdir}/node.dll`, {name: `node.dll`});
    });

    // publish
    const pkgjson = fs.readFileSync('./package/pkg/package.json', 'utf-8');
    const cli_pkg = JSON.parse(pkgjson);
    const BDSX_VERSION = bdsx_pkg.version;
    if (cli_pkg.version !== BDSX_VERSION)
    {
        cli_pkg.version = BDSX_VERSION;
        fs.writeFileSync('./package/pkg/package.json', JSON.stringify(cli_pkg, null, 2));
        child_process.execSync('npm publish', {stdio: 'inherit'});
    }
        
    // copy files to pkg dir
    copy('./ii_unknown.json', './package/pkg/ii_unknown.json');
    copy('./cli.js', './package/pkg/index.js');
    copy('./bdsx-bin.zip', './package/pkg/bdsx-bin.zip');
    mkdir('../package/pkg/gen');
    copy('./gen/version.json', './package/pkg/gen/version.json');
    
    // pkg
    child_process.execSync('pkg ./package/pkg --out-path=../release/bin', {stdio: 'inherit'});
    
    // npm install for example
    process.chdir('../release/bdsx');
    child_process.execSync('npm i', {stdio: 'inherit'});
    process.chdir('../..');
    
    // zip for release
    mkdir('./release-zip');

    const ZIP = `./release-zip/bdsx-${BDSX_VERSION}.zip`;
    await zip(ZIP, archive=>{        
        archive.directory('release/', false);
    });

    console.log(`${ZIP}: Generated `);
})();
