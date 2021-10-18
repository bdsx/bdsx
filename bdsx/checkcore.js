"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nversion = require("./version-bdsx.json");
const core_1 = require("./core");
const colors = require("colors");
if (core_1.cgate.bdsxCoreVersion !== nversion) {
    const oversion = core_1.cgate.bdsxCoreVersion || '1.0.0.1';
    console.error(colors.red('[BDSX] BDSX Core outdated'));
    console.error(colors.red(`[BDSX] Current version: ${oversion}`));
    console.error(colors.red(`[BDSX] Required version: ${nversion}`));
    console.log("[BDSX] Please run 'npm i' or " + (process.platform === "win32" ? 'update.bat' : 'update.sh') + " to update");
    process.exit(0);
}
//# sourceMappingURL=checkcore.js.map