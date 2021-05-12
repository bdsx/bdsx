
import { OperationSize, Register } from './assembler';
import { proc, proc2 } from './bds/symbols';
import { abstract, emptyFunc } from './common';
import { chakraUtil, StaticPointer, VoidPointer } from './core';
import { makefunc } from './makefunc';
import { makefuncDefines } from './makefunc_defines';
import { Singleton } from './singleton';

namespace NativeTypeFn {
    export const size = Symbol('size');
    export const align = Symbol('align');
    export const getter = Symbol('getter');
    export const setter = Symbol('setter');
    export const ctor = Symbol('ctor');
    export const dtor = Symbol('dtor');
    export const ctor_copy = Symbol('ctor_copy');
    export const ctor_move = Symbol('ctor_move');
    export const isNativeClass = Symbol('isNativeClass');
    export const descriptor = Symbol('descriptor');
    export const bitGetter = Symbol('bitGetter');
    export const bitSetter = Symbol('bitSetter');
}

/**
 * native type information
 */
export interface Type<T> extends makefunc.Paramable {
    name:string;
    isTypeOf(v:unknown):v is T;

    [NativeTypeFn.getter](ptr:StaticPointer, offset?:number):T;
    [NativeTypeFn.setter](ptr:StaticPointer, value:T, offset?:number):void;
    [NativeTypeFn.ctor]:(ptr:StaticPointer)=>void,
    [NativeTypeFn.dtor]:(ptr:StaticPointer)=>void,
    [NativeTypeFn.ctor_copy]:(to:StaticPointer, from:StaticPointer)=>void,
    [NativeTypeFn.ctor_move]:(to:StaticPointer, from:StaticPointer)=>void,
    [NativeTypeFn.descriptor](builder:NativeDescriptorBuilder, key:string|number, offset:number, bitmask:[number, number]|null):void;

    /**
     * nullable actually
     */
    [NativeTypeFn.size]:number;
    [NativeTypeFn.align]:number;
    [NativeTypeFn.isNativeClass]?:true;
}

export type GetFromType<T> =
    T extends Type<any> ?
    T extends {prototype:any} ? T['prototype'] :
    T extends {[NativeTypeFn.getter](ptr:StaticPointer, offset?:number):infer RET} ? RET :
    never : never;

function defaultCopy(size:number):(to:StaticPointer, from:StaticPointer)=>void {
    return (to:StaticPointer, from:StaticPointer)=>{
        to.copyFrom(from, size);
    };
}

export class NativeDescriptorBuilder {
    public readonly desc:PropertyDescriptorMap = {};
    public readonly params:unknown[] = [];

    public readonly ctor = new NativeDescriptorBuilder.UseContextCtor;
    public readonly dtor = new NativeDescriptorBuilder.UseContextDtor;
    public readonly ctor_copy = new NativeDescriptorBuilder.UseContextCtorCopy;
}
export namespace NativeDescriptorBuilder {
    export abstract class UseContext {
        public code = '';
        protected _use = false;
        public offset = 0;

        protected abstract initUse():void;

        setPtrOffset(offset:number):void {
            if (!this._use) {
                this._use = true;
                this.initUse();
            }
            const delta = offset-this.offset;
            if (delta !== 0) this.code += `ptr.move(${delta});\n`;
            this.offset = offset;
        }
    }

    export class UseContextCtor extends UseContext {
        protected initUse(): void {
            this.code += `const ptr = this.add();\n`;
        }
    }
    export class UseContextDtor extends UseContext {
        protected initUse(): void {
            this.code += `const ptr = this.add();\n`;
        }
    }
    export class UseContextCtorCopy extends UseContext {
        setPtrOffset(offset:number):void {
            if (!this._use) {
                this._use = true;
                this.initUse();
            }
            const delta = offset-this.offset;
            if (delta !== 0) this.code += `ptr.move(${delta});\noptr.move(${delta});\n`;
            this.offset = offset;
        }
        protected initUse(): void {
            this.code += `const ptr = this.add();\nconst optr = o.add();\n`;
        }
    }
}

