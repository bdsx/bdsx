import { Bufferable, emptyFunc, Encoding, TypeFromEncoding } from "./common";
import { NativePointer, PrivatePointer, StaticPointer, StructurePointer, VoidPointer } from "./core";
import { makefunc } from "./makefunc";
import { NativeDescriptorBuilder, NativeType, Type } from "./nativetype";
import { Singleton } from "./singleton";
import { isBaseOf } from "./util";

type FieldMapItem = [Type<any>, number]|Type<any>;


export type KeysFilter<T, FILTER> = {[key in keyof T]:T[key] extends FILTER ? never: key}[keyof T];
export type KeysWithoutFunction<T> = {[key in keyof T]:T[key] extends (...args:any[])=>any ? never: key}[keyof T];

type StructureFields<T> = {[key in KeysWithoutFunction<T>]?:Type<T[key]>|[Type<T[key]>, number]};

const isNativeClass = Symbol();
const isSealed = Symbol();
const fieldmap = Symbol();

function accessor(key:string|number):string {
    if (typeof key === 'number') return `[${key}]`;
    if (/^[a-zA-Z_$][a-zA-Z_$]*$/.test(key)) return `.${key}`;
    return `[${JSON.stringify(key)}]`;
}

export interface NativeClassType<T extends NativeClass> extends Type<T>
{
    new(alloc?:boolean):T;
    prototype:T;
    [StructurePointer.contentSize]:number|null;
    [fieldmap]:Record<keyof any, [Type<any>, number, [number, number]|null]>;
    [isSealed]:boolean;
    [isNativeClass]:true;
    define(fields:StructureFields<T>, defineSize?:number|null, defineAlign?:number|null, abstract?:boolean):void;
    offsetOf(key:KeysWithoutFunction<T>):number;
    typeOf<KEY extends KeysWithoutFunction<T>>(field:KEY):Type<T[KEY]>;
    ref<T extends NativeClass>(this:{new():T}):NativeType<T>;
}

class StructureDefination {
    /**
     * end of fields
     */
    eof:number|null;
    align:number;
    bitoffset = 0;
    bitTargetSize = 0;
    fields:Record<keyof any, [Type<any>, number, [number, number]|null]> = {};

    constructor(supercls:NativeClassType<any>) {
        this.eof = supercls[NativeType.size];
        this.align = supercls[NativeType.align];
    }
    define<T extends NativeClass>(clazz:NativeClassType<T>, size?:number|null):void {
        if (size == null) {
            if (size === null) {
                this.eof = null;
            } else {
                size = this.eof !== null ? (((this.eof + this.align - 1) / this.align)|0)*this.align : null;
            }
        } else {
            if (this.eof !== null) {
                if (this.eof > size) throw Error(`field offsets are bigger than the class size. fields_end=${this.eof}, size=${size}`);
            }
            this.eof = size;
        }

        if (makefunc.np2js in clazz) {
            clazz[NativeType.getter] = wrapperGetter;
            clazz[NativeType.descriptor] = wrapperDescriptor;
        }
        sealClass(clazz);

        clazz[fieldmap] = this.fields;
        Object.freeze(this.fields);

        const propmap = new NativeDescriptorBuilder;
        for (const key in this.fields) {
            const [type, offset, bitmask] = this.fields[key]!;
            type[NativeType.descriptor](propmap, key, offset, bitmask);
        }
        const params = propmap.params;
        const supercls = (clazz as any).__proto__.prototype;
        const idx = params.push(supercls) - 1;

        function override(ctx:NativeDescriptorBuilder.UseContext, type:typeof NativeType.ctor|typeof NativeType.dtor):void {
            const superfn = supercls[type];
            const manual = clazz.prototype[type];
            if (ctx.code !== '') {
                const func = new Function('NativeType', 'types', ctx.code);
                if (superfn === manual) {
                    clazz.prototype[type] = function(this:T){
                        superfn.call(this);
                        func.call(this, NativeType, params);
                    };
                } else {
                    clazz.prototype[type] = function(this:T){
                        superfn.call(this);
                        func.call(this, NativeType, params);
                        manual.call(this);
                    };
                }
            } else if (superfn !== manual) {
                clazz.prototype[type] = function(this:T){
                    superfn.call(this);
                    manual.call(this);
                };
            }
        }

        override(propmap.ctor, NativeType.ctor);
        override(propmap.dtor, NativeType.dtor);
        if (propmap.ctor_copy.code !== '') {
            if (!clazz.prototype.hasOwnProperty(NativeType.ctor_copy)) {
                let code = propmap.ctor_copy.code;
                if (clazz.prototype[NativeType.ctor_copy] !== emptyFunc) {
                    code = `types[${idx}][NativeType.ctor_copy].call(this);\n${code}`;
                }
                const func = new Function('NativeType', 'types', 'o', propmap.ctor_copy.code);
                clazz.prototype[NativeType.ctor_copy] = function(this:T, o:T){
                    func.call(this, NativeType, params, o);
                };
            }
        }

        clazz[StructurePointer.contentSize] =
        clazz.prototype[NativeType.size] =
        clazz[NativeType.size] = size!;
        clazz[NativeType.align] = this.align;
        Object.defineProperties(clazz.prototype, propmap.desc);
    }

