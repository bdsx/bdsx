import { installBDS } from "./installerapi";

let agreeOption = false;
const argv = process.argv;
const bdsPath = process.argv[2];
for (let i=3;i<argv.length;i++) {
    const arg = process.argv[i];
    switch (arg) {
    case '-y': agreeOption = true; break;
    }
}

installBDS(bdsPath, agreeOption).then(res=>{
    if (!res) process.exit(-1);
});
