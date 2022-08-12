import * as util from 'util';
import { capi } from "./capi";
import { CircularDetector } from "./circulardetector";
import { Bufferable, emptyFunc, Encoding, TypeFromEncoding } from "./common";
import { NativePointer, PrivatePointer, StaticPointer, StructurePointer, VoidPointer } from "./core";
import { makefunc } from "./makefunc";
import { mangle } from './mangle';
import { int32_t, NativeDescriptorBuilder, NativeType, Type, void_t } from "./nativetype";
import { Singleton } from "./singleton";
import { remapAndPrintError } from "./source-map-support";
import { isBaseOf } from "./util";

type FieldMapItem = [Type<any>, number]|Type<any>;

export type KeysFilter<T, FILTER> = {[key in keyof T]:T[key] extends FILTER ? key: never}[keyof T];
export type KeysWithoutFunction<T> = {[key in keyof T]:T[key] extends (...args:any[])=>any ? never: key}[keyof T];

type StructureFields<T> = {[key in KeysWithoutFunction<T>]?:Type<T[key]>|[Type<T[key]>, number]};

const isNativeClass = Symbol('isNativeClass');
const isSealed = Symbol('isSealed');
const fieldmap = Symbol('fieldmap');
const resolver = Symbol('NativeClass.resolver');

function accessor(key:string|number):string {
    if (typeof key === 'number') return `[${key}]`;
    if (/^[a-zA-Z_$][a-zA-Z_$]*$/.test(key)) return `.${key}`;
    return `[${JSON.stringify(key)}]`;
}

export interface NativeClassType<T extends NativeClass> extends Type<T> {
    new(alloc?:boolean):T;
    prototype:T;

    [StructurePointer.contentSize]:number|null;
    [fieldmap]:Record<keyof any, NativeFieldInfo>;
    [isSealed]:boolean;
    [isNativeClass]:true;
    [resolver]?(ptr:StaticPointer|null, type:NativeClassType<T>):any;
    construct<T extends NativeClass>(this:{new(v?:boolean):T}, copyFrom?:T|null):T;
    allocate<T>(this:new()=>T, copyFrom?:T|null):T;
    define(fields:StructureFields<T>, defineSize?:number|null, defineAlign?:number|null, abstract?:boolean):void;
    offsetOf(key:KeysWithoutFunction<T>):number;
    typeOf<KEY extends KeysWithoutFunction<T>>(field:KEY):Type<T[KEY]>;
    ref<T extends NativeClass>(this:new()=>T):NativeType<T>;
    from(ptr:StaticPointer):T|null;
}

function generateFunction(builder:NativeDescriptorBuilder, clazz:Type<any>, superproto:NativeClass):((()=>void)|null)[] {
    function override(ctx:NativeDescriptorBuilder.UseContext, type:typeof NativeType.ctor|typeof NativeType.dtor, fnname:string):void{
        const superfn = superproto[type];
        const manualfn = clazz.prototype[type];
        if (superfn === abstractClassError) {
            ctx.used = false;
        } else if (ctx.used) {
            if (superproto[type] !== emptyFunc) {
                ctx.code = `superproto[NativeType.${fnname}].call(this);\n`+ctx.code;
            }
            if (superfn !== manualfn) {
                const funcname = builder.import(manualfn);
                ctx.code += `${funcname}.call(this);\n`;
            }
            let prefix = '\nfunction(){\n';
            if (ctx.ptrUsed) prefix += 'const ptr=this.add();\n';
            ctx.code = prefix+ctx.code;
        } else if (clazz.prototype.hasOwnProperty(type)) {
            clazz.prototype[type] = function(this:unknown){
                superfn.call(this);
                manualfn.call(this);
            };
        }
    }

    override(builder.ctor, NativeType.ctor, 'ctor');
    override(builder.dtor, NativeType.dtor, 'dtor');
    const hasCtorCopy = clazz.prototype.hasOwnProperty(NativeType.ctor_copy);
    if (builder.ctor_copy.used) {
        if (hasCtorCopy) {
            builder.ctor_copy.used = false;
        } else {
            let code = '\nfunction(o){\n';
            if (builder.ctor_copy.ptrUsed) code += 'const ptr=this.add();\nconst optr=o.add();\n';
            if (superproto[NativeType.ctor_copy] !== emptyFunc) {
                code += `superproto[NativeType.ctor_copy].call(this,o);\n`;
            }
            code += builder.ctor_copy.code;
            builder.ctor_copy.code = code;
        }
    }
    if (builder.ctor_move.used) {
        if (clazz.prototype.hasOwnProperty(NativeType.ctor_move)) {
            builder.ctor_move.used = false;
        } else if (hasCtorCopy) {
            clazz.prototype[NativeType.ctor_move] = clazz.prototype[NativeType.ctor_copy];
            builder.ctor_move.used = false;
        } else {
            let code = '\nfunction(o){\n';
            if (builder.ctor_move.ptrUsed) code += 'const ptr=this.add();\nconst optr=o.add();\n';
            if (superproto[NativeType.ctor_move] !== emptyFunc) {
                code += `superproto[NativeType.ctor_move].call(this,o);\n`;
            }
            code += builder.ctor_move.code;
            builder.ctor_move.code = code;
        }
    }
    const list = [builder.ctor, builder.dtor, builder.ctor_copy, builder.ctor_move];

    let out = '\nconst [';
    for (const imp of builder.imports.values()) {
        out += imp;
        out += ',';
    }
    out += 'NativeType,superproto] = imp;\nreturn [';
    for (const item of list) {
        if (item.used) {
            out += item.code;
            out += '},';
        } else {
            out += 'null,';
        }
    }
    out += '];';
    const imports = [...builder.imports.keys(), NativeType, superproto];
    return new Function('imp', out)(imports);
}

