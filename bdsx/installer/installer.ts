import { gitCheck } from "./gitcheck";
import { BDSInstaller, installBDS } from "./installerapi";

const opts:BDSInstaller.Options = {};
const argv = process.argv;
const bdsPath = argv[2];
for (let i=3;i<argv.length;i++) {
    const arg = argv[i];
    switch (arg) {
    case '-y': opts.agree = '-y'; break;
    }
}

(async()=>{
    await gitCheck();
    if (!await installBDS(bdsPath, opts)) process.exit(-1);
})();