function numericBitGetter(this:NativeType<number>, ptr:StaticPointer, shift:number, mask:number, offset?:number):number {
    const value = this[NativeType.getter](ptr, offset);
    return (value & mask) >> shift;
}
function numericBitSetter(this:NativeType<number>, ptr:StaticPointer, value:number, shift:number, mask:number, offset?:number):void {
    value = ((value << shift) & mask) | (this[NativeType.getter](ptr, offset) & ~mask);
    this[NativeType.setter](ptr, value, offset);
}

export class NativeType<T> extends makefunc.ParamableT<T> implements Type<T> {
    public static readonly getter:typeof NativeTypeFn.getter = NativeTypeFn.getter;
    public static readonly setter:typeof NativeTypeFn.setter = NativeTypeFn.setter;
    public static readonly ctor:typeof NativeTypeFn.ctor = NativeTypeFn.ctor;
    public static readonly dtor:typeof NativeTypeFn.dtor = NativeTypeFn.dtor;
    public static readonly ctor_copy:typeof NativeTypeFn.ctor_copy = NativeTypeFn.ctor_copy;
    public static readonly ctor_move:typeof NativeTypeFn.ctor_move = NativeTypeFn.ctor_move;
    public static readonly size:typeof NativeTypeFn.size = NativeTypeFn.size;
    public static readonly align:typeof NativeTypeFn.align = NativeTypeFn.align;
    public static readonly descriptor:typeof NativeTypeFn.descriptor = NativeTypeFn.descriptor;

    public [NativeTypeFn.getter]:(this:NativeType<T>, ptr:StaticPointer, offset?:number)=>T;
    public [NativeTypeFn.setter]:(this:NativeType<T>, ptr:StaticPointer, v:T, offset?:number)=>void;
    public [NativeTypeFn.ctor]:(this:NativeType<T>, ptr:StaticPointer)=>void;
    public [NativeTypeFn.dtor]:(this:NativeType<T>, ptr:StaticPointer)=>void;
    public [NativeTypeFn.ctor_move]:(this:NativeType<T>, to:StaticPointer, from:StaticPointer)=>void;
    public [NativeTypeFn.ctor_copy]:(this:NativeType<T>, to:StaticPointer, from:StaticPointer)=>void;
    public [NativeTypeFn.size]:number;
    public [NativeTypeFn.align]:number;
    public [makefunc.js2npAsm]:(this:NativeType<T>, asm:makefunc.Maker, target: makefunc.Target, source: makefunc.Target, info:makefunc.ParamInfo)=>void;
    public [makefunc.np2jsAsm]:(this:NativeType<T>, asm:makefunc.Maker, target: makefunc.Target, source: makefunc.Target, info:makefunc.ParamInfo)=>void;
    public [makefunc.np2npAsm]:(this:NativeType<T>, asm:makefunc.Maker, target: makefunc.Target, source: makefunc.Target, info:makefunc.ParamInfo)=>void;
    public [makefunc.js2npLocalSize]:number;
    public [NativeTypeFn.bitGetter]:(this:NativeType<T>, ptr:StaticPointer, shift:number, mask:number, offset?:number)=>T = abstract;
    public [NativeTypeFn.bitSetter]:(this:NativeType<T>, ptr:StaticPointer, value:T, shift:number, mask:number, offset?:number)=>void = abstract;
    public isTypeOf:(v:unknown)=>v is T;