interface NativeFieldInfo extends NativeDescriptorBuilder.Info {
    type:Type<any>;
}

class StructureDefinition {
    /**
     * end of fields
     */
    eof:number|null;
    align:number;
    bitoffset = 0;
    bitTargetSize = 0;
    fields:Record<keyof any, NativeFieldInfo> = {};

    constructor(supercls:NativeClassType<any>) {
        this.eof = supercls[NativeType.size];
        this.align = supercls[NativeType.align];
    }
    static defaultDefine<T extends NativeClass>(clazz:NativeClassType<T>, opts:NativeClassOptions):void {
        mangle.update(clazz, opts);

        const superclass = (clazz as any).__proto__;
        clazz[StructurePointer.contentSize] =
        clazz.prototype[NativeType.size] =
        clazz[NativeType.size] = opts.size === undefined ? superclass[NativeType.size] : opts.size!;
        let align = opts.align == null ? superclass[NativeType.align] : opts.align;
        if (opts.minimalAlign != null && opts.minimalAlign > align) align = opts.minimalAlign;
        clazz[NativeType.align] = align;

        sealClass(clazz);
    }
    define<T extends NativeClass>(clazz:NativeClassType<T>, opts:NativeClassOptions):void {
        if (opts.size == null) {
            if (opts.size === null) {
                this.eof = null;
            } else {
                opts.size = this.eof !== null ? (((this.eof + this.align - 1) / this.align)|0)*this.align : null;
            }
        } else {
            if (this.eof !== null) {
                if (this.eof > opts.size) throw Error(`field offsets are bigger than the class size. fields_end=${this.eof}, size=${opts.size}`);
            }
            this.eof = opts.size;
        }
        if (opts.align != null) this.align = opts.align;
        else opts.align = this.align;

        StructureDefinition.defaultDefine(clazz, opts);

        clazz[fieldmap] = this.fields;

        const propmap = new NativeDescriptorBuilder;
        for (const [key, info] of Object.entries(this.fields)) {
            info.type[NativeType.descriptor](propmap, key, info);
        }
        const supercls = (clazz as any).__proto__;
        const superproto = supercls.prototype;

        const superfield = supercls[fieldmap];
        Object.setPrototypeOf(this.fields, superfield || null);
        Object.freeze(this.fields);

        const clazzproto = clazz.prototype;
        if (!(clazzproto instanceof NativeStruct)) {
            const [ctor, dtor, ctor_copy, ctor_move] = generateFunction(propmap, clazz, superproto);
            if (ctor !== null && clazzproto[NativeType.ctor] !== abstractClassError) {
                clazzproto[NativeType.ctor] = ctor;
            }
            if (dtor !== null && clazzproto[NativeType.dtor] !== abstractClassError) {
                clazzproto[NativeType.dtor] = dtor;
            }
            if (ctor_copy !== null && clazzproto[NativeType.ctor_copy] !== abstractClassError) {
                clazzproto[NativeType.ctor_copy] = ctor_copy;
            }
            if (clazzproto[NativeType.ctor_copy] !== callCtorCopyForAbstractClass) {
                if (ctor_move !== null) {
                    clazzproto[NativeType.ctor_move] = ctor_move;
                } else {
                    clazzproto[NativeType.ctor_move] = callCtorCopy;
                }
            }
        }
        Object.defineProperties(clazzproto, propmap.desc);
    }

