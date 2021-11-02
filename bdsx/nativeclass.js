"use strict";
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.nativeClassUtil = exports.NativeArray = exports.nativeClass = exports.nativeField = exports.NativeClass = void 0;
const capi_1 = require("./capi");
const circulardetector_1 = require("./circulardetector");
const common_1 = require("./common");
const core_1 = require("./core");
const makefunc_1 = require("./makefunc");
const nativetype_1 = require("./nativetype");
const singleton_1 = require("./singleton");
const util_1 = require("./util");
const util = require("util");
const isNativeClass = Symbol();
const isSealed = Symbol();
const fieldmap = Symbol();
function accessor(key) {
    if (typeof key === 'number')
        return `[${key}]`;
    if (/^[a-zA-Z_$][a-zA-Z_$]*$/.test(key))
        return `.${key}`;
    return `[${JSON.stringify(key)}]`;
}
function generateFunction(builder, clazz, superproto) {
    function override(ctx, type, fnname) {
        const superfn = superproto[type];
        const manualfn = clazz.prototype[type];
        if (ctx.used) {
            if (superproto[type] !== common_1.emptyFunc) {
                ctx.code = `superproto[NativeType.${fnname}].call(this);\n` + ctx.code;
            }
            if (superfn !== manualfn) {
                builder.import(manualfn, 'manual_' + fnname);
                ctx.code += `manual_${fnname}.call(this);\n`;
            }
            let prefix = '\nfunction(){\n';
            if (ctx.ptrUsed)
                prefix += 'const ptr = this.add();\n';
            ctx.code = prefix + ctx.code;
        }
        else if (superfn !== manualfn) {
            clazz.prototype[type] = function () {
                superfn.call(this);
                manualfn.call(this);
            };
        }
    }
    override(builder.ctor, nativetype_1.NativeType.ctor, 'ctor');
    override(builder.dtor, nativetype_1.NativeType.dtor, 'dtor');
    if (builder.ctor_copy.used) {
        if (clazz.prototype.hasOwnProperty(nativetype_1.NativeType.ctor_copy)) {
            builder.ctor_copy.used = false;
        }
        else {
            let code = '\nfunction(o){\n';
            if (builder.ctor_copy.ptrUsed)
                code += 'const ptr = this.add();\nconst optr = o.add();\n';
            if (superproto[nativetype_1.NativeType.ctor_copy] !== common_1.emptyFunc) {
                code += `superproto[NativeType.ctor_copy].call(this);\n`;
            }
            code += builder.ctor_copy.code;
            builder.ctor_copy.code = code;
        }
    }
    if (builder.ctor_move.used) {
        if (clazz.prototype.hasOwnProperty(nativetype_1.NativeType.ctor_move)) {
            builder.ctor_move.used = false;
        }
        else {
            let code = '\nfunction(o){\n';
            if (builder.ctor_move.ptrUsed)
                code += 'const ptr = this.add();\nconst optr = o.add();\n';
            if (superproto[nativetype_1.NativeType.ctor_move] !== common_1.emptyFunc) {
                code += `superproto[NativeType.ctor_move].call(this);\n`;
            }
            code += builder.ctor_move.code;
            builder.ctor_move.code = code;
        }
    }
    const list = [builder.ctor, builder.dtor, builder.ctor_copy, builder.ctor_move];
    let out = '"use strict";\nconst [';
    for (const imp of builder.imports.values()) {
        out += imp;
        out += ',';
    }
    out += 'NativeType,superproto] = $imp;\nreturn [';
    for (const item of list) {
        if (item.used) {
            out += item.code;
            out += '},';
        }
        else {
            out += 'null,';
        }
    }
    out += '];';
    const imports = [...builder.imports.keys(), nativetype_1.NativeType, superproto];
    return new Function('$imp', out)(imports);
}
class StructureDefinition {
    constructor(supercls) {
        this.bitoffset = 0;
        this.bitTargetSize = 0;
        this.fields = Object.create(null);
        this.eof = supercls[nativetype_1.NativeType.size];
        this.align = supercls[nativetype_1.NativeType.align];
    }
    define(clazz, size) {
        if (size == null) {
            if (size === null) {
                this.eof = null;
            }
            else {
                size = this.eof !== null ? (((this.eof + this.align - 1) / this.align) | 0) * this.align : null;
            }
        }
        else {
            if (this.eof !== null) {
                if (this.eof > size)
                    throw Error(`field offsets are bigger than the class size. fields_end=${this.eof}, size=${size}`);
            }
            this.eof = size;
        }
        sealClass(clazz);
        clazz[fieldmap] = this.fields;
        const propmap = new nativetype_1.NativeDescriptorBuilder;
        for (const key in this.fields) {
            const info = this.fields[key];
            info.type[nativetype_1.NativeType.descriptor](propmap, key, info);
        }
        const supercls = clazz.__proto__;
        const superproto = supercls.prototype;
        const superfield = supercls[fieldmap];
        if (superfield != null)
            this.fields.__proto__ = superfield;
        Object.freeze(this.fields);
        const [ctor, dtor, ctor_copy, ctor_move] = generateFunction(propmap, clazz, superproto);
        if (ctor !== null) {
            if (!clazz.prototype[nativetype_1.NativeType.ctor].isNativeFunction) {
                clazz.prototype[nativetype_1.NativeType.ctor] = ctor;
            }
        }
        if (dtor !== null) {
            if (!clazz.prototype[nativetype_1.NativeType.dtor].isNativeFunction) {
                clazz.prototype[nativetype_1.NativeType.dtor] = dtor;
            }
        }
        if (ctor_copy !== null) {
            if (!clazz.prototype[nativetype_1.NativeType.ctor_copy].isNativeFunction) {
                clazz.prototype[nativetype_1.NativeType.ctor_copy] = ctor_copy;
            }
        }
        if (ctor_move !== null) {
            if (!clazz.prototype[nativetype_1.NativeType.ctor_move].isNativeFunction) {
                clazz.prototype[nativetype_1.NativeType.ctor_move] = ctor_move;
            }
        }
        clazz[core_1.StructurePointer.contentSize] =
            clazz.prototype[nativetype_1.NativeType.size] =
                clazz[nativetype_1.NativeType.size] = size;
        clazz[nativetype_1.NativeType.align] = this.align;
        Object.defineProperties(clazz.prototype, propmap.desc);
    }
    field(key, type, fieldOffset, bitField) {
        if ((0, util_1.isBaseOf)(type, NativeClass)) {
            sealClass(type);
        }
        const alignofType = type[nativetype_1.NativeType.align];
        if (alignofType > this.align)
            this.align = alignofType;
        let offset;
        let relative;
        let ghost = false;
        let noInitialize = false;
        if (fieldOffset != null) {
            if (typeof fieldOffset === 'number') {
                offset = fieldOffset;
            }
            else {
                const opts = fieldOffset;
                if (opts.relative) {
                    relative = opts.offset;
                }
                else {
                    offset = opts.offset;
                }
                bitField = opts.bitMask;
                ghost = opts.ghost || false;
                if (ghost)
                    noInitialize = true;
                else
                    noInitialize = opts.noInitialize || false;
            }
        }
        if (offset == null) {
            if (this.eof === null) {
                throw Error('Cannot set a field without the offset, if the sizeof previous field or super class is unknown');
            }
            offset = (((this.eof + alignofType - 1) / alignofType) | 0) * alignofType;
        }
        if (relative != null) {
            offset += relative;
        }
        const sizeofType = type[nativetype_1.NativeType.size];
        if (sizeofType === null) {
            if (bitField != null) {
                throw Error(`${type.name} does not support the bit mask`);
            }
            this.fields[key] = { type, offset, ghost, noInitialize, bitmask: null };
            if (!ghost)
                this.eof = null;
        }
        else {
            let bitmask = null;
            let nextOffset = offset;
            if (bitField != null) {
                if (!(type instanceof nativetype_1.NativeType) || !type.supportsBitMask()) {
                    throw Error(`${type.name} does not support the bit mask`);
                }
                const maxBits = sizeofType * 8;
                if (bitField >= maxBits)
                    throw Error(`Too big bit mask, ${type.name} maximum is ${maxBits}`);
                const nextBitOffset = this.bitoffset + bitField;
                let shift = 0;
                if (this.bitoffset === 0 || this.bitTargetSize !== sizeofType || nextBitOffset > maxBits) {
                    // next bit field
                    if (!ghost)
                        this.bitoffset = bitField;
                    nextOffset = offset + sizeofType;
                }
                else {
                    offset -= sizeofType;
                    shift = this.bitoffset;
                    if (!ghost)
                        this.bitoffset = nextBitOffset;
                }
                if (!ghost)
                    this.bitTargetSize = sizeofType;
                const mask = ((1 << bitField) - 1) << shift;
                bitmask = [shift, mask];
            }
            else {
                if (!ghost) {
                    this.bitoffset = 0;
                    this.bitTargetSize = 0;
                }
                nextOffset = offset + sizeofType;
            }
            this.fields[key] = { type, offset, ghost, noInitialize, bitmask };
            if (!ghost && this.eof !== null && nextOffset > this.eof) {
                this.eof = nextOffset;
            }
        }
    }
}
const structures = new WeakMap();
class NativeClass extends core_1.StructurePointer {
    static isNativeClassType(type) {
        return isNativeClass in type;
    }
    [(_a = nativetype_1.NativeType.size, _b = nativetype_1.NativeType.align, _c = core_1.StructurePointer.contentSize, _d = isNativeClass, _e = isSealed, nativetype_1.NativeType.size, nativetype_1.NativeType.ctor)]() {
        // empty
    }
    [nativetype_1.NativeType.dtor]() {
        // empty
    }
    [nativetype_1.NativeType.ctor_copy](from) {
        // empty
    }
    [nativetype_1.NativeType.ctor_move](from) {
        // empty
    }
    [nativetype_1.NativeType.setter](from) {
        if (this.equals(from))
            return; // self setting
        this[nativetype_1.NativeType.dtor]();
        this[nativetype_1.NativeType.ctor_copy](from);
    }
    static [nativetype_1.NativeType.ctor](ptr) {
        ptr.as(this)[nativetype_1.NativeType.ctor]();
    }
    static [nativetype_1.NativeType.dtor](ptr) {
        ptr.as(this)[nativetype_1.NativeType.dtor]();
    }
    static [nativetype_1.NativeType.ctor_copy](to, from) {
        to.as(this)[nativetype_1.NativeType.ctor_copy](from.as(this));
    }
    static [nativetype_1.NativeType.ctor_move](to, from) {
        to.as(this)[nativetype_1.NativeType.ctor_move](from.as(this));
    }
    static [nativetype_1.NativeType.setter](ptr, value, offset) {
        const nptr = ptr.addAs(this, offset, (offset || 0) >> 31);
        nptr[nativetype_1.NativeType.setter](value);
    }
    static [nativetype_1.NativeType.getter](ptr, offset) {
        return ptr.addAs(this, offset, (offset || 0) >> 31);
    }
    static [nativetype_1.NativeType.descriptor](builder, key, info) {
        const { offset, noInitialize } = info;
        const type = this;
        builder.desc[key] = {
            configurable: true,
            get() {
                const value = type[nativetype_1.NativeType.getter](this, offset);
                Object.defineProperty(this, key, { value });
                return value;
            }
        };
        if (noInitialize)
            return;
        if (type[nativetype_1.NativeType.ctor] !== common_1.emptyFunc) {
            builder.ctor.used = true;
            builder.ctor.code += `this${accessor(key)}[NativeType.ctor]();\n`;
        }
        if (type[nativetype_1.NativeType.dtor] !== common_1.emptyFunc) {
            builder.dtor.used = true;
            builder.dtor.code += `this${accessor(key)}[NativeType.dtor]();\n`;
        }
        builder.ctor_copy.used = true;
        builder.ctor_copy.code += `this${accessor(key)}[NativeType.ctor_copy](o${accessor(key)});\n`;
        builder.ctor_move.used = true;
        builder.ctor_move.code += `this${accessor(key)}[NativeType.ctor_move](o${accessor(key)});\n`;
    }
    /**
     * call the constructor
     * @alias [NativeType.ctor]
     */
    construct(copyFrom) {
        if (copyFrom == null) {
            this[nativetype_1.NativeType.ctor]();
        }
        else {
            this[nativetype_1.NativeType.ctor_copy](copyFrom);
        }
    }
    /**
     * call the destructor
     * @alias [NativeType.dtor]
     */
    destruct() {
        this[nativetype_1.NativeType.dtor]();
    }
    /**
     * Combiation of allocating and constructing.
     *
     * const inst = new Class(true);
     * inst.construct();
     */
    static construct(copyFrom) {
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
    static allocate(copyFrom) {
        const clazz = this;
        const inst = capi_1.capi.malloc(clazz[nativetype_1.NativeType.size]).as(clazz);
        inst.construct(copyFrom);
        return inst;
    }
    static next(ptr, count) {
        const clazz = this;
        const size = clazz[core_1.StructurePointer.contentSize];
        if (size === null) {
            throw Error('Cannot call the next with the unknown sized structure');
        }
        return ptr.addAs(this, count * size);
    }
    /**
     * Cannot construct & Unknown size
     */
    static abstract(fields, defineSize, defineAlign) {
        const clazz = this;
        clazz.define(fields, defineSize, defineAlign, true);
    }
    static define(fields, defineSize, defineAlign = null, abstract = false) {
        const clazz = this;
        if (clazz.hasOwnProperty(isSealed)) {
            throw Error('Cannot define the structure of the already used');
        }
        const superclass = clazz.__proto__;
        sealClass(superclass);
        const def = new StructureDefinition(superclass);
        structures.set(clazz, def);
        for (const key in fields) {
            const type = fields[key];
            if (type instanceof Array) {
                def.field(key, type[0], type[1]);
            }
            else {
                def.field(key, type);
            }
        }
        if (abstract) {
            def.eof = null;
            if (defineSize === undefined)
                defineSize = null;
        }
        if (defineAlign !== null)
            def.align = defineAlign;
        def.define(clazz, defineSize);
    }
    static defineAsUnion(fields, abstract = false) {
        const clazz = this;
        for (const key in fields) {
            const item = fields[key];
            if (!(item instanceof Array)) {
                fields[key] = [item, 0];
            }
        }
        return clazz.define(fields, undefined, undefined, abstract);
    }
    static ref() {
        return singleton_1.Singleton.newInstance(NativeClass, this, () => makeReference(this));
    }
    static offsetOf(field) {
        return this[fieldmap][field].offset;
    }
    static typeOf(field) {
        return this[fieldmap][field].type;
    }
    static *keys() {
        for (const key in this[fieldmap]) {
            yield key;
        }
    }
    /**
     * call the destructor and capi.free
     *
     * inst.destruct();
     * capi.free(inst);
     */
    static delete(item) {
        item.destruct();
        capi_1.capi.free(item);
    }
    _toJsonOnce(allocator) {
        return circulardetector_1.CircularDetector.check(this, allocator, obj => {
            const fields = this.constructor[fieldmap];
            for (const field in fields) {
                let value;
                try {
                    value = this[field];
                }
                catch (err) {
                    value = 'Error: ' + err.message;
                }
                obj[field] = value;
            }
        });
    }
    static setExtends(supercls) {
        this.__proto__ = supercls;
        this.prototype._proto__ = supercls.prototype;
    }
    toJSON() {
        const obj = this._toJsonOnce(() => ({}));
        for (const key in obj) {
            if (!obj.hasOwnProperty(key))
                continue;
            const v = obj[key];
            if (v != null)
                obj[key] = v.toJSON != null ? v.toJSON() : v;
        }
        return obj;
    }
    [util.inspect.custom](depth, options) {
        return this._toJsonOnce(() => new (circulardetector_1.CircularDetector.makeTemporalClass(this.constructor.name, this, options)));
    }
}
exports.NativeClass = NativeClass;
NativeClass[_a] = 0;
NativeClass[_b] = 1;
NativeClass[_c] = 0;
NativeClass[_d] = true;
NativeClass[_e] = true;
NativeClass.getIndex = makefunc_1.TypeIn.getIndex;
NativeClass.prototype[nativetype_1.NativeType.size] = 0;
NativeClass.prototype[nativetype_1.NativeType.ctor] = common_1.emptyFunc;
NativeClass.prototype[nativetype_1.NativeType.dtor] = common_1.emptyFunc;
NativeClass.prototype[nativetype_1.NativeType.ctor_copy] = common_1.emptyFunc;
function sealClass(cls) {
    let node = cls;
    while (!node.hasOwnProperty(isSealed)) {
        node[isSealed] = true;
        node = node.__proto__;
    }
}
function nativeField(type, fieldOffset, bitMask) {
    return (obj, key) => {
        const clazz = obj.constructor;
        let def = structures.get(clazz);
        if (def == null)
            structures.set(clazz, def = new StructureDefinition(clazz.__proto__));
        def.field(key, type, fieldOffset, bitMask);
    };
}
exports.nativeField = nativeField;
function nativeClass(size, align = null) {
    return (clazz) => {
        const def = structures.get(clazz);
        if (def == null) {
            sealClass(clazz);
            const superclass = clazz.__proto__;
            clazz[core_1.StructurePointer.contentSize] =
                clazz.prototype[nativetype_1.NativeType.size] =
                    clazz[nativetype_1.NativeType.size] = size === undefined ? superclass[nativetype_1.NativeType.size] : size;
            clazz[nativetype_1.NativeType.align] = align == null ? superclass[nativetype_1.NativeType.align] : align;
        }
        else {
            structures.delete(clazz);
            if (align !== null)
                def.align = align;
            def.define(clazz, size);
        }
    };
}
exports.nativeClass = nativeClass;
class NativeArray extends core_1.PrivatePointer {
    static [nativetype_1.NativeType.getter](ptr, offset) {
        return ptr.addAs(this, offset, offset >> 31);
    }
    static [nativetype_1.NativeType.setter](ptr, value, offset) {
        throw Error('NativeArray cannot be set');
    }
    static [makefunc_1.makefunc.getFromParam](stackptr, offset) {
        return stackptr.addAs(this, offset, offset >> 31);
    }
    static [makefunc_1.makefunc.setToParam](stackptr, value, offset) {
        stackptr.setPointer(value, offset);
    }
    static [nativetype_1.NativeType.descriptor](builder, key, info) {
        const { offset, noInitialize } = info;
        const type = this;
        builder.desc[key] = {
            configurable: true,
            get() {
                const value = this.addAs(type, offset, offset >> 31);
                Object.defineProperty(this, key, { value });
                return value;
            }
        };
        if (noInitialize)
            return;
        if (type[nativetype_1.NativeType.ctor] !== common_1.emptyFunc) {
            builder.ctor.used = true;
            builder.ctor.code += `this${accessor(key)}[NativeType.ctor]();\n`;
        }
        if (type[nativetype_1.NativeType.dtor] !== common_1.emptyFunc) {
            builder.dtor.used = true;
            builder.dtor.code += `this${accessor(key)}[NativeType.dtor]();\n`;
        }
        builder.ctor_copy.used = true;
        builder.ctor_copy.code += `this${accessor(key)}[NativeType.ctor_copy](o${accessor(key)});\n`;
        builder.ctor_move.used = true;
        builder.ctor_move.code += `this${accessor(key)}[NativeType.ctor_move](o${accessor(key)});\n`;
    }
    static ref() {
        return singleton_1.Singleton.newInstance(NativeArray, this, () => {
            const clazz = this;
            return new nativetype_1.NativeType(clazz.name + '*', 8, 8, clazz.isTypeOf, clazz.isTypeOfWeak, (ptr, offset) => clazz[makefunc_1.makefunc.getFromParam](ptr, offset), (ptr, v, offset) => ptr.setPointer(v, offset));
        });
    }
    set(value, i) {
        const size = this.componentType[nativetype_1.NativeType.size];
        if (size == null)
            throw Error(`${this.componentType.name}: unknown size`);
        this.componentType[nativetype_1.NativeType.setter](this, value, i * size);
    }
    get(i) {
        const size = this.componentType[nativetype_1.NativeType.size];
        if (size == null)
            throw Error(`${this.componentType.name}: unknown size`);
        return this.componentType[nativetype_1.NativeType.getter](this, i * size);
    }
    toArray() {
        const n = this.length;
        const out = new Array(n);
        for (let i = 0; i < n; i++) {
            out[i] = this.get(i);
        }
        return out;
    }
    *[(_f = nativetype_1.NativeType.align, Symbol.iterator)]() {
        const n = this.length;
        for (let i = 0; i < n; i++) {
            yield this.get(i);
        }
    }
    static make(itemType, count) {
        var _g, _h, _j;
        const itemSize = itemType[nativetype_1.NativeType.size];
        if (itemSize === null)
            throw Error('Unknown size of item. NativeArray needs item size');
        const propmap = new nativetype_1.NativeDescriptorBuilder;
        propmap.desc.length = { value: count };
        let off = 0;
        for (let i = 0; i < count; i++) {
            itemType[nativetype_1.NativeType.descriptor](propmap, i, { offset: off, bitmask: null, ghost: false, noInitialize: false });
            off += itemSize;
        }
        class NativeArrayImpl extends NativeArray {
            static isTypeOf(v) {
                return v === null || v instanceof NativeArrayImpl;
            }
        }
        _g = nativetype_1.NativeType.size, _h = core_1.StructurePointer.contentSize, _j = nativetype_1.NativeType.align, nativetype_1.NativeType.size;
        NativeArrayImpl[_g] = off;
        NativeArrayImpl[_h] = off;
        NativeArrayImpl[_j] = itemType[nativetype_1.NativeType.align];
        NativeArrayImpl.prototype[nativetype_1.NativeType.size] = off;
        NativeArrayImpl.prototype.length = count;
        NativeArrayImpl.prototype.componentType = itemType;
        Object.defineProperties(NativeArrayImpl.prototype, propmap.desc);
        return NativeArrayImpl;
    }
}
exports.NativeArray = NativeArray;
NativeArray[_f] = 1;
exports.MantleClass = NativeClass;
function makeReference(type) {
    const clazz = type;
    return new nativetype_1.NativeType(type.name + '*', 8, 8, clazz.isTypeOf, clazz.isTypeOfWeak, (ptr, offset) => clazz[makefunc_1.makefunc.getFromParam](ptr, offset), (ptr, v, offset) => ptr.setPointer(v, offset));
}
var nativeClassUtil;
(function (nativeClassUtil) {
    function bindump(object) {
        const size = object[nativetype_1.NativeType.size];
        const ptr = object.as(core_1.NativePointer);
        for (let i = 0; i < size; i += 8) {
            const remaining = Math.min(size - i, 8);
            let str = '';
            for (let i = 0; i < remaining; i++) {
                let b = ptr.readUint8().toString(16);
                if (b.length === 1)
                    b = '0' + b;
                str = b + str;
            }
            console.log(str);
        }
    }
    nativeClassUtil.bindump = bindump;
})(nativeClassUtil = exports.nativeClassUtil || (exports.nativeClassUtil = {}));
//# sourceMappingURL=nativeclass.js.map