    constructor(
        name:string,
        size:number,
        align:number,
        isTypeOf:(v:unknown)=>boolean,
        get:(ptr:StaticPointer, offset?:number)=>T,
        set:(ptr:StaticPointer, v:T, offset?:number)=>void,
        js2npAsm:(asm:makefunc.Maker, target: makefunc.Target, source: makefunc.Target, info:makefunc.ParamInfo)=>void,
        np2jsAsm:(asm:makefunc.Maker, target: makefunc.Target, source: makefunc.Target, info:makefunc.ParamInfo)=>void,
        np2npAsm:(asm:makefunc.Maker, target: makefunc.Target, source: makefunc.Target, info:makefunc.ParamInfo)=>void,
        ctor:(ptr:StaticPointer)=>void = emptyFunc,
        dtor:(ptr:StaticPointer)=>void = emptyFunc,
        ctor_copy:(to:StaticPointer, from:StaticPointer)=>void = defaultCopy(size),
        ctor_move:(to:StaticPointer, from:StaticPointer)=>void = ctor_copy) {
        super(name, js2npAsm, np2jsAsm, np2npAsm);
        this[NativeType.size] = size;
        this[NativeType.align] = align;
        this.isTypeOf = isTypeOf as any;
        this[NativeType.getter] = get;
        this[NativeType.setter] = set;
        this[NativeType.ctor] = ctor;
        this[NativeType.dtor] = dtor;
        this[NativeType.ctor_copy] = ctor_copy;
        this[NativeType.ctor_move] = ctor_move;
        this[makefunc.js2npLocalSize] = size;
    }

    supportsBitMask():boolean {
        return this[NativeTypeFn.bitGetter] !== abstract;
    }

    extends<FIELDS>(fields?:FIELDS, name?:string):NativeType<T>&FIELDS {
        const type = this;
        const ntype = new NativeType(
            name ?? this.name,
            type[NativeType.size],
            type[NativeType.align],
            type.isTypeOf,
            type[NativeType.getter],
            type[NativeType.setter],
            type[makefunc.js2npAsm],
            type[makefunc.np2jsAsm],
            type[makefunc.np2npAsm],
            type[NativeType.ctor],
            type[NativeType.dtor],
            type[NativeType.ctor_copy],
            type[NativeType.ctor_move],
        );
        if (fields) {
            for (const field in fields) {
                (ntype as any)[field] = fields[field];
            }
        }
        return ntype as any;
    }

    ref():NativeType<T> {
        return Singleton.newInstance(NativeType, this, ()=>makeReference(this));
    }

    [NativeTypeFn.descriptor](builder:NativeDescriptorBuilder, key:string, offset:number, mask:[number, number]|null):void {
        abstract();
    }

    static defaultDescriptor(this:Type<any>, builder:NativeDescriptorBuilder, key:string, offset:number, bitmask:[number, number]|null):void {
        const type = this;
        if (bitmask !== null) {
            if (!(type instanceof NativeType)) throw Error(`${this.name} does not support the bit mask`);
            builder.desc[key] = {
                get(this: StaticPointer) { return type[NativeTypeFn.bitGetter](this, bitmask[0], bitmask[1], offset); },
                set(this: StaticPointer, value:any) { return type[NativeTypeFn.bitSetter](this, value, bitmask[0], bitmask[1], offset); }
            };
        } else {
            builder.desc[key] = {
                get(this: StaticPointer) { return type[NativeType.getter](this, offset); },
                set(this: StaticPointer, value:any) { return type[NativeType.setter](this, value, offset); }
            };
        }
        let ctorbase = (type as any).prototype;
        if (!ctorbase || !(NativeType.ctor in ctorbase)) ctorbase = type;

        const typeidx = builder.params.push(type)-1;
        if (ctorbase[NativeType.ctor] !== emptyFunc) {
            builder.ctor.setPtrOffset(offset);
            builder.ctor.code += `types[${typeidx}][NativeType.ctor](ptr);\n`;
        }
        if (ctorbase[NativeType.dtor] !== emptyFunc) {
            builder.dtor.setPtrOffset(offset);
            builder.dtor.code += `types[${typeidx}][NativeType.dtor](ptr);\n`;
        }
        builder.ctor_copy.setPtrOffset(offset);
        builder.ctor_copy.code += `types[${typeidx}][NativeType.ctor_copy](ptr, optr);\n`;
    }

