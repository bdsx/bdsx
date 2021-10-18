"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installErrorHandler = void 0;
const assembler_1 = require("./assembler");
const core_1 = require("./core");
const event_1 = require("./event");
const source_map_support_1 = require("./source-map-support");
const util_1 = require("./util");
const windows_h_1 = require("./windows_h");
const path = require("path");
var JsErrorCode;
(function (JsErrorCode) {
    JsErrorCode[JsErrorCode["JsNoError"] = 0] = "JsNoError";
    JsErrorCode[JsErrorCode["JsErrorCategoryUsage"] = 65536] = "JsErrorCategoryUsage";
    JsErrorCode[JsErrorCode["JsErrorInvalidArgument"] = 65537] = "JsErrorInvalidArgument";
    JsErrorCode[JsErrorCode["JsErrorNullArgument"] = 65538] = "JsErrorNullArgument";
    JsErrorCode[JsErrorCode["JsErrorNoCurrentContext"] = 65539] = "JsErrorNoCurrentContext";
    JsErrorCode[JsErrorCode["JsErrorInExceptionState"] = 65540] = "JsErrorInExceptionState";
    JsErrorCode[JsErrorCode["JsErrorNotImplemented"] = 65541] = "JsErrorNotImplemented";
    JsErrorCode[JsErrorCode["JsErrorWrongThread"] = 65542] = "JsErrorWrongThread";
    JsErrorCode[JsErrorCode["JsErrorRuntimeInUse"] = 65543] = "JsErrorRuntimeInUse";
    JsErrorCode[JsErrorCode["JsErrorBadSerializedScript"] = 65544] = "JsErrorBadSerializedScript";
    JsErrorCode[JsErrorCode["JsErrorInDisabledState"] = 65545] = "JsErrorInDisabledState";
    JsErrorCode[JsErrorCode["JsErrorCannotDisableExecution"] = 65546] = "JsErrorCannotDisableExecution";
    JsErrorCode[JsErrorCode["JsErrorHeapEnumInProgress"] = 65547] = "JsErrorHeapEnumInProgress";
    JsErrorCode[JsErrorCode["JsErrorArgumentNotObject"] = 65548] = "JsErrorArgumentNotObject";
    JsErrorCode[JsErrorCode["JsErrorInProfileCallback"] = 65549] = "JsErrorInProfileCallback";
    JsErrorCode[JsErrorCode["JsErrorInThreadServiceCallback"] = 65550] = "JsErrorInThreadServiceCallback";
    JsErrorCode[JsErrorCode["JsErrorCannotSerializeDebugScript"] = 65551] = "JsErrorCannotSerializeDebugScript";
    JsErrorCode[JsErrorCode["JsErrorAlreadyDebuggingContext"] = 65552] = "JsErrorAlreadyDebuggingContext";
    JsErrorCode[JsErrorCode["JsErrorAlreadyProfilingContext"] = 65553] = "JsErrorAlreadyProfilingContext";
    JsErrorCode[JsErrorCode["JsErrorIdleNotEnabled"] = 65554] = "JsErrorIdleNotEnabled";
    JsErrorCode[JsErrorCode["JsCannotSetProjectionEnqueueCallback"] = 65555] = "JsCannotSetProjectionEnqueueCallback";
    JsErrorCode[JsErrorCode["JsErrorCannotStartProjection"] = 65556] = "JsErrorCannotStartProjection";
    JsErrorCode[JsErrorCode["JsErrorInObjectBeforeCollectCallback"] = 65557] = "JsErrorInObjectBeforeCollectCallback";
    JsErrorCode[JsErrorCode["JsErrorObjectNotInspectable"] = 65558] = "JsErrorObjectNotInspectable";
    JsErrorCode[JsErrorCode["JsErrorPropertyNotSymbol"] = 65559] = "JsErrorPropertyNotSymbol";
    JsErrorCode[JsErrorCode["JsErrorPropertyNotString"] = 65560] = "JsErrorPropertyNotString";
    JsErrorCode[JsErrorCode["JsErrorCategoryEngine"] = 131072] = "JsErrorCategoryEngine";
    JsErrorCode[JsErrorCode["JsErrorOutOfMemory"] = 131073] = "JsErrorOutOfMemory";
    JsErrorCode[JsErrorCode["JsErrorCategoryScript"] = 196608] = "JsErrorCategoryScript";
    JsErrorCode[JsErrorCode["JsErrorScriptException"] = 196609] = "JsErrorScriptException";
    JsErrorCode[JsErrorCode["JsErrorScriptCompile"] = 196610] = "JsErrorScriptCompile";
    JsErrorCode[JsErrorCode["JsErrorScriptTerminated"] = 196611] = "JsErrorScriptTerminated";
    JsErrorCode[JsErrorCode["JsErrorScriptEvalDisabled"] = 196612] = "JsErrorScriptEvalDisabled";
    JsErrorCode[JsErrorCode["JsErrorCategoryFatal"] = 262144] = "JsErrorCategoryFatal";
    JsErrorCode[JsErrorCode["JsErrorFatal"] = 262145] = "JsErrorFatal";
    JsErrorCode[JsErrorCode["JsErrorWrongRuntime"] = 262146] = "JsErrorWrongRuntime";
})(JsErrorCode || (JsErrorCode = {}));
function installErrorHandler() {
    core_1.jshook.setOnError(event_1.events.errorFire);
    const oldSetInterval = setInterval;
    global.setInterval = function (callback, ms, ...args) {
        return oldSetInterval((...args) => {
            try {
                callback(...args);
            }
            catch (err) {
                event_1.events.errorFire(err);
            }
        }, ms, ...args);
    };
    const oldSetTimeout = setTimeout;
    global.setTimeout = function (callback, ms, ...args) {
        return oldSetTimeout((...args) => {
            try {
                callback(...args);
            }
            catch (err) {
                event_1.events.errorFire(err);
            }
        }, ms, ...args);
    };
    setTimeout.__promisify__ = oldSetTimeout.__promisify__;
    // default runtime error handler
    core_1.runtimeError.setHandler(err => {
        if (err == null) {
            err = Error(`Native crash without error object, (result=${err})`);
        }
        (0, source_map_support_1.remapError)(err);
        function minimizeName(filepath) {
            const deps = filepath.match(/\\node-chakracore\\deps\\(.+)$/);
            if (deps !== null) {
                return 'node\\' + deps[1];
            }
            const chakra = filepath.match(/\\node-chakracore\\src\\(.+)$/);
            if (chakra !== null) {
                return 'node\\' + chakra[1];
            }
            const core = filepath.match(/\\bdsx-core\\bdsx\\(.+)$/);
            if (core !== null) {
                return 'bdsx-core\\' + core[1];
            }
            return filepath;
        }
        if (err.code != null && err.nativeStack != null && err.exceptionInfos != null) {
            const lastSender = core_1.ipfilter.getLastSender();
            console.error('[ Native Crash ]');
            console.error(`Last packet from IP: ${lastSender}`);
            console.error('[ Native Stack ]');
            const chakraErrorNumber = err.code & 0x0fffffff;
            if (JsErrorCode[chakraErrorNumber] != null) {
                console.error(`${JsErrorCode[chakraErrorNumber]}(0x${(0, util_1.numberWithFillZero)(chakraErrorNumber, 8, 16)})`);
            }
            else {
                let errmsg = `${core_1.runtimeError.codeToString(err.code)}(0x${(0, util_1.numberWithFillZero)(err.code, 8, 16)})`;
                switch (err.code) {
                    case windows_h_1.EXCEPTION_ACCESS_VIOLATION: {
                        const info = err.exceptionInfos;
                        errmsg += `, Accessing an invalid memory address at 0x${(0, util_1.numberWithFillZero)(info[1], 16, 16)}`;
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
                }
                else {
                    moduleName = frame.base != null ? frame.base.toString() : 'null';
                }
                const isChakraDll = moduleName.toLowerCase() === 'chakracore.dll';
                if (isChakraDll) {
                    if (insideChakra)
                        continue;
                    insideChakra = true;
                    console.error('   at <ChakraCore>');
                    continue;
                }
                let out = '';
                const funcname = frame.functionName;
                if (funcname !== null) {
                    out = `   at ${moduleName}!${frame.functionName}`;
                }
                else {
                    const name = assembler_1.asm.getFunctionName(frame.address);
                    if (name !== null) {
                        out = `   at <asm> ${name}`;
                    }
                    else {
                        // unknown
                        const addr = frame.address.getAddressAsFloat();
                        if (addr >= 0x1000) {
                            if (insideChakra)
                                continue;
                            out = '   at <unknown> ';
                        }
                        else {
                            out = '   at <invalid> ';
                        }
                        if (frame.base == null) {
                            out += frame.address;
                        }
                        else {
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
        }
        else {
            console.error('[ JS Crash ]');
        }
        try {
            if ((err instanceof Error) && !err.stack)
                throw err;
        }
        catch (err) {
        }
        console.error(err.stack || err.message || err);
    });
}
exports.installErrorHandler = installErrorHandler;
//# sourceMappingURL=errorhandler.js.map