    field(key:string, type:Type<any>, fieldOffset?:NativeFieldOptions|number|null, bitField?:number|null):void {
        if (isBaseOf(type, NativeClass)) {
            sealClass(type);
        }

        const alignofType = type[NativeType.align];
        if (alignofType > this.align) this.align = alignofType;

        let offset:number|undefined;
        let relative:number|undefined;
        let ghost = false;
        let noInitialize = false;
        let constValue = false;
        if (fieldOffset != null) {
            if (typeof fieldOffset === 'number') {
                offset = fieldOffset;
            } else {
                const opts = fieldOffset;
                if (opts.relative) {
                    relative = opts.offset;
                } else {
                    offset = opts.offset;
                }
                bitField = opts.bitMask;
                ghost = opts.ghost || false;
                constValue = opts.const || false;
                if (ghost) noInitialize = true;
                else noInitialize = opts.noInitialize || false;
            }
        }
        if (offset == null) {
            if (this.eof === null) {
                throw Error('Cannot set a field without the offset, if the sizeof previous field or super class is unknown');
            }
            offset = (((this.eof + alignofType - 1) / alignofType)|0)*alignofType;
        }
        if (relative != null) {
            offset += relative;
        }

        const sizeofType = type[NativeType.size];
        if (sizeofType === null) {
            if (bitField != null) {
                throw Error(`${type.name} does not support the bit mask`);
            }
            this.fields[key] = {type, offset, ghost, noInitialize, bitmask:null, const:constValue};
            if (!ghost) this.eof = null;
        } else {
            let bitmask:[number, number]|null = null;
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
                    if (!ghost) this.bitoffset = bitField;
                    nextOffset = offset + sizeofType;
                } else {
                    offset -= sizeofType;
                    shift = this.bitoffset;
                    if (!ghost) this.bitoffset = nextBitOffset;
                }
                if (!ghost) this.bitTargetSize = sizeofType;
                const mask = ((1 << bitField) - 1) << shift;
                bitmask = [shift, mask];
            } else {
                if (!ghost) {
                    this.bitoffset = 0;
                    this.bitTargetSize = 0;
                }
                nextOffset = offset + sizeofType;
            }
            this.fields[key] = {type, offset, ghost, noInitialize, bitmask, const:constValue};
            if (!ghost && this.eof !== null && nextOffset > this.eof) {
                this.eof = nextOffset;
            }
        }
    }
}

const structures = new WeakMap<{new():any}, StructureDefinition>();

function ptrAs<T extends NativeClass>(ptr:StaticPointer, type:NativeClassType<T>):T {
    return ptr instanceof type ? ptr : ptr.as(type);
}

