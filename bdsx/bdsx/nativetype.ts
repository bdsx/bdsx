
import { proc } from './bds/symbols';
import { CommandParameterType } from './commandparam';
import { abstract, emptyFunc } from './common';
import { AllocatedPointer, StaticPointer, VoidPointer } from './core';
import { makefunc } from './makefunc';
import { mangle } from './mangle';
import { Singleton } from './singleton';

namespace NativeTypeFn {
    export const align = Symbol('align');
    export const ctor = Symbol('ctor');
    export const ctor_copy = Symbol('ctor_copy');
    export const isNativeClass = Symbol('isNativeClass');
    export const descriptor = Symbol('descriptor');
    export const bitGetter = Symbol('bitGetter');
    export const bitSetter = Symbol('bitSetter');
}

/**
 * native type information
 */
export interface Type<T> extends makefunc.Paramable {
    prototype:T;

    name:string;
    symbol:string;

    isTypeOf<V>(this:{prototype:V}, v:unknown):v is V;

    [makefunc.getter](ptr:StaticPointer, offset?:number):any;
    [makefunc.setter](ptr:StaticPointer, value:any, offset?:number):void;
    [NativeTypeFn.ctor]:(ptr:StaticPointer)=>void,
    [makefunc.dtor]:(ptr:StaticPointer)=>void,
    [NativeTypeFn.ctor_copy]:(to:StaticPointer, from:StaticPointer)=>void,
    [makefunc.ctor_move]:(to:StaticPointer, from:StaticPointer)=>void,
    [NativeTypeFn.descriptor](builder:NativeDescriptorBuilder, key:string|number, info:NativeDescriptorBuilder.Info):void;

    /**
     * nullable actually
     */
    [NativeTypeFn.align]:number;
    [NativeTypeFn.isNativeClass]?:true;
}

export type GetFromType<T> =
    T extends Type<any> ?
    T extends {prototype:any} ? T['prototype'] :
    T extends {[makefunc.getter](ptr:StaticPointer, offset?:number):infer RET} ? RET :
    never : never;

function defaultCopy(size:number):(to:StaticPointer, from:StaticPointer)=>void {
    return (to:StaticPointer, from:StaticPointer)=>{
        to.copyFrom(from, size);
    };
}

export class NativeDescriptorBuilder {
    public readonly desc:PropertyDescriptorMap = {};
    public readonly params:unknown[] = [];

    public readonly imports = new Map<unknown, string>();

    public readonly ctor = new NativeDescriptorBuilder.UseContextCtor;
    public readonly dtor = new NativeDescriptorBuilder.UseContextDtor;
    public readonly ctor_copy = new NativeDescriptorBuilder.UseContextCtorCopy;
    public readonly ctor_move = new NativeDescriptorBuilder.UseContextCtorCopy;

    private nameCounter = 0;

    /**
     * @deprecated dummy
     */
    importType(type:Type<any>):string {
        return this.import(type);
    }

    import(type:unknown):string {
        const oname = this.imports.get(type);
        if (oname != null) return oname;

        const name = '_'+(this.nameCounter++).toString(36);
        this.imports.set(type, name);
        return name;
    }
}
export namespace NativeDescriptorBuilder {
    export abstract class UseContext {
        public code = '';
        public used = false;
        public offset = 0;
        public ptrUsed = false;

        setPtrOffset(offset:number):void {
            this.used = true;
            const delta = offset-this.offset;
            if (delta !== 0) this.code += `ptr.move(${delta});\n`;
            this.offset = offset;
        }
    }

    export class UseContextCtor extends UseContext {
    }
    export class UseContextDtor extends UseContext {
    }
    export class UseContextCtorCopy extends UseContext {
        setPtrOffset(offset:number):void {
            this.used = true;
            const delta = offset-this.offset;
            if (delta !== 0) this.code += `ptr.move(${delta});\noptr.move(${delta});\n`;
            this.offset = offset;
        }
    }
    export interface Info {
        offset:number;
        bitmask:[number,number]|null;
        ghost:boolean;
        noInitialize:boolean;
        const:boolean;
    }
}

