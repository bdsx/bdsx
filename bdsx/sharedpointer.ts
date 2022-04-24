import { capi } from "./capi";
import { abstract } from "./common";
import { StaticPointer, VoidPointer } from "./core";
import { makefunc } from "./makefunc";
import { mangle } from "./mangle";
import { nativeClass, NativeClass, NativeClassType, nativeField } from "./nativeclass";
import { NativeType, Type, uint32_t, void_t } from "./nativetype";
import { Singleton } from "./singleton";

@nativeClass()
class CxxPtrBase<T> extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(uint32_t)
    useRef:uint32_t;
    @nativeField(uint32_t)
    weakRef:uint32_t;
    value:T;

    [NativeType.ctor]():void {
        this.useRef = 1;
        this.weakRef = 1;
    }
    addRef():void {
        this.interlockedIncrement32(0x8); // useRef
    }
    addRefWeak():void {
        this.interlockedIncrement32(0xc); // weakRef
    }
    release():void {
        if (this.interlockedDecrement32(0x8) === 0) {
            this._Destroy();
            this.releaseWeak();
        }
    }
    releaseWeak():void {
        if (this.interlockedDecrement32(0xc) === 0) {
            this._DeleteThis();
        }
    }
    _DeleteThis():void {
        abstract();
    }
    _Destroy():void {
        abstract();
    }

    static make<T>(type:Type<T>):NativeClassType<CxxPtrBase<T>> {
        return Singleton.newInstance(CxxPtrBase, type, ()=>{
            class SharedPtrBaseImpl extends CxxPtrBase<T> {
            }
            SharedPtrBaseImpl.define({value:type} as any);
            return SharedPtrBaseImpl as NativeClassType<CxxPtrBase<T>>;
        });
    }
}
CxxPtrBase.prototype._Destroy = makefunc.js([0], void_t, {this:CxxPtrBase});
CxxPtrBase.prototype._DeleteThis = makefunc.js([8], void_t, {this:CxxPtrBase});
const sizeOfSharedPtrBase = CxxPtrBase[NativeType.size];

/** @deprecate Do you need to use it? */
export const SharedPtrBase = CxxPtrBase;
/** @deprecate Do you need to use it? */
export type SharedPtrBase<T> = CxxPtrBase<T>;

/**
 * wrapper for std::shared_ptr
 */
export abstract class CxxSharedPtr<T extends NativeClass> extends NativeClass {
    static readonly type:NativeClassType<any>;

    p:T|null;
    ref:CxxPtrBase<T>|null;

    [NativeType.ctor]():void {
        this.p = null;
        this.ref = null;
    }
    [NativeType.dtor]():void {
        const ref = this.ref;
        if (ref !== null) ref.release();
    }
    [NativeType.ctor_copy](value:CxxSharedPtr<T>):void {
        this.p = value.p;
        const ref = value.ref;
        this.ref = ref;
        if (ref !== null) ref.addRef();
    }
    [NativeType.ctor_move](value:CxxSharedPtr<T>):void {
        this.p = value.p;
        this.ref = value.ref;
        value.p = null;
        value.ref = null;
    }
    /**
     * @deprecated use [NativeType.ctor_move]()
     */
    ctor_move(value:CxxSharedPtr<T>):void {
        this[NativeType.ctor_move](value);
    }
    assign(value:CxxSharedPtr<T>):this {
        this[NativeType.dtor]();
        this[NativeType.ctor_copy](value);
        return this;
    }
    assign_move(value:CxxSharedPtr<T>):this {
        this[NativeType.dtor]();
        this[NativeType.ctor_move](value);
        return this;
    }
    exists():boolean {
        return this.ref !== null;
    }
    addRef():void {
        this.ref!.addRef();
    }
    assignTo(dest:StaticPointer):void {
        const ctor:new()=>CxxSharedPtr<T> = this.constructor as any;
        const ptr = dest.as(ctor);
        ptr.assign(this);
    }
    dispose():void {
        const ref = this.ref;
        if (ref !== null) {
            ref.release();
            this.ref = null;
        }
        this.p = null;
    }
    abstract create(vftable:VoidPointer):void;

