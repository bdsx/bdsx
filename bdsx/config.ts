import { capi } from "./capi";

export namespace Config {

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
    export const REPLACE_UNICODE_ENCODER = capi.isRunningOnWine();
}