    field(key:string, type:Type<any>, fieldOffset?:number|null, bitField?:number|null):void {
        if (isBaseOf(type, NativeClass)) {
            sealClass(type as NativeClassType<any>);
        }

        const alignofType = type[NativeType.align];
        if (alignofType > this.align) this.align = alignofType;

        let offset = 0;
        if (fieldOffset != null) {
            offset = fieldOffset;
        } else {
            if (this.eof === null) {
                throw Error('Cannot set a field without the offset, if the sizeof previous field or super class is unknown');
            }
            offset = (((this.eof + alignofType - 1) / alignofType)|0)*alignofType;
        }

        const sizeofType = type[NativeType.size];
        if (sizeofType === null) {
            if (bitField != null) {
                throw Error(`${type.name} does not support the bit mask`);
            }
            this.fields[key] = [type, offset, null];
            this.eof = null;
        } else {
            let bitmaskinfo:[number, number]|null = null;
            let nextOffset = offset;
            if (bitField != null) {
                if (!(type instanceof NativeType) || !type.supportsBitMask()) {
                    throw Error(`${type.name} does not support the bit mask`);
                }

                const maxBits = sizeofType * 8;
                if (bitField >= maxBits) throw Error(`Too big bit mask, ${type.name} maximum is ${maxBits}`);
                const nextBitOffset = this.bitoffset + bitField;
                let shift = 0;
                if (this.bitoffset === 0 || this.bitTargetSize !== sizeofType || nextBitOffset > maxBits) {
                    // next bit field
                    this.bitoffset = bitField;
                    nextOffset = offset + sizeofType;
                } else {
                    offset -= sizeofType;
                    shift = this.bitoffset;
                    this.bitoffset = nextBitOffset;
                }
                this.bitTargetSize = sizeofType;
                const mask = ((1 << bitField) - 1) << shift;
                bitmaskinfo = [shift, mask];
            } else {
                this.bitoffset = 0;
                this.bitTargetSize = 0;
                nextOffset = offset + sizeofType;
            }
            this.fields[key] = [type, offset, bitmaskinfo];
            if (this.eof !== null && nextOffset > this.eof) {
                this.eof = nextOffset;
            }
        }
    }
}

const structures = new WeakMap<{new():any}, StructureDefination>();

export class NativeClass extends StructurePointer {
    static readonly [NativeType.size]:number = 0;
    static readonly [NativeType.align]:number = 1;
    static readonly [StructurePointer.contentSize]:number = 0;
    static readonly [fieldmap]:Record<keyof any, [NativeType<any>, number, [number, number]|null]>;
    static readonly [isNativeClass] = true;
    static readonly [isSealed] = true;
    static readonly [makefunc.pointerReturn] = true;

    static isNativeClassType(type:Record<string, any>):type is typeof NativeClass {
        return isNativeClass in type;
    }

    [NativeType.size]:number;