function numericBitGetter(this:NativeType<number>, ptr:StaticPointer, shift:number, mask:number, offset?:number):number {
    const value = this[makefunc.getter](ptr, offset);
    return (value & mask) >> shift;
}
function numericBitSetter(this:NativeType<number>, ptr:StaticPointer, value:number, shift:number, mask:number, offset?:number):void {
    value = ((value << shift) & mask) | (this[NativeType.getter](ptr, offset) & ~mask);
    this[NativeType.setter](ptr, value, offset);
}

export class NativeType<T> extends makefunc.ParamableT<T> implements Type<T> {
    public static readonly getter:typeof makefunc.getter = makefunc.getter;
    public static readonly setter:typeof makefunc.setter = makefunc.setter;
    public static readonly ctor:typeof NativeTypeFn.ctor = NativeTypeFn.ctor;
    public static readonly dtor:typeof makefunc.dtor = makefunc.dtor;
    public static readonly registerDirect:typeof makefunc.registerDirect = makefunc.registerDirect;
    public static readonly ctor_copy:typeof NativeTypeFn.ctor_copy = NativeTypeFn.ctor_copy;
    public static readonly ctor_move:typeof makefunc.ctor_move = makefunc.ctor_move;
    public static readonly size:typeof makefunc.size = makefunc.size;
    public static readonly align:typeof NativeTypeFn.align = NativeTypeFn.align;
    public static readonly descriptor:typeof NativeTypeFn.descriptor = NativeTypeFn.descriptor;

    public [makefunc.getter]:(this:NativeType<T>, ptr:StaticPointer, offset?:number)=>T;
    public [makefunc.setter]:(this:NativeType<T>, ptr:StaticPointer, v:T, offset?:number)=>void;
    public [NativeTypeFn.ctor]:(this:NativeType<T>, ptr:StaticPointer)=>void;
    public [makefunc.dtor]:(this:NativeType<T>, ptr:StaticPointer)=>void;
    public [makefunc.ctor_move]:(this:NativeType<T>, to:StaticPointer, from:StaticPointer)=>void;
    public [NativeTypeFn.ctor_copy]:(this:NativeType<T>, to:StaticPointer, from:StaticPointer)=>void;
    public [NativeTypeFn.align]:number;
    public [NativeTypeFn.bitGetter]:(this:NativeType<T>, ptr:StaticPointer, shift:number, mask:number, offset?:number)=>T = abstract;
    public [NativeTypeFn.bitSetter]:(this:NativeType<T>, ptr:StaticPointer, value:T, shift:number, mask:number, offset?:number)=>void = abstract;

    constructor(
        /**
         * pdb symbol name. it's used by type_id.pdbimport
         */
        public readonly symbol:string,
        /**
         * name for displaying
         */
        name:string,
        size:number,
        align:number,
        /**
         * js type checker for overloaded functions
         * and parameter checking
         */
        isTypeOf:(v:unknown)=>boolean,
        /**
         * isTypeOf but allow downcasting
         */
        isTypeOfWeak:((v:unknown)=>boolean)|undefined,
        /**
         * getter with the pointer
         */
        get:(ptr:StaticPointer, offset?:number)=>T,
        /**
         * setter with the pointer
         */
        set:(ptr:StaticPointer, v:T, offset?:number)=>void,
        /**
         * assembly for casting the native value to the js value
         */
        getFromParam:(stackptr:StaticPointer, offset?:number)=>T|null = get,
        /**
         * assembly for casting the js value to the native value
         */
        setToParam:(stackptr:StaticPointer, param:T extends VoidPointer ? (T|null) : T, offset?:number)=>void = set as any,
        /**
         * constructor
         */
        ctor:(ptr:StaticPointer)=>void = emptyFunc,
        /**
         * destructor
         */
        dtor:(ptr:StaticPointer)=>void = emptyFunc,
        /**
         * copy constructor, https://en.cppreference.com/w/cpp/language/copy_constructor
         */
        ctor_copy:(to:StaticPointer, from:StaticPointer)=>void = defaultCopy(size),
        /**
         * move constructor, https://en.cppreference.com/w/cpp/language/move_constructor
         * it uses the copy constructor by default
         */
        ctor_move:(to:StaticPointer, from:StaticPointer)=>void = ctor_copy) {
        super(name, getFromParam, setToParam, ctor_move, isTypeOf, isTypeOfWeak);
        this[NativeType.size] = size;
        this[NativeType.align] = align;
        this[NativeType.getter] = get;
        this[NativeType.setter] = set;
        this[NativeType.ctor] = ctor;
        this[NativeType.dtor] = dtor;
        this[NativeType.ctor_copy] = ctor_copy;
        this[NativeType.ctor_move] = ctor_move;
    }

