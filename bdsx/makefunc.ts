import { asmcode } from "./asm/asmcode";
import { asm, Register, X64Assembler } from "./assembler";
import { proc2 } from "./bds/symbols";
import "./codealloc";
import { abstract, Bufferable, emptyFunc, Encoding } from "./common";
import { AllocatedPointer, cgate, chakraUtil, jshook, NativePointer, runtimeError, StaticPointer, StructurePointer, uv_async, VoidPointer } from "./core";
import { dllraw } from "./dllraw";
import { FunctionGen } from "./functiongen";
import { isBaseOf } from "./util";
import util = require('util');

export type ParamType = makefunc.Paramable;

const functionMap = new AllocatedPointer(0x100);
chakraUtil.JsAddRef(functionMap);
const callNativeFunction:(stackSize:number, writer:(stackptr:NativePointer)=>void, nativefunc:VoidPointer)=>NativePointer = chakraUtil.JsCreateFunction(asmcode.callNativeFunction, null);
const breakBeforeCallNativeFunction:(stackSize:number, writer:(stackptr:NativePointer)=>void, nativefunc:VoidPointer)=>NativePointer = chakraUtil.JsCreateFunction(asmcode.breakBeforeCallNativeFunction, null);
const callJsFunction = asmcode.callJsFunction;

function initFunctionMap():void {
    function chakraCoreToDef(funcName:keyof typeof asmcode):void {
        (asmcode as any)[funcName] = cgate.GetProcAddress(chakraCoreDll, funcName);
    }

    const chakraCoreDll = cgate.GetModuleHandleW('ChakraCore.dll');

    asmcode.GetCurrentThreadId = dllraw.kernel32.GetCurrentThreadId;
    asmcode.uv_async_alloc = uv_async.alloc;
    asmcode.uv_async_post = uv_async.post;
    asmcode.uv_async_call = uv_async.call;
    asmcode.vsnprintf = proc2.vsnprintf;

    asmcode.js_null = chakraUtil.asJsValueRef(null);
    asmcode.js_undefined = chakraUtil.asJsValueRef(undefined);
    asmcode.runtimeErrorRaise = runtimeError.raise;

    chakraCoreToDef('JsNumberToInt');
    chakraCoreToDef('JsCallFunction');
    chakraCoreToDef('JsConstructObject');
    chakraCoreToDef('JsGetAndClearException');
    asmcode.pointer_js2class = chakraUtil.pointer_js2class;
    asmcode.jshook_fireError = jshook.fireErrorPointer;
    asmcode.NativePointer = chakraUtil.asJsValueRef(NativePointer);
}

initFunctionMap();

