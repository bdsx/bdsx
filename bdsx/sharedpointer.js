"use strict";
var SharedPtrBase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedPtr = exports.SharedPtrBase = void 0;
const tslib_1 = require("tslib");
const capi_1 = require("./capi");
const common_1 = require("./common");
const core_1 = require("./core");
const makefunc_1 = require("./makefunc");
const nativeclass_1 = require("./nativeclass");
const nativetype_1 = require("./nativetype");
const singleton_1 = require("./singleton");
const templatename_1 = require("./templatename");
let SharedPtrBase = SharedPtrBase_1 = class SharedPtrBase extends nativeclass_1.NativeClass {
    [nativetype_1.NativeType.ctor]() {
        this.useRef = 1;
        this.weakRef = 1;
    }
    addRef() {
        this.interlockedIncrement32(8); // useRef
        this.interlockedIncrement32(16); // weakRef
    }
    release() {
        if (this.interlockedDecrement32(0x8) === 0) {
            this._Destroy();
        }
        if (this.interlockedDecrement32(0xc) === 0) {
            this._DeleteThis();
        }
    }
    _DeleteThis() {
        (0, common_1.abstract)();
    }
    _Destroy() {
        (0, common_1.abstract)();
    }
    static make(type) {
        return singleton_1.Singleton.newInstance(SharedPtrBase_1, type, () => {
            class SharedPtrBaseImpl extends SharedPtrBase_1 {
            }
            SharedPtrBaseImpl.define({ value: type });
            return SharedPtrBaseImpl;
        });
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], SharedPtrBase.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], SharedPtrBase.prototype, "useRef", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], SharedPtrBase.prototype, "weakRef", void 0);
SharedPtrBase = SharedPtrBase_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], SharedPtrBase);
exports.SharedPtrBase = SharedPtrBase;
SharedPtrBase.prototype._Destroy = makefunc_1.makefunc.js([0], nativetype_1.void_t, { this: SharedPtrBase });
SharedPtrBase.prototype._DeleteThis = makefunc_1.makefunc.js([8], nativetype_1.void_t, { this: SharedPtrBase });
const sizeOfSharedPtrBase = SharedPtrBase[nativetype_1.NativeType.size];
/**
 * wrapper for std::shared_ptr
 */
class SharedPtr extends nativeclass_1.NativeClass {
    [nativetype_1.NativeType.dtor]() {
        if (this.ref !== null)
            this.ref.release();
    }
    assign(value) {
        this[nativetype_1.NativeType.dtor]();
        this[nativetype_1.NativeType.ctor_copy](value);
        return this;
    }
    assign_move(value) {
        this[nativetype_1.NativeType.dtor]();
        this[nativetype_1.NativeType.ctor_move](value);
        return this;
    }
    exists() {
        return this.ref !== null;
    }
    addRef() {
        this.ref.addRef();
    }
    assignTo(dest) {
        const ctor = this.constructor;
        const ptr = dest.as(ctor);
        ptr.assign(this);
    }
    static make(type) {
        const t = type;
        return singleton_1.Singleton.newInstance(SharedPtr, t, () => {
            const Base = SharedPtrBase.make(t);
            class TypedSharedPtr extends SharedPtr {
                [nativetype_1.NativeType.ctor]() {
                    this.setPointer(null, 0);
                    this.ref = null;
                }
                create(vftable) {
                    const size = Base[nativetype_1.NativeType.size];
                    if (size === null)
                        throw Error(`cannot allocate the non sized class`);
                    this.ref = capi_1.capi.malloc(size).as(Base);
                    this.ref.vftable = vftable;
                    this.ref.construct();
                    this.setPointer(this.ref.add(sizeOfSharedPtrBase), 0);
                }
                [nativetype_1.NativeType.ctor_copy](value) {
                    this.setPointer(value.getPointer(0), 0);
                    this.ref = value.ref;
                    if (this.ref !== null)
                        this.ref.addRef();
                }
                [nativetype_1.NativeType.ctor_move](value) {
                    this.setPointer(value.getPointer(0), 0);
                    this.ref = value.ref;
                    value.setPointer(null, 0);
                    value.ref = null;
                }
                ctor_move(value) {
                    this.setPointer(value.getPointer(0), 0);
                    this.ref = value.ref;
                    value.ref = null;
                }
                dispose() {
                    if (this.ref !== null) {
                        this.ref.release();
                        this.ref = null;
                    }
                    this.setPointer(null, 0);
                }
            }
            Object.defineProperty(TypedSharedPtr, 'name', { value: (0, templatename_1.templateName)('std::shared_ptr', t.name) });
            TypedSharedPtr.define({
                p: t.ref(),
                ref: Base.ref(),
            });
            return TypedSharedPtr;
        });
    }
}
exports.SharedPtr = SharedPtr;
//# sourceMappingURL=sharedpointer.js.map