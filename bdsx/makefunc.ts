import { asm, AsmMultiplyConstant, FloatRegister, OperationSize, Register, Value64, X64Assembler } from "./assembler";
import { proc, proc2 } from "./bds/symbols";
import "./codealloc";
import { abstract, Bufferable } from "./common";
import { AllocatedPointer, cgate, chakraUtil, NativePointer, runtimeError, StaticPointer, StructurePointer, uv_async, VoidPointer } from "./core";
import { dllraw } from "./dllraw";
import { makefuncDefines } from "./makefunc_defines";
import { remapStack } from "./source-map-support";
import { isBaseOf, removeLine } from "./util";
import asmcode = require('./asm/asmcode');

/**
 * @deprecated use NativeType (int32_t, float32_t, float64_t, ...)
 */
export enum RawTypeId {
    /** @deprecated use int32_t */
	Int32,
    /** @deprecated use int64_as_float_t */
	FloatAsInt64,
    /** @deprecated use float32_t */
	Float32,
    /** @deprecated use float64_t */
	Float64,
    /** @deprecated use makefunc.Ansi */
	StringAnsi,
    /** @deprecated use makefunc.Utf8 */
	StringUtf8,
    /** @deprecated use makefunc.Utf16 */
	StringUtf16,
    /** @deprecated use makefunc.Buffer */
	Buffer,
    /** @deprecated use bin64_t */
	Bin64,
    /** @deprecated use bool_t */
	Boolean,
    /** @deprecated use makefunc.JsValueRef */
	JsValueRef,
    /** @deprecated use void_t */
	Void,
    /** @deprecated use float64_t */
	Float = 3,
}

export type ParamType = RawTypeId | makefunc.Paramable;

const nullValueRef = chakraUtil.asJsValueRef(null);
const functionMap = new AllocatedPointer(0x100);
chakraUtil.JsAddRef(functionMap);
const functionMapPtr = functionMap.add(0x80);

function initFunctionMap():void {
    function setFunctionMap(name:keyof typeof makefuncDefines, address:VoidPointer|null):void {
        if (address === undefined) throw Error(`Unexpected value for ${name}`);
        functionMap.setPointer(address, makefuncDefines[name] + 0x80);
    }

    function chakraCoreToMakeFuncMap(funcName:string):void {
        const constname = `fn_${funcName}` as keyof typeof makefuncDefines;
        const offset = makefuncDefines[constname];
        if (typeof offset !== 'number') throw Error(`${constname} not found`);
        setFunctionMap(constname, cgate.GetProcAddress(chakraCoreDll, funcName));
    }

    function chakraCoreToDef(funcName:keyof typeof asmcode):void {
        (asmcode as any)[funcName] = cgate.GetProcAddress(chakraCoreDll, funcName);
    }

    const chakraCoreDll = cgate.GetModuleHandleW('ChakraCore.dll');

    setFunctionMap('fn_getout', asmcode.getout);
    setFunctionMap('fn_str_np2js', asmcode.str_np2js);
    setFunctionMap('fn_str_js2np', asmcode.str_js2np);
    setFunctionMap('fn_stack_free_all', chakraUtil.stack_free_all);
    setFunctionMap('fn_utf16_js2np', asmcode.utf16_js2np);
    setFunctionMap('fn_pointer_js2class', chakraUtil.pointer_js2class);
    setFunctionMap('fn_bin64', asmcode.bin64);
    chakraCoreToMakeFuncMap('JsNumberToInt');
    chakraCoreToMakeFuncMap('JsBoolToBoolean');
    chakraCoreToMakeFuncMap('JsBooleanToBool');
    setFunctionMap('fn_getout_invalid_parameter', asmcode.getout_invalid_parameter);
    chakraCoreToMakeFuncMap('JsIntToNumber');
    chakraCoreToMakeFuncMap('JsNumberToDouble');
    setFunctionMap('fn_buffer_to_pointer', asmcode.buffer_to_pointer);
    chakraCoreToMakeFuncMap('JsDoubleToNumber');
    chakraCoreToMakeFuncMap('JsPointerToString');
    chakraCoreToMakeFuncMap('JsStringToPointer');
    setFunctionMap('fn_ansi_np2js', chakraUtil.from_ansi);
    setFunctionMap('fn_utf8_np2js', chakraUtil.from_utf8);
    setFunctionMap('fn_utf16_np2js', asmcode.utf16_np2js);
    setFunctionMap('fn_pointer_np2js', asmcode.pointer_np2js);
    setFunctionMap('fn_pointer_np2js_nullable', asmcode.pointer_np2js_nullable);
    setFunctionMap('fn_getout_invalid_parameter_count', asmcode.getout_invalid_parameter_count);
    chakraCoreToMakeFuncMap('JsCallFunction');
    setFunctionMap('fn_pointer_js_new', asmcode.pointer_js_new);
    chakraCoreToMakeFuncMap('JsSetException');
    setFunctionMap('fn_returnPoint', null);

    asmcode.printf = proc.printf;
    asmcode.GetCurrentThreadId = dllraw.kernel32.GetCurrentThreadId;
    asmcode.memcpy = dllraw.vcruntime140.memcpy;
    asmcode.asyncAlloc = uv_async.alloc;
    asmcode.asyncPost = uv_async.post;
    asmcode.sprintf = proc2.sprintf;
    asmcode.vsnprintf = proc2.vsnprintf;
    asmcode.malloc = dllraw.ucrtbase.malloc;
    asmcode.Sleep = dllraw.kernel32.Sleep;

    chakraCoreToDef('JsHasException');
    chakraCoreToDef('JsCreateTypeError');
    chakraCoreToDef('JsGetValueType');
    chakraCoreToDef('JsStringToPointer');
    chakraCoreToDef('JsGetArrayBufferStorage');
    chakraCoreToDef('JsGetTypedArrayStorage');
    chakraCoreToDef('JsGetDataViewStorage');
    chakraCoreToDef('JsConstructObject');
    asmcode.js_null = nullValueRef;
    asmcode.js_true = chakraUtil.asJsValueRef(true);
    chakraCoreToDef('JsGetAndClearException');
    asmcode.runtimeErrorFire = runtimeError.fire;
    asmcode.runtimeErrorRaise = runtimeError.raise;

}