    supportsBitMask():boolean {
        return this[NativeTypeFn.bitGetter] !== abstract;
    }

    extends<FIELDS>(fields?:FIELDS, symbol?:string, name?:string):null extends FIELDS ? NativeType<T> : NativeType<T>&FIELDS {
        const type = this;
        const ntype = new NativeType(
            symbol ?? this.symbol,
            name ?? this.name,
            type[NativeType.size],
            type[NativeType.align],
            type.isTypeOf,
            type.isTypeOfWeak,
            type[NativeType.getter],
            type[NativeType.setter],
            type[makefunc.getFromParam],
            type[makefunc.setToParam],
            type[NativeType.ctor],
            type[NativeType.dtor],
            type[NativeType.ctor_copy],
            type[NativeType.ctor_move],
        );
        if (fields != null) {
            for (const [field, value] of Object.entries(fields)) {
                (ntype as any)[field] = value;
            }
        }
        return ntype as any;
    }

    ref():NativeType<T> {
        return Singleton.newInstance(NativeType, this, ()=>makeReference(this));
    }

    [NativeTypeFn.descriptor](builder:NativeDescriptorBuilder, key:string, info:NativeDescriptorBuilder.Info):void {
        abstract();
    }

    static defaultDescriptor(this:Type<any>, builder:NativeDescriptorBuilder, key:string, info:NativeDescriptorBuilder.Info):void {
        const {offset, bitmask, noInitialize, const: constValue} = info;

        const type = this;
        if (bitmask !== null) {
            if (!(type instanceof NativeType)) throw Error(`${this.name} does not support the bit mask`);
            if (constValue) {
                builder.desc[key] = {
                    configurable: true,
                    get(this: StaticPointer) {
                        const value = type[NativeTypeFn.bitGetter](this, bitmask[0], bitmask[1], offset);
                        Object.defineProperty(this, key, {value});
                        return value;
                    },
                };
            } else {
                builder.desc[key] = {
                    get(this: StaticPointer) { return type[NativeTypeFn.bitGetter](this, bitmask[0], bitmask[1], offset); },
                    set(this: StaticPointer, value:any) { return type[NativeTypeFn.bitSetter](this, value, bitmask[0], bitmask[1], offset); },
                };
            }
        } else {
            if (constValue) {
                builder.desc[key] = {
                    configurable: true,
                    get(this: StaticPointer) {
                        const value = type[NativeType.getter](this, offset);
                        Object.defineProperty(this, key, {value});
                        return value;
                    },
                };
            } else {
                builder.desc[key] = {
                    get(this: StaticPointer) { return type[NativeType.getter](this, offset); },
                    set(this: StaticPointer, value:any) { return type[NativeType.setter](this, value, offset); },
                };
            }
        }

        if (noInitialize) return;
        let ctorbase = (type as any).prototype;
        if (!ctorbase || !(NativeType.ctor in ctorbase)) ctorbase = type;

        const name = builder.importType(type);
        if (ctorbase[NativeType.ctor] !== emptyFunc) {
            builder.ctor.ptrUsed = true;
            builder.ctor.setPtrOffset(offset);
            builder.ctor.code += `${name}[NativeType.ctor](ptr);\n`;
        }
        if (ctorbase[NativeType.dtor] !== emptyFunc) {
            builder.dtor.ptrUsed = true;
            builder.dtor.setPtrOffset(offset);
            builder.dtor.code += `${name}[NativeType.dtor](ptr);\n`;
        }
        builder.ctor_copy.ptrUsed = true;
        builder.ctor_copy.setPtrOffset(offset);
        builder.ctor_copy.code += `${name}[NativeType.ctor_copy](ptr, optr);\n`;
        builder.ctor_move.ptrUsed = true;
        builder.ctor_move.setPtrOffset(offset);
        builder.ctor_move.code += `${name}[NativeType.ctor_move](ptr, optr);\n`;
    }