export class NativeClass extends StructurePointer {
    static readonly [NativeType.size]:number = 0;
    static readonly [NativeType.align]:number = 1;
    static readonly [StructurePointer.contentSize]:number = 0;
    static readonly [fieldmap]:Record<keyof any, NativeFieldInfo>;
    static readonly [isNativeClass] = true;
    static readonly [isSealed] = true;
    static readonly symbol:string;

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
        // empty
    }
    [NativeType.setter](from:this|null):void {
        if (this.equalsptr(from)) return; // self setting
        this[NativeType.dtor]();
        this[NativeType.ctor_copy](from!);
    }
    static [resolver]?(this:NativeClassType<NativeClass>, ptr:StaticPointer|null):any;

    static [NativeType.ctor](ptr:StaticPointer):void {
        ptrAs(ptr, this)[NativeType.ctor]();
    }
    static [NativeType.dtor](ptr:StaticPointer):void {
        ptrAs(ptr, this)[NativeType.dtor]();
    }
    static [NativeType.ctor_copy](to:StaticPointer, from:StaticPointer):void {
        ptrAs(to, this)[NativeType.ctor_copy](ptrAs(from, this));
    }
    static [NativeType.ctor_move](to:StaticPointer, from:StaticPointer):void {
        ptrAs(to, this)[NativeType.ctor_move](ptrAs(from, this));
    }
    static [NativeType.setter](ptr:StaticPointer, value:NativeClass, offset?:number):void {
        const nptr = ptr.addAs(this, offset);
        (nptr as any)[NativeType.setter](value as any);
    }
    static [NativeType.getter](ptr:StaticPointer, offset?:number):NativeClass {
        return ptr.addAs(this, offset);
    }
    static [NativeType.descriptor](builder:NativeDescriptorBuilder, key:string|number, info:NativeDescriptorBuilder.Info):void {
        const {offset, noInitialize} = info;
        const type = this;
        builder.desc[key] = {
            configurable: true,
            get(this:NativeClass) {
                const value = type[NativeType.getter](this as any, offset);
                Object.defineProperty(this, key, {value});
                return value;
            },
        };
        if (noInitialize) return;
        if (type[NativeType.ctor] !== emptyFunc) {
            builder.ctor.used = true;
            builder.ctor.code += `this${accessor(key)}[NativeType.ctor]();\n`;
        }
        if (type[NativeType.dtor] !== emptyFunc) {
            builder.dtor.used = true;
            builder.dtor.code += `this${accessor(key)}[NativeType.dtor]();\n`;
        }
        builder.ctor_copy.used = true;
        builder.ctor_copy.code += `this${accessor(key)}[NativeType.ctor_copy](o${accessor(key)});\n`;
        builder.ctor_move.used = true;
        builder.ctor_move.code += `this${accessor(key)}[NativeType.ctor_move](o${accessor(key)});\n`;
    }

    /**
     * call the constructor.
     * alias of \[NativeType.ctor]() and \[Native.ctor_copy]();
     */
    construct(copyFrom?:this|null):void {
        if (copyFrom == null) {
            this[NativeType.ctor]();
        } else {
            this[NativeType.ctor_copy](copyFrom);
        }
    }

    /**
     * call the destructor.
     * alias of \[NativeType.dtor]();
     */
    destruct():void {
        this[NativeType.dtor]();
    }

    /**
     * Combiation of allocating and constructing.
     *
     * const inst = new Class(true);
     * inst.construct();
     */
    static construct<T extends NativeClass>(this:new(v?:boolean)=>T, copyFrom?:T|null):T {
        const inst = new this(true);
        inst.construct(copyFrom);
        return inst;
    }

    /**
     * allocating with malloc and constructing.
     *
     * const inst = capi.malloc(size).as(Class);
     * inst.construct();
     */
    static allocate<T>(this:new()=>T, copyFrom?:T|null):T {
        const clazz = this as NativeClassType<any>;
        const inst = capi.malloc(clazz[NativeType.size]).as(clazz);
        inst.construct(copyFrom);
        return inst;
    }

    static next<T extends NativeClass>(this:new()=>T, ptr:T, count:number):T {
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
    static abstract<T extends NativeClass>(this:new()=>T, fields:StructureFields<T>, defineSize?:number, defineAlign?:number|null):void {
        const clazz = this as NativeClassType<T>;
        clazz.define(fields, defineSize, defineAlign, true);
    }

    static define<T extends NativeClass>(this:new()=>T, fields:StructureFields<T>, defineSize?:number|null, defineAlign:number|null = null, abstract:boolean=false):void {
        const clazz = this as NativeClassType<T>;
        if (clazz.hasOwnProperty(isSealed)) {
            throw Error('Cannot define the structure of the already used');
        }

        const superclass = (clazz as any).__proto__;
        sealClass(superclass);
        const def = new StructureDefinition(superclass);
        structures.set(clazz, def);

        for (const [key, type] of Object.entries<FieldMapItem>(fields as any)) {
            if (type instanceof Array) {
                def.field(key, type[0], type[1]);
            } else {
                def.field(key, type);
            }
        }
        if (abstract) {
            def.eof = null;
            if (defineSize === undefined) defineSize = null;
        }
        if (defineAlign !== null) def.align = defineAlign;
        def.define(clazz, {size: defineSize});
    }

    static defineAsUnion<T extends NativeClass>(this:new()=>T, fields:StructureFields<T>, abstract:boolean = false):void {
        const clazz = this as NativeClassType<T>;
        for (const [key, item] of Object.entries<FieldMapItem>(fields as any)) {
            if (!(item instanceof Array)) {
                fields[key as KeysWithoutFunction<T>] = [item, 0];
            }
        }
        return clazz.define(fields, undefined, undefined, abstract);
    }

    static ref<T extends NativeClass>(this:new()=>T):NativeType<T> {
        return Singleton.newInstance(NativeClass, this, ()=>makeReference(this));
    }

    static offsetOf<T extends NativeClass>(this:new()=>T, field:KeysWithoutFunction<T>):number {
        return (this as NativeClassType<T>)[fieldmap][field].offset;
    }

    static typeOf<T extends NativeClass, KEY extends KeysWithoutFunction<T>>(this:new()=>T, field:KEY):Type<T[KEY]> {
        return (this as NativeClassType<T>)[fieldmap][field].type;
    }

    static keys():string[] {
        return Object.keys(this[fieldmap]);
    }

    /**
     * call the destructor and capi.free
     *
     * inst.destruct();
     * capi.free(inst);
     */
    static delete(item:NativeClass):void {
        item.destruct();
        capi.free(item);
    }

    static from<T extends NativeClass>(this:new()=>T, ptr:StaticPointer|PrivatePointer|null):T|null {
        if (ptr == null) return null;
        return ptr.as(this);
    }
    static setResolver<T extends NativeClass>(this:new()=>T, fn:(this:NativeClassType<T>, ptr:StaticPointer|null)=>T|null):void {
        const cls = this as NativeClassType<T>;
        cls[makefunc.getter] = resolverGetter;
        cls[makefunc.getFromParam] = resolverGetFromParam;
        cls[resolver] = fn;
        cls.from = fn;
    }

    protected _toJsonOnce(allocator:()=>Record<string, any>):Record<string, any> {
        return CircularDetector.check(this, allocator, obj=>{
            const fields = (this as any).constructor[fieldmap];
            for (const field in fields) {
                let value:unknown;
                try {
                    value = (this as any)[field];
                } catch (err) {
                    value = 'Error: '+err.message;
                }
                obj[field] = value;
            }
        });
    }

    toJSON():Record<string, any> {
        const obj = this._toJsonOnce(()=>({}));
        for (const [key, v] of Object.entries(obj)) {
            if (v != null) obj[key] = v.toJSON != null ? v.toJSON() : v;
        }
        return obj;
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        try {
            return this._toJsonOnce(()=>new (CircularDetector.makeTemporalClass(this.constructor.name, this, options)));
        } catch (err) {
            remapAndPrintError(err);
            return 'Error: '+err.message;
        }
    }
}

