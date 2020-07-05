
import fs = require('fs');
import child_process = require('child_process');

function copy(from:string, to:string)
{
    console.log(`copy "${from}" "${to}"`);
    try
    {
        fs.copyFileSync(from, to);
    }
    catch (err)
    {
        console.error(err.stack);
    }
}

// update version
import bdsx_pkg = require("../package.json");
const pkgjson = fs.readFileSync('./package/pkg/package.json', 'utf-8');
const cli_pkg = JSON.parse(pkgjson);
if (cli_pkg.version === bdsx_pkg.version)
{
    console.error('bdsx version is not changed: '+bdsx_pkg.version);
    process.exit(1);
}
cli_pkg.version = bdsx_pkg.version;
fs.writeFileSync('./package/pkg/package.json', JSON.stringify(cli_pkg, null, 2));

// publish
child_process.execSync('npm publish', {stdio: 'inherit'});

// copy files
copy('./ii_unknown.json', './package/pkg/ii_unknown.json');
copy('./cli.js', './package/pkg/index.js');
copy('./bdsx-bin.zip', './package/pkg/bdsx-bin.zip');
try { fs.mkdirSync('../package/pkg/gen'); } catch (err) {}
copy('./gen/version.json', './package/pkg/gen/version.json');

// pkg
child_process.execSync('pkg ./package/pkg --out-path=../release/bin', {stdio: 'inherit'});