initFunctionMap();

const PARAMNUM_RETURN = -1;
const PARAMNUM_THIS = 0;

const PARAM_OFFSET = 3;

function throwTypeError(paramNum: number, name: string, value: string, detail: string): never {
    let out = '';
    if (paramNum === PARAMNUM_RETURN) out = 'Invalid return ';
    else if (paramNum === PARAMNUM_THIS) out = 'Invalid this ';
    else out = 'Invalid parameter ';
    out += `${name}(${value})`;
    if (paramNum > 0) out += ` at ${paramNum}`;
    out += `, ${detail}`;
    throw Error(out);
}

function checkTypeIsFunction(value: unknown, paramNum: number): void {
    const type = typeof value;
    if (type !== 'function') {
        throwTypeError(paramNum, 'type', type, 'function required');
    }
}

function pointerClassOrThrow(paramNum: number, type: any): void {
    if (!isBaseOf(type, VoidPointer)) {
        const name = type.name+'';
        throwTypeError(paramNum, 'class', name, '*Pointer class required');
    }
}

const makefuncTypeMap:makefunc.Paramable[] = [];
function remapType(type:ParamType):makefunc.Paramable {
    if (typeof type === 'number') {

        if (makefuncTypeMap.length === 0) {
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

function qwordMove(asm:makefunc.Maker, target:makefunc.Target, source:makefunc.Target):void {
    asm.qmov_t_t(target, source);
}


class ParamInfoMaker {
    public readonly structureReturn: boolean;
    public readonly useThis: boolean;
    public readonly thisType: makefunc.Paramable;

    public readonly return: makefunc.ParamInfo;
    public readonly params: makefunc.ParamInfo[] = [];
    public readonly countOnCalling: number;
    public readonly countOnCpp: number;

    constructor(
        returnType:makefunc.Paramable,
        opts:MakeFuncOptions<any>|null|undefined,
        params:makefunc.Paramable[]) {
        if (opts != null) {
            this.structureReturn = !!opts.structureReturn;
            this.thisType = opts.this;
            this.useThis = !!this.thisType;
            if (this.useThis) {
                if (!isBaseOf(this.thisType, VoidPointer)) {
                    throw Error('Non pointer at this');
                }
            }
        } else {
            this.structureReturn = false;
            this.useThis = false;
        }
        this.countOnCalling = params.length;
        this.countOnCpp = this.countOnCalling + (+this.useThis) + (+this.structureReturn);

        if (this.structureReturn) params.unshift(StructureReturnAllocation);
        if (this.useThis) params.unshift(this.thisType);

        {
            const info = new makefunc.ParamInfo;
            info.offsetForLocalSpace = null;
            info.type = returnType;
            info.numberOnMaking = 2;
            info.numberOnUsing = PARAMNUM_RETURN;
            info.needDestruction = this.structureReturn;
            this.return = info;
        }

        for (let i=0;i<params.length;i++) {
            const info = new makefunc.ParamInfo;
            info.offsetForLocalSpace = null;
            info.needDestruction = false;

            if (this.useThis && i === 0) {
                info.type = this.thisType;
                info.numberOnMaking = 3;
                info.type = params[0];
                info.numberOnUsing = PARAMNUM_THIS;
            } else if (this.structureReturn && i === +this.useThis) {
                info.type = this.return.type;
                info.numberOnMaking = 2;
                info.type = StructureReturnAllocation;
                info.numberOnUsing = PARAMNUM_RETURN;
            } else {
                const indexOnUsing = i - +this.structureReturn - +this.useThis;
                const indexOnMaking = PARAM_OFFSET + indexOnUsing;
                info.numberOnMaking = indexOnMaking + 1;
                info.numberOnUsing = indexOnUsing + 1;
                info.type = params[i];
            }
            this.params.push(info);
        }
    }
}

type InstanceTypeOnly<T> = T extends {new():infer V} ? V : never;

type TypeFrom_js2np<T extends ParamType> =
    T extends RawTypeId ? any : InstanceTypeOnly<T>|null;
type TypeFrom_np2js<T extends ParamType> =
    T extends RawTypeId ? any : InstanceTypeOnly<T>;

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
     * @deprecated nullable is default now
     */
    nullableReturn?:boolean;

    /**
     * @deprecated meaningless. 'this' should be alawys *Pointer on JS
     */
    nullableThis?:boolean;
    /**
     * @deprecated nullable is default now
     */
    nullableParams?:boolean;

    /**
     * Option for native debugging
     */
    nativeDebugBreak?:boolean;
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
    ((this:GetThisFromOpts<OPTS>, ...args: TypesFromParamIds_js2np<PARAMS>) => TypeFrom_np2js<RETURN>)& {pointer:PTR};

function symbolNotFound():never {
    throw Error('symbol not found');
}

class DupCheck {
    private readonly map = new Map<string, string>();

    check(target:unknown):void {
        const str = String(target);
        const oldstack = this.map.get(str);
        if (oldstack !== undefined) {
            console.error(`Duplicated ${str}`);
            console.error(remapStack(oldstack));
            return;
        }
        this.map.set(str, removeLine(Error().stack!, 0, 1));
    }
}

// const dupcheck = new DupCheck;

export namespace makefunc {
    export const js2np = Symbol('makefunc.js2np');
    export const np2js = Symbol('makefunc.np2js');
    export const js2npAsm = Symbol('makefunc.js2npAsm');
    export const np2jsAsm = Symbol('makefunc.np2jsAsm');
    export const np2npAsm = Symbol('makefunc.np2npAsm');
    export const js2npLocalSize = Symbol('makefunc.js2npLocalSize');
    export const pointerReturn = Symbol('makefunc.pointerReturn');
    export const nullAlsoInstance = Symbol('makefunc.nullAlsoInstance');

    export interface Paramable {
        name:string;
        [js2npAsm](asm:X64Assembler, target: Target, source: Target, info:makefunc.ParamInfo): void;
        [np2jsAsm](asm:X64Assembler, target: Target, source: Target, info:makefunc.ParamInfo): void;
        [np2npAsm](asm:X64Assembler, target: Target, source: Target, info:makefunc.ParamInfo): void;
        [np2js]?(ptr:any):any;
        [js2np]?(ptr:any):any;

        /**
         * the local space for storing it
         */
        [js2npLocalSize]?:number;

        /**
         * if it has the local space. the value is the pointer that indicates the stored data.
         * or it's read from the stored data
         */
        [pointerReturn]?:boolean;

        /**
         * the null pointer also can be the JS instance
         */
        [nullAlsoInstance]?:boolean;
    }
    export interface ParamableT<T> extends Paramable {
        new():T;
    }
    export class ParamableT<T> {
        constructor(
            public readonly name:string,
            _js2npAsm:(asm:X64Assembler, target: Target, source: Target, info:makefunc.ParamInfo)=>void,
            _np2jsAsm:(asm:X64Assembler, target: Target, source: Target, info:makefunc.ParamInfo)=>void,
            _np2npAsm:(asm:X64Assembler, target: Target, source: Target, info:makefunc.ParamInfo)=>void,
            _np2js?:(ptr:T|null)=>T|null,
            _js2np?:(ptr:T|null)=>T|null) {
            this[js2npAsm] = _js2npAsm;
            this[np2jsAsm] = _np2jsAsm;
            this[np2npAsm] = _np2npAsm;
            this[np2js] = _np2js;
            this[js2np] = _js2np;
        }
    }

    export class ParamInfo {
        offsetForLocalSpace:null|number;
        numberOnMaking: number;
        numberOnUsing: number;
        type: Paramable;
        needDestruction:boolean;
    }

    export class Target {
        reg: Register;
        freg: FloatRegister;
        offset: number;
        memory: boolean;

        equals(other: Target): boolean {
            if (this.memory) {
                return other.memory && this.reg === other.reg && this.offset === other.offset;
            }
            return !other.memory && this.reg === other.reg;
        }

        getTemp():Register {
            return this.reg !== Register.r10 ? Register.r10 : Register.r11;
        }

        getFTemp():FloatRegister {
            return this.freg !== FloatRegister.xmm5 ? FloatRegister.xmm5 : FloatRegister.xmm6;
        }

        static register(reg: Register, freg: FloatRegister): Target {
            const ti = new Target;
            ti.reg = reg;
            ti.freg = freg;
            ti.memory = false;
            return ti;
        }

        static memory(reg: Register, offset: number): Target {
            const ti = new Target;
            ti.reg = reg;
            ti.offset = offset;
            ti.memory = true;
            return ti;
        }

        tempPtr(...sources:Target[]): Target {
            if (this.memory) return this;
            return Target.tempPtr(...sources);
        }

        static tempPtr(...sources:Target[]):Target {
            let offsets = 0;
            for (const src of sources) {
                if (src.memory && src.reg === Register.rbp) {
                    console.assert(src.offset%8 === 0);
                    offsets |= 1 << (src.offset>>3);
                    continue;
                }
            }
            let offset = 0;
            while ((offsets & 1) !== 0) {
                offsets >>>= 1;
                offset += 8;
            }
            return Target.memory(Register.rbp, offset);
        }

        static readonly return = Target.register(Register.rax, FloatRegister.xmm0);
        static readonly [0] = Target.register(Register.rcx, FloatRegister.xmm0);
        static readonly [1] = Target.register(Register.rdx, FloatRegister.xmm1);
        static readonly [2] = Target.register(Register.r8, FloatRegister.xmm2);
        static readonly [3] = Target.register(Register.r9, FloatRegister.xmm3);
    }

    export class Maker extends X64Assembler {
        public offsetForStructureReturn: number;
        public useStackAllocator = false;

        constructor(
            public readonly pi: ParamInfoMaker,
            public stackSize: number,
            useGetOut: boolean) {
            super(new Uint8Array(64), 0);

            this.push_r(Register.rdi);
            this.push_r(Register.rsi);
            this.push_r(Register.rbp);
            this.mov_r_c(Register.rdi, functionMapPtr);
            if (useGetOut) {
                this.mov_r_rp(Register.rax, Register.rdi, 1, makefuncDefines.fn_returnPoint);
            }
            this.push_r(Register.rax);

            if (useGetOut) {
                this.lea_r_rp(Register.rax, Register.rsp, 1, 1);
                this.mov_rp_r(Register.rdi, 1, makefuncDefines.fn_returnPoint, Register.rax);
            }
        }

        calculateStackSize():void {
            // align
            const alignmentOffset = 8;
            this.stackSize -= alignmentOffset;
            this.stackSize = ((this.stackSize + 0xf) & ~0xf);
            this.stackSize += alignmentOffset;
        }

        end(): void {
            this.add_r_c(Register.rsp, this.stackSize);
            this.pop_r(Register.rcx);
            this.pop_r(Register.rbp);
            this.mov_rp_r(Register.rdi, 1, makefuncDefines.fn_returnPoint, Register.rcx);
            this.pop_r(Register.rsi);
            this.pop_r(Register.rdi);
            this.ret();
        }

        qmov_t_c(target: Target, value: Value64): void {
            if (target.memory) {
                const temp = target.reg !== Register.r10 ? Register.r10 : Register.r11;
                this.mov_r_c(temp, value);
                this.mov_rp_r(target.reg, 1, target.offset, temp);
            } else {
                this.mov_r_c(target.reg, value);
            }
        }

        qmov_t_t(target:Target, source:Target):void {
            if (target.memory) {
                if (source.memory) {
                    if (target === source) {
                        // same
                    } else {
                        const temp = target.getTemp();
                        this.mov_r_rp(temp, source.reg, 1, source.offset, OperationSize.qword);
                        this.mov_rp_r(target.reg, 1, target.offset, temp, OperationSize.qword);
                    }
                } else {
                    this.mov_rp_r(target.reg, 1, target.offset, source.reg, OperationSize.qword);
                }
            } else {
                if (source.memory) {
                    this.mov_r_rp(target.reg, source.reg, 1, source.offset, OperationSize.qword);
                } else {
                    if (target === source) {
                        // same
                    } else {
                        this.mov_r_r(target.reg, source.reg, OperationSize.qword);
                    }
                }
            }
        }

        lea_t_rp(target:Target, source:Register, multiply:AsmMultiplyConstant, offset:number):void {
            if (target.memory) {
                if (offset === 0) {
                    this.mov_rp_r(target.reg, 1, target.offset, source, OperationSize.qword);
                } else {
                    const temp = target.getTemp();
                    this.lea_r_rp(temp, source, multiply, offset, OperationSize.qword);
                    this.mov_rp_r(target.reg, 1, target.offset, temp, OperationSize.qword);
                }
            } else {
                if (offset === 0 && target.reg === source) return;
                this.lea_r_rp(target.reg, source, multiply, offset, OperationSize.qword);
            }
        }

        mov_t_t(target:Target, source:Target, size:OperationSize):void {
            if (size === OperationSize.void) return;
            if (size > OperationSize.qword) throw Error('Unexpected operation size: '+OperationSize[size]);
            if (size === OperationSize.qword) return this.qmov_t_t(target, source);
            if (target.memory) {
                if (source.memory) {
                    if (target === source) {
                        // same
                    } else {
                        const temp = target.getTemp();
                        if (size >= OperationSize.dword) {
                            this.mov_r_rp(temp, source.reg, 1, source.offset, size);
                        } else {
                            this.movzx_r_rp(temp, source.reg, 1, source.offset, OperationSize.dword, size);
                        }
                        this.mov_rp_r(target.reg, 1, target.offset, temp, size);
                    }
                } else {
                    this.mov_rp_r(target.reg, 1, target.offset, source.reg, size);
                }
            } else {
                if (source.memory) {
                    if (size >= OperationSize.dword) {
                        this.mov_r_rp(target.reg, source.reg, 1, source.offset, size);
                    } else {
                        this.movzx_r_rp(target.reg, source.reg, 1, source.offset, OperationSize.dword, size);
                    }
                } else {
                    if (target === source) {
                        // same
                    } else {
                        this.mov_r_r(target.reg, source.reg, OperationSize.dword);
                    }
                }
            }
        }

        mov2dw_t_t(target:Target, source:Target, size:OperationSize, signed:boolean):void {
            if (size === OperationSize.void) return;
            if (size > OperationSize.qword) throw Error('Unexpected operation size: '+OperationSize[size]);
            if (target.memory) {
                if (source.memory) {
                    if (target === source) {
                        // same
                    } else {
                        const temp = target.getTemp();
                        if (size >= OperationSize.dword) {
                            this.mov_r_rp(temp, source.reg, 1, source.offset, size);
                        } else {
                            if (signed) this.movsx_r_rp(temp, source.reg, 1, source.offset, OperationSize.dword, size);
                            else this.movzx_r_rp(temp, source.reg, 1, source.offset, OperationSize.dword, size);
                        }
                        this.mov_rp_r(target.reg, 1, target.offset, temp, OperationSize.dword);
                    }
                } else {
                    this.mov_rp_r(target.reg, 1, target.offset, source.reg, OperationSize.dword);
                }
            } else {
                if (source.memory) {
                    if (size >= OperationSize.dword) {
                        this.mov_r_rp(target.reg, source.reg, 1, source.offset, size);
                    } else {
                        if (signed) this.movsx_r_rp(target.reg, source.reg, 1, source.offset, OperationSize.dword, size);
                        else this.movzx_r_rp(target.reg, source.reg, 1, source.offset, OperationSize.dword, size);
                    }
                } else {
                    if (size >= OperationSize.dword) {
                        if (target === source) {
                            // same
                        } else {
                            this.mov_r_r(target.reg, source.reg, OperationSize.dword);
                        }
                    } else {
                        if (signed) this.movsx_r_r(target.reg, source.reg, OperationSize.dword, size);
                        else this.movzx_r_r(target.reg, source.reg, OperationSize.dword, size);
                    }
                }
            }
        }

        /**
         * int64_t -> float64_t
         */
        cvtsi2sd_t_t(target: Target, source: Target): void {
            if (target.memory) {
                if (source.memory) {
                    const ftemp = target.getFTemp();
                    this.cvtsi2sd_f_rp(ftemp, source.reg, 1, source.offset);
                    this.movsd_rp_f(target.reg, 1, target.offset, ftemp);
                } else {
                    this.cvtsi2sd_f_r(FloatRegister.xmm0, source.reg);
                    this.movsd_rp_f(target.reg, 1, target.offset, FloatRegister.xmm0);
                }
            } else {
                if (source.memory) {
                    this.cvtsi2sd_f_rp(target.freg, source.reg, 1, source.offset);
                } else {
                    this.cvtsi2sd_f_r(target.freg, source.reg);
                }
            }
        }

        /**
         * float64_t -> int64_t
         */
        cvttsd2si_t_t(target: Target, source: Target): void {
            if (target.memory) {
                const temp = target.getTemp();
                if (source.memory) {
                    this.cvttsd2si_r_rp(temp, source.reg, 1, source.offset);
                    this.mov_rp_r(target.reg, 1, target.offset, temp);
                } else {
                    this.cvttsd2si_r_f(temp, source.freg);
                    this.mov_rp_r(target.reg, 1, target.offset, temp);
                }
            } else {
                if (source.memory) {
                    this.cvttsd2si_r_rp(target.reg, source.reg, 1, source.offset);
                } else {
                    this.cvttsd2si_r_f(target.reg, source.freg);
                }
            }
        }

        /**
         * float32_t -> float64_t
         */
        cvtss2sd_t_t(target:Target, source:Target): void {
            if (target.memory) {
                if (source.memory) {
                    const ftemp = target.getFTemp();
                    this.cvtss2sd_f_rp(ftemp, source.reg, 1, source.offset);
                    this.movsd_rp_f(target.reg, 1, target.offset, ftemp);
                } else {
                    this.cvtss2sd_f_f(FloatRegister.xmm0, source.freg);
                    this.movsd_rp_f(target.reg, 1, target.offset, FloatRegister.xmm0);
                }
            } else {
                if (source.memory) {
                    this.cvtss2sd_f_rp(target.freg, source.reg, 1, source.offset);
                } else {
                    this.cvtss2sd_f_f(target.freg, source.freg);
                }
            }
        }

        /**
         * float64_t -> float32_t
         */
        cvtsd2ss_t_t(target:Target, source:Target): void {
            if (target.memory) {
                if (source.memory) {
                    const ftemp = target.getFTemp();
                    this.cvtsd2ss_f_rp(ftemp, source.reg, 1, source.offset);
                    this.movss_rp_f(target.reg, 1, target.offset, ftemp);
                } else {
                    this.cvtsd2ss_f_f(FloatRegister.xmm0, source.freg);
                    this.movss_rp_f(target.reg, 1, target.offset, FloatRegister.xmm0);
                }
            } else {
                if (source.memory) {
                    this.cvtsd2ss_f_rp(target.freg, source.reg, 1, source.offset);
                } else {
                    this.cvtsd2ss_f_f(target.freg, source.freg);
                }
            }
        }

        movss_t_t(target:Target, source:Target):void {
            if (target.memory) {
                if (source.memory) {
                    if (target === source) {
                        // same
                    } else {
                        const temp = target.getTemp();
                        this.mov_r_rp(temp, source.reg, 1, source.offset, OperationSize.dword);
                        this.mov_rp_r(target.reg, 1, target.offset, temp, OperationSize.dword);
                    }
                } else {
                    this.movss_rp_f(target.reg, 1, target.offset, source.freg);
                }
            } else {
                if (source.memory) {
                    this.movss_f_rp(target.freg, source.reg, 1, source.offset);
                } else {
                    if (target === source) {
                        // same
                    } else {
                        this.movss_f_f(target.freg, source.freg);
                    }
                }
            }
        }

        movsd_t_t(target:Target, source:Target):void {
            if (target.memory) {
                if (source.memory) {
                    if (target === source) {
                        // same
                    } else {
                        const temp = target.getTemp();
                        this.mov_r_rp(temp, source.reg, 1, source.offset);
                        this.mov_rp_r(target.reg, 1, target.offset, temp);
                    }
                } else {
                    this.movsd_rp_f(target.reg, 1, target.offset, source.freg);
                }
            } else {
                if (source.memory) {
                    this.movsd_f_rp(target.freg, source.reg, 1, source.offset);
                } else {
                    if (target === source) {
                        // same
                    } else {
                        this.movsd_f_f(target.freg, source.freg);
                    }
                }
            }
        }

        jsNumberToInt(target:Target, source:Target, size:OperationSize, info:ParamInfo):void {
            const temp = target.tempPtr();
            this.qmov_t_t(makefunc.Target[0], source);
            this.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
            this.call_rp(Register.rdi, 1, makefuncDefines.fn_JsNumberToInt);
            this.throwIfNonZero(info);
            this.mov_t_t(target, temp, size);
        }

        jsUintToNumber(target:Target, source:Target, size:OperationSize, info:ParamInfo):void {
            const temp = target.tempPtr();
            this.mov2dw_t_t(makefunc.Target[0], source, size, false);
            this.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
            this.call_rp(Register.rdi, 1, makefuncDefines.fn_JsIntToNumber);
            this.throwIfNonZero(info);
            this.qmov_t_t(target, temp);
        }

        jsIntToNumber(target:Target, source:Target, size:OperationSize, info:ParamInfo, signed:boolean):void {
            const temp = target.tempPtr();
            this.mov2dw_t_t(makefunc.Target[0], source, size, signed);
            this.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
            this.call_rp(Register.rdi, 1, makefuncDefines.fn_JsIntToNumber);
            this.throwIfNonZero(info);
            this.qmov_t_t(target, temp);
        }

        nativeToJs(info:ParamInfo, target:Target, source:Target):void {
            if (info.type === StructureReturnAllocation) {
                throw Error('Unsupported');
                // this.pi.returnType[np2jsAsm](this, target, source, info);
            }
            const wrapper = info.type[np2js];
            if (wrapper) {
                chakraUtil.JsAddRef(wrapper);

                const temp = target.tempPtr();
                this.sub_r_c(Register.rsp, 0x30);
                info.type[makefunc.np2jsAsm](this, makefunc.Target.memory(Register.rsp, 0x28), source, info);
                this.mov_r_c(Register.rax, nullValueRef);
                this.mov_rp_r(Register.rsp, 1, 0x20, Register.rax);
                this.mov_r_c(Register.rcx, chakraUtil.asJsValueRef(wrapper));
                this.lea_r_rp(Register.rdx, Register.rsp, 1, 0x20);
                this.mov_r_c(Register.r8, 2);
                this.lea_r_rp(Register.r9, temp.reg, 1, temp.offset);
                this.call_rp(Register.rdi, 1, makefuncDefines.fn_JsCallFunction);
                this.throwIfNonZero(info);
                this.add_r_c(Register.rsp, 0x30);
                this.qmov_t_t(target, temp);
            } else {
                info.type[makefunc.np2jsAsm](this, target, source, info);
            }
        }

        jsToNative(info:ParamInfo, target:Target, source:Target):void {
            if (info.type === StructureReturnAllocation) {
                if (this.pi.return.offsetForLocalSpace !== null) {
                    this.lea_t_rp(target, Register.rbp, 1, this.pi.return.offsetForLocalSpace);
                } else if ('prototype' in this.pi.return.type) {
                    chakraUtil.JsAddRef(this.pi.return.type);
                    this.lea_r_rp(Register.rdx, Register.rbp, 1, this.offsetForStructureReturn);
                    this.mov_r_c(Register.rcx, chakraUtil.asJsValueRef(this.pi.return.type));
                    this.call_rp(Register.rdi, 1, makefuncDefines.fn_pointer_js_new);
                    this.qmov_t_t(target, makefunc.Target.return);
                } else {
                    throw Error(`${this.pi.return.type.name} is not constructible`);
                }
                return;
            }

            const wrapper = info.type[js2np];
            if (wrapper) {
                chakraUtil.JsAddRef(wrapper);

                const temp = target.tempPtr();
                this.sub_r_c(Register.rsp, 0x30);
                info.type[makefunc.js2npAsm](this, makefunc.Target.memory(Register.rsp, 0x28), source, info);
                this.mov_r_c(Register.rax, nullValueRef);
                this.mov_rp_r(Register.rsp, 1, 0x20, Register.rax);

                this.mov_r_c(Register.rcx, chakraUtil.asJsValueRef(wrapper));
                this.lea_r_rp(Register.rdx, Register.rsp, 1, 0x20);
                this.mov_r_c(Register.r8, 2);
                this.lea_r_rp(Register.r9, temp.reg, 1, temp.offset);
                this.call_rp(Register.rdi, 1, makefuncDefines.fn_JsCallFunction);
                this.throwIfNonZero(info);
                this.add_r_c(Register.rsp, 0x30);
                this.qmov_t_t(target, temp);
            } else {
                info.type[makefunc.js2npAsm](this, target, source, info);
            }
        }

        throwIfNonZero(info:ParamInfo):void {
            this.test_r_r(Register.rax, Register.rax, OperationSize.dword);
            this.jz_label('!');
            this.mov_r_c(Register.rcx, info.numberOnUsing);
            this.call_rp(Register.rdi, 1, makefuncDefines.fn_getout_invalid_parameter);
            this.close_label('!');
        }
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
        const pimaker = new ParamInfoMaker(remapType(returnType), opts, params.map(remapType)); // check param count also
        if (pimaker.structureReturn) throw Error(`makefunc.np does not support structureReturn:true`); // TODO: support

        chakraUtil.JsAddRef(jsfunction);
        checkTypeIsFunction(jsfunction, 1);

        const spaceForTemp = 0x10;
        const spaceForOutput = 0x8;
        const spaceForFunctionCalling = 0x20;
        const paramsSize = pimaker.countOnCalling * 8 + 8; // params + this
        const func = new Maker(pimaker, paramsSize, false);
        if (opts && opts.nativeDebugBreak) func.debugBreak();
        func.stackSize += spaceForTemp; // space for tempPtr()
        func.stackSize += spaceForOutput;  // space for the output of JsCallFunction
        func.stackSize += spaceForFunctionCalling; // space for the function calling

        // calculate local space size
        {
            const localSize = pimaker.return.type[js2npLocalSize];
            if (localSize) func.stackSize += localSize;
        }
        func.calculateStackSize();

        // local spaces
        const argStackOffset = 0x28;
        let offset = paramsSize+spaceForTemp+spaceForOutput+spaceForFunctionCalling-func.stackSize-argStackOffset;
        {
            const localSize = pimaker.return.type[js2npLocalSize];
            if (localSize) {
                pimaker.return.offsetForLocalSpace = offset;
                offset += localSize;
            }
        }

        // 0x28~ - js arguments
        // 0x20~0x28 - space for the output for JsCallFunction
        // 0x00~0x20 - parameters for JsCallFunction
        func.lea_r_rp(Register.rbp, Register.rsp, 1, argStackOffset);

        const activeRegisters = Math.min(pimaker.countOnCpp, 4);
        if (activeRegisters > 1) {
            for (let i = 1; i < activeRegisters; i++) {
                const param = pimaker.params[i];
                param.type[np2npAsm](func, Target.memory(Register.rbp, i * 8), Target[i as 0|1|2|3], param);
            }
        }

        func.lea_r_rp(Register.rsi, Register.rsp, 1, -func.stackSize + 0x20); // without calling stack
        func.sub_r_c(Register.rsp, func.stackSize);

        offset = 0;
        if (!pimaker.useThis) {
            func.mov_r_c(Register.rax, nullValueRef);
            func.mov_rp_r(Register.rsi, 1, 0, Register.rax);
        }

        for (let i = 0; i < pimaker.countOnCpp; i++) {
            const info = pimaker.params[i];
            if (i === 0) {
                func.nativeToJs(info, Target.memory(Register.rsi, info.numberOnUsing * 8), Target[0]);
            } else {
                func.nativeToJs(info,
                    Target.memory(Register.rsi, info.numberOnUsing * 8),
                    Target.memory(Register.rbp, offset));
            }
            offset += 8;
        }

        func.mov_r_c(Register.rcx, chakraUtil.asJsValueRef(jsfunction));
        func.lea_r_rp(Register.rdx, Register.rsp, 1, 0x20);
        func.mov_r_c(Register.r8, pimaker.countOnCalling + 1);
        func.mov_r_r(Register.r9, Register.rbp);
        func.call_rp(Register.rdi, 1, makefuncDefines.fn_JsCallFunction);

        func.test_r_r(Register.rax, Register.rax);
        func.jz_label('!');
        func.mov_r_r(Register.rcx, Register.rax);
        func.call_rp(Register.rdi, 1, makefuncDefines.fn_getout);
        func.close_label('!');

        func.jsToNative(pimaker.return, makefunc.Target.return, Target.memory(Register.rbp, 0));

        func.end();
        return func.alloc();
    }
    /**
     * make the native function as a JS function.
     *
     * wrapper codes are not deleted permanently.
     * do not use it dynamically.
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
        // if (functionPointer instanceof VoidPointer) {
        //     dupcheck.check(functionPointer);
        // }

        const returnTypeResolved = remapType(returnType);
        const pimaker = new ParamInfoMaker(returnTypeResolved, opts, params.map(remapType)); // check param count also

        let vfoff:number|undefined;
        if (functionPointer instanceof Array) {
            vfoff = functionPointer[0];
            if (typeof vfoff !== 'number') {
                throwTypeError(1, 'type', typeof functionPointer, '*Pointer or [number, number] required');
            }
        } else if (!(functionPointer instanceof VoidPointer)) {
            return symbolNotFound as (()=>never)&{pointer:PTR};
        }

        const paramsSize = pimaker.countOnCpp * 8;
        const func = new Maker(pimaker, paramsSize, true);
        if (opts && opts.nativeDebugBreak) func.debugBreak();

        const spaceForTemp = 0x10;
        const spaceForCalling = 0x20;
        func.stackSize += spaceForTemp; // space for tempPtr()
        func.stackSize += spaceForCalling;
        if (pimaker.structureReturn) {
            func.stackSize += 8; // structureReturn space
            const localSize = pimaker.return.type[js2npLocalSize];
            if (localSize) func.stackSize += localSize;
            else if ((pimaker.return.type as any)[StructurePointer.contentSize] == null){
                throw Error(`unknown size, need the size for structureReturn:true (${pimaker.return.type.name})`);
            }
        }

        // calculate local space size
        for (const param of pimaker.params) {
            const localSize = param.type[js2npLocalSize];
            if (localSize) func.stackSize += localSize;
        }
        func.calculateStackSize();

        // structure return space
        let offset = spaceForTemp;
        if (pimaker.structureReturn) {
            func.offsetForStructureReturn = offset;
            offset += 8;

            const localSize = pimaker.return.type[js2npLocalSize];
            if (localSize) {
                pimaker.return.offsetForLocalSpace = offset;
                offset += localSize;
            }
        }

        // local spaces
        for (const param of pimaker.params) {
            const localSize = param.type[js2npLocalSize];
            if (localSize) {
                param.offsetForLocalSpace = offset;
                offset += localSize;
            }
        }

        let targetfuncptr:VoidPointer|null;
        if (vfoff === undefined) {
            targetfuncptr = functionPointer as VoidPointer;
        } else {
            targetfuncptr = null;
        }
        if (pimaker.countOnCalling !== 0) {
            func.cmp_r_c(Register.r9, pimaker.countOnCalling + 1);
            func.jz_label('!');
            func.mov_r_c(Register.rdx, pimaker.countOnCalling);
            func.lea_r_rp(Register.rcx, Register.r9, 1, -1);
            func.jmp_rp(Register.rdi, 1, makefuncDefines.fn_getout_invalid_parameter_count);
            func.close_label('!');
        }
        func.mov_r_r(Register.rsi, Register.r8);
        func.lea_r_rp(Register.rbp, Register.rsp, 1, - func.stackSize + paramsSize + spaceForCalling);
        func.sub_r_c(Register.rsp, func.stackSize);

        if (pimaker.countOnCpp > 1) {

            const last = pimaker.countOnCpp - 1;
            let offset = -paramsSize;
            for (let i = 0; i < pimaker.countOnCpp; i++) {
                const info = pimaker.params[i];
                func.jsToNative(info,
                    i !== last ? Target.memory(Register.rbp, offset) : i < 4 ?
                        Target[i as 0|1|2|3] :
                        Target.memory(Register.rbp, offset),
                    Target.memory(Register.rsi, info.numberOnUsing * 8));
                offset += 8;
            }

            if (func.useStackAllocator) {
                func.mov_r_c(Register.rax, chakraUtil.stack_ptr);
                func.or_rp_c(Register.rax, 1, 0, 1);
            }

            // paramCountOnCpp >= 2
            const n = Math.min(pimaker.countOnCpp-1, 4);
            for (let i=0;i<n;i++) {
                pimaker.params[i].type[np2npAsm](func, makefunc.Target[i as 0|1|2|3], Target.memory(Register.rsp, 8*i+spaceForCalling), pimaker.params[i]);
            }

        } else {
            if (pimaker.countOnCpp !== 0) {
                const pi = pimaker.params[0];
                func.jsToNative(pi, makefunc.Target[0], Target.memory(Register.rsi, pi.numberOnUsing * 8));
            }

            if (func.useStackAllocator) {
                func.mov_r_c(Register.rax, chakraUtil.stack_ptr);
                func.or_rp_c(Register.rax, 1, 0, 1);
            }
        }

        func.add_r_c(Register.rsp, spaceForCalling);
        if (targetfuncptr !== null) {
            func.call64(targetfuncptr, Register.rax);
        } else {
            const thisoff = (functionPointer as number[])[1] || 0;
            func.mov_r_rp(Register.rax, Register.rcx, 1, thisoff);
            func.call_rp(Register.rax, 1, vfoff!);
        }
        func.sub_r_c(Register.rsp, spaceForCalling);

        let returnTarget = Target.return;
        let returnInMemory:Target|null = null;
        if (func.useStackAllocator) {
            returnTarget = Target.memory(Register.rbp, 0);
        }
        if (pimaker.structureReturn) {
            if (pimaker.return.offsetForLocalSpace !== null) {
                if (pimaker.return.type[pointerReturn]) {
                    func.lea_t_rp(Target[0], Register.rbp, 1, pimaker.return.offsetForLocalSpace);
                } else {
                    pimaker.return.type[np2npAsm](func, Target[0], Target.memory(Register.rbp, pimaker.return.offsetForLocalSpace), pimaker.return);
                }
                func.nativeToJs(pimaker.return, returnTarget, Target[0]);
            } else {
                returnInMemory = Target.memory(Register.rbp, func.offsetForStructureReturn);
            }
        } else {
            func.nativeToJs(pimaker.return, returnTarget, Target.return);
        }
        if (func.useStackAllocator) {
            func.mov_r_c(Register.rdx, chakraUtil.stack_ptr);
            func.and_rp_c(Register.rdx, 1, 0, -2);
            func.call_rp(Register.rdi, 1, makefuncDefines.fn_stack_free_all);
        }
        if (returnInMemory !== null) {
            func.qmov_t_t(Target.return, returnInMemory);
        } else if (func.useStackAllocator) {
            func.qmov_t_t(Target.return, returnTarget);
        }

        func.end();
        const nativecode = func.alloc();
        const funcout = chakraUtil.JsCreateFunction(nativecode, null) as FunctionFromTypes_js<PTR, OPTS, PARAMS, RETURN>;
        funcout.pointer = functionPointer;
        return funcout;
    }
    export import asJsValueRef = chakraUtil.asJsValueRef;

    export const Ansi = new ParamableT<string>(
        'Ansi',
        (asm:Maker, target:Target, source:Target, info:ParamInfo)=>{
            asm.qmov_t_t(Target[0], source);
            asm.xor_r_r(Register.r9, Register.r9);
            asm.mov_r_c(Register.r8, chakraUtil.stack_ansi);
            asm.mov_r_c(Register.rdx, info.numberOnUsing);
            asm.call_rp(Register.rdi, 1, makefuncDefines.fn_str_js2np);
            asm.qmov_t_t(target, Target.return);
            asm.useStackAllocator = true;
        },
        (asm:Maker, target:Target, source:Target, info:ParamInfo)=>{
            const temp = target.tempPtr();
            asm.qmov_t_t(Target[0], source);
            asm.lea_r_rp(Register.r8, temp.reg, 1, temp.offset);
            asm.xor_r_r(Register.rdx, Register.rdx);
            asm.call_rp(Register.rdi, 1, makefuncDefines.fn_ansi_np2js);
            asm.throwIfNonZero(info);
            asm.qmov_t_t(target, temp);
        },
        qwordMove
    );

    export const Utf8 = new ParamableT<string>(
        'Utf8',
        (asm:Maker, target:Target, source:Target, info:ParamInfo)=>{
            asm.qmov_t_t(Target[0], source);
            asm.xor_r_r(Register.r9, Register.r9);
            asm.mov_r_c(Register.r8, chakraUtil.stack_utf8);
            asm.mov_r_c(Register.rdx, info.numberOnUsing);
            asm.call_rp(Register.rdi, 1, makefuncDefines.fn_str_js2np);
            asm.qmov_t_t(target, Target.return);
            asm.useStackAllocator = true;
        },
        (asm:Maker, target:Target, source:Target, info:ParamInfo)=>{
            const temp = target.tempPtr();
            asm.qmov_t_t(Target[0], source);
            asm.lea_r_rp(Register.r8, temp.reg, 1, temp.offset);
            asm.xor_r_r(Register.rdx, Register.rdx);
            asm.call_rp(Register.rdi, 1, makefuncDefines.fn_utf8_np2js);
            asm.throwIfNonZero(info);
            asm.qmov_t_t(target, temp);
        },
        qwordMove
    );

    export const Utf16 = new ParamableT<string>(
        'Utf16',
        (asm:Maker, target:Target, source:Target, info:ParamInfo)=>{
            asm.qmov_t_t(Target[0], source);
            asm.mov_r_c(Register.rdx, info.numberOnUsing);
            asm.call_rp(Register.rdi, 1, makefuncDefines.fn_utf16_js2np);
            asm.qmov_t_t(target, Target.return);
        },
        (asm:Maker, target:Target, source:Target, info:ParamInfo)=>{
            asm.qmov_t_t(Target[0], source);
            asm.mov_r_c(Register.rdx, info.numberOnUsing);
            asm.call_rp(Register.rdi, 1, makefuncDefines.fn_utf16_np2js);
            asm.qmov_t_t(target, Target.return);
        },
        qwordMove,
    );

    export const Buffer = new ParamableT<VoidPointer|Bufferable>(
        'Buffer',
        (asm:Maker, target:Target, source:Target, info:ParamInfo)=>{
            asm.qmov_t_t(Target[0], source);
            asm.mov_r_c(Register.rdx, info.numberOnUsing);
            asm.call_rp(Register.rdi, 1, makefuncDefines.fn_buffer_to_pointer);
            asm.qmov_t_t(target, Target.return);
        },
        (asm:Maker, target:Target, source:Target, info:ParamInfo)=>{
            asm.qmov_t_t(Target[0], source);
            asm.mov_r_c(Register.rdx, info.numberOnUsing);
            asm.call_rp(Register.rdi, 1, makefuncDefines.fn_utf16_np2js);
            asm.qmov_t_t(target, Target.return);
        },
        qwordMove
    );

    export const JsValueRef = new ParamableT<any>(
        'JsValueRef',
        qwordMove,
        qwordMove,
        qwordMove
    );
}

const StructureReturnAllocation = new makefunc.ParamableT<VoidPointer>(
    'StructureReturnAllocation',
    abstract,
    abstract,
    qwordMove
);

declare module "./assembler"
{
    interface X64Assembler
    {
        /**
         * asm.alloc + makefunc.js
         * allocates it on the executable memory. and make it as a JS function.
         */
        make<OPTS extends MakeFuncOptions<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
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

VoidPointer[makefunc.js2npAsm] = function(asm:makefunc.Maker, target:makefunc.Target, source:makefunc.Target, info:makefunc.ParamInfo) {
    pointerClassOrThrow(info.numberOnMaking, info.type);
    asm.qmov_t_t(makefunc.Target[0], source);
    asm.call_rp(Register.rdi, 1, makefuncDefines.fn_pointer_js2class);
    asm.test_r_r(Register.rax, Register.rax);
    asm.jz_label('!'); // cannot use cmovnz
    asm.mov_r_rp(Register.rax, Register.rax, 1, 0x10);
    asm.close_label('!');
    asm.qmov_t_t(target, makefunc.Target.return);
};
VoidPointer[makefunc.np2jsAsm] = function(asm:makefunc.Maker, target:makefunc.Target, source:makefunc.Target, info:makefunc.ParamInfo) {
    pointerClassOrThrow(info.numberOnMaking, info.type);
    chakraUtil.JsAddRef(info.type);
    asm.qmov_t_t(makefunc.Target[1], source);
    asm.mov_r_c(Register.rcx, chakraUtil.asJsValueRef(info.type));
    if (info.type[makefunc.nullAlsoInstance] || (info.numberOnUsing === PARAMNUM_RETURN && asm.pi.structureReturn)) {
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_pointer_np2js);
    } else {
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_pointer_np2js_nullable);
    }
    asm.qmov_t_t(target, makefunc.Target.return);
};
VoidPointer[makefunc.np2npAsm] = qwordMove;

VoidPointer.prototype[asm.splitTwo32Bits] = function() {
    return [this.getAddressLow(), this.getAddressHigh()];
};
Uint8Array.prototype[asm.splitTwo32Bits] = function() {
    const ptr = new NativePointer;
    ptr.setAddressFromBuffer(this);
    return [ptr.getAddressLow(), ptr.getAddressHigh()];
};

X64Assembler.prototype.make = function<OPTS extends MakeFuncOptions<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
    this:X64Assembler, returnType:RETURN, opts?:OPTS, ...params:PARAMS):
	FunctionFromTypes_js<StaticPointer, OPTS, PARAMS, RETURN>{
    return makefunc.js(this.alloc(), returnType, opts,  ...params);
};