/**
 * the class that does not need a constructor or destructor
 */
export class NativeStruct extends NativeClass {
    /**
     * @deprecated no need to use
     */
    [NativeType.ctor]():void {
        // empty
    }
    /**
     * @deprecated no need to use
     */
    [NativeType.dtor]():void {
        // empty
    }
    [NativeType.ctor_copy](from:this):void {
        this.copyFrom(from, this[NativeType.size]);
    }
    [NativeType.ctor_move](from:this):void {
        this.copyFrom(from, this[NativeType.size]);
    }
    [NativeType.setter](from:this|null):void {
        this.copyFrom(from!, this[NativeType.size]);
    }

    /**
     * @deprecated no need to use
     */
    construct():void;
    construct(copyFrom:this|null):void;
    /**
     * call the constructor.
     * alias of \[NativeType.ctor]() and \[Native.ctor_copy]();
     */
    construct(copyFrom?:this|null):void {
        if (copyFrom == null) return;
        this[NativeType.ctor_copy](copyFrom);
    }

    /**
     * @deprecated no need to use
     */
    destruct():void {
        // empty
    }
    static [NativeType.ctor_copy](to:StaticPointer, from:StaticPointer):void {
        to.copyFrom(from, this[NativeType.size]);
    }
    static [NativeType.ctor_move](to:StaticPointer, from:StaticPointer):void {
        to.copyFrom(from, this[NativeType.size]);
    }
    static [NativeType.setter](ptr:StaticPointer, value:NativeClass, offset?:number):void {
        ptr.copyFrom(value, this[NativeType.size], offset);
    }
    static [NativeType.getter](ptr:StaticPointer, offset?:number):NativeClass {
        return ptr.addAs(this, offset);
    }
}

