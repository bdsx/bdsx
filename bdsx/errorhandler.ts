
import { asm } from "./assembler";
import { ipfilter, jshook, runtimeError } from "./core";
import { events } from "./event";
import { remapError } from "./source-map-support";
import { numberWithFillZero } from "./util";
import { EXCEPTION_ACCESS_VIOLATION } from "./windows_h";
import path = require("path");

enum JsErrorCode {
    JsNoError = 0,

    JsErrorCategoryUsage = 0x10000,
    JsErrorInvalidArgument,
    JsErrorNullArgument,
    JsErrorNoCurrentContext,
    JsErrorInExceptionState,
    JsErrorNotImplemented,
    JsErrorWrongThread,
    JsErrorRuntimeInUse,
    JsErrorBadSerializedScript,
    JsErrorInDisabledState,
    JsErrorCannotDisableExecution,
    JsErrorHeapEnumInProgress,
    JsErrorArgumentNotObject,
    JsErrorInProfileCallback,
    JsErrorInThreadServiceCallback,
    JsErrorCannotSerializeDebugScript,
    JsErrorAlreadyDebuggingContext,
    JsErrorAlreadyProfilingContext,
    JsErrorIdleNotEnabled,
    JsCannotSetProjectionEnqueueCallback,
    JsErrorCannotStartProjection,
    JsErrorInObjectBeforeCollectCallback,
    JsErrorObjectNotInspectable,
    JsErrorPropertyNotSymbol,
    JsErrorPropertyNotString,

    JsErrorCategoryEngine = 0x20000,
    JsErrorOutOfMemory,

    JsErrorCategoryScript = 0x30000,
    JsErrorScriptException,
    JsErrorScriptCompile,
    JsErrorScriptTerminated,
    JsErrorScriptEvalDisabled,

    JsErrorCategoryFatal = 0x40000,
    JsErrorFatal,
    JsErrorWrongRuntime,
}

export function installErrorHandler():void {
    jshook.setOnError(events.errorFire);

    const oldSetInterval = setInterval;
    global.setInterval = function(callback: (...args: any[]) => void, ms: number, ...args: any[]):NodeJS.Timeout {
        return oldSetInterval((...args:any[])=>{
            try {
                callback(...args);
            } catch (err) {
                events.errorFire(err);
            }
        }, ms, ...args);
    };
    const oldSetTimeout = setTimeout;
    global.setTimeout = function(callback: (...args: any[]) => void, ms: number, ...args: any[]):NodeJS.Timeout {
        return oldSetTimeout((...args:any[])=>{
            try {
                callback(...args);
            } catch (err) {
                events.errorFire(err);
            }
        }, ms, ...args);
    } as any;
    setTimeout.__promisify__ = oldSetTimeout.__promisify__;

    // default runtime error handler
    runtimeError.setHandler(err=>{
        if (err == null) {
            err = Error(`Native crash without error object, (result=${err})`);
        }
        remapError(err);

        function minimizeName(filepath:string):string {
            const deps = filepath.match(/\\node-chakracore\\deps\\(.+)$/);
            if (deps !== null) {
                return 'node\\'+deps[1];
            }
            const chakra = filepath.match(/\\node-chakracore\\src\\(.+)$/);
            if (chakra !== null) {
                return 'node\\'+chakra[1];
            }
            const core = filepath.match(/\\bdsx-core\\bdsx\\(.+)$/);
            if (core !== null) {
                return 'bdsx-core\\'+core[1];
            }
            return filepath;
        }

        if (err.code != null && err.nativeStack != null && err.exceptionInfos != null) {
            const lastSender = ipfilter.getLastSender();
            console.error('[ Native Crash ]');
            console.error(`Last packet from IP: ${lastSender}`);
            console.error('[ Native Stack ]');

            const chakraErrorNumber = err.code & 0x0fffffff;
            if (JsErrorCode[chakraErrorNumber] != null) {
                console.error(`${JsErrorCode[chakraErrorNumber]}(0x${numberWithFillZero(chakraErrorNumber, 8, 16)})`);
            } else {
                let errmsg = `${runtimeError.codeToString(err.code)}(0x${numberWithFillZero(err.code, 8, 16)})`;
                switch (err.code) {
                case EXCEPTION_ACCESS_VIOLATION: {
                    const info = err.exceptionInfos;
                    errmsg += `, Accessing an invalid memory address at 0x${numberWithFillZero(info[1], 16, 16)}`;
                    break;
                }
                }
                console.error(errmsg);
            }

            let insideChakra = false;
            for (const frame of err.nativeStack) {

                let moduleName = frame.moduleName;
                if (moduleName != null) {
                    moduleName = path.basename(moduleName);
                } else {
                    moduleName = frame.base != null ? frame.base.toString() : 'null';
                }
                const isChakraDll = moduleName.toLowerCase() === 'chakracore.dll';
                if (isChakraDll) {
                    if (insideChakra) continue;
                    insideChakra = true;
                    console.error('   at <ChakraCore>');
                    continue;
                }
                let out = '';
                const funcname = frame.functionName;
                if (funcname !== null) {
                    out = `   at ${moduleName}!${frame.functionName}`;
                } else {
                    const name = asm.getFunctionName(frame.address);
                    if (name !== null) {
                        out = `   at <asm> ${name}`;
                    } else {
                        // unknown
                        const addr = frame.address.getAddressAsFloat();
                        if (addr >= 0x1000) {
                            if (insideChakra) continue;
                            out = '   at <unknown> ';
                        } else {
                            out = '   at <invalid> ';
                        }
                        if (frame.base == null) {
                            out += frame.address;
                        } else {
                            out += `${moduleName}+${frame.address.subptr(frame.base)}`;
                        }
                    }
                }
                const filepath = frame.fileName;
                if (filepath !== null) {
                    const pathname = minimizeName(filepath);
                    out += ` (${pathname}:${frame.lineNumber})`;
                }
                console.error(out);
                insideChakra = false;
            }
            console.error('[ JS Stack ]');
        } else {
            console.error('[ JS Crash ]');
        }
        try {
            if ((err instanceof Error) && !err.stack) throw err;
        } catch (err) {
        }
        console.error(err.stack || err.message || err);
    });

}
