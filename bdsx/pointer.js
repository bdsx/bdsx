"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CxxStringWrapper = exports.Ptr = exports.Wrapper = void 0;
const tslib_1 = require("tslib");
const circulardetector_1 = require("./circulardetector");
const common_1 = require("./common");
const core_1 = require("./core");
const dll_1 = require("./dll");
const nativeclass_1 = require("./nativeclass");
const nativetype_1 = require("./nativetype");
const util = require("util");
class Wrapper extends nativeclass_1.NativeClass {
    static make(type) {
        class TypedWrapper extends Wrapper {
        }
        TypedWrapper.type = type;
        Object.defineProperty(TypedWrapper, 'name', { value: type.name });
        TypedWrapper.prototype.type = type;
        TypedWrapper.define({ value: type });
        return TypedWrapper;
    }
    static [nativetype_1.NativeType.ctor_copy](to, from) {
        to.copyFrom(from, 8);
    }
    static [nativetype_1.NativeType.ctor_move](to, from) {
        to.copyFrom(from, 8);
    }
    static [nativetype_1.NativeType.descriptor](builder, key, info) {
        const { offset } = info;
        const type = this;
        let obj = null;
        function init(ptr) {
            obj = ptr.getPointerAs(type, offset);
            Object.defineProperty(ptr, key, {
                get() {
                    return obj;
                },
                set(v) {
                    obj = v;
                    ptr.setPointer(v, offset);
                }
            });
        }
        builder.desc[key] = {
            configurable: true,
            get() {
                init(this);
                return obj;
            }
        };
    }
}
exports.Wrapper = Wrapper;
const bufferKeeper = Symbol();
class Ptr extends Wrapper {
    get(index) {
        const size = this.type[nativetype_1.NativeType.size];
        if (size == null)
            throw Error(`${this.type.name}: unknown size`);
        return this.type[nativetype_1.NativeType.getter](this, index * size);
    }
    set(value, index) {
        const size = this.type[nativetype_1.NativeType.size];
        if (size == null)
            throw Error(`${this.type.name}: unknown size`);
        this.type[nativetype_1.NativeType.setter](this, value, index * size);
    }
    static create(count) {
        const size = this.type[nativetype_1.NativeType.size];
        if (size == null)
            throw Error(`${this.type.name}: unknown size`);
        const buffer = new core_1.AllocatedPointer(size * count);
        const ptr = buffer.as(this);
        ptr[bufferKeeper] = buffer; // make a reference for avoiding GC
        return ptr;
    }
    static make(type) {
        return Wrapper.make(type.ref());
    }
}
exports.Ptr = Ptr;
let CxxStringWrapper = class CxxStringWrapper extends nativeclass_1.NativeClass {
    [nativetype_1.NativeType.ctor]() {
        (0, common_1.abstract)();
    }
    [nativetype_1.NativeType.dtor]() {
        (0, common_1.abstract)();
    }
    [nativetype_1.NativeType.ctor_copy](other) {
        (0, common_1.abstract)();
    }
    get value() {
        return this.getCxxString();
    }
    set value(str) {
        this.setCxxString(str);
    }
    get valueptr() {
        if (this.capacity >= 0x10)
            return this.getPointer();
        else
            return this.add();
    }
    valueAs(encoding) {
        return this.getCxxString(0, encoding);
    }
    reserve(nsize) {
        const capacity = this.capacity;
        if (nsize > capacity) {
            const orivalue = this.valueptr;
            this.capacity = nsize;
            const dest = dll_1.dll.ucrtbase.malloc(nsize + 1);
            dest.copyFrom(orivalue, this.length);
            if (capacity >= 0x10)
                dll_1.dll.ucrtbase.free(orivalue);
            this.setPointer(dest);
            if (dest === null) {
                this.setString("[out of memory]\0");
                this.capacity = 15;
                this.length = 15;
                return;
            }
        }
    }
    resize(nsize) {
        this.reserve(nsize);
        this.length = nsize;
    }
    [util.inspect.custom](depth, options) {
        const obj = new (circulardetector_1.CircularDetector.makeTemporalClass(this.constructor.name, this, options));
        obj.value = this.value;
        return obj;
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int64_as_float_t, 0x10)
], CxxStringWrapper.prototype, "length", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int64_as_float_t, 0x18)
], CxxStringWrapper.prototype, "capacity", void 0);
CxxStringWrapper = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CxxStringWrapper);
exports.CxxStringWrapper = CxxStringWrapper;
CxxStringWrapper.prototype[nativetype_1.NativeType.ctor] = function () { return nativetype_1.CxxString[nativetype_1.NativeType.ctor](this); };
CxxStringWrapper.prototype[nativetype_1.NativeType.dtor] = function () { return nativetype_1.CxxString[nativetype_1.NativeType.dtor](this); };
CxxStringWrapper.prototype[nativetype_1.NativeType.ctor_copy] = function (other) {
    return nativetype_1.CxxString[nativetype_1.NativeType.ctor_copy](this, other);
};
CxxStringWrapper.prototype[nativetype_1.NativeType.ctor_move] = function (other) {
    return nativetype_1.CxxString[nativetype_1.NativeType.ctor_move](this, other);
};
//# sourceMappingURL=pointer.js.map