    static definePointedProperty<KEY extends keyof any, T>(target:{[key in KEY]:T}, key:KEY, pointer:StaticPointer, type:Type<T>):void {
        Object.defineProperty(target, key, {
            get():T {
                return type[NativeType.getter](pointer);
            },
            set(value:T):void {
                return type[NativeType.setter](pointer, value);
            }
        });
    }
}
NativeType.prototype[NativeTypeFn.descriptor] = NativeType.defaultDescriptor;

function makeReference<T>(type:NativeType<T>):NativeType<T> {
    return new NativeType<T>(
        `${type.name}*`,
        8, 8,
        type.isTypeOf,
        (ptr)=>type[NativeType.getter](ptr.getPointer()),
        (ptr, v)=>type[NativeType.setter](ptr.getPointer(), v),
        type[makefunc.js2npAsm],
        type[makefunc.np2jsAsm],
        type[makefunc.np2npAsm],
    );
}


declare module './core'
{
    interface VoidPointerConstructor
    {
        [NativeType.size]:number;
        [NativeType.align]:number;
        [NativeType.getter]<THIS extends VoidPointer>(this:{new(ptr?:VoidPointer):THIS}, ptr:StaticPointer, offset?:number):THIS;
        [NativeType.setter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, value:VoidPointer, offset?:number):void;
        [NativeType.ctor](ptr:StaticPointer):void;
        [NativeType.dtor](ptr:StaticPointer):void;
        [NativeType.ctor_copy](to:StaticPointer, from:StaticPointer):void;
        [NativeType.ctor_move](to:StaticPointer, from:StaticPointer):void;
        [NativeType.descriptor](builder:NativeDescriptorBuilder, key:string, offset:number, bitmask:[number, number]|null):void;
        isTypeOf<T>(this:{new():T}, v:unknown):v is T;
    }
}

VoidPointer[NativeType.size] = 8;
VoidPointer[NativeType.align] = 8;
VoidPointer[NativeType.getter] = function<THIS extends VoidPointer>(this:{new(ptr?:VoidPointer):THIS}, ptr:StaticPointer, offset?:number):THIS{
    return ptr.getPointerAs(this, offset);
};
VoidPointer[NativeType.setter] = function<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, value:VoidPointer, offset?:number):void{
    ptr.setPointer(value, offset);
};
VoidPointer[NativeType.ctor] = emptyFunc;
VoidPointer[NativeType.dtor] = emptyFunc;
VoidPointer[NativeType.ctor_copy] = function(to:StaticPointer, from:StaticPointer):void{
    to.copyFrom(from, 8);
};
VoidPointer[NativeType.ctor_move] = function(to:StaticPointer, from:StaticPointer):void{
    this[NativeType.ctor_copy](to, from);
};
VoidPointer[NativeType.descriptor] = NativeType.defaultDescriptor;
VoidPointer.isTypeOf = function<T>(this:{new():T}, v:unknown):v is T {
    return v instanceof this;
};

const undefValueRef = chakraUtil.asJsValueRef(undefined);

export const void_t = new NativeType<void>(
    'void',
    0, 1,
    v=>v === undefined,
    emptyFunc,
    emptyFunc,
    emptyFunc,
    (asm:makefunc.Maker, target:makefunc.Target, source:makefunc.Target, info:makefunc.ParamInfo)=>{
        if (info.numberOnUsing !== -1) throw Error(`void_t cannot be the parameter`);
        asm.qmov_t_c(target, undefValueRef);
    },
    emptyFunc);
