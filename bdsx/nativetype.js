"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CxxStringWith8Bytes = exports.templateArgs = exports.JsValueRef = exports.AddressOfIt = exports.PointerLike = exports.StringUtf16 = exports.StringUtf8 = exports.StringAnsi = exports.bin128_t = exports.bin64_t = exports.GslStringSpan = exports.CxxString = exports.float64_t = exports.float32_t = exports.int64_as_float_t = exports.long_t = exports.int32_t = exports.int16_t = exports.int8_t = exports.uint64_as_float_t = exports.ulong_t = exports.uint32_t = exports.uint16_t = exports.uint8_t = exports.bool_t = exports.void_t = exports.nullptr_t = exports.NativeType = exports.NativeDescriptorBuilder = void 0;
const common_1 = require("./common");
const core_1 = require("./core");
const dllraw_1 = require("./dllraw");
const makefunc_1 = require("./makefunc");
const singleton_1 = require("./singleton");
const util_1 = require("./util");
var NativeTypeFn;
(function (NativeTypeFn) {
    NativeTypeFn.align = Symbol('align');
    NativeTypeFn.ctor = Symbol('ctor');
    NativeTypeFn.ctor_copy = Symbol('ctor_copy');
    NativeTypeFn.isNativeClass = Symbol('isNativeClass');
    NativeTypeFn.descriptor = Symbol('descriptor');
    NativeTypeFn.bitGetter = Symbol('bitGetter');
    NativeTypeFn.bitSetter = Symbol('bitSetter');
})(NativeTypeFn || (NativeTypeFn = {}));
function defaultCopy(size) {
    return (to, from) => {
        to.copyFrom(from, size);
    };
}
class NativeDescriptorBuilder {
    constructor() {
        this.desc = {};
        this.params = [];
        this.imports = new Map();
        this.names = new Set();
        this.ctor = new NativeDescriptorBuilder.UseContextCtor;
        this.dtor = new NativeDescriptorBuilder.UseContextDtor;
        this.ctor_copy = new NativeDescriptorBuilder.UseContextCtorCopy;
        this.ctor_move = new NativeDescriptorBuilder.UseContextCtorCopy;
    }
    importType(type) {
        return this.import(type, type.name);
    }
    import(type, name) {
        const oname = this.imports.get(type);
        if (oname != null)
            return oname;
        name = (0, util_1.filterToIdentifierableString)(name);
        if (this.names.has(name)) {
            const oname = name;
            let idx = 1;
            do {
                name = oname + (++idx);
            } while (this.names.has(name));
        }
        this.imports.set(type, name);
        this.names.add(name);
        return name;
    }
}
exports.NativeDescriptorBuilder = NativeDescriptorBuilder;
(function (NativeDescriptorBuilder) {
    class UseContext {
        constructor() {
            this.code = '';
            this.used = false;
            this.offset = 0;
            this.ptrUsed = false;
        }
        setPtrOffset(offset) {
            this.used = true;
            const delta = offset - this.offset;
            if (delta !== 0)
                this.code += `ptr.move(${delta});\n`;
            this.offset = offset;
        }
    }
    NativeDescriptorBuilder.UseContext = UseContext;
    class UseContextCtor extends UseContext {
    }
    NativeDescriptorBuilder.UseContextCtor = UseContextCtor;
    class UseContextDtor extends UseContext {
    }
    NativeDescriptorBuilder.UseContextDtor = UseContextDtor;
    class UseContextCtorCopy extends UseContext {
        setPtrOffset(offset) {
            this.used = true;
            const delta = offset - this.offset;
            if (delta !== 0)
                this.code += `ptr.move(${delta});\noptr.move(${delta});\n`;
            this.offset = offset;
        }
    }
    NativeDescriptorBuilder.UseContextCtorCopy = UseContextCtorCopy;
})(NativeDescriptorBuilder = exports.NativeDescriptorBuilder || (exports.NativeDescriptorBuilder = {}));
function numericBitGetter(ptr, shift, mask, offset) {
    const value = this[makefunc_1.makefunc.getter](ptr, offset);
    return (value & mask) >> shift;
}
function numericBitSetter(ptr, value, shift, mask, offset) {
    value = ((value << shift) & mask) | (this[NativeType.getter](ptr, offset) & ~mask);
    this[NativeType.setter](ptr, value, offset);
}
class NativeType extends makefunc_1.makefunc.ParamableT {
    constructor(
    /**
     * pdb symbol name. it's used by type_id.pdbimport
     */
    name, size, align, 
    /**
     * js type checker for overloaded functions
     * and parameter checking
     */
    isTypeOf, 
    /**
     * isTypeOf but allo downcasting
     */
    isTypeOfWeak, 
    /**
     * getter with the pointer
     */
    get, 
    /**
     * setter with the pointer
     */
    set, 
    /**
     * assembly for casting the native value to the js value
     */
    getFromParam = get, 
    /**
     * assembly for casting the js value to the native value
     */
    setToParam = set, 
    /**
     * constructor
     */
    ctor = common_1.emptyFunc, 
    /**
     * destructor
     */
    dtor = common_1.emptyFunc, 
    /**
     * copy constructor, https://en.cppreference.com/w/cpp/language/copy_constructor
     */
    ctor_copy = defaultCopy(size), 
    /**
     * move constructor, https://en.cppreference.com/w/cpp/language/move_constructor
     * it uses the copy constructor by default
     */
    ctor_move = ctor_copy) {
        super(name, getFromParam, setToParam, ctor_move, isTypeOf, isTypeOfWeak);
        this[_a] = common_1.abstract;
        this[_b] = common_1.abstract;
        this[NativeType.size] = size;
        this[NativeType.align] = align;
        this[NativeType.getter] = get;
        this[NativeType.setter] = set;
        this[NativeType.ctor] = ctor;
        this[NativeType.dtor] = dtor;
        this[NativeType.ctor_copy] = ctor_copy;
        this[NativeType.ctor_move] = ctor_move;
        this.getIndex();
    }
    supportsBitMask() {
        return this[NativeTypeFn.bitGetter] !== common_1.abstract;
    }
    extends(fields, name) {
        const type = this;
        const ntype = new NativeType(name || this.name, type[NativeType.size], type[NativeType.align], type.isTypeOf, type.isTypeOfWeak, type[NativeType.getter], type[NativeType.setter], type[makefunc_1.makefunc.getFromParam], type[makefunc_1.makefunc.setToParam], type[NativeType.ctor], type[NativeType.dtor], type[NativeType.ctor_copy], type[NativeType.ctor_move]);
        if (fields != null) {
            for (const field in fields) {
                ntype[field] = fields[field];
            }
        }
        return ntype;
    }
    ref() {
        return singleton_1.Singleton.newInstance(NativeType, this, () => makeReference(this));
    }
    [(makefunc_1.makefunc.getter, makefunc_1.makefunc.setter, NativeTypeFn.ctor, makefunc_1.makefunc.dtor, makefunc_1.makefunc.ctor_move, NativeTypeFn.ctor_copy, NativeTypeFn.align, _a = NativeTypeFn.bitGetter, _b = NativeTypeFn.bitSetter, NativeTypeFn.descriptor)](builder, key, info) {
        (0, common_1.abstract)();
    }
    static defaultDescriptor(builder, key, info) {
        const { offset, bitmask, noInitialize } = info;
        const type = this;
        if (bitmask !== null) {
            if (!(type instanceof NativeType))
                throw Error(`${this.name} does not support the bit mask`);
            builder.desc[key] = {
                get() { return type[NativeTypeFn.bitGetter](this, bitmask[0], bitmask[1], offset); },
                set(value) { return type[NativeTypeFn.bitSetter](this, value, bitmask[0], bitmask[1], offset); }
            };
        }
        else {
            builder.desc[key] = {
                get() { return type[NativeType.getter](this, offset); },
                set(value) { return type[NativeType.setter](this, value, offset); }
            };
        }
        if (noInitialize)
            return;
        let ctorbase = type.prototype;
        if (ctorbase == null || !(NativeType.ctor in ctorbase))
            ctorbase = type;
        const name = builder.importType(type);
        if (ctorbase[NativeType.ctor] !== common_1.emptyFunc) {
            builder.ctor.ptrUsed = true;
            builder.ctor.setPtrOffset(offset);
            builder.ctor.code += `${name}[NativeType.ctor](ptr);\n`;
        }
        if (ctorbase[NativeType.dtor] !== common_1.emptyFunc) {
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
}
exports.NativeType = NativeType;
NativeType.getter = makefunc_1.makefunc.getter;
NativeType.setter = makefunc_1.makefunc.setter;
NativeType.ctor = NativeTypeFn.ctor;
NativeType.dtor = makefunc_1.makefunc.dtor;
NativeType.registerDirect = makefunc_1.makefunc.registerDirect;
NativeType.ctor_copy = NativeTypeFn.ctor_copy;
NativeType.ctor_move = makefunc_1.makefunc.ctor_move;
NativeType.size = makefunc_1.makefunc.size;
NativeType.align = NativeTypeFn.align;
NativeType.descriptor = NativeTypeFn.descriptor;
NativeType.prototype[NativeTypeFn.descriptor] = NativeType.defaultDescriptor;
function makeReference(type) {
    return new NativeType(`${type.name}*`, 8, 8, type.isTypeOf, type.isTypeOfWeak, (ptr, offset) => type[NativeType.getter](ptr.getPointer(offset)), (ptr, v, offset) => type[NativeType.setter](ptr.getPointer(), v, offset), undefined, // same with getter
    (stackptr, param, offset) => stackptr.setPointer(makefunc_1.makefunc.tempValue(type, param), offset));
}
core_1.VoidPointer[NativeType.align] = 8;
core_1.VoidPointer[NativeType.ctor] = common_1.emptyFunc;
core_1.VoidPointer[NativeType.dtor] = common_1.emptyFunc;
core_1.VoidPointer[NativeType.ctor_copy] = function (to, from) {
    to.copyFrom(from, 8);
};
core_1.VoidPointer[NativeType.ctor_move] = function (to, from) {
    this[NativeType.ctor_copy](to, from);
};
core_1.VoidPointer[NativeType.descriptor] = NativeType.defaultDescriptor;
function isNumber(v) {
    return typeof v === 'number';
}
function int32To64(ptr, v, offset) {
    ptr.setInt32To64WithZero(v, offset);
}
exports.nullptr_t = new NativeType('nullptr_t', 0, 1, v => v == null, undefined, (ptr, offset) => null, (ptr, v, offset) => {
    // empty
}, undefined, common_1.emptyFunc);
Object.freeze(exports.nullptr_t);
exports.void_t = new NativeType('void', 0, 1, v => v === undefined, undefined, common_1.emptyFunc, common_1.emptyFunc, common_1.emptyFunc, common_1.emptyFunc, common_1.emptyFunc);
exports.bool_t = new NativeType('bool', 1, 1, v => typeof v === 'boolean', undefined, (ptr, offset) => ptr.getBoolean(offset), (ptr, v, offset) => ptr.setBoolean(v, offset), undefined, int32To64);
exports.bool_t[NativeTypeFn.bitGetter] = (ptr, shift, mask, offset) => {
    const value = ptr.getUint8(offset);
    return (value & mask) !== 0;
};
exports.bool_t[NativeTypeFn.bitSetter] = (ptr, value, shift, mask, offset) => {
    const nvalue = ((+value) << shift) | (ptr.getUint8(offset) & ~mask);
    ptr.setUint8(nvalue, offset);
};
exports.uint8_t = new NativeType('unsigned char', 1, 1, v => typeof v === 'number' && (v | 0) === v && 0 <= v && v <= 0xff, isNumber, (ptr, offset) => ptr.getUint8(offset), (ptr, v, offset) => ptr.setUint8(v, offset), undefined, int32To64);
exports.uint8_t[NativeTypeFn.bitGetter] = numericBitGetter;
exports.uint8_t[NativeTypeFn.bitSetter] = numericBitSetter;
exports.uint16_t = new NativeType('unsigned short', 2, 2, v => typeof v === 'number' && (v | 0) === v && 0 <= v && v <= 0xffff, isNumber, (ptr, offset) => ptr.getUint16(offset), (ptr, v, offset) => ptr.setUint16(v, offset), undefined, int32To64);
exports.uint16_t[NativeTypeFn.bitGetter] = numericBitGetter;
exports.uint16_t[NativeTypeFn.bitSetter] = numericBitSetter;
exports.uint32_t = new NativeType('unsigned int', 4, 4, v => typeof v === 'number' && (v >>> 0) === v, isNumber, (ptr, offset) => ptr.getUint32(offset), (ptr, v, offset) => ptr.setUint32(v, offset), undefined, int32To64);
exports.uint32_t[NativeTypeFn.bitGetter] = numericBitGetter;
exports.uint32_t[NativeTypeFn.bitSetter] = numericBitSetter;
exports.ulong_t = new NativeType('unsigned long', 4, 4, v => typeof v === 'number' && (v >>> 0) === v, isNumber, (ptr, offset) => ptr.getUint32(offset), (ptr, v, offset) => ptr.setUint32(v, offset), undefined, int32To64);
exports.ulong_t[NativeTypeFn.bitGetter] = numericBitGetter;
exports.ulong_t[NativeTypeFn.bitSetter] = numericBitSetter;
exports.uint64_as_float_t = new NativeType('unsigned __int64', 8, 8, v => typeof v === 'number' && Math.round(v) === v && 0 <= v && v < 0x10000000000000000, isNumber, (ptr, offset) => ptr.getUint64AsFloat(offset), (ptr, v, offset) => ptr.setUint64WithFloat(v, offset));
exports.int8_t = new NativeType('char', 1, 1, v => typeof v === 'number' && (v | 0) === v && -0x80 <= v && v <= 0x7f, isNumber, (ptr, offset) => ptr.getInt8(offset), (ptr, v, offset) => ptr.setInt8(v, offset), undefined, int32To64);
exports.int8_t[NativeTypeFn.bitGetter] = numericBitGetter;
exports.int8_t[NativeTypeFn.bitSetter] = numericBitSetter;
exports.int16_t = new NativeType('short', 2, 2, v => typeof v === 'number' && (v | 0) === v && -0x8000 <= v && v <= 0x7fff, isNumber, (ptr, offset) => ptr.getInt16(offset), (ptr, v, offset) => ptr.setInt16(v, offset), undefined, int32To64);
exports.int16_t[NativeTypeFn.bitGetter] = numericBitGetter;
exports.int16_t[NativeTypeFn.bitSetter] = numericBitSetter;
exports.int32_t = new NativeType('int', 4, 4, v => typeof v === 'number' && (v | 0) === v, isNumber, (ptr, offset) => ptr.getInt32(offset), (ptr, v, offset) => ptr.setInt32(v, offset), undefined, int32To64);
exports.int32_t[NativeTypeFn.bitGetter] = numericBitGetter;
exports.int32_t[NativeTypeFn.bitSetter] = numericBitSetter;
exports.long_t = new NativeType('long', 4, 4, v => typeof v === 'number' && (v | 0) === v, isNumber, (ptr, offset) => ptr.getInt32(offset), (ptr, v, offset) => ptr.setInt32(v, offset), undefined, int32To64);
exports.long_t[NativeTypeFn.bitGetter] = numericBitGetter;
exports.long_t[NativeTypeFn.bitSetter] = numericBitSetter;
exports.int64_as_float_t = new NativeType('__int64', 8, 8, v => typeof v === 'number' && Math.round(v) === v && -0x8000000000000000 <= v && v < 0x8000000000000000, isNumber, (ptr, offset) => ptr.getInt64AsFloat(offset), (ptr, v, offset) => ptr.setInt64WithFloat(v, offset));
exports.float32_t = new NativeType('float', 4, 4, isNumber, isNumber, (ptr, offset) => ptr.getFloat32(offset), (ptr, v, offset) => ptr.setFloat32(v, offset), undefined, (stackptr, param, offset) => stackptr.setFloat32To64WithZero(param, offset));
exports.float32_t[makefunc_1.makefunc.useXmmRegister] = true;
exports.float64_t = new NativeType('double', 8, 8, isNumber, isNumber, (ptr, offset) => ptr.getFloat64(offset), (ptr, v, offset) => ptr.setFloat64(v, offset));
exports.float64_t[makefunc_1.makefunc.useXmmRegister] = true;
const string_ctor = makefunc_1.makefunc.js(dllraw_1.dllraw.bedrock_server['??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ'], exports.void_t, null, core_1.VoidPointer);
const string_dtor = makefunc_1.makefunc.js(dllraw_1.dllraw.bedrock_server['?_Tidy_deallocate@?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAAXXZ'], exports.void_t, null, core_1.VoidPointer);
exports.CxxString = new NativeType('std::basic_string<char,std::char_traits<char>,std::allocator<char> >', 0x20, 8, v => typeof v === 'string', undefined, (ptr, offset) => ptr.getCxxString(offset), (ptr, v, offset) => ptr.setCxxString(v, offset), (stackptr, offset) => {
    const ptr = stackptr.getPointer(offset);
    return ptr.getCxxString();
}, (stackptr, param, offset) => {
    const buf = new core_1.AllocatedPointer(0x20);
    string_ctor(buf);
    buf.setCxxString(param);
    makefunc_1.makefunc.temporalDtors.push(() => string_dtor(buf));
    stackptr.setPointer(buf, offset);
}, string_ctor, string_dtor, (to, from) => {
    to.setCxxString(from.getCxxString());
}, (to, from) => {
    to.copyFrom(from, 0x20);
    string_ctor(from);
});
function impossible() {
    throw Error(`Impossible to set`);
}
// continued from https://github.com/bdsx/bdsx/pull/142/commits/9820de4acf3c818ae5bc2f5eae0d19fd750f4482
exports.GslStringSpan = new NativeType('gsl::basic_string_span<char const,-1>', 0x10, 8, v => typeof v === 'string', undefined, (ptr, offset) => {
    const length = ptr.getInt64AsFloat(offset);
    return ptr.getPointer((offset || 0) + 8).getString(length);
}, impossible, (stackptr, offset) => {
    const strptr = stackptr.getPointer(offset);
    const length = strptr.getInt64AsFloat(0);
    return strptr.getPointer(8).getString(length);
}, (stackptr, param, offset) => {
    const str = Buffer.from(param, 'utf8');
    const buf = new core_1.AllocatedPointer(0x10);
    buf.setPointer(core_1.VoidPointer.fromAddressBuffer(str), 8);
    buf.setInt64WithFloat(str.length, 0);
    makefunc_1.makefunc.temporalKeeper.push(buf, str);
    stackptr.setPointer(buf, offset);
});
Object.freeze(exports.GslStringSpan);
exports.bin64_t = new NativeType('unsigned __int64', 8, 8, v => typeof v === 'string' && v.length === 4, undefined, (ptr, offset) => ptr.getBin64(offset), (ptr, v, offset) => ptr.setBin(v, offset)).extends({
    one: '\u0001\0\0\0',
    zero: '\0\0\0\0',
    minus_one: '\uffff\uffff\uffff\uffff',
});
exports.bin128_t = new NativeType('unsigned __int128', 16, 8, v => typeof v === 'string' && v.length === 8, undefined, (ptr, offset) => ptr.getBin(8, offset), (ptr, v, offset) => ptr.setBin(v, offset), () => { throw Error('bin128_t does not support the function type'); }, () => { throw Error('bin128_t does not support the function type'); }).extends({
    one: '\u0001\0\0\0',
    zero: '\0\0\0\0',
    minus_one: '\uffff\uffff\uffff\uffff',
});
exports.StringAnsi = new NativeType('char const *', 8, 8, v => v === null || typeof v === 'string', undefined, (ptr, offset) => ptr.getPointer().getString(undefined, offset, common_1.Encoding.Ansi), impossible, undefined, (stackptr, param, offset) => {
    if (param === null) {
        stackptr.setPointer(null, offset);
    }
    else {
        const buf = makefunc_1.makefunc.tempAlloc(param.length * 2 + 1);
        const len = buf.setString(param, 0, common_1.Encoding.Ansi);
        buf.setUint8(len, 0);
        stackptr.setPointer(buf, offset);
    }
});
exports.StringUtf8 = new NativeType('char const *', 8, 8, v => v === null || typeof v === 'string', undefined, (ptr, offset) => ptr.getPointer().getString(undefined, offset, common_1.Encoding.Utf8), impossible, undefined, (stackptr, param, offset) => stackptr.setPointer(param === null ? null : makefunc_1.makefunc.tempString(param), offset));
exports.StringUtf16 = new NativeType('StringUtf16', 8, 8, v => v === null || typeof v === 'string', undefined, (stackptr, offset) => stackptr.getPointer().getString(undefined, offset, common_1.Encoding.Utf16), impossible, undefined, (stackptr, param, offset) => stackptr.setPointer(param === null ? null : makefunc_1.makefunc.tempString(param, common_1.Encoding.Utf16), offset));
exports.PointerLike = new NativeType('void const *', 8, 8, v => {
    if (v === null)
        return true;
    if (v instanceof core_1.VoidPointer)
        return true;
    if (v instanceof DataView)
        return true;
    if (v instanceof ArrayBuffer)
        return true;
    if (v instanceof Uint8Array)
        return true;
    if (v instanceof Int32Array)
        return true;
    if (v instanceof Uint16Array)
        return true;
    if (v instanceof Uint32Array)
        return true;
    if (v instanceof Int8Array)
        return true;
    if (v instanceof Int16Array)
        return true;
    return false;
}, undefined, (stackptr, offset) => stackptr.getPointer(offset), (stackptr, param, offset) => {
    if (!(param instanceof core_1.VoidPointer)) {
        throw Error(`Needs the pointer for fields`);
    }
    stackptr.setPointer(param, offset);
}, undefined, (stackptr, param, offset) => {
    if (param !== null) {
        if (typeof param === 'string') {
            param = makefunc_1.makefunc.tempString(param);
        }
        else if (!(param instanceof core_1.VoidPointer)) {
            param = core_1.VoidPointer.fromAddressBuffer(param);
        }
    }
    stackptr.setPointer(param, offset);
});
exports.AddressOfIt = new NativeType('void const &*', 8, 8, v => {
    if (v === null)
        return true;
    return v instanceof core_1.VoidPointer;
}, undefined, (stackptr, offset) => stackptr.add(offset), (stackptr, param, offset) => {
    throw Error('Invalid usage');
}, undefined, (stackptr, param, offset) => {
    throw Error('Invalid usage');
});
exports.JsValueRef = new NativeType('JsValueRef', 8, 8, () => true, undefined, (ptr, offset) => ptr.getJsValueRef(offset), (ptr, param, offset) => ptr.setJsValueRef(param, offset));
function templateArgs(...args) {
    return args;
}
exports.templateArgs = templateArgs;
/** @deprecated for legacy support */
exports.CxxStringWith8Bytes = exports.CxxString.extends();
exports.CxxStringWith8Bytes[NativeType.size] = 0x28;
//# sourceMappingURL=nativetype.js.map