function resolverGetter(this:NativeClassType<any>, ptr:StaticPointer, offset?:number):any {
    return this[resolver]!(ptr.add(offset), this)!;
}
function resolverGetFromParam(this:NativeClassType<any>, stackptr:StaticPointer, offset?:number):any {
    return this[resolver]!(stackptr.getNullablePointer(offset), this);
}

function genCallCtorCopy():(this:NativeClass, other:NativeClass)=>void {
    function callCtorCopy(this:NativeClass, other:NativeClass):void {
        this[NativeType.ctor_copy](other);
    }
    return callCtorCopy;
}
const callCtorCopy = genCallCtorCopy();
const callCtorCopyForAbstractClass = genCallCtorCopy();

NativeClass.prototype[NativeType.size] = 0;
NativeClass.prototype[NativeType.ctor] = emptyFunc;
NativeClass.prototype[NativeType.dtor] = emptyFunc;
NativeClass.prototype[NativeType.ctor_copy] = emptyFunc;
NativeClass.prototype[NativeType.ctor_move] = emptyFunc;

function sealClass<T extends NativeClass>(cls:NativeClassType<T>):void {
    let node = cls as any;
    while (!node.hasOwnProperty(isSealed)) {
        node[isSealed] = true;
        node = node.__proto__;
    }
}

export interface NativeFieldOptions {
    offset?:number;
    /**
     * offset is a relative offset
     */
    relative?:boolean;
    bitMask?:number;
    /**
     * Set it as not a actual field, just for accessing.
     * Does not increase the size of the class.
     * also does not increase the next field offset.
     * And does not call the constructor and the destructor.
     *
     * It's noInitialize with the zero space
     */
    ghost?:boolean;
    /**
     * Don't initialize
     * But it has space unlike ghost
     */
    noInitialize?:boolean;
    /**
     * read once at the first access and reuse it.
     */
    const?:boolean;
}

export interface NativeClassOptions extends mangle.UpdateOptions {
    size?:number|null;
    align?:number|null;
    minimalAlign?:number|null;
}

export function nativeField<T>(type:Type<T>, fieldOffset?:NativeFieldOptions|number|null, bitMask?:number|null) {
    return <K extends string>(obj:Record<K, T|null>, key:K):void=>{
        const clazz = obj.constructor as NativeClassType<any>;
        let def = structures.get(clazz);
        if (def == null) structures.set(clazz, def = new StructureDefinition((clazz as any).__proto__));
        def.field(key, type, fieldOffset, bitMask);
    };
}

export function nativeClass(size?:number|NativeClassOptions|null, align:number|null = null) {
    return <T extends NativeClass>(clazz:NativeClassType<T>):void=>{
        const def = structures.get(clazz);

        if (typeof size === 'number' || size == null) {
            size = {size, align};
        } else if (align != null) {
            size.align = align;
        }
        if (def == null) {
            StructureDefinition.defaultDefine(clazz, size);
        } else {
            structures.delete(clazz);
            def.define(clazz, size);
        }
    };
}

export interface NativeArrayType<T> extends Type<NativeArray<T>> {
    new(ptr?:VoidPointer):NativeArray<T>;
}

export abstract class NativeArray<T> extends PrivatePointer implements Iterable<T> {
    abstract length:number;
    abstract componentType:Type<T>;