Object.freeze(void_t);
export type void_t = void;
export const bool_t = new NativeType<boolean>(
    'bool',
    1, 1,
    v=>v === undefined,
    (ptr, offset)=>ptr.getBoolean(offset),
    (ptr, v, offset)=>ptr.setBoolean(v, offset),
    (asm, target, source, info)=>{
        const temp = target.tempPtr();
        asm.qmov_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsBooleanToBool);
        asm.throwIfNonZero(info);
        asm.mov_t_t(target, temp, OperationSize.byte);
    },
    (asm, target, source, info)=>{
        const temp = target.tempPtr();
        asm.mov_t_t(makefunc.Target[0], source, OperationSize.byte);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsBoolToBoolean);
        asm.throwIfNonZero(info);
        asm.qmov_t_t(target, temp);
    },
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.byte));
export type bool_t = boolean;
bool_t[NativeTypeFn.bitGetter] = (ptr, shift, mask, offset)=>{
    const value = ptr.getUint8(offset);
    return (value & mask) !== 0;
};
bool_t[NativeTypeFn.bitSetter] = (ptr, value, shift, mask, offset)=>{
    const nvalue = ((+value) << shift) | (ptr.getUint8(offset) & ~mask);
    ptr.setUint8(nvalue, offset);
};
Object.freeze(bool_t);
export const uint8_t = new NativeType<number>(
    'unsigned char',
    1, 1,
    v=>typeof v === 'number' && (v|0) === v && 0 <= v && v <= 0xff,
    (ptr, offset)=>ptr.getInt8(offset),
    (ptr, v, offset)=>ptr.setInt8(v, offset),
    (asm, target, source, info)=>asm.jsNumberToInt(target, source, OperationSize.byte, info),
    (asm, target, source, info)=>asm.jsIntToNumber(target, source, OperationSize.byte, info, false),
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.byte));
export type uint8_t = number;
uint8_t[NativeTypeFn.bitGetter] = numericBitGetter;
uint8_t[NativeTypeFn.bitSetter] = numericBitSetter;
Object.freeze(uint8_t);
export const uint16_t = new NativeType<number>(
    'unsigned short',
    2, 2,
    v=>typeof v === 'number' && (v|0) === v && 0 <= v && v <= 0xffff,
    (ptr, offset)=>ptr.getInt16(offset),
    (ptr, v, offset)=>ptr.setInt16(v, offset),
    (asm, target, source, info)=>asm.jsNumberToInt(target, source, OperationSize.word, info),
    (asm, target, source, info)=>asm.jsIntToNumber(target, source, OperationSize.word, info, false),
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.word));
export type uint16_t = number;
uint16_t[NativeTypeFn.bitGetter] = numericBitGetter;
uint16_t[NativeTypeFn.bitSetter] = numericBitSetter;
Object.freeze(uint16_t);
export const uint32_t = new NativeType<number>(
    'unsigned int',
    4, 4,
    v=>typeof v === 'number' && (v>>>0) === v,
    (ptr, offset)=>ptr.getUint32(offset),
    (ptr, v, offset)=>ptr.setUint32(v, offset),
    (asm, target, source, info)=>asm.jsNumberToInt(target, source, OperationSize.dword, info),
    (asm, target, source, info)=>asm.jsIntToNumber(target, source, OperationSize.dword, info, false),
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.dword));
export type uint32_t = number;
uint32_t[NativeTypeFn.bitGetter] = numericBitGetter;
uint32_t[NativeTypeFn.bitSetter] = numericBitSetter;
Object.freeze(uint32_t);
export const ulong_t = new NativeType<number>(
    'unsigned long',
    4, 4,
    v=>typeof v === 'number' && (v>>>0) === v,
    (ptr, offset)=>ptr.getUint32(offset),
    (ptr, v, offset)=>ptr.setUint32(v, offset),
    (asm, target, source, info)=>asm.jsNumberToInt(target, source, OperationSize.dword, info),
    (asm, target, source, info)=>asm.jsIntToNumber(target, source, OperationSize.dword, info, false),
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.dword));
export type ulong_t = number;
ulong_t[NativeTypeFn.bitGetter] = numericBitGetter;
ulong_t[NativeTypeFn.bitSetter] = numericBitSetter;
Object.freeze(ulong_t);
export const uint64_as_float_t = new NativeType<number>(
    'unsigned __int64',
    8, 8,
    v=>typeof v === 'number' && Math.round(v) === v && 0 <= v && v < 0x10000000000000000,
    (ptr, offset)=>ptr.getUint64AsFloat(offset),
    (ptr, v, offset)=>ptr.setUint64WithFloat(v, offset),
    (asm, target, source, info)=>{
        // TODO: negative number to higher number
        const temp = target.tempPtr();
        asm.qmov_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsNumberToDouble);
        asm.throwIfNonZero(info);
        asm.cvttsd2si_t_t(target, temp);
    },
    (asm, target, source, info)=>{
        const temp = target.tempPtr();
        asm.cvtsi2sd_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsDoubleToNumber);
        asm.throwIfNonZero(info);
        asm.qmov_t_t(target, temp);
        // TODO: negative number to zero
    },
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.qword));
export type uint64_as_float_t = number;
Object.freeze(uint64_as_float_t);
export const int8_t = new NativeType<number>(
    'char',
    1, 1,
    v=>typeof v === 'number' && (v|0) === v && -0x80 <= v && v <= 0x7f,
    (ptr, offset)=>ptr.getUint8(offset),
    (ptr, v, offset)=>ptr.setUint8(v, offset),
    (asm, target, source, info)=>asm.jsNumberToInt(target, source, OperationSize.byte, info),
    (asm, target, source, info)=>asm.jsIntToNumber(target, source, OperationSize.byte, info, true),
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.byte));
export type int8_t = number;
int8_t[NativeTypeFn.bitGetter] = numericBitGetter;
int8_t[NativeTypeFn.bitSetter] = numericBitSetter;
Object.freeze(int8_t);
export const int16_t = new NativeType<number>(
    'short',
    2, 2,
    v=>typeof v === 'number' && (v|0) === v && -0x8000 <= v && v <= 0x7fff,
    (ptr, offset)=>ptr.getUint16(offset),
    (ptr, v, offset)=>ptr.setUint16(v, offset),
    (asm, target, source, info)=>asm.jsNumberToInt(target, source, OperationSize.word, info),
    (asm, target, source, info)=>asm.jsIntToNumber(target, source, OperationSize.word, info, true),
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.word));
export type int16_t = number;
int16_t[NativeTypeFn.bitGetter] = numericBitGetter;
int16_t[NativeTypeFn.bitSetter] = numericBitSetter;
Object.freeze(int16_t);
export const int32_t = new NativeType<number>(
    'int',
    4, 4,
    v=>typeof v === 'number' && (v|0) === v,
    (ptr, offset)=>ptr.getInt32(offset),
    (ptr, v, offset)=>ptr.setInt32(v, offset),
    (asm, target, source, info)=>asm.jsNumberToInt(target, source, OperationSize.dword, info),
    (asm, target, source, info)=>asm.jsIntToNumber(target, source, OperationSize.dword, info, true),
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.dword));
export type int32_t = number;
int32_t[NativeTypeFn.bitGetter] = numericBitGetter;
int32_t[NativeTypeFn.bitSetter] = numericBitSetter;
Object.freeze(int32_t);
export const long_t = new NativeType<number>(
    'long',
    4, 4,
    v=>typeof v === 'number' && (v|0) === v,
    (ptr, offset)=>ptr.getInt32(offset),
    (ptr, v, offset)=>ptr.setInt32(v, offset),
    (asm, target, source, info)=>asm.jsNumberToInt(target, source, OperationSize.dword, info),
    (asm, target, source, info)=>asm.jsIntToNumber(target, source, OperationSize.dword, info, true),
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.dword));
export type long_t = number;
long_t[NativeTypeFn.bitGetter] = numericBitGetter;
long_t[NativeTypeFn.bitSetter] = numericBitSetter;
Object.freeze(long_t);
export const int64_as_float_t = new NativeType<number>(
    '__int64',
    8, 8,
    v=>typeof v === 'number' && Math.round(v) === v && -0x8000000000000000 <= v && v < 0x8000000000000000,
    (ptr, offset)=>ptr.getInt64AsFloat(offset),
    (ptr, v, offset)=>ptr.setInt64WithFloat(v, offset),
    (asm, target, source, info)=>{
        const temp = target.tempPtr();
        asm.qmov_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsNumberToDouble);
        asm.throwIfNonZero(info);
        asm.cvttsd2si_t_t(target, temp);
    },
    (asm, target, source, info)=>{
        const temp = target.tempPtr();
        asm.cvtsi2sd_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsDoubleToNumber);
        asm.throwIfNonZero(info);
        asm.qmov_t_t(target, temp);
    },
    (asm, target, source)=>asm.mov_t_t(target, source, OperationSize.qword));