    static definePointedProperty<KEY extends keyof any, T>(target:{[key in KEY]:T}, key:KEY, pointer:StaticPointer, type:Type<T>):void {
        Object.defineProperty(target, key, {
            get():T {
                return type[NativeType.getter](pointer);
            },
            set(value:T):void {
                return type[NativeType.setter](pointer, value);
            },
        });
    }
}
NativeType.prototype[NativeTypeFn.descriptor] = NativeType.defaultDescriptor;

export class CommandParameterNativeType<T> extends NativeType<T> {
    readonly [CommandParameterType.symbol]:true;
}

function makeReference<T>(type:NativeType<T>):NativeType<T> {
    return new NativeType<T>(
        `${type.symbol} * __ptr64`,
        `${type.name}*`,
        8, 8,
        type.isTypeOf,
        type.isTypeOfWeak,
        (ptr, offset)=>type[NativeType.getter](ptr.getPointer(offset)),
        (ptr, v, offset)=>type[NativeType.setter](ptr.getPointer(), v, offset),
        undefined, // same with getter
        (stackptr, param, offset)=>stackptr.setPointer(makefunc.tempValue(type, param), offset),
    );
}

declare module './core' {
    interface VoidPointerConstructor {
        symbol:string;
        [NativeType.align]:number;
        [NativeType.ctor](ptr:StaticPointer):void;
        [NativeType.dtor](ptr:StaticPointer):void;
        [NativeType.ctor_copy](to:StaticPointer, from:StaticPointer):void;
        [NativeType.ctor_move](to:StaticPointer, from:StaticPointer):void;
        [NativeType.descriptor](builder:NativeDescriptorBuilder, key:string, info:NativeDescriptorBuilder.Info):void;
    }
}

VoidPointer.symbol = 'PEAX';
VoidPointer[NativeType.align] = 8;
VoidPointer[NativeType.ctor] = emptyFunc;
VoidPointer[NativeType.dtor] = emptyFunc;
VoidPointer[NativeType.ctor_copy] = function(to:StaticPointer, from:StaticPointer):void{
    to.copyFrom(from, 8);
};
VoidPointer[NativeType.ctor_move] = function(to:StaticPointer, from:StaticPointer):void{
    this[NativeType.ctor_copy](to, from);
};
VoidPointer[NativeType.descriptor] = NativeType.defaultDescriptor;

function isNumber(v:unknown):v is number {
    return typeof v === 'number';
}

function int32To64(ptr:StaticPointer, v:unknown, offset?:number):void {
    ptr.setInt32To64WithZero(v as any, offset);
}

export const void_t = new NativeType<void>(
    'X', 'void_t',
    0, 1,
    v=>v === undefined,
    undefined,
    emptyFunc,
    emptyFunc,
    emptyFunc,
    emptyFunc,
    emptyFunc);
export type void_t = void;
export const bool_t = new CommandParameterNativeType<boolean>(
    '_N', 'bool_t',
    1, 1,
    v=>typeof v === 'boolean',
    undefined,
    (ptr, offset)=>ptr.getBoolean(offset),
    (ptr, v, offset)=>ptr.setBoolean(v, offset),
    undefined,
    int32To64);