    static [NativeType.getter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, offset?:number):THIS {
        return ptr.addAs(this, offset);
    }
    static [NativeType.setter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, value:THIS, offset?:number):void {
        throw Error("non assignable");
    }
    static [NativeType.descriptor](builder:NativeDescriptorBuilder, key:string|number, info:NativeDescriptorBuilder.Info):void {
        const {offset, noInitialize} = info;
        const type = this as any;
        builder.desc[key] = {
            configurable: true,
            get(this:VoidPointer) {
                const value = this.addAs(type, offset);
                Object.defineProperty(this, key, {value});
                return value;
            },
        };
        if (noInitialize) return;
        if (type[NativeType.ctor] !== emptyFunc) {
            builder.ctor.used = true;
            builder.ctor.code += `this${accessor(key)}[NativeType.ctor]();\n`;
        }
        if (type[NativeType.dtor] !== emptyFunc) {
            builder.dtor.used = true;
            builder.dtor.code += `this${accessor(key)}[NativeType.dtor]();\n`;
        }
        builder.ctor_copy.used = true;
        builder.ctor_copy.code += `this${accessor(key)}[NativeType.ctor_copy](o${accessor(key)});\n`;
        builder.ctor_move.used = true;
        builder.ctor_move.code += `this${accessor(key)}[NativeType.ctor_move](o${accessor(key)});\n`;
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
            itemType[NativeType.descriptor](propmap, i, {offset: off, bitmask:null, ghost:false, noInitialize:false,const:false});
            off += itemSize;
        }
        class NativeArrayImpl extends NativeArray<T> {
            static readonly [NativeType.size] = off;
            static readonly [StructurePointer.contentSize] = off;
            static readonly [NativeType.align] = itemType[NativeType.align];
            [NativeType.size]:number;
            static isTypeOf<T>(this:new()=>T, v:unknown):v is T {
                return v === null || v instanceof NativeArrayImpl;
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
    getNullablePointerAs<T extends VoidPointer>(ctor:new()=>T, offset?: number): T|null;
    getPointer(offset?: number): NativePointer;
    getPointerAs<T extends VoidPointer>(ctor:new()=>T, offset?: number): T;

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

    setInt32To64WithZero(value: number, offset?: number): void;
    setFloat32To64WithZero(value: number, offset?: number): void;

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
    return new NativeType<T>(mangle.pointer(clazz.symbol), type.name+'*', 8, 8,
        clazz.isTypeOf,
        clazz.isTypeOfWeak,
        (stackptr, offset)=>clazz[makefunc.getFromParam](stackptr, offset),
        (stackptr, v, offset)=>stackptr.setPointer(v, offset),
    );
}

export namespace nativeClassUtil {
    export function bindump(object:NativeClass):void {
        const size = object[NativeType.size];
        const ptr = object.as(NativePointer);
        for (let i=0;i<size;i+=8) {
            const remaining = Math.min(size - i, 8);
            let str = '';
            for (let i=0;i<remaining;i++) {
                let b = ptr.readUint8().toString(16);
                if (b.length === 1) b = '0'+b;
                str = b + str;
            }
            console.log(str);
        }
    }
}

/**
 * this class is not constructible.
 * if the NativeClass does not have full fields. Please inherit it instead of NativeClass.
 */
export class AbstractClass extends NativeClass {
}

export type AbstractMantleClass = MantleClass;
export const AbstractMantleClass = AbstractClass as typeof MantleClass;

function abstractClassError(this:Record<string, unknown>):never {
    throw Error(`${this.constructor.name} is not constructible. it needs to provide the constructor or the destructor for using them`);
}

const abstractproto = AbstractClass.prototype;
abstractproto[NativeType.ctor] = abstractClassError;
abstractproto[NativeType.dtor] = abstractClassError;
abstractproto[NativeType.ctor_copy] = abstractClassError;
abstractproto[NativeType.ctor_move] = callCtorCopyForAbstractClass;

const vectorDeletingDestructorImpl = makefunc.js([0, 0], void_t, {this:NativeClass}, int32_t);

export function vectorDeletingDestructor(this:NativeClass):void {
    vectorDeletingDestructorImpl.call(this, 0);
}

export namespace vectorDeletingDestructor {
    export function deleteIt(this:NativeClass):void {
        vectorDeletingDestructorImpl.call(this, 1);
    }
}