    static make<T extends NativeClass>(cls:new()=>T):NativeClassType<CxxSharedPtr<T>> {
        const clazz = cls as NativeClassType<T>;
        return Singleton.newInstance(CxxSharedPtr, cls, ()=>{
            const Base = CxxPtrBase.make(clazz);
            class Clazz extends CxxSharedPtr<NativeClass> {
                create(vftable:VoidPointer):void {
                    const size = Base[NativeType.size];
                    if (size === null) throw Error(`cannot allocate the non sized class`);
                    this.ref = capi.malloc(size).as(Base);
                    this.ref.vftable = vftable;
                    this.ref.construct();
                    this.p = this.ref.addAs(clazz, sizeOfSharedPtrBase);
                }
            }
            Clazz.define({
                p:clazz.ref(),
                ref:Base.ref(),
            });
            Object.defineProperties(Clazz, {
                name: { value: `CxxSharedPtr<${clazz.name}>` },
                symbol: { value: mangle.templateClass(['std', 'shared_ptr'], clazz) },
            });

            return Clazz as any;
        });
    }
}

/** @deprecated use CxxSharedPtr, avoid duplicated name */
export const SharedPtr = CxxSharedPtr;
/** @deprecated use CxxSharedPtr, avoid duplicated name */
export type SharedPtr<T extends NativeClass> = CxxSharedPtr<T>;

/**
 * wrapper for std::weak_ptr
 */
export abstract class CxxWeakPtr<T extends NativeClass> extends NativeClass {
    static readonly type:NativeClassType<any>;

    p:T|null;
    ref:CxxPtrBase<T>|null;

    [NativeType.ctor]():void {
        this.p = null;
        this.ref = null;
    }
    [NativeType.dtor]():void {
        const ref = this.ref;
        if (ref !== null) ref.releaseWeak();
    }
    [NativeType.ctor_copy](value:CxxWeakPtr<T>):void {
        this.p = value.p;
        const ref = value.ref;
        this.ref = ref;
        if (ref !== null) ref.addRefWeak();
    }
    [NativeType.ctor_move](value:CxxWeakPtr<T>):void {
        this.p = value.p;
        this.ref = value.ref;
        value.p = null;
        value.ref = null;
    }
    assign(value:CxxWeakPtr<T>):this {
        this[NativeType.dtor]();
        this[NativeType.ctor_copy](value);
        return this;
    }
    assign_move(value:CxxWeakPtr<T>):this {
        this[NativeType.dtor]();
        this[NativeType.ctor_move](value);
        return this;
    }
    exists():boolean {
        return this.ref !== null;
    }
    addRef():void {
        this.ref!.addRefWeak();
    }
    assignTo(dest:StaticPointer):void {
        const ctor:new()=>CxxWeakPtr<T> = this.constructor as any;
        const ptr = dest.as(ctor);
        ptr.assign(this);
    }
    dispose():void {
        const ref = this.ref;
        if (ref !== null) {
            ref.releaseWeak();
            this.ref = null;
        }
        this.p = null;
    }
    abstract create(vftable:VoidPointer):void;

    static make<T extends NativeClass>(cls:new()=>T):NativeClassType<CxxWeakPtr<T>> {
        const clazz = cls as NativeClassType<T>;
        return Singleton.newInstance(CxxWeakPtr, cls, ()=>{
            const Base = CxxPtrBase.make(clazz);
            class Clazz extends CxxWeakPtr<NativeClass> {
                create(vftable:VoidPointer):void {
                    const size = Base[NativeType.size];
                    if (size === null) throw Error(`cannot allocate the non sized class`);
                    this.ref = capi.malloc(size).as(Base);
                    this.ref.vftable = vftable;
                    this.ref.construct();
                    this.p = this.ref.addAs(clazz, sizeOfSharedPtrBase);
                }
            }
            Object.defineProperties(Clazz, {
                name: { value: `CxxWeakPtr<${clazz.name}>` },
                symbol: { value: mangle.templateClass(['std', 'weak_ptr'], clazz) },
            });
            Clazz.define({
                p:clazz.ref(),
                ref:Base.ref(),
            });

            return Clazz as any;
        });
    }
}