export type bool_t = boolean;
bool_t[NativeTypeFn.bitGetter] = (ptr, shift, mask, offset)=>{
    const value = ptr.getUint8(offset);
    return (value & mask) !== 0;
};
bool_t[NativeTypeFn.bitSetter] = (ptr, value, shift, mask, offset)=>{
    const nvalue = ((+value) << shift) | (ptr.getUint8(offset) & ~mask);
    ptr.setUint8(nvalue, offset);
};
export const uint8_t = new NativeType<number>(
    'E', 'uint8_t',
    1, 1,
    v=>typeof v === 'number' && (v|0) === v && 0 <= v && v <= 0xff,
    isNumber,
    (ptr, offset)=>ptr.getUint8(offset),
    (ptr, v, offset)=>ptr.setUint8(v, offset),
    undefined,
    int32To64);
export type uint8_t = number;
uint8_t[NativeTypeFn.bitGetter] = numericBitGetter;
uint8_t[NativeTypeFn.bitSetter] = numericBitSetter;
export const uint16_t = new NativeType<number>(
    'G', 'uint16_t',
    2, 2,
    v=>typeof v === 'number' && (v|0) === v && 0 <= v && v <= 0xffff,
    isNumber,
    (ptr, offset)=>ptr.getUint16(offset),
    (ptr, v, offset)=>ptr.setUint16(v, offset),
    undefined,
    int32To64);
export type uint16_t = number;
uint16_t[NativeTypeFn.bitGetter] = numericBitGetter;
uint16_t[NativeTypeFn.bitSetter] = numericBitSetter;
export const uint32_t = new NativeType<number>(
    'I', 'uint32_t',
    4, 4,
    v=>typeof v === 'number' && (v>>>0) === v,
    isNumber,
    (ptr, offset)=>ptr.getUint32(offset),
    (ptr, v, offset)=>ptr.setUint32(v, offset),
    undefined,
    int32To64);
export type uint32_t = number;
uint32_t[NativeTypeFn.bitGetter] = numericBitGetter;
uint32_t[NativeTypeFn.bitSetter] = numericBitSetter;
export const ulong_t = new NativeType<number>(
    'K', 'ulong_t',
    4, 4,
    v=>typeof v === 'number' && (v>>>0) === v,
    isNumber,
    (ptr, offset)=>ptr.getUint32(offset),
    (ptr, v, offset)=>ptr.setUint32(v, offset),
    undefined,
    int32To64);
export type ulong_t = number;
ulong_t[NativeTypeFn.bitGetter] = numericBitGetter;
ulong_t[NativeTypeFn.bitSetter] = numericBitSetter;
export const uint64_as_float_t = new NativeType<number>(
    '_K', 'uint64_as_float_t',
    8, 8,
    v=>typeof v === 'number' && Math.round(v) === v && 0 <= v && v < 0x10000000000000000,
    isNumber,
    (ptr, offset)=>ptr.getUint64AsFloat(offset),
    (ptr, v, offset)=>ptr.setUint64WithFloat(v, offset));
export type uint64_as_float_t = number;
export const int8_t = new NativeType<number>(
    'D', 'int8_t',
    1, 1,
    v=>typeof v === 'number' && (v|0) === v && -0x80 <= v && v <= 0x7f,
    isNumber,
    (ptr, offset)=>ptr.getInt8(offset),
    (ptr, v, offset)=>ptr.setInt8(v, offset),
    undefined,
    int32To64);
export type int8_t = number;
int8_t[NativeTypeFn.bitGetter] = numericBitGetter;
int8_t[NativeTypeFn.bitSetter] = numericBitSetter;
export const int16_t = new NativeType<number>(
    'F', 'int16_t',
    2, 2,
    v=>typeof v === 'number' && (v|0) === v && -0x8000 <= v && v <= 0x7fff,
    isNumber,
    (ptr, offset)=>ptr.getInt16(offset),
    (ptr, v, offset)=>ptr.setInt16(v, offset),
    undefined,
    int32To64);
