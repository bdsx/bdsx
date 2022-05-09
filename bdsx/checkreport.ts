
import * as colors from 'colors';

export function checkAndReport(name:string, oversion:string, nversion:string):void {
    if (oversion === nversion) return;
    console.error(colors.red(`[BDSX] ${name} outdated`));
    console.error(colors.red(`[BDSX] Current version: ${oversion}`));
    console.error(colors.red(`[BDSX] Required version: ${nversion}`));
    console.log("[BDSX] Please run 'npm i' or " + (process.platform === "win32" ? 'update.bat' : 'update.sh') + " to update");
    process.exit(0);
}
