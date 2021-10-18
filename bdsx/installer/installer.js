"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const installerapi_1 = require("./installerapi");
let agreeOption = false;
const argv = process.argv;
const bdsPath = process.argv[2];
for (let i = 3; i < argv.length; i++) {
    const arg = process.argv[i];
    switch (arg) {
        case '-y':
            agreeOption = true;
            break;
    }
}
if (!(0, installerapi_1.installBDS)(bdsPath, agreeOption)) {
    process.exit(-1);
}
//# sourceMappingURL=installer.js.map