"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makefunc = exports.TypeIn = void 0;
const asmcode = require("./asm/asmcode");
const assembler_1 = require("./assembler");
require("./codealloc");
const common_1 = require("./common");
const core_1 = require("./core");
const dllraw_1 = require("./dllraw");
const functiongen_1 = require("./functiongen");
const util_1 = require("./util");
const util = require("util");
const minecraft = require("./minecraft");
const functionMap = new core_1.AllocatedPointer(0x100);
core_1.chakraUtil.JsAddRef(functionMap);
const callNativeFunction = core_1.chakraUtil.JsCreateFunction(asmcode.callNativeFunction, null);
const breakBeforeCallNativeFunction = core_1.chakraUtil.JsCreateFunction(asmcode.breakBeforeCallNativeFunction, null);
const callJsFunction = asmcode.callJsFunction;
function initFunctionMap() {
    function chakraCoreToDef(funcName) {
        asmcode[funcName] = core_1.cgate.GetProcAddress(chakraCoreDll, funcName);
    }
    const chakraCoreDll = core_1.cgate.GetModuleHandleW('ChakraCore.dll');
    asmcode.GetCurrentThreadId = dllraw_1.dllraw.kernel32.GetCurrentThreadId;
    asmcode.uv_async_alloc = core_1.uv_async.alloc;
    asmcode.uv_async_post = core_1.uv_async.post;
    asmcode.uv_async_call = core_1.uv_async.call;
    asmcode.vsnprintf = minecraft.addressof_vsnprintf;
    asmcode.js_null = core_1.chakraUtil.asJsValueRef(null);
    asmcode.js_undefined = core_1.chakraUtil.asJsValueRef(undefined);
    asmcode.runtimeErrorRaise = core_1.runtimeError.raise;
    chakraCoreToDef('JsNumberToInt');
    chakraCoreToDef('JsCallFunction');
    chakraCoreToDef('JsConstructObject');
    chakraCoreToDef('JsGetAndClearException');
    asmcode.pointer_js2class = core_1.chakraUtil.pointer_js2class;
    asmcode.jshook_fireError = core_1.jshook.fireErrorPointer;
    asmcode.NativePointer = core_1.chakraUtil.asJsValueRef(core_1.NativePointer);
}
initFunctionMap();
const makefuncTypeMap = [];
function remapType(type) {
    if (typeof type === 'number') {
        if (makefuncTypeMap.length === 0) {
            const { RawTypeId } = (require)('./legacy');
            const { bool_t, int32_t, int64_as_float_t, float64_t, float32_t, bin64_t, void_t } = require('./nativetype');
            makefuncTypeMap[RawTypeId.Boolean] = bool_t;
            makefuncTypeMap[RawTypeId.Int32] = int32_t;
            makefuncTypeMap[RawTypeId.FloatAsInt64] = int64_as_float_t;
            makefuncTypeMap[RawTypeId.Float64] = float64_t;
            makefuncTypeMap[RawTypeId.Float32] = float32_t;
            makefuncTypeMap[RawTypeId.StringAnsi] = makefunc.Ansi;
            makefuncTypeMap[RawTypeId.StringUtf8] = makefunc.Utf8;
            makefuncTypeMap[RawTypeId.StringUtf16] = makefunc.Utf16;
            makefuncTypeMap[RawTypeId.Buffer] = makefunc.Buffer;
            makefuncTypeMap[RawTypeId.Bin64] = bin64_t;
            makefuncTypeMap[RawTypeId.JsValueRef] = makefunc.JsValueRef;
            makefuncTypeMap[RawTypeId.Void] = void_t;
        }
        const res = makefuncTypeMap[type];
        if (res == null)
            throw Error(`Invalid RawTypeId: ${type}`);
        return res;
    }
    return type;
}
const typeIndex = Symbol('typeIndex');
let typeIndexCounter = 0;
var TypeIn;
(function (TypeIn) {
    function getIndex() {
        let v = this[typeIndex];
        if (v == null) {
            v = this[typeIndex] = ++typeIndexCounter;
        }
        return v;
    }
    TypeIn.getIndex = getIndex;
})(TypeIn = exports.TypeIn || (exports.TypeIn = {}));
function invalidParameterError(paramName, expected, actual) {
    throw TypeError(`unexpected parameter type (${paramName}, expected=${expected}, actual=${actual != null ? actual.constructor.name : actual})`);
}
var makefunc;
(function (makefunc) {
    makefunc.temporalKeeper = [];
    makefunc.temporalDtors = [];
    makefunc.getter = Symbol('getter');
    makefunc.setter = Symbol('setter');
    makefunc.setToParam = Symbol('makefunc.writeToParam');
    makefunc.getFromParam = Symbol('makefunc.readFromParam');
    makefunc.useXmmRegister = Symbol('makefunc.returnWithXmm0');
    makefunc.dtor = Symbol('makefunc.dtor');
    makefunc.ctor_move = Symbol('makefunc.ctor_move');
    makefunc.size = Symbol('makefunc.size');
    /**
     * istructure but assigned to register directly for parameters.
     */
    makefunc.registerDirect = Symbol('makefunc.registerDirect');
    class ParamableT {
        constructor(name, _getFromParam, _setToParam, _ctor_move, isTypeOf, isTypeOfWeak = isTypeOf) {
            this.name = name;
            this[makefunc.getFromParam] = _getFromParam;
            this[makefunc.setToParam] = _setToParam;
            this[makefunc.ctor_move] = _ctor_move;
            this.isTypeOf = isTypeOf;
            this.isTypeOfWeak = isTypeOfWeak;
            this.getIndex();
        }
        getIndex() {
            (0, common_1.abstract)();
        }
    }
    makefunc.ParamableT = ParamableT;
    ParamableT.prototype[makefunc.useXmmRegister] = false;
    ParamableT.prototype.getIndex = TypeIn.getIndex;
    /**
     * allocate temporal memory for using in NativeType
     * it will removed at native returning
     */
    function tempAlloc(size) {
        const ptr = new core_1.AllocatedPointer(size);
        makefunc.temporalKeeper.push(ptr);
        return ptr;
    }
    makefunc.tempAlloc = tempAlloc;
    /**
     * allocate temporal memory for using in NativeType
     * it will removed at native returning
     */
    function tempValue(type, value) {
        const ptr = tempAlloc(type[makefunc.size]);
        type[makefunc.setToParam](ptr, value);
        return ptr;
    }
    makefunc.tempValue = tempValue;
    /**
     * allocate temporal string for using in NativeType
     * it will removed at native returning
     */
    function tempString(str, encoding) {
        const ptr = core_1.AllocatedPointer.fromString(str, encoding);
        makefunc.temporalKeeper.push(ptr);
        return ptr;
    }
    makefunc.tempString = tempString;
    function npRaw(func, onError, opts) {
        core_1.chakraUtil.JsAddRef(func);
        const code = (0, assembler_1.asm)();
        if (opts == null)
            opts = {};
        if (opts.jsDebugBreak)
            code.debugBreak();
        return code
            .mov_r_c(assembler_1.Register.r10, core_1.chakraUtil.asJsValueRef(func))
            .mov_r_c(assembler_1.Register.r11, onError)
            .jmp64(callJsFunction, assembler_1.Register.rax)
            .unwind()
            .alloc(opts.name || 'makefunc.npRaw');
    }
    makefunc.npRaw = npRaw;
    /**
     * make the JS function as a native function.
     *
     * wrapper codes are not deleted permanently.
     * do not use it dynamically.
     */
    function np(jsfunction, returnType, opts, ...params) {
        if (typeof jsfunction !== 'function') {
            invalidParameterError('arg1', 'function', jsfunction);
        }
        const options = opts || {};
        const returnTypeResolved = remapType(returnType);
        const paramsTypeResolved = params.map(remapType);
        const result = returnTypeResolved[makefunc.useXmmRegister] ? asmcode.addressof_xmm0Value : asmcode.addressof_raxValue;
        const gen = new functiongen_1.FunctionGen;
        if (options.jsDebugBreak)
            gen.writeln('debugger;');
        gen.import('temporalKeeper', makefunc.temporalKeeper);
        gen.import('temporalDtors', makefunc.temporalDtors);
        gen.writeln('const keepIdx=temporalKeeper.length;');
        gen.writeln('const dtorIdx=temporalDtors.length;');
        gen.import('getter', makefunc.getter);
        gen.import('getFromParam', makefunc.getFromParam);
        let offset = 0;
        function param(varname, type) {
            args.push(varname);
            gen.import(`${varname}_t`, type);
            if (offset >= 0x20) { // args memory space
                if (type[makefunc.registerDirect]) {
                    gen.writeln(`const ${varname}=${varname}_t[getter](stackptr, ${offset + 0x58});`);
                }
                else {
                    gen.writeln(`const ${varname}=${varname}_t[getFromParam](stackptr, ${offset + 0x58});`);
                }
            }
            else { // args register space
                if (type[makefunc.registerDirect]) {
                    gen.writeln(`const ${varname}=${varname}_t[getter](stackptr, ${offset});`);
                }
                else if (type[makefunc.useXmmRegister]) {
                    gen.writeln(`const ${varname}=${varname}_t[getFromParam](stackptr, ${offset + 0x20});`);
                }
                else {
                    gen.writeln(`const ${varname}=${varname}_t[getFromParam](stackptr, ${offset});`);
                }
            }
            offset += 8;
        }
        if (options.structureReturn) {
            if ((0, util_1.isBaseOf)(returnTypeResolved, core_1.StructurePointer)) {
                param(`retVar`, returnTypeResolved);
            }
            else {
                param(`retVar`, core_1.StaticPointer);
            }
        }
        const args = [];
        if (options.this != null) {
            param(`thisVar`, options.this);
        }
        else {
            args.push('null');
        }
        for (let i = 0; i < paramsTypeResolved.length; i++) {
            const type = paramsTypeResolved[i];
            param(`arg${i}`, type);
        }
        gen.import('jsfunction', jsfunction);
        gen.import('result', result);
        gen.import('returnTypeResolved', returnTypeResolved);
        gen.import('setToParam', makefunc.setToParam);
        gen.import('ctor_move', makefunc.ctor_move);
        if (options.structureReturn) {
            gen.writeln(`const res=jsfunction.call(${args.join(',')});`);
            gen.writeln('returnTypeResolved[ctor_move](retVar, res);');
            if ((0, util_1.isBaseOf)(returnTypeResolved, core_1.StructurePointer)) {
                gen.writeln('returnTypeResolved[setToParam](result, retVar);');
            }
            else {
                gen.writeln('result.setPointer(retVar);');
            }
        }
        else {
            gen.writeln(`const res=jsfunction.call(${args.join(',')});`);
            gen.writeln('returnTypeResolved[setToParam](result, res);');
        }
        gen.writeln('for (let i=temporalDtors.length-1; i>=dtorIdx; i--) {');
        gen.writeln('    temporalDtors[i]();');
        gen.writeln('}');
        gen.writeln('temporalDtors.length = dtorIdx;');
        gen.writeln('temporalKeeper.length = keepIdx;');
        return npRaw(gen.generate('stackptr'), options.onError || asmcode.jsend_crash, opts);
    }
    makefunc.np = np;
    /**
     * make the native function as a JS function.
     *
     * @param returnType *_t or *Pointer
     * @param params *_t or *Pointer
     */
    function js(functionPointer, returnType, opts, ...params) {
        const options = opts || {};
        const returnTypeResolved = remapType(returnType);
        const paramsTypeResolved = params.map(remapType);
        let countOnCpp = params.length;
        if (options.this != null)
            countOnCpp++;
        const paramsSize = countOnCpp * 8;
        let stackSize = Math.max(paramsSize, 0x20); // minimum stack for stable
        // 16 bytes align
        stackSize += 0x8;
        stackSize = ((stackSize + 0xf) & ~0xf);
        const ncall = options.nativeDebugBreak ? breakBeforeCallNativeFunction : callNativeFunction;
        const gen = new functiongen_1.FunctionGen;
        if (options.jsDebugBreak)
            gen.writeln('debugger;');
        if (functionPointer instanceof Array) {
            // virtual function
            const vfoff = functionPointer[0];
            const thisoff = functionPointer[1] || 0;
            gen.writeln(`const vftable=this.getPointer(${thisoff});`);
            gen.writeln(`const func=vftable.getPointer(${vfoff});`);
        }
        else {
            if (!(functionPointer instanceof core_1.VoidPointer)) {
                if (functionPointer == null)
                    throw Error(`the function pointer is null`);
                throw TypeError(`arg1, expected=*Pointer, actual=${functionPointer}`);
            }
            gen.import('func', functionPointer);
        }
        const returnTypeIsClass = (0, util_1.isBaseOf)(returnTypeResolved, core_1.StructurePointer);
        const paramPairs = [];
        if (options.this != null) {
            paramPairs.push(['this', options.this]);
        }
        if (options.structureReturn) {
            if (returnTypeIsClass) {
                paramPairs.push([`retVar`, returnTypeResolved]);
            }
            else {
                paramPairs.push([`retVar`, core_1.VoidPointer]);
            }
        }
        gen.import('invalidParameterError', invalidParameterError);
        gen.import('setToParam', makefunc.setToParam);
        gen.import('setter', makefunc.setter);
        gen.import('temporalKeeper', makefunc.temporalKeeper);
        gen.import('temporalDtors', makefunc.temporalDtors);
        for (let i = 0; i < paramsTypeResolved.length; i++) {
            const varname = `arg${i}`;
            const type = paramsTypeResolved[i];
            paramPairs.push([varname, type]);
            gen.writeln(`if (!${varname}_t.isTypeOfWeak(${varname})) invalidParameterError("${varname}", "${type.name}", ${varname});`);
        }
        gen.writeln('const keepIdx=temporalKeeper.length;');
        gen.writeln('const dtorIdx=temporalDtors.length;');
        function writeNcall() {
            gen.writeln('ncall(stackSize, stackptr=>{');
            let offset = 0;
            for (const [varname, type] of paramPairs) {
                gen.import(`${varname}_t`, type);
                if (type[makefunc.registerDirect]) {
                    gen.writeln(`    ${varname}_t[setter](stackptr, ${varname}, ${offset});`);
                }
                else {
                    gen.writeln(`    ${varname}_t[setToParam](stackptr, ${varname}, ${offset});`);
                }
                offset += 8;
            }
            gen.writeln('}, func);');
        }
        let returnVar = 'out';
        gen.import('stackSize', stackSize);
        gen.import('ncall', ncall);
        if (options.structureReturn) {
            gen.import('returnTypeResolved', returnTypeResolved);
            if (returnTypeIsClass) {
                gen.writeln('const retVar=new returnTypeResolved(true);');
                returnVar = 'retVar';
                writeNcall();
            }
            else {
                gen.import('getter', makefunc.getter);
                gen.import('AllocatedPointer', core_1.AllocatedPointer);
                gen.import('sizeSymbol', makefunc.size);
                gen.writeln('const retVar=new AllocatedPointer(returnTypeResolved[sizeSymbol]);');
                writeNcall();
                const getterFunc = returnTypeResolved[makefunc.getter];
                if (getterFunc !== common_1.emptyFunc) {
                    gen.writeln('const out=returnTypeResolved[getter](retVar);');
                }
                else {
                    returnVar = '';
                }
                const returnTypeDtor = returnTypeResolved[makefunc.dtor];
                if (returnTypeDtor !== common_1.emptyFunc) {
                    gen.import('returnTypeDtor', returnTypeDtor);
                    gen.writeln('returnTypeDtor(retVar);');
                }
            }
        }
        else {
            const result = returnTypeResolved[makefunc.useXmmRegister] ? asmcode.addressof_xmm0Value : asmcode.addressof_raxValue;
            gen.import('result', result);
            gen.import('returnTypeResolved', returnTypeResolved);
            gen.import('getFromParam', makefunc.getFromParam);
            writeNcall();
            if (returnTypeIsClass && returnTypeResolved[makefunc.registerDirect]) {
                gen.import('sizeSymbol', makefunc.size);
                gen.writeln('const out=new returnTypeResolved(true);');
                gen.writeln(`out.copyFrom(result, returnTypeResolved[sizeSymbol]);`);
            }
            else {
                const getterFunc = returnTypeResolved[makefunc.getFromParam];
                if (getterFunc !== common_1.emptyFunc) {
                    gen.writeln('const out=returnTypeResolved[getFromParam](result);');
                }
                else {
                    returnVar = '';
                }
            }
        }
        gen.writeln('for (let i = temporalDtors.length-1; i>= dtorIdx; i--) {');
        gen.writeln('    temporalDtors[i]();');
        gen.writeln('}');
        gen.writeln('temporalDtors.length = dtorIdx;');
        gen.writeln('temporalKeeper.length = keepIdx;');
        if (returnVar !== '')
            gen.writeln(`return ${returnVar};`);
        const args = [];
        for (let i = 0; i < paramsTypeResolved.length; i++) {
            args.push('arg' + i);
        }
        const funcout = gen.generate(...args);
        funcout.pointer = functionPointer;
        return funcout;
    }
    makefunc.js = js;
    makefunc.asJsValueRef = core_1.chakraUtil.asJsValueRef;
    /** @deprecated use StringAnsi in nativetype */
    makefunc.Ansi = new ParamableT('Ansi', (stackptr, offset) => stackptr.getPointer().getString(undefined, offset, common_1.Encoding.Ansi), (stackptr, param, offset) => {
        if (param === null) {
            stackptr.setPointer(null, offset);
        }
        else {
            const buf = tempAlloc(param.length * 2 + 1);
            const len = buf.setString(param, 0, common_1.Encoding.Ansi);
            buf.setUint8(len, 0);
            stackptr.setPointer(buf, offset);
        }
    }, common_1.abstract, v => v === null || typeof v === 'string');
    /** @deprecated use StringUtf8 in nativetype */
    makefunc.Utf8 = new ParamableT('Utf8', (stackptr, offset) => stackptr.getPointer().getString(undefined, offset, common_1.Encoding.Utf8), (stackptr, param, offset) => stackptr.setPointer(param === null ? null : tempString(param), offset), common_1.abstract, v => v === null || typeof v === 'string');
    /** @deprecated use StringUtf16 in nativetype */
    makefunc.Utf16 = new ParamableT('Utf16', (stackptr, offset) => stackptr.getPointer().getString(undefined, offset, common_1.Encoding.Utf16), (stackptr, param, offset) => stackptr.setPointer(param === null ? null : tempString(param, common_1.Encoding.Utf16), offset), common_1.abstract, v => v === null || typeof v === 'string');
    /** @deprecated use PointerLike in nativetype */
    makefunc.Buffer = new ParamableT('Buffer', (stackptr, offset) => stackptr.getPointer(offset), (stackptr, param, offset) => {
        if (param !== null && !(param instanceof core_1.VoidPointer)) {
            param = core_1.VoidPointer.fromAddressBuffer(param);
        }
        stackptr.setPointer(param, offset);
    }, common_1.abstract, v => {
        if (v === null)
            return true;
        if (v instanceof core_1.VoidPointer)
            return true;
        if (v instanceof DataView)
            return true;
        if (v instanceof ArrayBuffer)
            return true;
        if (v instanceof Uint8Array)
            return true;
        if (v instanceof Int32Array)
            return true;
        if (v instanceof Uint16Array)
            return true;
        if (v instanceof Uint32Array)
            return true;
        if (v instanceof Int8Array)
            return true;
        if (v instanceof Int16Array)
            return true;
        return false;
    });
    /** @deprecated use JsValueRef in nativetype */
    makefunc.JsValueRef = new ParamableT('JsValueRef', (stackptr, offset) => stackptr.getJsValueRef(offset), (stackptr, param, offset) => stackptr.setJsValueRef(param, offset), common_1.abstract, () => true);
})(makefunc = exports.makefunc || (exports.makefunc = {}));
core_1.VoidPointer.prototype[util.inspect.custom] = function () {
    return `${this.constructor.name} { ${this.toString()} }`;
};
core_1.VoidPointer[makefunc.size] = 8;
core_1.VoidPointer[makefunc.getter] = function (ptr, offset) {
    return ptr.getPointerAs(this, offset);
};
core_1.VoidPointer[makefunc.setter] = function (ptr, value, offset) {
    ptr.setPointer(value, offset);
};
core_1.VoidPointer[makefunc.setToParam] = function (stackptr, param, offset) {
    stackptr.setPointer(param, offset);
};
core_1.VoidPointer[makefunc.getFromParam] = function (stackptr, offset) {
    return stackptr.getNullablePointerAs(this, offset);
};
makefunc.ParamableT.prototype[makefunc.useXmmRegister] = false;
core_1.VoidPointer[makefunc.useXmmRegister] = false;
core_1.VoidPointer.prototype[assembler_1.asm.splitTwo32Bits] = function () {
    return [this.getAddressLow(), this.getAddressHigh()];
};
Uint8Array.prototype[assembler_1.asm.splitTwo32Bits] = function () {
    const ptr = new core_1.NativePointer;
    ptr.setAddressFromBuffer(this);
    return [ptr.getAddressLow(), ptr.getAddressHigh()];
};
core_1.VoidPointer.isTypeOf = function (v) {
    return v === null || v instanceof this;
};
core_1.VoidPointer.isTypeOfWeak = function (v) {
    return v === null || v instanceof core_1.VoidPointer;
};
assembler_1.X64Assembler.prototype.make = function (returnType, opts, ...params) {
    return makefunc.js(this.alloc(opts && opts.name), returnType, opts, ...params);
};
//# sourceMappingURL=makefunc.js.map