    [NativeType.ctor]():void {
        // empty
    }
    [NativeType.dtor]():void {
        // empty
    }
    [NativeType.ctor_copy](from:this):void {
        // empty
    }
    [NativeType.ctor_move](from:this):void {
        this[NativeType.ctor_copy](from);
    }
    [NativeType.setter](from:this):void {
        this[NativeType.dtor]();
        this[NativeType.ctor_copy](from);
    }
    static [NativeType.ctor](ptr:StaticPointer):void {
        ptr.as(this)[NativeType.ctor]();
    }
    static [NativeType.dtor](ptr:StaticPointer):void {
        ptr.as(this)[NativeType.dtor]();
    }
    static [NativeType.ctor_copy](to:StaticPointer, from:StaticPointer):void {
        to.as(this)[NativeType.ctor_copy](from.as(this));
    }
    static [NativeType.ctor_move](to:StaticPointer, from:StaticPointer):void {
        to.as(this)[NativeType.ctor_move](from.as(this));
    }
    static [NativeType.setter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:VoidPointer, value:THIS, offset?:number):void {
        const nptr = ptr.addAs(this, offset, (offset || 0) >> 31);
        (nptr as any)[NativeType.setter](value as any);
    }
    static [NativeType.getter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:VoidPointer, offset?:number):THIS {
        return ptr.addAs(this, offset, (offset || 0) >> 31);
    }
    static [NativeType.descriptor](builder:NativeDescriptorBuilder, key:string|number, offset:number):void {
        const type = this;
        builder.desc[key] = {
            configurable: true,
            get(this:VoidPointer) {
                const value = type[NativeType.getter](this, offset);
                Object.defineProperty(this, key, {value});
                return value;
            }
        };
        if (type[NativeType.ctor] !== emptyFunc) {
            builder.ctor.code += `this${accessor(key)}[NativeType.ctor]();\n`;
        }
        if (type[NativeType.dtor] !== emptyFunc) {
            builder.dtor.code += `this${accessor(key)}[NativeType.dtor]();\n`;
        }
        builder.ctor_copy.code += `this${accessor(key)}[NativeType.ctor_copy](o${accessor(key)});\n`;
    }

    /**
     * alias of [NativeType.ctor]() and [Native.ctor_copy]();
     */
    construct(copyFrom?:this|null):void {
        if (copyFrom == null) {
            this[NativeType.ctor]();
        } else {
            this[NativeType.ctor_copy](copyFrom);
        }
    }

    /**
     * alias of [NativeType.dtor]();
     */
    destruct():void {
        this[NativeType.dtor]();
    }

    static next<T extends NativeClass>(this:{new():T}, ptr:T, count:number):T {
        const clazz = this as NativeClassType<T>;
        const size = clazz[StructurePointer.contentSize];
        if (size === null) {
            throw Error('Cannot call the next with the unknown sized structure');
        }
        return ptr.addAs(this, count * size) as any;
    }
    /**
     * Cannot construct & Unknown size
     */
    static abstract<T extends NativeClass>(this:{new():T}, fields:StructureFields<T>, defineSize?:number, defineAlign?:number|null):void {
        const clazz = this as NativeClassType<T>;
        clazz.define(fields, defineSize, defineAlign, true);
    }

    static define<T extends NativeClass>(this:{new():T}, fields:StructureFields<T>, defineSize?:number|null, defineAlign:number|null = null, abstract:boolean=false):void {
        const clazz = this as NativeClassType<T>;
        if (makefunc.np2js in clazz) {
            clazz[NativeType.getter] = wrapperGetter;
            clazz[NativeType.descriptor] = wrapperDescriptor;
        }

        if (clazz.hasOwnProperty(isSealed)) {
            throw Error('Cannot define the structure of the already used');
        }

        const superclass = (clazz as any).__proto__;
        sealClass(superclass);
        const def = new StructureDefination(superclass);
        structures.set(clazz, def);

        for (const key in fields) {
            const type:FieldMapItem = fields[key as KeysWithoutFunction<T>]!;
            if (type instanceof Array) {
                def.field(key, type[0], type[1]);
            } else {
                def.field(key, type);
            }
        }
        if (abstract) def.eof = null;
        if (defineAlign !== null) def.align = defineAlign;
        def.define(clazz, defineSize);
    }

