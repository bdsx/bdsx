

import { asm, Register } from './assembler';
import { proc, proc2 } from './bds/proc';
import { emptyFunc, RawTypeId } from './common';
import { makefunc, StaticPointer, VoidPointer } from './core';
import { Singleton } from './singleton';

namespace NativeTypeFn
{
    export const size = Symbol('size');
    export const getter = Symbol('getter');
    export const setter = Symbol('setter');
    export const ctor = Symbol('ctor');
    export const dtor = Symbol('dtor');
    export const ctor_copy = Symbol('ctor_copy');
    export const ctor_move = Symbol('ctor_move');
    export const isNativeClass = Symbol('isNativeClass');
    export const descriptor = Symbol('descriptor');
}

/**
 * native type information
 */
export interface Type<T>
{
    [NativeTypeFn.getter](ptr:StaticPointer, offset?:number):T;
    [NativeTypeFn.setter](ptr:StaticPointer, value:T, offset?:number):void;
    [NativeTypeFn.ctor]:(ptr:StaticPointer)=>void,
    [NativeTypeFn.dtor]:(ptr:StaticPointer)=>void,
    [NativeTypeFn.ctor_copy]:(to:StaticPointer, from:StaticPointer)=>void,
    [NativeTypeFn.ctor_move]:(to:StaticPointer, from:StaticPointer)=>void,
    [NativeTypeFn.descriptor](builder:NativeDescriptorBuilder, key:string|number, offset:number):void;
    [NativeTypeFn.size]:number|null;
    [NativeTypeFn.isNativeClass]?:true;
}

function defaultCopy(size:number):(to:StaticPointer, from:StaticPointer)=>void
{
    return (to:StaticPointer, from:StaticPointer)=>{
        to.copyFrom(from, size);
    };
}

export class NativeDescriptorBuilder
{
    public readonly desc:PropertyDescriptorMap = {};
    public readonly types:Type<any>[] = [];

    public ctor_code = '';
    public dtor_code = '';
};

export class NativeType<T> implements Type<T>
{
    public static readonly getter:typeof NativeTypeFn.getter = NativeTypeFn.getter;
    public static readonly setter:typeof NativeTypeFn.setter = NativeTypeFn.setter;
    public static readonly ctor:typeof NativeTypeFn.ctor = NativeTypeFn.ctor;
    public static readonly dtor:typeof NativeTypeFn.dtor = NativeTypeFn.dtor;
    public static readonly ctor_copy:typeof NativeTypeFn.ctor_copy = NativeTypeFn.ctor_copy;
    public static readonly ctor_move:typeof NativeTypeFn.ctor_move = NativeTypeFn.ctor_move;
    public static readonly size:typeof NativeTypeFn.size = NativeTypeFn.size;
    public static readonly descriptor:typeof NativeTypeFn.descriptor = NativeTypeFn.descriptor;
    
    
    public readonly [NativeTypeFn.getter]:(ptr:StaticPointer, offset?:number)=>T;
    public readonly [NativeTypeFn.setter]:(ptr:StaticPointer, v:T, offset?:number)=>void;
    public readonly [NativeTypeFn.ctor]:(ptr:StaticPointer, offset?:number)=>void;
    public readonly [NativeTypeFn.dtor]:(ptr:StaticPointer, offset?:number)=>void;
    public readonly [NativeTypeFn.ctor_move]:(to:StaticPointer, from:StaticPointer)=>void;
    public readonly [NativeTypeFn.ctor_copy]:(to:StaticPointer, from:StaticPointer)=>void;
    public readonly [NativeTypeFn.size]:number;

    constructor(
        size:number,
        get:(ptr:StaticPointer, offset?:number)=>T, 
        set:(ptr:StaticPointer, v:T, offset?:number)=>void,
        ctor:(ptr:StaticPointer)=>void = emptyFunc,
        dtor:(ptr:StaticPointer)=>void = emptyFunc,
        ctor_copy:(to:StaticPointer, from:StaticPointer)=>void = defaultCopy(size),
        ctor_move:(to:StaticPointer, from:StaticPointer)=>void = ctor_copy)
    {
        this[NativeType.size] = size;
        this[NativeType.getter] = get;
        this[NativeType.setter] = set;
        this[NativeType.ctor] = ctor;
        this[NativeType.dtor] = dtor;
        this[NativeType.ctor_copy] = ctor_copy;
        this[NativeType.ctor_move] = ctor_move;
    }
    
    extends<FIELDS>(fields?:FIELDS):NativeType<T>&FIELDS
    {
        const type = this;
        const ntype = new NativeType(
            type[NativeType.size],
            (ptr) => type[NativeType.getter](ptr),
            (ptr, v) => type[NativeType.setter](ptr, v),
        );
        if (fields)
        {
            for (const field in fields)
            {
                (ntype as any)[field] = fields[field];
            }
        }
        return ntype as any;
    }

    ref():NativeType<T>
    {
        return refSingleton.newInstance(this, ()=>{
            return makeReference(this);
        });
    }
    
    [NativeTypeFn.descriptor](builder:NativeDescriptorBuilder, key:string, offset:number):void
    {
        throw 'abstract';
    }

