
import { proc, proc2 } from './bds/symbols';
import { abstract, emptyFunc } from './common';
import { StaticPointer, VoidPointer } from './core';
import { makefunc, RawTypeId } from './makefunc';
import { Singleton } from './singleton';

namespace NativeTypeFn
{
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
    public readonly types:Type<any>[] = [];

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

export class NativeType<T> implements Type<T> {
    public static readonly getter:typeof NativeTypeFn.getter = NativeTypeFn.getter;
    public static readonly setter:typeof NativeTypeFn.setter = NativeTypeFn.setter;
    public static readonly ctor:typeof NativeTypeFn.ctor = NativeTypeFn.ctor;
    public static readonly dtor:typeof NativeTypeFn.dtor = NativeTypeFn.dtor;
    public static readonly ctor_copy:typeof NativeTypeFn.ctor_copy = NativeTypeFn.ctor_copy;
    public static readonly ctor_move:typeof NativeTypeFn.ctor_move = NativeTypeFn.ctor_move;
    public static readonly size:typeof NativeTypeFn.size = NativeTypeFn.size;
    public static readonly align:typeof NativeTypeFn.align = NativeTypeFn.align;
    public static readonly descriptor:typeof NativeTypeFn.descriptor = NativeTypeFn.descriptor;
    
    
    public readonly [NativeTypeFn.getter]:(ptr:StaticPointer, offset?:number)=>T;
    public readonly [NativeTypeFn.setter]:(ptr:StaticPointer, v:T, offset?:number)=>void;
    public readonly [NativeTypeFn.ctor]:(ptr:StaticPointer)=>void;
    public readonly [NativeTypeFn.dtor]:(ptr:StaticPointer)=>void;
    public readonly [NativeTypeFn.ctor_move]:(to:StaticPointer, from:StaticPointer)=>void;
    public readonly [NativeTypeFn.ctor_copy]:(to:StaticPointer, from:StaticPointer)=>void;
    public readonly [NativeTypeFn.size]:number;
    public readonly [NativeTypeFn.align]:number;


    constructor(
        size:number,
        align:number,
        get:(ptr:StaticPointer, offset?:number)=>T, 
        set:(ptr:StaticPointer, v:T, offset?:number)=>void,
        ctor:(ptr:StaticPointer)=>void = emptyFunc,
        dtor:(ptr:StaticPointer)=>void = emptyFunc,
        ctor_copy:(to:StaticPointer, from:StaticPointer)=>void = defaultCopy(size),
        ctor_move:(to:StaticPointer, from:StaticPointer)=>void = ctor_copy) {
        this[NativeType.size] = size;
        this[NativeType.align] = align;
        this[NativeType.getter] = get;
        this[NativeType.setter] = set;
        this[NativeType.ctor] = ctor;
        this[NativeType.dtor] = dtor;
        this[NativeType.ctor_copy] = ctor_copy;
        this[NativeType.ctor_move] = ctor_move;
    }
    
    extends<FIELDS>(fields?:FIELDS):NativeType<T>&FIELDS {
        const type = this;
        const ntype = new NativeType(
            type[NativeType.size],
            type[NativeType.align],
            (ptr, offset) => type[NativeType.getter](ptr, offset),
            (ptr, v, offset) => type[NativeType.setter](ptr, v, offset),
        );
        if (fields) {
            for (const field in fields) {
                (ntype as any)[field] = fields[field];
            }
        }
        return ntype as any;
    }

    ref():NativeType<T> {
        return refSingleton.newInstance(this, ()=>makeReference(this));
    }
    
    [NativeTypeFn.descriptor](builder:NativeDescriptorBuilder, key:string, offset:number):void {
        abstract();
    }

