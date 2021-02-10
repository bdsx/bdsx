import { ipfilter, RuntimeError } from "./core";
import { remapError } from "./source-map-support";


let onRuntimeError: ((jsStack:string, nativeStack:string, lastSender:string) => void | boolean)|null = null;

/**
 * @deprecated legacy support
 */
export namespace legacy
{

    /**
     * @deprecated just catch it from bedrockServer.launch()
     */
    export function setOnRuntimeErrorListener(cb: ((jsStack:string, nativeStack:string, lastSender:string) => void | boolean)|null): void {
        onRuntimeError = cb;
    }

    /**
     * @deprecated this is a implementation for mimic old bdsx
     */
    export function catchAndSendToRuntimeErrorListener(err:Error):void {
        remapError(err);
        if (!(err instanceof RuntimeError)) {
            console.error(err.stack || err.message);
            return;
        }
        let defmsg = true;

        const lastSender = ipfilter.getLastSender();

        if (onRuntimeError !== null) {
            try {
                defmsg = onRuntimeError(err.stack!, err.nativeStack || '', lastSender) !== false;
            } catch (err) {
                const errstr = err.stack!;
                console.log("[onRuntimeError callback has error]");
                console.log(errstr);
            }
        }
    }

}