export type int16_t = number;
int16_t[NativeTypeFn.bitGetter] = numericBitGetter;
int16_t[NativeTypeFn.bitSetter] = numericBitSetter;
export const int32_t = new CommandParameterNativeType<number>(
    'H', 'int32_t',
    4, 4,
    v=>typeof v === 'number' && (v|0) === v,
    isNumber,
    (ptr, offset)=>ptr.getInt32(offset),
    (ptr, v, offset)=>ptr.setInt32(v, offset),
    undefined,
    int32To64);
export type int32_t = number;
int32_t[NativeTypeFn.bitGetter] = numericBitGetter;
int32_t[NativeTypeFn.bitSetter] = numericBitSetter;
export const long_t = new NativeType<number>(
    'J', 'long_t',
    4, 4,
    v=>typeof v === 'number' && (v|0) === v,
    isNumber,
    (ptr, offset)=>ptr.getInt32(offset),
    (ptr, v, offset)=>ptr.setInt32(v, offset),
    undefined,
    int32To64);
export type long_t = number;
long_t[NativeTypeFn.bitGetter] = numericBitGetter;
long_t[NativeTypeFn.bitSetter] = numericBitSetter;
export const int64_as_float_t = new NativeType<number>(
    '_J', 'int64_as_float_t',
    8, 8,
    v=>typeof v === 'number' && Math.round(v) === v && -0x8000000000000000 <= v && v < 0x8000000000000000,
    isNumber,
    (ptr, offset)=>ptr.getInt64AsFloat(offset),
    (ptr, v, offset)=>ptr.setInt64WithFloat(v, offset),
    undefined,
    int32To64);
export type int64_as_float_t = number;

export const float32_t = new CommandParameterNativeType<number>(
    'M', 'float32_t',
    4, 4,
    isNumber,
    isNumber,
    (ptr, offset)=>ptr.getFloat32(offset),
    (ptr, v, offset)=>ptr.setFloat32(v, offset),
    undefined,
    (stackptr, param, offset)=>stackptr.setFloat32To64WithZero(param, offset));
export type float32_t = number;
float32_t[makefunc.useXmmRegister] = true;
export const float64_t = new NativeType<number>(
    'N', 'float64_t',
    8, 8,
    isNumber,
    isNumber,
    (ptr, offset)=>ptr.getFloat64(offset),
    (ptr, v, offset)=>ptr.setFloat64(v, offset));
export type float64_t = number;
float64_t[makefunc.useXmmRegister] = true;

const string_ctor = makefunc.js(proc['??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ'], void_t, null, VoidPointer);
const string_dtor = makefunc.js(proc['?_Tidy_deallocate@?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAAXXZ'], void_t, null, VoidPointer);

const strbufCache:AllocatedPointer[] = [];

export const CxxString = new CommandParameterNativeType<string>(
    'V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@', 'CxxString',
    0x20, 8,
    v=>typeof v === 'string',
    undefined,
    (ptr, offset)=>ptr.getCxxString(offset),
    (ptr, v, offset)=>ptr.setCxxString(v, offset),
    (stackptr, offset)=>{
        const ptr = stackptr.getPointer(offset);
        return ptr.getCxxString();
    },
    (stackptr, param, offset)=>{
        const buf = strbufCache.pop() || new AllocatedPointer(0x20);
        string_ctor(buf);
        buf.setCxxString(param);
        makefunc.temporalDtors.push(()=>{
            string_dtor(buf);
            if (strbufCache.length < 8) {
                strbufCache.push(buf);
            }
        });
        stackptr.setPointer(buf, offset);
    },
    string_ctor,
    string_dtor,
    (to, from)=>{
        string_ctor(to);
        to.setCxxString(from.getCxxString());
    }, (to, from)=>{
        to.copyFrom(from, 0x20);
        string_ctor(from);
    });
export type CxxString = string;

function impossible():never {
    throw Error(`Impossible to set`);
}