    static defaultDescriptor(this:Type<any>, builder:NativeDescriptorBuilder, key:string, offset:number):void {
        const type = this;
        builder.desc[key] = {
            get(this: StaticPointer) { return type[NativeType.getter](this, offset); },
            set(this: StaticPointer, value:any) { return type[NativeType.setter](this, value, offset); }
        };
        const typeidx = builder.types.push(type)-1;
        if (type[NativeType.ctor] !== emptyFunc) {
            builder.ctor.setPtrOffset(offset);
            builder.ctor.code += `types[${typeidx}][NativeType.ctor](ptr);\n`;
        }
        if (type[NativeType.dtor] !== emptyFunc) {
            builder.dtor.setPtrOffset(offset);
            builder.dtor.code += `types[${typeidx}][NativeType.dtor](ptr);\n`;
        }
        builder.ctor_copy.setPtrOffset(offset);
        builder.ctor_copy.code += `types[${typeidx}][NativeType.ctor_copy](ptr, optr);\n`;
    }
}
NativeType.prototype[NativeTypeFn.descriptor] = NativeType.defaultDescriptor;

const refSingleton = new Singleton<NativeType<any>>();

function makeReference<T>(type:NativeType<T>):NativeType<T> {
    return new NativeType<T>(
        8,
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
        [NativeType.align]:number;
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

export const bool_t = new NativeType<boolean>(
    1, 1,
    (ptr, offset)=>ptr.getBoolean(offset), 
    (ptr, v, offset)=>ptr.setBoolean(v, offset));
export type bool_t = boolean;
export const uint8_t = new NativeType<number>(
    1, 1,
    (ptr, offset)=>ptr.getInt8(offset), 
    (ptr, v, offset)=>ptr.setInt8(v, offset));
export type uint8_t = number;
export const uint16_t = new NativeType<number>(
    2, 2,
    (ptr, offset)=>ptr.getInt16(offset), 
    (ptr, v, offset)=>ptr.setInt16(v, offset));
export type uint16_t = number;
export const uint32_t = new NativeType<number>(
    4, 4,
    (ptr, offset)=>ptr.getUint32(offset), 
    (ptr, v, offset)=>ptr.setUint32(v, offset));
export type uint32_t = number;
export const uint64_as_float_t = new NativeType<number>(
    8, 8,
    (ptr, offset)=>ptr.getUint64AsFloat(offset), 
    (ptr, v, offset)=>ptr.setUint64WithFloat(v, offset));
export type uint64_as_float_t = number;
export const int8_t = new NativeType<number>(
    1, 1,
    (ptr, offset)=>ptr.getUint8(offset), 
    (ptr, v, offset)=>ptr.setUint8(v, offset));
export type int8_t = number;
export const int16_t = new NativeType<number>(
    2, 2,
    (ptr, offset)=>ptr.getUint16(offset), 
    (ptr, v, offset)=>ptr.setUint16(v, offset));
export type int16_t = number;
export const int32_t = new NativeType<number>(
    4, 4,
    (ptr, offset)=>ptr.getInt32(offset), 
    (ptr, v, offset)=>ptr.setInt32(v, offset));
export type int32_t = number;
export const int64_as_float_t = new NativeType<number>(
    8, 8,
    (ptr, offset)=>ptr.getInt64AsFloat(offset), 
    (ptr, v, offset)=>ptr.setInt64WithFloat(v, offset));
export type int64_as_float_t = number;
export const float32_t = new NativeType<number>(
    4, 4,
    (ptr, offset)=>ptr.getFloat32(offset), 
    (ptr, v, offset)=>ptr.setFloat32(v, offset));
export type float32_t = number;
export const float64_t = new NativeType<number>(
    8, 8,
    (ptr, offset)=>ptr.getFloat64(offset), 
    (ptr, v, offset)=>ptr.setFloat64(v, offset));
export type float64_t = number;

const string_ctor = makefunc.js(proc2['??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ'], RawTypeId.Void, null, VoidPointer);
const string_dtor = makefunc.js(proc['std::basic_string<char,std::char_traits<char>,std::allocator<char> >::_Tidy_deallocate'], RawTypeId.Void, null, VoidPointer);

export const CxxString = new NativeType<string>(
    0x20, 8,
    (ptr, offset)=>ptr.getCxxString(offset),
    (ptr, v, offset)=>ptr.setCxxString(v, offset),
    string_ctor,
    string_dtor,
    (to, from)=>{
        to.setCxxString(from.getCxxString());
    }, (to, from)=>{
        to.copyFrom(from, 0x20);
        string_ctor(from);
    });
export type CxxString = string;

export const bin64_t = new NativeType<string>(
    8, 8,
    (ptr, offset)=>ptr.getBin64(offset), 
    (ptr, v, offset)=>ptr.setBin(v, offset)
).extends({
    one:'\u0001\0\0\0',
    zero:'\0\0\0\0',
    minus_one:'\uffff\uffff\uffff\uffff',
});
export type bin64_t = string;

export const bin128_t = new NativeType<string>(
    16, 8,
    (ptr)=>ptr.getBin(8), 
    (ptr, v)=>ptr.setBin(v)
).extends({
    one:'\u0001\0\0\0',
    zero:'\0\0\0\0',
    minus_one:'\uffff\uffff\uffff\uffff',
});
export type bin128_t = string;
