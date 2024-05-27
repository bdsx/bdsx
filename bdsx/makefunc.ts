import * as util from "util";
import { asmcode } from "./asm/asmcode";
import { asm, Register, X64Assembler } from "./assembler";
import { proc } from "./bds/symbols";
import "./codealloc";
import { Bufferable, emptyFunc, Encoding } from "./common";
import { AllocatedPointer, cgate, chakraUtil, jshook, NativePointer, runtimeError, StaticPointer, StructurePointer, uv_async, VoidPointer } from "./core";
import { dllraw } from "./dllraw";
import { FunctionGen } from "./functiongen";
import { isBaseOf } from "./util";

export type ParamType = makefunc.Paramable;

const functionMap = new AllocatedPointer(0x100);
chakraUtil.JsAddRef(functionMap);
const callNativeFunction: (stackSize: number, writer: (stackptr: NativePointer) => void, nativefunc: VoidPointer) => NativePointer = chakraUtil.JsCreateFunction(
    asmcode.callNativeFunction,
    null,
);
const breakBeforeCallNativeFunction: (stackSize: number, writer: (stackptr: NativePointer) => void, nativefunc: VoidPointer) => NativePointer =
    chakraUtil.JsCreateFunction(asmcode.breakBeforeCallNativeFunction, null);
const callJsFunction = asmcode.callJsFunction;

function initFunctionMap(): void {
    function chakraCoreToDef(funcName: keyof typeof asmcode): void {
        (asmcode as any)[funcName] = cgate.GetProcAddress(chakraCoreDll, funcName);
    }

    const chakraCoreDll = cgate.GetModuleHandleW("ChakraCore.dll");

    asmcode.GetCurrentThreadId = dllraw.kernel32.GetCurrentThreadId;
    asmcode.uv_async_alloc = uv_async.alloc;
    asmcode.uv_async_post = uv_async.post;
    asmcode.uv_async_call = uv_async.call;
    asmcode.vsnprintf = proc.vsnprintf;

    asmcode.js_null = chakraUtil.asJsValueRef(null);
    asmcode.js_undefined = chakraUtil.asJsValueRef(undefined);
    asmcode.runtimeErrorRaise = runtimeError.raise;

    chakraCoreToDef("JsNumberToInt");
    chakraCoreToDef("JsCallFunction");
    chakraCoreToDef("JsConstructObject");
    chakraCoreToDef("JsGetAndClearException");
    asmcode.pointer_js2class = chakraUtil.pointer_js2class;
    asmcode.jshook_fireError = jshook.fireErrorPointer;
    asmcode.NativePointer = chakraUtil.asJsValueRef(NativePointer);
}

initFunctionMap();