    static defineAsUnion<T extends NativeClass>(this:{new():T}, fields:StructureFields<T>, abstract:boolean = false):void {
        const clazz = this as NativeClassType<T>;
        for (const key in fields) {
            const item:FieldMapItem = fields[key as KeysWithoutFunction<T>]!;
            if (!(item instanceof Array)) {
                fields[key as KeysWithoutFunction<T>] = [item, 0];
            }
        }
        return clazz.define(fields, undefined, undefined, abstract);
    }

    static ref<T extends NativeClass>(this:{new():T}):NativeType<T> {
        return Singleton.newInstance(NativeClass, this, ()=>makeReference(this));
    }

    static offsetOf<T extends NativeClass>(this:{new():T}, field:KeysWithoutFunction<T>):number {
        return (this as NativeClassType<T>)[fieldmap][field][1];
    }

    static typeOf<T extends NativeClass, KEY extends KeysWithoutFunction<T>>(this:{new():T}, field:KEY):Type<T[KEY]> {
        return (this as NativeClassType<T>)[fieldmap][field][0];
    }
}

NativeClass.prototype[NativeType.size] = 0;
NativeClass.prototype[NativeType.ctor] = emptyFunc;
NativeClass.prototype[NativeType.dtor] = emptyFunc;
NativeClass.prototype[NativeType.ctor_copy] = emptyFunc;

function sealClass<T extends NativeClass>(cls:NativeClassType<T>):void {
    let node = cls as any;
    while (!node.hasOwnProperty(isSealed)) {
        node[isSealed] = true;
        node = node.__proto__;
    }
}

export function nativeField<T>(type:Type<T>, fieldOffset?:number|null, bitMask?:number|null) {
    return <K extends string>(obj:NativeClass&Record<K, T|null>, key:K):void=>{
        const clazz = obj.constructor as NativeClassType<any>;
        let def = structures.get(clazz);
        if (def === undefined) structures.set(clazz, def = new StructureDefination((clazz as any).__proto__));
        def.field(key, type, fieldOffset, bitMask);
    };
}

export function nativeClass(size?:number|null, align:number|null = null) {
    return <T extends NativeClass>(clazz:NativeClassType<T>):void=>{
        const def = structures.get(clazz);
        if (def === undefined) {
            if (makefunc.np2js in clazz) {
                clazz[NativeType.getter] = wrapperGetter;
                clazz[NativeType.descriptor] = wrapperDescriptor;
            }
            sealClass(clazz);
            const superclass = (clazz as any).__proto__;
            clazz[StructurePointer.contentSize] =
            clazz.prototype[NativeType.size] =
            clazz[NativeType.size] = size === undefined ? superclass[NativeType.size] : size!;
            clazz[NativeType.align] = align == null ? superclass[NativeType.align] : align;
        } else {
            structures.delete(clazz);
            if (align !== null) def.align = align;
            def.define(clazz, size);
        }
    };
}

function wrapperGetter<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, offset?:number):THIS{
    return (this as any)[makefunc.np2js](ptr.addAs(this, offset));
}
function wrapperDescriptor<THIS extends NativeClass>(this:{new():THIS}, builder:NativeDescriptorBuilder, key:string|number, offset:number):void {
    const clazz = this as NativeClassType<THIS>;
    builder.desc[key] = {
        configurable: true,
        get(this:VoidPointer) {
            const value = (clazz as any)[makefunc.np2js](this.addAs(clazz, offset));
            Object.defineProperty(this, key, {value});
            return value;
        }
    };
    if (clazz[NativeType.ctor] !== emptyFunc) {
        builder.ctor.code += `this${accessor(key)}[NativeType.ctor]();\n`;
    }
    if (clazz[NativeType.dtor] !== emptyFunc) {
        builder.dtor.code += `this${accessor(key)}[NativeType.dtor]();\n`;
    }
    builder.ctor_copy.code += `this${accessor(key)}[NativeType.ctor_copy](o${accessor(key)});\n`;
}