export const GslStringSpan = new NativeType<string>(
    'gsl::basic_string_span<char const,-1>', 'GslStringSpan',
    0x10, 8,
    v=>typeof v === 'string',
    undefined,
    (ptr, offset)=>{
        const length = ptr.getInt64AsFloat(offset);
        return ptr.getPointer((offset||0)+8).getString(length);
    },
    impossible,
    (stackptr, offset)=>{
        const strptr = stackptr.getPointer(offset);
        const length = strptr.getInt64AsFloat(0);
        return strptr.getPointer(8).getString(length);
    },
    (stackptr, param, offset)=>{
        const str = Buffer.from(param, 'utf8');
        const buf = new AllocatedPointer(0x10);
        buf.setPointer(VoidPointer.fromAddressBuffer(str), 8);
        buf.setInt64WithFloat(str.length, 0);
        makefunc.temporalKeeper.push(buf, str);
        stackptr.setPointer(buf, offset);
    },
);
export type GslStringSpan = string;

export const bin64_t = new NativeType<string>(
    'unsigned __int64', 'bin64_t',
    8, 8,
    v=>typeof v === 'string' && v.length === 4,
    undefined,
    (ptr, offset)=>ptr.getBin64(offset),
    (ptr, v, offset)=>ptr.setBin(v, offset),
).extends({
    one:'\u0001\0\0\0',
    zero:'\0\0\0\0',
    minus_one:'\uffff\uffff\uffff\uffff',
});
export type bin64_t = string;

function bin128CannotBeUsedAsTheParameterType():never {
    throw Error('bin128_t cannot be used as the parameter type');
}
export const bin128_t = new NativeType<string>(
    'unsigned __int128', 'bin128_t',
    16, 8,
    v=>typeof v === 'string' && v.length === 8,
    undefined,
    (ptr, offset)=>ptr.getBin(8, offset),
    (ptr, v, offset)=>ptr.setBin(v, offset),
    bin128CannotBeUsedAsTheParameterType,
    bin128CannotBeUsedAsTheParameterType,
).extends({
    one:'\u0001\0\0\0',
    zero:'\0\0\0\0',
    minus_one:'\uffff\uffff\uffff\uffff',
});
export type bin128_t = string;

/** @deprecated for legacy support */
export const CxxStringWith8Bytes = CxxString.extends();
CxxStringWith8Bytes[NativeType.size] = 0x28;
export type CxxStringWith8Bytes = string;

function getSpanSymbol(type:Type<any>):string {
    return mangle.templateClass(['gsl', 'span'], type, '-1');
}

export class GslSpanToArray<T> extends NativeType<T[]> {
    private constructor(public readonly compType:Type<T>) {
        super(getSpanSymbol(compType), `GslSpanToArray<${compType.name}>`, 0x10, 8,
            v=>v instanceof Array,
            undefined,
            (ptr, offset)=>{
                const length = ptr.getInt64AsFloat(offset);
                const out:T[] = new Array(length);
                const compptr = ptr.getPointer(offset == null ? 8 : offset+8);
                const compsize = this.compType[makefunc.size];
                for (let i=0,compoffset=0; i!==length; i++,compoffset+=compsize) {
                    out[i] = this.compType[makefunc.getter](compptr, compoffset);
                }
                return out;
            },
            impossible,
            (stackptr, offset)=>this[NativeType.getter](stackptr.getPointer(offset)),
            (stackptr, array, offset)=>{
                const compsize = this.compType[makefunc.size];
                const buf = new AllocatedPointer(array.length * compsize);
                makefunc.temporalKeeper.push(buf);
                let compoffset = 0;
                for (const comp of array) {
                    this.compType[makefunc.setter](buf, comp, compoffset);
                    compoffset += compsize;
                }
                stackptr.setPointer(buf, offset);
            },
            ptr=>ptr.fill(0, 0x10),
        );
    }

    static make<T>(compType:Type<T>):GslSpanToArray<T> {
        return Singleton.newInstance<GslSpanToArray<T>>(GslSpanToArray, compType, ()=>new GslSpanToArray<T>(compType));
    }
}