export type int64_as_float_t = number;
Object.freeze(int64_as_float_t);

export const float32_t = new NativeType<number>(
    'float',
    4, 4,
    v=>typeof v === 'number',
    (ptr, offset)=>ptr.getFloat32(offset),
    (ptr, v, offset)=>ptr.setFloat32(v, offset),
    (asm, target, source, info)=>{
        const temp = target.tempPtr();
        asm.qmov_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsNumberToDouble);
        asm.throwIfNonZero(info);
        asm.cvtsd2ss_t_t(target, temp);
    },
    (asm, target, source, info)=>{
        const temp = target.tempPtr();
        asm.cvtss2sd_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsDoubleToNumber);
        asm.throwIfNonZero(info);
        asm.qmov_t_t(target, temp);
    },
    (asm, target, source)=>asm.movss_t_t(target, source));
export type float32_t = number;
Object.freeze(float32_t);
export const float64_t = new NativeType<number>(
    'double',
    8, 8,
    v=>typeof v === 'number',
    (ptr, offset)=>ptr.getFloat64(offset),
    (ptr, v, offset)=>ptr.setFloat64(v, offset),
    (asm, target, source, info)=>{
        const temp = target.tempPtr();
        asm.qmov_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsNumberToDouble);
        asm.throwIfNonZero(info);
        asm.movsd_t_t(target, temp);
    },
    (asm, target, source, info)=>{
        const temp = target.tempPtr();
        asm.movsd_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.rdx, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsDoubleToNumber);
        asm.throwIfNonZero(info);
        asm.qmov_t_t(target, temp);
    },
    (asm, target, source)=>asm.movsd_t_t(target, source));