const makefuncTypeMap: makefunc.Paramable[] = [];
function remapType(type: ParamType): makefunc.Paramable {
    if (typeof type === "number") {
        if (makefuncTypeMap.length === 0) {
            const { RawTypeId } = require("./legacy");
            const { bool_t, int32_t, int64_as_float_t, float64_t, float32_t, bin64_t, void_t } = require("./nativetype") as typeof import("./nativetype");
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
        if (!res) throw Error(`Invalid RawTypeId: ${type}`);
        return res;
    }
    return type;
}

type InstanceTypeOnly<T> = T extends { prototype: infer V } ? V : never;

type TypeFrom_js2np<T extends ParamType> = InstanceTypeOnly<T> | null | undefined;
type TypeFrom_np2js<T extends ParamType> = InstanceTypeOnly<T>;

export type TypesFromParamIds_js2np<T extends ParamType[]> = {
    [key in keyof T]: T[key] extends null ? void : T[key] extends ParamType ? TypeFrom_js2np<T[key]> : T[key];
};
export type TypesFromParamIds_np2js<T extends ParamType[]> = {
    [key in keyof T]: T[key] extends null ? void : T[key] extends ParamType ? TypeFrom_np2js<T[key]> : T[key];
};

export interface MakeFuncOptions<THIS extends { new (): VoidPointer | void }> {
    /**
     * *Pointer, 'this' parameter passes as first parameter.
     */
    this?: THIS;
    /**
     * it allocates at the first parameter with the returning class and returns it.
     * if this is defined, it allocates at the second parameter.
     */
    structureReturn?: boolean;
    /**
     * Option for native debugging
     */
    nativeDebugBreak?: boolean;
    /**
     * Option for JS debugging
     */
    jsDebugBreak?: boolean;

    /**
     * for makefunc.np
     * jump to onError when JsCallFunction is failed (js exception, wrong thread, etc)
     */
    onError?: VoidPointer | null;

    /**
     * allow calling this function from somewhere other than the game thread.
     * it will ignore the onError parameter.
     *
     * technically it's possible to block the worker till the end of JS processing.
     */
    crossThread?: boolean;

    /**
     * code chunk name, default: js function name
     */
    name?: string;

    /**
     * it's only called once.
     * it will reduce references for memory optimization.
     * but BDSX may crash if it's called twice.
     */
    onlyOnce?: boolean;
}
type GetThisFromOpts<OPTS extends MakeFuncOptions<any> | null> = OPTS extends MakeFuncOptions<infer THIS>
    ? THIS extends { new (): VoidPointer }
        ? InstanceType<THIS>
        : void
    : void;

export type FunctionFromTypes_np<OPTS extends MakeFuncOptions<any> | null, PARAMS extends ParamType[], RETURN extends ParamType> = (
    this: GetThisFromOpts<OPTS>,
    ...args: TypesFromParamIds_np2js<PARAMS>
) => TypeFrom_js2np<RETURN>;

export type FunctionFromTypes_js<
    PTR extends VoidPointer | readonly [number, number?],
    OPTS extends MakeFuncOptions<any> | null,
    PARAMS extends ParamType[],
    RETURN extends ParamType,
> = ((this: GetThisFromOpts<OPTS>, ...args: TypesFromParamIds_js2np<PARAMS>) => TypeFrom_np2js<RETURN>) & {
    pointer: PTR;
};

export type FunctionFromTypes_js_without_pointer<OPTS extends MakeFuncOptions<any> | null, PARAMS extends ParamType[], RETURN extends ParamType> = (
    this: GetThisFromOpts<OPTS>,
    ...args: TypesFromParamIds_js2np<PARAMS>
) => TypeFrom_np2js<RETURN>;

function invalidParameterError(paramName: string, expected: string, actual: unknown): never {
    throw TypeError(`unexpected parameter type (${paramName}, expected=${expected}, actual=${actual != null ? (actual as any).constructor.name : actual})`);
}

export namespace makefunc {
    export const temporalKeeper: any[] = [];

    /**
     * get the value from the pointer.
     */
    export const getter = Symbol("getter");
    /**
     * set the value to the pointer.
     */
    export const setter = Symbol("setter");
    /**
     * set the value from the register.
     * Passed directly to registers via temporary stack memory.
     */
    export const setToParam = Symbol("makefunc.writeToParam");
    /**
     * get the value from the register
     * Passed directly from registers via temporary stack memory.
     */
    export const getFromParam = Symbol("makefunc.readFromParam");
    /**
     * it's a floating point.
     * need to be passed as xmm registers
     */
    export const useXmmRegister = Symbol("makefunc.returnWithXmm0");
    /**
     * the parameter will be passed as a pointer that points to stack space.
     * it cannot be returned on makefunc.np
     *
     * flag for the native type
     */
    export const paramHasSpace = Symbol("makefunc.paramHasSpace");
    /**
     * constructor
     */
    export const ctor = Symbol("makefunc.ctor");
    /**
     * destructor
     */
    export const dtor = Symbol("makefunc.dtor");
    /**
     * move constructor
     */
    export const ctor_move = Symbol("makefunc.ctor_move");
    /**
     * size of the type
     */
    export const size = Symbol("makefunc.size");
    /**
     * alignment of the type
     */
    export const align = Symbol("makefunc.align");
    /**
     * this class is not stored in the stack on function calls.
     * it is just assigned to the register directly.
     *
     * flag for the class
     */
    export const registerDirect = Symbol("makefunc.registerDirect");

    export interface Paramable {
        symbol: string;
        name: string;
        [getter](ptr: StaticPointer, offset?: number): any;
        [setter](ptr: StaticPointer, value: any, offset?: number): void;
        [getFromParam](stackptr: StaticPointer, offset?: number): any;
        [setToParam](stackptr: StaticPointer, param: any, offset?: number): void;
        [useXmmRegister]: boolean;
        [paramHasSpace]: boolean;
        [ctor](ptr: StaticPointer): void;
        [ctor_move](to: StaticPointer, from: StaticPointer): void;
        [dtor](ptr: StaticPointer): void;
        [size]: number;
        [align]: number;
        [registerDirect]?: boolean;
        isTypeOf(v: unknown): boolean;
        /**
         * allow downcasting
         */
        isTypeOfWeak(v: unknown): boolean;
    }
    export interface ParamableT<T> extends Paramable {
        prototype: T;
        [getFromParam](stackptr: StaticPointer, offset?: number): T | null;
        [setToParam](stackptr: StaticPointer, param: T extends VoidPointer ? T | null : T, offset?: number): void;
        [useXmmRegister]: boolean;
        isTypeOf<V>(this: { prototype: V }, v: unknown): v is V;
        isTypeOfWeak(v: unknown): boolean;
    }
    export class ParamableT<T> {
        constructor(
            public readonly name: string,
            _getFromParam: (stackptr: StaticPointer, offset?: number) => T | null,
            _setToParam: (stackptr: StaticPointer, param: T extends VoidPointer ? T | null : T, offset?: number) => void,
            isTypeOf: (v: unknown) => boolean,
            isTypeOfWeak: (v: unknown) => boolean = isTypeOf,
        ) {
            this[getFromParam] = _getFromParam;
            this[setToParam] = _setToParam;
            this.isTypeOf = isTypeOf as any;
            this.isTypeOfWeak = isTypeOfWeak as any;
        }
    }
    ParamableT.prototype[useXmmRegister] = false;
    ParamableT.prototype[paramHasSpace] = false;

    /**
     * allocate temporal memory for using in NativeType
     * it will removed at native returning
     */
    export function tempAlloc(size: number): StaticPointer {
        const ptr = new AllocatedPointer(size);
        temporalKeeper.push(ptr);
        return ptr;
    }

    /**
     * allocate temporal memory for using in NativeType
     * it will removed at native returning
     */
    export function tempValue(type: Paramable, value: unknown): StaticPointer {
        const ptr = tempAlloc(Math.max(type[size], 8)); // XXX: setToParam needs 8 bytes for primitive types
        type[setToParam](ptr, value);
        return ptr;
    }

    /**
     * allocate temporal string for using in NativeType
     * it will removed at native returning
     */
    export function tempString(str: string, encoding?: Encoding): StaticPointer {
        const ptr = AllocatedPointer.fromString(str, encoding);
        temporalKeeper.push(ptr);
        return ptr;
    }

    export function npRaw(func: (stackptr: NativePointer) => void, onError: VoidPointer, opts?: { name?: string; nativeDebugBreak?: boolean } | null): VoidPointer {
        chakraUtil.JsAddRef(func);
        const code = asm();
        if (opts == null) opts = {};
        if (opts.nativeDebugBreak) code.debugBreak();
        return code
            .mov_r_c(Register.r10, chakraUtil.asJsValueRef(func))
            .mov_r_c(Register.r11, onError)
            .jmp64(callJsFunction, Register.rax)
            .unwind()
            .alloc(opts.name || func.name || `#np_call`);
    }

    /**
     * np: native patch
     * make the JS function as a native function.
     *
     * wrapper codes are not deleted permanently.
     * do not use it dynamically.
     */
    export function np<RETURN extends ParamType, OPTS extends MakeFuncOptions<any> | null, PARAMS extends ParamType[]>(
        jsfunction: FunctionFromTypes_np<OPTS, PARAMS, RETURN>,
        returnType: RETURN,
        opts?: OPTS,
        ...params: PARAMS
    ): VoidPointer {
        if (typeof jsfunction !== "function") invalidParameterError("arg1", "function", jsfunction);

        const options: MakeFuncOptions<any> = opts! || {};
        if (options.name == null) {
            options.name = jsfunction.name;
        }

        const returnTypeResolved = remapType(returnType);
        const paramsTypeResolved = params.map(remapType);

        const gen = new FunctionGen(options.name, "stackptr");
        if (options.jsDebugBreak) gen.writeln("debugger;");

        gen.import("temporalKeeper", temporalKeeper);
        gen.writeln("const keepIdx=temporalKeeper.length;");

        gen.import("getter", getter);
        gen.import("getFromParam", getFromParam);
        let offset = 0;
        function param(varname: string, type: Paramable): void {
            args.push(varname);
            nativeParam(varname, type);
        }
        function nativeParam(varname: string, type: Paramable): void {
            gen.import(`${varname}_t`, type);
            if (offset >= 0x20) {
                // args memory space
                if (type[registerDirect]) {
                    gen.writeln(`const ${varname}=${varname}_t[getter](stackptr, ${offset + 0x68});`);
                } else {
                    gen.writeln(`const ${varname}=${varname}_t[getFromParam](stackptr, ${offset + 0x68});`);
                }
            } else {
                // args register space
                if (type[registerDirect]) {
                    gen.writeln(`const ${varname}=${varname}_t[getter](stackptr, ${offset});`);
                } else if (type[useXmmRegister]) {
                    gen.writeln(`const ${varname}=${varname}_t[getFromParam](stackptr, ${offset + 0x20});`);
                } else {
                    gen.writeln(`const ${varname}=${varname}_t[getFromParam](stackptr, ${offset});`);
                }
            }
            offset += 8;
        }

        const args: string[] = [];
        let needThis: boolean;
        if ((needThis = options.this != null)) {
            param(`thisVar`, options.this);
        }
        if (options.structureReturn) {
            if (isBaseOf(returnTypeResolved, StructurePointer)) {
                nativeParam(`retVar`, returnTypeResolved);
            } else {
                nativeParam(`retVar`, StaticPointer);
            }
        }
        for (let i = 0; i < paramsTypeResolved.length; i++) {
            const type = paramsTypeResolved[i];
            param(`arg${i}`, type);
        }

        gen.import("jsfunction", jsfunction);
        gen.import("returnTypeResolved", returnTypeResolved);
        gen.import("setToParam", setToParam);
        if (needThis) gen.writeln(`const res=jsfunction.call(${args.join(",")});`);
        else gen.writeln(`const res=jsfunction(${args.join(",")});`);

        const resultOffset = returnTypeResolved[makefunc.useXmmRegister] ? 0x50 : 0x48;
        if (options.structureReturn) {
            if (isBaseOf(returnTypeResolved, StructurePointer)) {
                gen.import("ctor_move", ctor_move);
                gen.writeln("returnTypeResolved[ctor_move](retVar, res);");
                gen.writeln(`returnTypeResolved[setToParam](stackptr, retVar, ${resultOffset});`); // set address
            } else {
                if (returnTypeResolved[ctor] !== emptyFunc) {
                    gen.import("ctor", ctor);
                    gen.writeln("returnTypeResolved[ctor](retVar);");
                }
                gen.import("setter", setter);
                gen.writeln("returnTypeResolved[setter](retVar, res);");
                gen.writeln(`stackptr.setPointer(retVar, ${resultOffset});`);
            }
        } else {
            if (returnTypeResolved[paramHasSpace]) throw Error(`cannot native return with ${returnType.name}`);
            gen.writeln(`returnTypeResolved[setToParam](stackptr, res, ${resultOffset});`);
        }
        gen.writeln("temporalKeeper.length = keepIdx;");

        if (options.onlyOnce) {
            gen.import("chakraRelease", chakraUtil.JsRelease);
            gen.writeln(`chakraRelease(${gen.functionName});`);
        }
        return npRaw(gen.generate(), options.crossThread ? asmcode.jsend_crossthread : options.onError || asmcode.jsend_crash, options);
    }

    /**
     * make the native function as a JS function.
     *
     * @param returnType *_t or *Pointer
     * @param params *_t or *Pointer
     */
    export function js<
        PTR extends VoidPointer | readonly [number, number?], // address of the function | [offset in vftable, offset of vftable]
        OPTS extends MakeFuncOptions<any> | null,
        RETURN extends ParamType,
        PARAMS extends ParamType[],
    >(functionPointer: PTR, returnType: RETURN, opts?: OPTS, ...params: PARAMS): FunctionFromTypes_js<PTR, OPTS, PARAMS, RETURN> {
        const options: MakeFuncOptions<any> = opts! || {};

        const returnTypeResolved = remapType(returnType);
        const paramsTypeResolved = params.map(remapType);

        let countOnCpp = params.length;
        if (options.this != null) countOnCpp++;
        const paramsSize = countOnCpp * 8;

        let stackSize = paramsSize;
        if (stackSize < 0x20) stackSize = 0x20; // minimum stack for calling

        // param spaces
        const spaceOffsets: number[] = [];
        for (const param of params) {
            if (param[paramHasSpace]) {
                spaceOffsets.push(stackSize);
                if (param[makefunc.align] == null || param[makefunc.size] == null) throw Error("Invalid parameter size");
                stackSize += param[makefunc.size]; // param has space
                const align = param[makefunc.align] - 1;
                stackSize = (stackSize + align) & ~align;
            }
        }

        // 16 bytes align
        stackSize -= 0x28; // share space
        stackSize = (stackSize + 0xf) & ~0xf;

        const ncall = options.nativeDebugBreak ? breakBeforeCallNativeFunction : callNativeFunction;

        const args: string[] = [];
        for (let i = 0; i < paramsTypeResolved.length; i++) {
            args.push("arg" + i);
        }
        const gen = new FunctionGen(options.name, ...args);

        if (options.jsDebugBreak) gen.writeln("debugger;");
        if (functionPointer instanceof Array) {
            // virtual function
            const vfoff = functionPointer[0];
            const thisoff = functionPointer[1] || 0;
            gen.writeln(`const vftable=this.getPointer(${thisoff});`);
            gen.writeln(`const func=vftable.getPointer(${vfoff});`);
        } else {
            if (!(functionPointer instanceof VoidPointer)) throw TypeError(`arg1, expected=*Pointer, actual=${functionPointer}`);
            gen.import("func", functionPointer);
        }

        const returnTypeIsClass = isBaseOf(returnTypeResolved, StructurePointer);

        const paramPairs: [string, Paramable, number?][] = [];
        if (options.this != null) {
            paramPairs.push(["this", options.this]);
        }
        if (options.structureReturn) {
            if (returnTypeIsClass) {
                paramPairs.push([`retVar`, returnTypeResolved]);
            } else {
                paramPairs.push([`retVar`, VoidPointer]);
            }
        }

        gen.import("invalidParameterError", invalidParameterError);
        gen.import("setToParam", setToParam);
        gen.import("setter", setter);

        gen.import("temporalKeeper", temporalKeeper);

        let j = 0;
        for (let i = 0; i < paramsTypeResolved.length; i++) {
            const varname = `arg${i}`;
            const type = paramsTypeResolved[i];
            if (type[paramHasSpace]) paramPairs.push([varname, type, spaceOffsets[j++]]);
            else paramPairs.push([varname, type]);
            gen.writeln(`if (!${varname}_t.isTypeOfWeak(${varname})) invalidParameterError("${varname}", "${type.name}", ${varname});`);
        }

        gen.writeln("const keepIdx=temporalKeeper.length;");
        gen.import("dtor", makefunc.dtor);
        gen.import("ctor", makefunc.ctor);

        function writeNcall(): void {
            gen.writeln(`return ncall(${stackSize},func,stackptr=>{`);
            if (spaceOffsets.length !== 0) {
                gen.writeln("  let space;");
            }
            let offset = 0;
            for (const [varname, type, spaceOffset] of paramPairs) {
                gen.import(`${varname}_t`, type);
                if (spaceOffset != null) {
                    gen.writeln(`  space=stackptr.add(${spaceOffset});`);
                    if (type[ctor] !== emptyFunc) {
                        gen.writeln(`  ${varname}_t[ctor](space);`);
                    }
                    if (type[registerDirect]) {
                        gen.writeln(`  ${varname}_t[setter](space, ${varname});`);
                    } else {
                        gen.writeln(`  ${varname}_t[setToParam](space, ${varname});`);
                    }
                    gen.writeln(`  stackptr.setPointer(space, ${offset});`);
                } else {
                    if (type[registerDirect]) {
                        gen.writeln(`  ${varname}_t[setter](stackptr, ${varname}, ${offset});`);
                    } else {
                        gen.writeln(`  ${varname}_t[setToParam](stackptr, ${varname}, ${offset});`);
                    }
                }
                offset += 8;
            }
            gen.writeln("},stackptr=>{");
        }

        let returnVar = "out";
        gen.import("ncall", ncall);
        if (options.structureReturn) {
            gen.import("returnTypeResolved", returnTypeResolved);
            if (returnTypeIsClass) {
                gen.writeln("const retVar=new returnTypeResolved(true);");
                returnVar = "retVar";
                writeNcall();
            } else {
                gen.import("getter", getter);
                gen.import("AllocatedPointer", AllocatedPointer);
                gen.import("returnTypeDtor", returnTypeResolved[dtor]);
                gen.import("sizeSymbol", size);
                gen.writeln("const retVar=new AllocatedPointer(returnTypeResolved[sizeSymbol]);");
                writeNcall();
                const getterFunc = returnTypeResolved[getter];
                if (getterFunc !== emptyFunc) {
                    gen.writeln("  const out=returnTypeResolved[getter](retVar);");
                } else {
                    returnVar = "";
                }
                gen.writeln("  returnTypeDtor(retVar);");
            }
        } else {
            const rbpOffset = stackSize + 0x28;
            const raxOffset = rbpOffset + 0x18;
            const xmm0Offset = rbpOffset + 0x20;
            const resultOffset = returnTypeResolved[makefunc.useXmmRegister] ? xmm0Offset : raxOffset;

            gen.import("returnTypeResolved", returnTypeResolved);
            gen.import("getFromParam", getFromParam);
            writeNcall();

            if (returnTypeIsClass && returnTypeResolved[registerDirect]) {
                gen.import("sizeSymbol", size);
                gen.writeln("  const out=new returnTypeResolved(true);");
                gen.writeln(`  stackptr.copyTo(out, returnTypeResolved[sizeSymbol], ${resultOffset});`);
            } else {
                const getterFunc = returnTypeResolved[getFromParam];
                if (getterFunc !== emptyFunc) {
                    gen.writeln(`  const out=returnTypeResolved[getFromParam](stackptr, ${resultOffset});`);
                } else {
                    returnVar = "";
                }
            }
        }

        // destruct stack
        let irev = paramPairs.length;
        while (irev-- !== 0) {
            const [varname, type, spaceOffset] = paramPairs[irev];
            if (spaceOffset != null) {
                gen.writeln(`  ${varname}_t[dtor](stackptr.add(${spaceOffset}));`);
            }
        }
        gen.writeln("  temporalKeeper.length = keepIdx;");

        if (returnVar !== "") gen.writeln(`  return ${returnVar};`);
        gen.writeln("});");

        const funcout = gen.generate() as any;
        funcout.pointer = functionPointer;
        return funcout;
    }
    export import asJsValueRef = chakraUtil.asJsValueRef;

    export const Ansi = new ParamableT<string>(
        "Ansi",
        (stackptr, offset) => stackptr.getPointer(offset).getString(undefined, 0, Encoding.Ansi),
        (stackptr, param, offset) => stackptr.setPointer(param === null ? null : tempString(param, Encoding.Ansi), offset),
        v => v === null || typeof v === "string",
    );

    export const Utf8 = new ParamableT<string>(
        "Utf8",
        (stackptr, offset) => stackptr.getPointer(offset).getString(undefined, 0, Encoding.Utf8),
        (stackptr, param, offset) => stackptr.setPointer(param === null ? null : tempString(param), offset),
        v => v === null || typeof v === "string",
    );

    export const Utf16 = new ParamableT<string>(
        "Utf16",
        (stackptr, offset) => stackptr.getPointer(offset).getString(undefined, 0, Encoding.Utf16),
        (stackptr, param, offset) => stackptr.setPointer(param === null ? null : tempString(param, Encoding.Utf16), offset),
        v => v === null || typeof v === "string",
    );

    export const Buffer = new ParamableT<VoidPointer | Bufferable>(
        "Buffer",
        (stackptr, offset) => stackptr.getPointer(offset),
        (stackptr, param, offset) => {
            if (param !== null && !(param instanceof VoidPointer)) {
                param = VoidPointer.fromAddressBuffer(param);
            }
            stackptr.setPointer(param, offset);
        },
        v => {
            if (v === null) return true;
            if (v instanceof VoidPointer) return true;
            if (v instanceof DataView) return true;
            if (v instanceof ArrayBuffer) return true;
            if (v instanceof Uint8Array) return true;
            if (v instanceof Int32Array) return true;
            if (v instanceof Uint16Array) return true;
            if (v instanceof Uint32Array) return true;
            if (v instanceof Int8Array) return true;
            if (v instanceof Int16Array) return true;
            return false;
        },
    );

    export const JsValueRef = new ParamableT<any>(
        "JsValueRef",
        (stackptr, offset) => stackptr.getJsValueRef(offset),
        (stackptr, param, offset) => stackptr.setJsValueRef(param, offset),
        () => true,
    );
}

export interface MakeFuncOptionsWithName<THIS extends { new (): VoidPointer | void }> extends MakeFuncOptions<THIS> {
    /**
     * name of the native stack trace
     */
    name?: string;
}

declare module "./assembler" {
    interface X64Assembler {
        /**
         * asm.alloc + makefunc.js
         * allocates it on the executable memory. and make it as a JS function.
         */
        make<OPTS extends MakeFuncOptionsWithName<any> | null, RETURN extends ParamType, PARAMS extends ParamType[]>(
            returnType: RETURN,
            opts?: OPTS,
            ...params: PARAMS
        ): FunctionFromTypes_js<StaticPointer, OPTS, PARAMS, RETURN>;
    }
    namespace asm {
        function const_str(str: string, encoding?: BufferEncoding): Buffer;
    }
}
declare module "./core" {
    interface VoidPointerConstructor extends makefunc.Paramable {
        isTypeOf<T>(this: { new (): T }, v: unknown): v is T;
    }
    interface VoidPointer {
        [asm.splitTwo32Bits](): [number, number];
        [util.inspect.custom](depth: number, options: Record<string, any>): unknown;
    }
}
declare global {
    interface Uint8Array {
        [asm.splitTwo32Bits](): [number, number];
    }
}

VoidPointer.prototype[util.inspect.custom] = function () {
    return `${this.constructor.name} { ${this.toString()} }`;
};
VoidPointer[makefunc.size] = 8;
VoidPointer[makefunc.getter] = function <THIS extends VoidPointer>(this: { new (ptr?: VoidPointer): THIS }, ptr: StaticPointer, offset?: number): THIS | null {
    return ptr.getNullablePointerAs(this, offset);
};
VoidPointer[makefunc.setter] = function <THIS extends VoidPointer>(this: { new (): THIS }, ptr: StaticPointer, value: VoidPointer, offset?: number): void {
    ptr.setPointer(value, offset);
};
VoidPointer[makefunc.setToParam] = function (stackptr: StaticPointer, param: VoidPointer, offset?: number): void {
    stackptr.setPointer(param, offset);
};
VoidPointer[makefunc.getFromParam] = function (stackptr: StaticPointer, offset?: number): VoidPointer | null {
    return stackptr.getNullablePointerAs(this, offset);
};
makefunc.ParamableT.prototype[makefunc.useXmmRegister] = false;
VoidPointer[makefunc.useXmmRegister] = false;
VoidPointer.prototype[asm.splitTwo32Bits] = function () {
    return [this.getAddressLow(), this.getAddressHigh()];
};
Uint8Array.prototype[asm.splitTwo32Bits] = function () {
    const ptr = new NativePointer();
    ptr.setAddressFromBuffer(this);
    return [ptr.getAddressLow(), ptr.getAddressHigh()];
};
VoidPointer.isTypeOf = function <T>(this: { new (): T }, v: unknown): v is T {
    return v === null || v instanceof this;
};
VoidPointer.isTypeOfWeak = function (v: unknown): boolean {
    return v == null || v instanceof VoidPointer;
};

X64Assembler.prototype.make = function <OPTS extends MakeFuncOptionsWithName<any> | null, RETURN extends ParamType, PARAMS extends ParamType[]>(
    this: X64Assembler,
    returnType: RETURN,
    opts?: OPTS,
    ...params: PARAMS
): FunctionFromTypes_js<StaticPointer, OPTS, PARAMS, RETURN> {
    return makefunc.js(this.alloc(opts && opts.name), returnType, opts, ...params);
};