    static defaultDescriptor(this:Type<any>, builder:NativeDescriptorBuilder, key:string, offset:number):void
    {
        const type = this;
        builder.desc[key] = {
            get(this: StaticPointer) { return type[NativeType.getter](this, offset); },
            set(this: StaticPointer, value:any) { return type[NativeType.setter](this, value, offset); }
        };
        const typeidx = builder.types.push(type)-1;
        if (type[NativeType.ctor] !== emptyFunc)
        {
            builder.ctor_code += `types[${typeidx}][NativeType.ctor](this, ${offset})\n`;
        }
        if (type[NativeType.dtor] !== emptyFunc)
        {
            builder.dtor_code += `types[${typeidx}][NativeType.dtor](this, ${offset})\n`;
        }
    }
}
NativeType.prototype[NativeTypeFn.descriptor] = NativeType.defaultDescriptor;

const refSingleton = new Singleton<NativeType<any>>();

function makeReference<T>(type:NativeType<T>):NativeType<T>
{
    return new NativeType<T>(
        8,
        (ptr)=>type[NativeType.getter](ptr.getPointer()),
        (ptr, v)=>type[NativeType.setter](ptr.getPointer(), v),
    );
}


declare module './core'
{
    interface VoidPointerConstructor
    {
        [NativeType.size]:number;
        [NativeType.getter]<THIS extends VoidPointer>(this:{new(ptr?:VoidPointer):THIS}, ptr:StaticPointer, offset?:number):THIS;
        [NativeType.setter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, value:VoidPointer, offset?:number):void;
        [NativeType.ctor](ptr:StaticPointer):void;
        [NativeType.dtor](ptr:StaticPointer):void;
        [NativeType.ctor_copy](to:StaticPointer, from:StaticPointer):void;
        [NativeType.ctor_move](to:StaticPointer, from:StaticPointer):void;
        [NativeType.descriptor](builder:NativeDescriptorBuilder, key:string, offset:number):void;
    }
}

VoidPointer[NativeType.size] = 8;
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

export const uint8_t = new NativeType<number>(
    1,
    (ptr, offset)=>ptr.getUint8(offset), 
    (ptr, v, offset)=>ptr.setUint8(v, offset));
export type uint8_t = number;
export const uint16_t = new NativeType<number>(
    2,
    (ptr, offset)=>ptr.getUint16(offset), 
    (ptr, v, offset)=>ptr.setUint16(v, offset));
export type uint16_t = number;
export const uint32_t = new NativeType<number>(
    4,
    (ptr, offset)=>ptr.getUint32(offset), 
    (ptr, v, offset)=>ptr.setUint32(v, offset));
export type uint32_t = number;
export const int8_t = new NativeType<number>(
    1,
    (ptr, offset)=>ptr.getUint8(offset), 
    (ptr, v, offset)=>ptr.setUint8(v, offset));
export type int8_t = number;
export const int16_t = new NativeType<number>(
    2,
    (ptr, offset)=>ptr.getUint16(offset), 
    (ptr, v, offset)=>ptr.setUint16(v, offset));
export type int16_t = number;
export const int32_t = new NativeType<number>(
    4,
    (ptr, offset)=>ptr.getUint32(offset), 
    (ptr, v, offset)=>ptr.setUint32(v, offset));
export type int32_t = number;
export const float32_t = new NativeType<number>(
    4,
    (ptr, offset)=>ptr.getUint32(offset), 
    (ptr, v, offset)=>ptr.setUint32(v, offset));
export type float32_t = number;
export const float64_t = new NativeType<number>(
    8,
    (ptr, offset)=>ptr.getUint32(offset), 
    (ptr, v, offset)=>ptr.setUint32(v, offset));
export type float64_t = number;
export const CxxString = new NativeType<string>(
    0x20,
    (ptr, offset)=>ptr.getCxxString(offset),
    (ptr, v, offset)=>ptr.setCxxString(v, offset),
    (ptr)=>string_ctor(ptr),
    (ptr)=>string_dtor(ptr));
export type CxxString = string;

const string_ctor = makefunc.js(proc2['??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ'], RawTypeId.Void, null, false, VoidPointer);
const string_dtor = makefunc.js(proc['std::basic_string<char,std::char_traits<char>,std::allocator<char> >::_Tidy_deallocate'], RawTypeId.Void, null, false, VoidPointer);

export const bin64_t = new NativeType<string>(
    8,
    (ptr)=>ptr.getBin64(), 
    (ptr, v)=>ptr.setBin(v)
).extends({
    one:'\u0001\0\0\0',
    zero:'\0\0\0\0',
    minus_one:'\uffff\uffff\uffff\uffff',
});
export type bin64_t = string;

export const bin128_t = new NativeType<string>(
    16,
    (ptr)=>ptr.getBin(8), 
    (ptr, v)=>ptr.setBin(v)
).extends({
    one:'\u0001\0\0\0',
    zero:'\0\0\0\0',
    minus_one:'\uffff\uffff\uffff\uffff',
});
export type bin128_t = string;
