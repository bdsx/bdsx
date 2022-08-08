import * as path from 'path';
import { fsutil } from "./fsutil";

let isBdsx = false;
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./core');
    isBdsx = true;
} catch (err) {
}

    // eslint-disable-next-line @typescript-eslint/no-require-imports
const isWine = isBdsx ? require('./dllraw').dllraw.ntdll.wine_get_version !== null : false;

export namespace Config {
    /**
     * true if running BDSX normally (with BDS and bdsx-core)
     */
    export const BDSX = isBdsx;

    /**
     * true if running on Linux+Wine
     */
    export const WINE = isWine;

    /**
     * handle stdin with the hooking method.
     * or it uses the readline module of node.js
     *
     * Linux+Wine has an issue on the readline module
     */
    export const USE_NATIVE_STDIN_HANDLER = true;

    /**
     * replace the unicode encoder of BDS.
     *
     * the original encoder crashes sometimes on Linux+Wine.
     */
    export const REPLACE_UNICODE_ENCODER = WINE;

    export const BDS_PATH = path.join(fsutil.projectPath, 'bedrock_server');
}