export type float64_t = number;
Object.freeze(float64_t);

const string_ctor = makefunc.js(proc2['??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ'], void_t, null, VoidPointer);
const string_dtor = makefunc.js(proc['std::basic_string<char,std::char_traits<char>,std::allocator<char> >::_Tidy_deallocate'], void_t, null, VoidPointer);

export const CxxString = new NativeType<string>(
    'std::basic_string<char,std::char_traits<char>,std::allocator<char> >',
    0x20, 8,
    v=>typeof v === 'string',
    (ptr, offset)=>ptr.getCxxString(offset),
    (ptr, v, offset)=>ptr.setCxxString(v, offset),
    (asm, target, source, info)=>{
        asm.qmov_t_t(makefunc.Target[0], source);
        asm.lea_r_rp(Register.r9, Register.rbp, 1, info.offsetForLocalSpace!+0x10);
        asm.mov_r_c(Register.r8, chakraUtil.stack_utf8);
        asm.mov_r_c(Register.rdx, info.numberOnUsing);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_str_js2np);

        asm.mov_r_rp(Register.rcx, Register.rbp, 1, info.offsetForLocalSpace!+0x10);
        asm.cmp_r_c(Register.rcx, 15);
        asm.ja_label('!');
        asm.mov_r_rp(Register.rdx, Register.rax, 1, 8);
        asm.mov_rp_r(Register.rbp, 1, info.offsetForLocalSpace!+0x08, Register.rdx);
        asm.mov_r_rp(Register.rax, Register.rax, 1, 0);
        asm.mov_r_c(Register.rcx, 15);
        asm.close_label('!');
        asm.mov_rp_r(Register.rbp, 1, info.offsetForLocalSpace!, Register.rax);
        asm.mov_rp_r(Register.rbp, 1, info.offsetForLocalSpace!+0x18, Register.rcx);
        asm.lea_t_rp(target, Register.rbp, 1, info.offsetForLocalSpace!);

        asm.useStackAllocator = true;
    },
    (asm, target, source, info)=>{
        const sourceTemp = source.tempPtr();
        if (info.needDestruction) asm.qmov_t_t(sourceTemp, source);
        asm.qmov_t_t(makefunc.Target[0], source);
        asm.mov_r_rp(Register.rdx, Register.rcx, 1, 0x10);
        asm.mov_r_rp(Register.rax, Register.rcx, 1, 0x18);
        asm.cmp_r_c(Register.rax, 15);
        asm.cmova_r_rp(Register.rcx, Register.rcx, 1, 0);
        asm.add_r_r(Register.rdx, Register.rcx);

        const temp = target.tempPtr(source, sourceTemp);
        asm.lea_r_rp(Register.r8, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_utf8_np2js);
        asm.throwIfNonZero(info);

        if (info.needDestruction) {
            asm.qmov_t_t(makefunc.Target[0], sourceTemp);
            asm.call64(string_dtor.pointer, Register.rax);
        }
        asm.qmov_t_t(target, temp);
    },
    (asm, target, source)=>asm.qmov_t_t(target, source),
    string_ctor,
    string_dtor,
    (to, from)=>{
        to.setCxxString(from.getCxxString());
    }, (to, from)=>{
        to.copyFrom(from, 0x20);
        string_ctor(from);
    });