export interface NativeArrayType<T> extends Type<NativeArray<T>>
{
    new(ptr?:VoidPointer):NativeArray<T>;
}

export abstract class NativeArray<T> extends PrivatePointer implements Iterable<T> {
    abstract length:number;
    abstract componentType:Type<T>;

    static [NativeType.getter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, offset?:number):THIS {
        return ptr.addAs(this, offset, offset! >> 31);
    }
    static [NativeType.setter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, value:THIS, offset?:number):void {
        throw Error("non assignable");
    }
    static [NativeType.descriptor](builder:NativeDescriptorBuilder, key:string|number, offset:number):void {
        const type = this as any;
        builder.desc[key] = {
            configurable: true,
            get(this:VoidPointer) {
                const value = this.addAs(type, offset, offset >> 31);
                Object.defineProperty(this, key, {value});
                return value;
            }
        };
        if (type[NativeType.ctor] !== emptyFunc) {
            builder.ctor.code += `this${accessor(key)}[NativeType.ctor]();\n`;
        }
        if (type[NativeType.dtor] !== emptyFunc) {
            builder.dtor.code += `this${accessor(key)}[NativeType.dtor]();\n`;
        }
        builder.ctor_copy.code += `this${accessor(key)}[NativeType.ctor_copy](o${accessor(key)});\n`;
    }
    static readonly [NativeType.align]:number = 1;

    get(i:number):T {
        const offset = i*this.componentType[NativeType.size];
        return this.componentType[NativeType.getter](this as any, offset);
    }

    toArray():T[] {
        const n = this.length;
        const out:T[] = new Array(n);
        for (let i=0;i<n;i++) {
            out[i] = this.get(i);
        }
        return out;
    }

    *[Symbol.iterator]():IterableIterator<T> {
        const n = this.length;
        for (let i=0;i<n;i++) {
            yield this.get(i);
        }
    }

    static make<T>(itemType:Type<T>, count:number):NativeArrayType<T> {
        const itemSize = itemType[NativeType.size];
        if (itemSize === null) throw Error('Unknown size of item. NativeArray needs item size');

        const propmap = new NativeDescriptorBuilder;
        propmap.desc.length = {value: count};

        let off = 0;
        for (let i = 0; i < count; i++) {
            itemType[NativeType.descriptor](propmap, i, off, null);
            off += itemSize;
        }
        class NativeArrayImpl extends NativeArray<T> {
            static readonly [NativeType.size] = off;
            static readonly [StructurePointer.contentSize] = off;
            static readonly [NativeType.align] = itemType[NativeType.align];
            [NativeType.size]:number;
            static isTypeOf<T>(this:{new():T}, v:unknown):v is T {
                return v instanceof NativeArrayImpl;
            }
            length:number;
            componentType:Type<T>;
        }
        NativeArrayImpl.prototype[NativeType.size] = off;
        NativeArrayImpl.prototype.length = count;
        NativeArrayImpl.prototype.componentType = itemType;

        Object.defineProperties(NativeArrayImpl.prototype, propmap.desc);
        return NativeArrayImpl;
    }
}

export declare class MantleClass extends NativeClass {
    getBoolean(offset?: number): boolean;
    getUint8(offset?: number): number;
    getUint16(offset?: number): number;
    getUint32(offset?: number): number;
    getUint64AsFloat(offset?: number): number;
    getInt8(offset?: number): number;
    getInt16(offset?: number): number;
    getInt32(offset?: number): number;
    getInt64AsFloat(offset?: number): number;
    getFloat32(offset?: number): number;
    getFloat64(offset?: number): number;
    getNullablePointer(offset?: number): NativePointer|null;
    getNullablePointerAs<T extends VoidPointer>(ctor:{new():T}, offset?: number): T|null;
    getPointer(offset?: number): NativePointer;
    getPointerAs<T extends VoidPointer>(ctor:{new():T}, offset?: number): T;

