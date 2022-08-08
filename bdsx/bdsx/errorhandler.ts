
import * as path from "path";
import { asm } from "./assembler";
import { cgate, ipfilter, jshook, runtimeError, VoidPointer } from "./core";
import { dllraw } from "./dllraw";
import { events } from "./event";
import { makefunc } from "./makefunc";
import { int32_t } from "./nativetype";
import { remapError } from "./source-map-support";
import { numberWithFillZero } from "./util";
import { EXCEPTION_ACCESS_VIOLATION, MAX_PATH } from "./windows_h";

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

let GetModuleFileNameW:((addr:VoidPointer, buffer:Uint16Array, size:int32_t)=>int32_t)|null = null;

function getDllNameFromAddress(addr:VoidPointer):string|null {
    if (GetModuleFileNameW === null) {
        GetModuleFileNameW = makefunc.js(cgate.GetProcAddress(dllraw.kernel32.module, 'GetModuleFileNameW'), int32_t, null, VoidPointer, makefunc.Buffer, int32_t);
    }

    const buffer = new Uint16Array(MAX_PATH);
    const n = GetModuleFileNameW(addr, buffer, MAX_PATH);
    if (n === 0) return null;
    return String.fromCharCode(...buffer.subarray(0, n));
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
    } as any;
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
        if (!err) {
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

        if (err.code && err.nativeStack && err.exceptionInfos) {
            const lastSender = ipfilter.getLastSender();
            console.error('[ Native Crash ]');
            console.error(`Last packet from IP: ${lastSender}`);
            console.error('[ Native Stack ]');

            const chakraErrorNumber = err.code & 0x0fffffff;
            if ((err.code & 0xf0000000) === (0xE0000000|0) && JsErrorCode[chakraErrorNumber] != null) {
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
                } else if (frame.base === null) {
                    moduleName = 'null';
                } else {
                    moduleName = getDllNameFromAddress(frame.base);
                    if (moduleName === null) {
                        moduleName = frame.base.toString();
                    } else {
                        moduleName = path.basename(moduleName);
                    }
                }
                const isChakraDll = moduleName.toLowerCase() === 'chakracore.dll';
                if (isChakraDll) {
                    if (insideChakra) continue;
                    insideChakra = true;
                    console.error('   at (ChakraCore)');
                    continue;
                }
                let out = `   at ${frame.address} `;
                const info = runtimeError.lookUpFunctionEntry(frame.address);
                const funcname = frame.functionName;
                let funcinfo:{
                    address:VoidPointer,
                    offset:number
                }|null = null;

                if (info !== null && info[1] != null) {
                    const address = info[0].add(info[1]);
                    funcinfo = {
                        address,
                        offset: frame.address.subptr(address),
                    };
                }
                if (funcname !== null) {
                    out += `${moduleName}!${frame.functionName}`;
                    if (funcinfo !== null) {
                        out += ` +0x${funcinfo.offset.toString(16)}`;
                    }
                } else {
                    let asmname:string|null;
                    if (funcinfo !== null && (asmname = asm.getFunctionNameFromEntryAddress(funcinfo.address)) !== null) {
                        out += `(asm) ${asmname} +0x${funcinfo.offset.toString(16)}`;
                    } else {
                        // unknown
                        const addr = frame.address.getAddressAsFloat();
                        if (addr >= 0x1000) {
                            if (insideChakra) continue;
                            out += '(unknown) ';
                        } else {
                            out += '(invalid) ';
                        }
                        if (frame.base == null) {
                            out += frame.address;
                        } else {
                            out += `${moduleName}+0x${frame.address.subptr(frame.base).toString(16)}`;
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