CxxString[makefunc.pointerReturn] = true;
Object.freeze(CxxString);
export type CxxString = string;

export const bin64_t = new NativeType<string>(
    'unsigned __int64',
    8, 8,
    v=>typeof v === 'string' && v.length === 4,
    (ptr, offset)=>ptr.getBin64(offset),
    (ptr, v, offset)=>ptr.setBin(v, offset),
    (asm, target, source, info)=>{
        asm.qmov_t_t(makefunc.Target[0], source);
        asm.mov_r_c(Register.rdx, info.numberOnUsing);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_bin64);
        asm.qmov_t_t(target, makefunc.Target.return);
    },
    (asm, target, source, info)=>{
        const temp = target.tempPtr(source);
        const sourceTemp = source.tempPtr(target, temp);
        asm.lea_r_rp(Register.rcx, sourceTemp.reg, 1, sourceTemp.offset);
        if (source.memory) {
            asm.mov_rp_r(Register.rcx, 1, 0, source.reg);
        }
        asm.mov_r_c(Register.rdx, 4);
        asm.lea_r_rp(Register.r8, temp.reg, 1, temp.offset);
        asm.call_rp(Register.rdi, 1, makefuncDefines.fn_JsPointerToString);
        asm.throwIfNonZero(info);
        asm.qmov_t_t(target, temp);
    },
    (asm, target, source)=>asm.qmov_t_t(target, source),
).extends({
    one:'\u0001\0\0\0',
    zero:'\0\0\0\0',
    minus_one:'\uffff\uffff\uffff\uffff',
});
export type bin64_t = string;
Object.freeze(bin64_t);

export const bin128_t = new NativeType<string>(
    'unsigned __int128',
    16, 8,
    v=>typeof v === 'string' && v.length === 8,
    (ptr)=>ptr.getBin(8),
    (ptr, v)=>ptr.setBin(v),
    ()=>{ throw Error('bin128_t is not supported for the function type'); },
    ()=>{ throw Error('bin128_t is not supported for the function type'); },
    ()=>{ throw Error('bin128_t is not supported for the function type'); }
).extends({
    one:'\u0001\0\0\0',
    zero:'\0\0\0\0',
    minus_one:'\uffff\uffff\uffff\uffff',
});
export type bin128_t = string;
Object.freeze(bin128_t);