    fill(bytevalue:number, bytes:number, offset?: number): void;
    copyFrom(from: VoidPointer, bytes:number, this_offset?: number, from_offset?:number): void;
    setBoolean(value: boolean, offset?: number): void;
    setUint8(value: number, offset?: number): void;
    setUint16(value: number, offset?: number): void;
    setUint32(value: number, offset?: number): void;
    setUint64WithFloat(value: number, offset?: number): void;
    setInt8(value: number, offset?: number): void;
    setInt16(value: number, offset?: number): void;
    setInt32(value: number, offset?: number): void;
    setInt64WithFloat(value: number, offset?: number): void;
    setFloat32(value: number, offset?: number): void;
    setFloat64(value: number, offset?: number): void;
    setPointer(value: VoidPointer|null, offset?: number): void;

    /**
     * get C++ std::string
     * @param encoding default = Encoding.Utf8
     */
    getCxxString<T extends Encoding = Encoding.Utf8>(offset?: number, encoding?: T): TypeFromEncoding<T>;

    /**
     * set C++ std::string
     * Need to target pointer to string
     * It will call string::assign method to pointer
     * @param encoding default = Encoding.Utf8
     */
    setCxxString(str: string | Bufferable, offset?: number, encoding?: Encoding): void;

    /**
     * get string
     * @param bytes if it's not provided, It will read until reach null character
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call getBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    getString<T extends Encoding = Encoding.Utf8>(bytes?: number, offset?: number, encoding?: T): TypeFromEncoding<T>;

    /**
     * set string with null character
     * @param encoding default = Encoding.Utf8
     * @return writed bytes without null character
     * if encoding is Encoding.Buffer it will call setBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    setString(text: string, offset?: number, encoding?: Encoding): number;

    getBuffer(bytes: number, offset?: number): Uint8Array;

    setBuffer(buffer: Bufferable, offset?: number): void;

    /**
     * Read memory as binary string.
     * It stores 2bytes per character
     * @param words 2bytes per word
     */
    getBin(words: number, offset?:number): string;

    /**
     * is same with getBin(4).
     * It stores 2bytes per character for 64bits.
     */
    getBin64(offset?:number): string;

    /**
     * Write memory with binary string.
     * It reads 2bytes per character
     * @param words 2bytes per word
     */
    setBin(v:string, offset?:number): void;

    interlockedIncrement16(offset?:number):number;
    interlockedIncrement32(offset?:number):number;
    interlockedIncrement64(offset?:number):number;
    interlockedDecrement16(offset?:number):number;
    interlockedDecrement32(offset?:number):number;
    interlockedDecrement64(offset?:number):number;
    interlockedCompareExchange8(exchange:number, compare:number, offset?:number):number;
    interlockedCompareExchange16(exchange:number, compare:number, offset?:number):number;
    interlockedCompareExchange32(exchange:number, compare:number, offset?:number):number;
    interlockedCompareExchange64(exchange:string, compare:string, offset?:number):string;

    getJsValueRef(offset?:number):any;
    setJsValueRef(value:unknown, offset?:number):void;
}
exports.MantleClass = NativeClass;

function makeReference<T extends NativeClass>(type:{new():T}):NativeType<T> {
    const clazz = type as NativeClassType<T>;

    function wrapperGetterRef(ptr:StaticPointer, offset?:number):T{
        return clazz[makefunc.np2js]!(ptr.getNullablePointerAs(clazz, offset))!;
    }
    function wrapperSetterRef(ptr:StaticPointer, value:T, offset?:number):void{
        ptr.setPointer(clazz[makefunc.js2np]!(value), offset);
    }
    function getterRef(ptr:StaticPointer, offset?:number):T {
        return ptr.getNullablePointerAs(type, offset)!;
    }
    function setterRef(ptr:StaticPointer, value:T, offset?:number):void {
        return ptr.setPointer(value, offset)!;
    }

    const getter = makefunc.np2js in type ? wrapperGetterRef : getterRef;
    const setter = makefunc.js2np in type ? wrapperSetterRef : setterRef;

    return new NativeType<T>(type.name+'*', 8, 8,
        clazz.isTypeOf,
        getter, setter,
        clazz[makefunc.js2npAsm],
        clazz[makefunc.np2jsAsm],
        clazz[makefunc.np2npAsm]);
}
