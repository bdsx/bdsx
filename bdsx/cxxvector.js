"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CxxVectorToArray = exports.CxxVector = void 0;
const dll_1 = require("./dll");
const makefunc_1 = require("./makefunc");
const msalloc_1 = require("./msalloc");
const nativeclass_1 = require("./nativeclass");
const nativetype_1 = require("./nativetype");
const singleton_1 = require("./singleton");
const templatename_1 = require("./templatename");
const util = require("util");
const VECTOR_SIZE = 0x18;
function getSize(bytes, compsize) {
    if (bytes % compsize !== 0) {
        throw Error(`invalid vector size (bytes=0x${bytes.toString(16)}, compsize=0x${compsize.toString(16)})`);
    }
    return bytes / compsize | 0;
}
/**
 * std::vector<T>
 * C++ standard dynamic array class
 */
class CxxVector extends nativeclass_1.NativeClass {
    [nativetype_1.NativeType.ctor]() {
        dll_1.dll.vcruntime140.memset(this, 0, VECTOR_SIZE);
    }
    [nativetype_1.NativeType.dtor]() {
        const begin = this.getPointer(0);
        const ptr = begin.add();
        const end = this.getPointer(8);
        const capBytes = this.getPointer(16).subptr(begin);
        const compsize = this.componentType[nativetype_1.NativeType.size];
        let idx = 0;
        while (!ptr.equals(end)) {
            this._dtor(ptr, idx++);
            ptr.move(compsize);
        }
        msalloc_1.msAlloc.deallocate(begin, capBytes);
        this._resizeCache(0);
    }
    [nativetype_1.NativeType.ctor_copy](from) {
        const fromSizeBytes = from.sizeBytes();
        const ptr = msalloc_1.msAlloc.allocate(fromSizeBytes);
        const compsize = this.componentType[nativetype_1.NativeType.size];
        const size = getSize(fromSizeBytes, compsize);
        const srcptr = from.getPointer(0);
        this.setPointer(ptr, 0);
        for (let i = 0; i < size; i++) {
            this._ctor(ptr, i);
            this._copy(ptr, from._get(srcptr, i), i);
            ptr.move(compsize);
            srcptr.move(compsize);
        }
        this.setPointer(ptr, 8);
        this.setPointer(ptr, 16);
    }
    [nativetype_1.NativeType.ctor_move](from) {
        from._resizeCache(0);
        dll_1.dll.vcruntime140.memcpy(this, from, VECTOR_SIZE);
        dll_1.dll.vcruntime140.memset(from, 0, VECTOR_SIZE);
    }
    _resizeCache(n) {
        // empty
    }
    _resize(newSizeBytes, oldCapBytes, oldptr, oldSizeBytes) {
        const newcapBytes = Math.max(newSizeBytes, oldCapBytes * 2);
        const compsize = this.componentType[nativetype_1.NativeType.size];
        const allocated = msalloc_1.msAlloc.allocate(newcapBytes);
        this.setPointer(allocated, 0);
        const oldSize = getSize(oldSizeBytes, compsize);
        const newSize = getSize(newSizeBytes, compsize);
        this._move_alloc(allocated, oldptr, Math.min(oldSize, newSize));
        msalloc_1.msAlloc.deallocate(oldptr, oldCapBytes);
        for (let i = oldSize; i < newSize; i++) {
            this._ctor(allocated, i);
            allocated.move(compsize);
        }
        this.setPointer(allocated, 8);
        allocated.move(newcapBytes - newSizeBytes);
        this.setPointer(allocated, 16);
    }
    set(idx, component) {
        const type = this.componentType;
        const compsize = type[nativetype_1.NativeType.size];
        let begptr = this.getPointer(0);
        const oldSizeBytes = this.getPointer(8).subptr(begptr);
        const targetOffset = idx * compsize;
        if (targetOffset < oldSizeBytes) {
            begptr.move(targetOffset);
            this._copy(begptr, component, idx);
            return;
        }
        const oldCapBytes = this.getPointer(16).subptr(begptr);
        const newSizeBytes = targetOffset + compsize;
        if (newSizeBytes > oldCapBytes) {
            this._resize(newSizeBytes, oldCapBytes, begptr, oldSizeBytes);
            begptr = this.getPointer(0);
        }
        begptr.move(newSizeBytes);
        this.setPointer(begptr, 8);
        begptr.move(-compsize, -1);
        this._copy(begptr, component, idx);
    }
    get(idx) {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const compsize = this.componentType[nativetype_1.NativeType.size];
        const bytes = endptr.subptr(beginptr);
        const size = getSize(bytes, compsize);
        if (idx < 0 || idx >= size)
            return null;
        beginptr.move(idx * compsize);
        return this._get(beginptr, idx);
    }
    back() {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        if (beginptr.equals(endptr))
            return null;
        const compsize = this.componentType[nativetype_1.NativeType.size];
        endptr.move(-compsize, -1);
        const bytes = endptr.subptr(beginptr);
        const idx = getSize(bytes, compsize);
        return this._get(endptr, idx);
    }
    pop() {
        const begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        if (endptr.equals(begptr))
            return false;
        const compsize = this.componentType[nativetype_1.NativeType.size];
        endptr.move(-compsize, -1);
        const idx = getSize(endptr.subptr(begptr), compsize);
        this._dtor(endptr, idx);
        this.setPointer(endptr, 8);
        return true;
    }
    push(...component) {
        const n = component.length;
        if (n === 0)
            return;
        let begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const capptr = this.getPointer(16);
        const oldbytes = endptr.subptr(begptr);
        const compsize = this.componentType[nativetype_1.NativeType.size];
        const oldsize = getSize(oldbytes, compsize);
        if (n === 1) {
            if (capptr.equals(endptr)) {
                const capBytes = capptr.subptr(begptr);
                const newBytes = oldbytes + compsize;
                this._resize(newBytes, capBytes, begptr, oldbytes);
                begptr = this.getPointer(0);
                begptr.move(oldbytes);
            }
            else {
                begptr.move(oldbytes + compsize);
                this.setPointer(begptr, 8);
                begptr.move(-compsize, -1);
                this._ctor(begptr, oldsize);
            }
            this._copy(begptr, component[0], oldsize);
        }
        else {
            const newbytes = n * compsize + oldbytes;
            const capbytes = capptr.subptr(begptr);
            if (newbytes > capbytes) {
                this._resize(newbytes, capbytes, begptr, oldbytes);
                begptr = this.getPointer(0);
                begptr.move(oldbytes);
            }
            else {
                const to = oldsize + n;
                for (let i = oldsize; i < to; i++) {
                    this._ctor(begptr, i);
                    begptr.move(compsize);
                }
                this.setPointer(begptr, 8);
                begptr.move(oldbytes - newbytes, -1);
            }
            let idx = getSize(oldbytes, compsize);
            for (const c of component) {
                this._copy(begptr, c, idx++);
                begptr.move(compsize);
            }
        }
    }
    splice(start, deleteCount, ...items) {
        const n = items.length;
        if (n < deleteCount) {
            let i = start + n;
            const offset = deleteCount - n;
            const newsize = this.size() - offset;
            for (; i < newsize; i++) {
                this.set(i, this.get(i + offset));
            }
            this.resize(newsize);
        }
        else if (n > deleteCount) {
            const offset = n - deleteCount;
            const size = this.size();
            const newsize = size + offset;
            this.resize(newsize);
            const iend = start + n;
            for (let i = newsize - 1; i >= iend; i--) {
                this.set(i, this.get(i - offset));
            }
        }
        for (let i = 0; i < n; i++) {
            this.set(i + start, items[i]);
        }
    }
    resize(newSize) {
        const compsize = this.componentType[nativetype_1.NativeType.size];
        const begin = this.getPointer(0);
        const end = this.getPointer(8);
        const oldSizeBytes = end.subptr(begin);
        const oldSize = getSize(oldSizeBytes, compsize);
        const newSizeBytes = newSize * compsize;
        if (newSize <= oldSize) {
            begin.move(newSizeBytes);
            this.setPointer(begin, 8);
            let i = newSize;
            while (!begin.equals(end)) {
                this._dtor(begin, i++);
                begin.move(compsize);
            }
            this._resizeCache(newSize);
            return;
        }
        const cap = this.getPointer(16);
        const oldCapBytes = cap.subptr(begin);
        if (newSizeBytes <= oldCapBytes) {
            begin.move(newSizeBytes);
            this.setPointer(begin, 8);
            let i = oldSize;
            while (!end.equals(begin)) {
                this._ctor(end, i++);
                end.move(compsize);
            }
            return;
        }
        this._resize(newSizeBytes, oldCapBytes, begin, oldSizeBytes);
    }
    size() {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const bytes = endptr.subptr(beginptr);
        const compsize = this.componentType[nativetype_1.NativeType.size];
        return getSize(bytes, compsize);
    }
    sizeBytes() {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        return endptr.subptr(beginptr);
    }
    capacity() {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(16);
        return getSize(endptr.subptr(beginptr), this.componentType[nativetype_1.NativeType.size]);
    }
    toArray() {
        const n = this.size();
        const out = new Array(n);
        for (let i = 0; i < n; i++) {
            out[i] = this.get(i);
        }
        return out;
    }
    setFromArray(array) {
        const n = array.length;
        const size = this.size();
        if (n > size)
            this.resize(n);
        for (let i = 0; i < n; i++) {
            this.set(i, array[i]);
        }
        if (n < size)
            this.resize(n);
    }
    *[Symbol.iterator]() {
        const n = this.size();
        for (let i = 0; i < n; i++) {
            yield this.get(i);
        }
    }
    static make(type) {
        const t = type;
        return singleton_1.Singleton.newInstance(CxxVector, t, () => {
            if (t[nativetype_1.NativeType.size] == null)
                throw Error("CxxVector needs the component size");
            if (nativeclass_1.NativeClass.isNativeClassType(t)) {
                class VectorImpl extends CxxVector {
                    constructor() {
                        super(...arguments);
                        this.cache = [];
                    }
                    _resizeCache(size) {
                        this.cache.length = size;
                    }
                    _move_alloc(allocated, oldptr, movesize) {
                        const clazz = this.componentType;
                        const compsize = this.componentType[nativetype_1.NativeType.size];
                        const oldptrmove = oldptr.add();
                        for (let i = 0; i < movesize; i++) {
                            const new_item = allocated.as(clazz);
                            const old_item = this._get(oldptrmove, i);
                            this.cache[i] = new_item;
                            new_item[nativetype_1.NativeType.ctor_move](old_item);
                            old_item[nativetype_1.NativeType.dtor]();
                            allocated.move(compsize);
                            oldptrmove.move(compsize);
                        }
                        this.cache.length = 0;
                    }
                    _get(ptr, index) {
                        const item = this.cache[index];
                        if (item != null)
                            return item;
                        const type = this.componentType;
                        return this.cache[index] = ptr.as(type);
                    }
                    _dtor(ptr, index) {
                        this._get(ptr, index)[nativetype_1.NativeType.dtor]();
                    }
                    _ctor(ptr, index) {
                        this._get(ptr, index)[nativetype_1.NativeType.ctor]();
                    }
                    _copy(ptr, from, index) {
                        this._get(ptr, index)[nativetype_1.NativeType.setter](from);
                    }
                }
                VectorImpl.componentType = t;
                Object.defineProperty(VectorImpl, 'name', { value: getVectorName(t) });
                VectorImpl.prototype.componentType = t;
                VectorImpl.abstract({}, VECTOR_SIZE, 8);
                return VectorImpl;
            }
            else {
                class VectorImpl extends CxxVector {
                    _move_alloc(allocated, oldptr, movesize) {
                        const compsize = this.componentType[nativetype_1.NativeType.size];
                        const oldptrmove = oldptr.add();
                        for (let i = 0; i < movesize; i++) {
                            this.componentType[nativetype_1.NativeType.ctor_move](allocated, oldptrmove);
                            this.componentType[nativetype_1.NativeType.dtor](oldptrmove);
                            allocated.move(compsize);
                            oldptrmove.move(compsize);
                        }
                    }
                    _get(ptr) {
                        const type = this.componentType;
                        return type[nativetype_1.NativeType.getter](ptr);
                    }
                    _dtor(ptr) {
                        const type = this.componentType;
                        type[nativetype_1.NativeType.dtor](ptr);
                    }
                    _ctor(ptr) {
                        const type = this.componentType;
                        type[nativetype_1.NativeType.ctor](ptr);
                    }
                    _copy(ptr, from) {
                        const type = this.componentType;
                        type[nativetype_1.NativeType.setter](ptr, from);
                    }
                }
                VectorImpl.componentType = t;
                Object.defineProperty(VectorImpl, 'name', { value: getVectorName(t) });
                VectorImpl.prototype.componentType = t;
                VectorImpl.abstract({}, VECTOR_SIZE, 8);
                return VectorImpl;
            }
        });
    }
    [util.inspect.custom](depth, options) {
        return `CxxVector ${util.inspect(this.toArray(), options)}`;
    }
}
exports.CxxVector = CxxVector;
function getVectorName(type) {
    return (0, templatename_1.templateName)('std::vector', type.name, (0, templatename_1.templateName)('std::allocator', type.name));
}
class CxxVectorToArrayImpl extends nativetype_1.NativeType {
    constructor(compType) {
        super(getVectorName(compType), VECTOR_SIZE, 8, v => v instanceof Array, undefined, (ptr, offset) => ptr.addAs(this.type, offset, offset >> 31).toArray(), (ptr, v, offset) => ptr.addAs(this.type, offset, offset >> 31).setFromArray(v), stackptr => stackptr.getPointerAs(this.type).toArray(), (stackptr, param, offset) => {
            const buf = new this.type(true);
            buf.construct();
            buf.setFromArray(param);
            makefunc_1.makefunc.temporalDtors.push(() => buf.destruct());
            stackptr.setPointer(buf, offset);
        }, ptr => dll_1.dll.vcruntime140.memset(ptr, 0, VECTOR_SIZE), ptr => {
            const beg = ptr.getPointer(0);
            const cap = ptr.getPointer(16);
            msalloc_1.msAlloc.deallocate(beg, cap.subptr(beg));
        }, (to, from) => to.as(this.type)[nativetype_1.NativeType.ctor_copy](from.as(this.type)), (to, from) => {
            dll_1.dll.vcruntime140.memcpy(to, from, VECTOR_SIZE);
            dll_1.dll.vcruntime140.memset(from, 0, VECTOR_SIZE);
        });
        this.compType = compType;
        this.type = CxxVector.make(this.compType);
    }
}
var CxxVectorToArray;
(function (CxxVectorToArray) {
    function make(compType) {
        return singleton_1.Singleton.newInstance(CxxVectorToArrayImpl, compType, () => new CxxVectorToArrayImpl(compType));
    }
    CxxVectorToArray.make = make;
})(CxxVectorToArray = exports.CxxVectorToArray || (exports.CxxVectorToArray = {}));
//# sourceMappingURL=cxxvector.js.map