const makefuncTypeMap:makefunc.Paramable[] = [];
function remapType(type:ParamType):makefunc.Paramable {
    if (typeof type === 'number') {
        if (makefuncTypeMap.length === 0) {
            const { RawTypeId } = require('./legacy');
            const { bool_t, int32_t, int64_as_float_t, float64_t, float32_t, bin64_t, void_t } = require('./nativetype') as typeof import('./nativetype');
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

type InstanceTypeOnly<T> = T extends {prototype:infer V} ? V : never;

type TypeFrom_js2np<T extends ParamType> = InstanceTypeOnly<T>|null;
type TypeFrom_np2js<T extends ParamType> = InstanceTypeOnly<T>;

export type TypesFromParamIds_js2np<T extends ParamType[]> = {
    [key in keyof T]: T[key] extends null ? void : T[key] extends ParamType ? TypeFrom_js2np<T[key]> : T[key];
};
export type TypesFromParamIds_np2js<T extends ParamType[]> = {
    [key in keyof T]: T[key] extends null ? void : T[key] extends ParamType ? TypeFrom_np2js<T[key]> : T[key];
};

export interface MakeFuncOptions<THIS extends { new(): VoidPointer|void; }>
{
    /**
     * *Pointer, 'this' parameter passes as first parameter.
     */
    this?:THIS;
    /**
     * it allocates at the first parameter with the returning class and returns it.
     * if this is defined, it allocates at the second parameter.
     */
    structureReturn?:boolean;
    /**
     * Option for native debugging
     */
    nativeDebugBreak?:boolean;
    /**
     * Option for JS debugging
     */
    jsDebugBreak?:boolean;

    /**
     * for makefunc.np
     * jump to onError when JsCallFunction is failed (js exception, wrong thread, etc)
     */
    onError?:VoidPointer|null;
}
type GetThisFromOpts<OPTS extends MakeFuncOptions<any>|null> =
    OPTS extends MakeFuncOptions<infer THIS> ?
    THIS extends { new(): VoidPointer; } ? InstanceType<THIS> : void : void;


export type FunctionFromTypes_np<
    OPTS extends MakeFuncOptions<any>|null,
    PARAMS extends ParamType[],
    RETURN extends ParamType> =
    (this:GetThisFromOpts<OPTS>, ...args: TypesFromParamIds_np2js<PARAMS>) => TypeFrom_js2np<RETURN>;

export type FunctionFromTypes_js<
    PTR extends VoidPointer|[number, number?],
    OPTS extends MakeFuncOptions<any>|null,
    PARAMS extends ParamType[],
    RETURN extends ParamType> =
    ((this:GetThisFromOpts<OPTS>, ...args: TypesFromParamIds_js2np<PARAMS>) => TypeFrom_np2js<RETURN>)& {
        pointer:PTR;
    };

export type FunctionFromTypes_js_without_pointer<
    OPTS extends MakeFuncOptions<any>|null,
    PARAMS extends ParamType[],
    RETURN extends ParamType> =
    ((this:GetThisFromOpts<OPTS>, ...args: TypesFromParamIds_js2np<PARAMS>) => TypeFrom_np2js<RETURN>);


function invalidParameterError(paramName:string, expected:string, actual:unknown):never {
    throw TypeError(`unexpected parameter type (${paramName}, expected=${expected}, actual=${actual != null ? (actual as any).constructor.name : actual})`);
}

export namespace makefunc {
    export const temporalKeeper:any[] = [];
    export const temporalDtors:(()=>void)[] = [];

    export const getter = Symbol('getter');
    export const setter = Symbol('setter');
    export const setToParam = Symbol('makefunc.writeToParam');
    export const getFromParam = Symbol('makefunc.readFromParam');
    export const useXmmRegister = Symbol('makefunc.returnWithXmm0');
    export const dtor = Symbol('makefunc.dtor');
    export const ctor_move = Symbol('makefunc.ctor_move');
    export const size = Symbol('makefunc.size');
    export const registerDirect = Symbol('makefunc.registerDirect');

    export interface Paramable {
        name:string;
        [getter](ptr:StaticPointer, offset?:number):any;
        [setter](ptr:StaticPointer, value:any, offset?:number):void;
        [getFromParam](stackptr:StaticPointer, offset?:number):any;
        [setToParam](stackptr:StaticPointer, param:any, offset?:number):void;
        [useXmmRegister]:boolean;
        [ctor_move](to:StaticPointer, from:StaticPointer):void;
        [dtor](ptr:StaticPointer):void;
        [size]:number;
        [registerDirect]?:boolean;
        isTypeOf(v:unknown):boolean;
        /**
         * allow downcasting
         */
        isTypeOfWeak(v:unknown):boolean;
    }
    export interface ParamableT<T> extends Paramable {
        prototype:T;
        [getFromParam](stackptr:StaticPointer, offset?:number):T|null;
        [setToParam](stackptr:StaticPointer, param:T extends VoidPointer ? (T|null) : T, offset?:number):void;
        [useXmmRegister]:boolean;
        isTypeOf<V>(this:{prototype:V}, v:unknown):v is V;
        isTypeOfWeak(v:unknown):boolean;
    }
    export class ParamableT<T> {
        constructor(
            public readonly name:string,
            _getFromParam:(stackptr:StaticPointer, offset?:number)=>T|null,
            _setToParam:(stackptr:StaticPointer, param:T extends VoidPointer ? (T|null) : T, offset?:number)=>void,
            _ctor_move:(to:StaticPointer, from:StaticPointer)=>void,
            isTypeOf:(v:unknown)=>boolean,
            isTypeOfWeak:(v:unknown)=>boolean = isTypeOf) {
            this[getFromParam] = _getFromParam;
            this[setToParam] = _setToParam;
            this[ctor_move] = _ctor_move;
            this.isTypeOf = isTypeOf as any;
            this.isTypeOfWeak = isTypeOfWeak as any;
        }
    }
    ParamableT.prototype[useXmmRegister] = false;

    /**
     * allocate temporal memory for using in NativeType
     * it will removed at native returning
     */
    export function tempAlloc(size:number):StaticPointer {
        const ptr = new AllocatedPointer(size);
        temporalKeeper.push(ptr);
        return ptr;
    }

    /**
     * allocate temporal memory for using in NativeType
     * it will removed at native returning
     */
    export function tempValue(type:Paramable, value:unknown):StaticPointer {
        const ptr = tempAlloc(type[size]);
        type[setToParam](ptr, value);
        return ptr;
    }

    /**
     * allocate temporal string for using in NativeType
     * it will removed at native returning
     */
    export function tempString(str:string, encoding?:Encoding):StaticPointer {
        const ptr = AllocatedPointer.fromString(str, encoding);
        temporalKeeper.push(ptr);
        return ptr;
    }

    export function npRaw(func:(stackptr:NativePointer)=>void, onError:VoidPointer, opts?:{name?:string, nativeDebugBreak?:boolean}|null):VoidPointer {
        chakraUtil.JsAddRef(func);
        const code = asm();
        if (opts == null) opts = {};
        if (opts.nativeDebugBreak) code.debugBreak();
        return code
        .mov_r_c(Register.r10, chakraUtil.asJsValueRef(func))
        .mov_r_c(Register.r11, onError)
        .jmp64(callJsFunction, Register.rax)
        .unwind()
        .alloc(opts.name || 'makefunc.npRaw');
    }

    /**
     * make the JS function as a native function.
     *
     * wrapper codes are not deleted permanently.
     * do not use it dynamically.
     */
    export function np<RETURN extends ParamType, OPTS extends MakeFuncOptions<any>|null, PARAMS extends ParamType[]>(
        jsfunction: FunctionFromTypes_np<OPTS, PARAMS, RETURN>,
        returnType: RETURN, opts?: OPTS, ...params: PARAMS): VoidPointer {
        if (typeof jsfunction !== 'function') invalidParameterError('arg1', 'function', jsfunction);

        const options:MakeFuncOptions<any> = opts! || {};
        const returnTypeResolved = remapType(returnType);
        const paramsTypeResolved = params.map(remapType);
        const result = returnTypeResolved[makefunc.useXmmRegister] ? asmcode.addressof_xmm0Value : asmcode.addressof_raxValue;

        const gen = new FunctionGen;
        if (options.jsDebugBreak) gen.writeln('debugger;');

        gen.import('temporalKeeper', temporalKeeper);
        gen.import('temporalDtors', temporalDtors);
        gen.writeln('const keepIdx=temporalKeeper.length;');
        gen.writeln('const dtorIdx=temporalDtors.length;');

        gen.import('getter', getter);
        gen.import('getFromParam', getFromParam);
        let offset = 0;
        function param(varname:string, type:Paramable):void {
            args.push(varname);
            gen.import(`${varname}_t`, type);
            if (offset >= 0x20) { // args memory space
                if (type[registerDirect]) {
                    gen.writeln(`const ${varname}=${varname}_t[getter](stackptr, ${offset+0x58});`);
                } else {
                    gen.writeln(`const ${varname}=${varname}_t[getFromParam](stackptr, ${offset+0x58});`);
                }
            } else { // args register space
                if (type[registerDirect]) {
                    gen.writeln(`const ${varname}=${varname}_t[getter](stackptr, ${offset});`);
                } else if (type[useXmmRegister]) {
                    gen.writeln(`const ${varname}=${varname}_t[getFromParam](stackptr, ${offset+0x20});`);
                } else {
                    gen.writeln(`const ${varname}=${varname}_t[getFromParam](stackptr, ${offset});`);
                }
            }
            offset += 8;
        }

        if (options.structureReturn) {
            if (isBaseOf(returnTypeResolved, StructurePointer)) {
                param(`retVar`, returnTypeResolved);
            } else {
                param(`retVar`, StaticPointer);
            }
        }

        const args:string[] = [];
        if (options.this != null) {
            param(`thisVar`, options.this);
        } else {
            args.push('null');
        }
        for (let i=0;i<paramsTypeResolved.length;i++) {
            const type = paramsTypeResolved[i];
            param(`arg${i}`, type);
        }

        gen.import('jsfunction', jsfunction);
        gen.import('result', result);
        gen.import('returnTypeResolved', returnTypeResolved);
        gen.import('setToParam', setToParam);
        gen.import('ctor_move', ctor_move);
        if (options.structureReturn) {
            gen.writeln(`const res=jsfunction.call(${args.join(',')});`);
            gen.writeln('returnTypeResolved[ctor_move](retVar, res);');
            if (isBaseOf(returnTypeResolved, StructurePointer)) {
                gen.writeln('returnTypeResolved[setToParam](result, retVar);');
            } else {
                gen.writeln('result.setPointer(retVar);');
            }
        } else {
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

    /**
     * make the native function as a JS function.
     *
     * @param returnType *_t or *Pointer
     * @param params *_t or *Pointer
     */
    export function js<PTR extends VoidPointer|[number, number?], OPTS extends MakeFuncOptions<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
        functionPointer: PTR,
        returnType:RETURN,
        opts?: OPTS,
        ...params: PARAMS):
        FunctionFromTypes_js<PTR, OPTS, PARAMS, RETURN> {

        const options:MakeFuncOptions<any> = opts! || {};
        const returnTypeResolved = remapType(returnType);
        const paramsTypeResolved = params.map(remapType);

        let countOnCpp = params.length;
        if (options.this != null) countOnCpp++;
        const paramsSize = countOnCpp * 8;

        let stackSize = Math.max(paramsSize, 0x20); // minimum stack for stable
        // 16 bytes align
        stackSize += 0x8;
        stackSize = ((stackSize + 0xf) & ~0xf);

        const ncall = options.nativeDebugBreak ? breakBeforeCallNativeFunction : callNativeFunction;

        const gen = new FunctionGen;

        if (options.jsDebugBreak) gen.writeln('debugger;');
        if (functionPointer instanceof Array) {
            // virtual function
            const vfoff = functionPointer[0];
            const thisoff = functionPointer[1] || 0;
            gen.writeln(`const vftable=this.getPointer(${thisoff});`);
            gen.writeln(`const func=vftable.getPointer(${vfoff});`);
        } else {
            if (!(functionPointer instanceof VoidPointer)) throw TypeError(`arg1, expected=*Pointer, actual=${functionPointer}`);
            gen.import('func', functionPointer);
        }

        const returnTypeIsClass = isBaseOf(returnTypeResolved, StructurePointer);

        const paramPairs:[string, Paramable][] = [];
        if (options.this != null) {
            paramPairs.push(['this', options.this]);
        }
        if (options.structureReturn) {
            if (returnTypeIsClass) {
                paramPairs.push([`retVar`, returnTypeResolved]);
            } else {
                paramPairs.push([`retVar`, VoidPointer]);
            }
        }

        gen.import('invalidParameterError', invalidParameterError);
        gen.import('setToParam', setToParam);
        gen.import('setter', setter);

        gen.import('temporalKeeper', temporalKeeper);
        gen.import('temporalDtors', temporalDtors);

        for (let i=0;i<paramsTypeResolved.length;i++) {
            const varname = `arg${i}`;
            const type = paramsTypeResolved[i];
            paramPairs.push([varname, type]);
            gen.writeln(`if (!${varname}_t.isTypeOfWeak(${varname})) invalidParameterError("${varname}", "${type.name}", ${varname});`);
        }

        gen.writeln('const keepIdx=temporalKeeper.length;');
        gen.writeln('const dtorIdx=temporalDtors.length;');

        function writeNcall():void {
            gen.writeln('ncall(stackSize, stackptr=>{');
            let offset = 0;
            for (const [varname, type] of paramPairs) {
                gen.import(`${varname}_t`, type);
                if (type[registerDirect]) {
                    gen.writeln(`    ${varname}_t[setter](stackptr, ${varname}, ${offset});`);
                } else {
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
            } else {
                gen.import('getter', getter);
                gen.import('AllocatedPointer', AllocatedPointer);
                gen.import('returnTypeDtor', returnTypeResolved[dtor]);
                gen.import('sizeSymbol', size);
                gen.writeln('const retVar = new AllocatedPointer(returnTypeResolved[sizeSymbol]);');
                writeNcall();
                const getterFunc = returnTypeResolved[getter];
                if (getterFunc !== emptyFunc) {
                    gen.writeln('const out=returnTypeResolved[getter](retVar);');
                } else {
                    returnVar = '';
                }
                gen.writeln('returnTypeDtor(retVar);');
            }
        } else {
            const result = returnTypeResolved[makefunc.useXmmRegister] ? asmcode.addressof_xmm0Value : asmcode.addressof_raxValue;
            gen.import('result', result);
            gen.import('returnTypeResolved', returnTypeResolved);
            gen.import('getFromParam', getFromParam);
            writeNcall();

            if (returnTypeIsClass && returnTypeResolved[registerDirect]) {
                gen.import('sizeSymbol', size);
                gen.writeln('const out=new returnTypeResolved(true);');
                gen.writeln(`out.copyFrom(result, returnTypeResolved[sizeSymbol]);`);
            } else {
                const getterFunc = returnTypeResolved[getFromParam];
                if (getterFunc !== emptyFunc) {
                    gen.writeln('const out=returnTypeResolved[getFromParam](result);');
                } else {
                    returnVar = '';
                }
            }
        }

        gen.writeln('for (let i = temporalDtors.length-1; i>= dtorIdx; i--) {');
        gen.writeln('    temporalDtors[i]();');
        gen.writeln('}');
        gen.writeln('temporalDtors.length = dtorIdx;');
        gen.writeln('temporalKeeper.length = keepIdx;');
        if (returnVar !== '') gen.writeln(`return ${returnVar};`);

        const args:string[] = [];
        for (let i=0;i<paramsTypeResolved.length;i++) {
            args.push('arg'+i);
        }
        const funcout = gen.generate(...args) as any;
        funcout.pointer = functionPointer;
        return funcout;
    }
    export import asJsValueRef = chakraUtil.asJsValueRef;

    export const Ansi = new ParamableT<string>(
        'Ansi',
        (stackptr, offset)=>stackptr.getPointer().getString(undefined, offset, Encoding.Ansi),
        (stackptr, param, offset)=>{
            if (param === null) {
                stackptr.setPointer(null, offset);
            } else {
                const buf = tempAlloc(param.length*2+1);
                const len = buf.setString(param, 0, Encoding.Ansi);
                buf.setUint8(0, len);
                stackptr.setPointer(buf, offset);
            }
        },
        abstract,
        v=>v === null || typeof v === 'string'
    );

    export const Utf8 = new ParamableT<string>(
        'Utf8',
        (stackptr, offset)=>stackptr.getPointer().getString(undefined, offset, Encoding.Utf8),
        (stackptr, param, offset)=>stackptr.setPointer(param === null ? null : tempString(param), offset),
        abstract,
        v=>v === null || typeof v === 'string'
    );

    export const Utf16 = new ParamableT<string>(
        'Utf16',
        (stackptr, offset)=>stackptr.getPointer().getString(undefined, offset, Encoding.Utf16),
        (stackptr, param, offset)=>stackptr.setPointer(param === null ? null : tempString(param, Encoding.Utf16), offset),
        abstract,
        v=>v === null || typeof v === 'string'
    );

    export const Buffer = new ParamableT<VoidPointer|Bufferable>(
        'Buffer',
        (stackptr, offset)=>stackptr.getPointer(offset),
        (stackptr, param, offset)=>{
            if (param !== null && !(param instanceof VoidPointer)) {
                param = VoidPointer.fromAddressBuffer(param);
            }
            stackptr.setPointer(param, offset);
        },
        abstract,
        v=>{
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
        }
    );

    export const JsValueRef = new ParamableT<any>(
        'JsValueRef',
        (stackptr, offset)=>stackptr.getJsValueRef(offset),
        (stackptr, param, offset)=>stackptr.setJsValueRef(param, offset),
        abstract,
        ()=>true
    );
}

export interface MakeFuncOptionsWithName<THIS extends { new(): VoidPointer|void; }> extends MakeFuncOptions<THIS> {
    /**
     * name of the native stack trace
     */
    name?:string;
}

declare module "./assembler"
{
    interface X64Assembler
    {
        /**
         * asm.alloc + makefunc.js
         * allocates it on the executable memory. and make it as a JS function.
         */
        make<OPTS extends MakeFuncOptionsWithName<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
            returnType: RETURN, opts?: OPTS, ...params: PARAMS):
            FunctionFromTypes_js<StaticPointer, OPTS, PARAMS, RETURN>;
    }
    namespace asm
    {
        function const_str(str:string, encoding?:BufferEncoding):Buffer;
    }
}
declare module "./core"
{
    interface VoidPointerConstructor extends makefunc.Paramable{
        isTypeOf<T>(this:{new():T}, v:unknown):v is T;
    }
    interface VoidPointer
    {
        [asm.splitTwo32Bits]():[number, number];
    }
}
declare global
{
    interface Uint8Array
    {
        [asm.splitTwo32Bits]():[number, number];
    }
}

VoidPointer.prototype[util.inspect.custom] = function() {
    return `${this.constructor.name} { ${this.toString()} }`;
};
VoidPointer[makefunc.size] = 8;
VoidPointer[makefunc.getter] = function<THIS extends VoidPointer>(this:{new(ptr?:VoidPointer):THIS}, ptr:StaticPointer, offset?:number):THIS{
    return ptr.getPointerAs(this, offset);
};
VoidPointer[makefunc.setter] = function<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, value:VoidPointer, offset?:number):void{
    ptr.setPointer(value, offset);
};
VoidPointer[makefunc.setToParam] = function(stackptr:StaticPointer, param:VoidPointer, offset?:number):void {
    stackptr.setPointer(param, offset);
};
VoidPointer[makefunc.getFromParam] = function(stackptr:StaticPointer, offset?:number):VoidPointer|null {
    return stackptr.getNullablePointerAs(this, offset);
};
makefunc.ParamableT.prototype[makefunc.useXmmRegister] = false;
VoidPointer[makefunc.useXmmRegister] = false;
VoidPointer.prototype[asm.splitTwo32Bits] = function() {
    return [this.getAddressLow(), this.getAddressHigh()];
};
Uint8Array.prototype[asm.splitTwo32Bits] = function() {
    const ptr = new NativePointer;
    ptr.setAddressFromBuffer(this);
    return [ptr.getAddressLow(), ptr.getAddressHigh()];
};
VoidPointer.isTypeOf = function<T>(this:{new():T}, v:unknown):v is T {
    return v === null || v instanceof this;
};
VoidPointer.isTypeOfWeak = function(v:unknown):boolean{
    return v === null || v instanceof VoidPointer;
};

X64Assembler.prototype.make = function<OPTS extends MakeFuncOptionsWithName<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
    this:X64Assembler, returnType:RETURN, opts?:OPTS, ...params:PARAMS):
	FunctionFromTypes_js<StaticPointer, OPTS, PARAMS, RETURN>{
    return makefunc.js(this.alloc(opts && opts.name), returnType, opts,  ...params);
};
