import { capi } from "./capi";
import { abstract } from "./common";
import { StaticPointer, VoidPointer } from "./core";
import { makefunc } from "./makefunc";
import { nativeClass, NativeClass, NativeClassType, nativeField } from "./nativeclass";
import { NativeType, Type, uint32_t, void_t } from "./nativetype";
import { Singleton } from "./singleton";
import { templateName } from "./templatename";

@nativeClass()
export class SharedPtrBase<T> extends NativeClass {
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
        this.interlockedIncrement32(8); // useRef
        this.interlockedIncrement32(16); // weakRef
    }
    release():void {
        if (this.interlockedDecrement32(0x8) === 0) {
            this._Destroy();
        }
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

    static make<T>(type:Type<T>):NativeClassType<SharedPtrBase<T>> {
        return Singleton.newInstance(SharedPtrBase, type, ()=>{
            class SharedPtrBaseImpl extends SharedPtrBase<T> {
            }
            SharedPtrBaseImpl.define({value:type} as any);
            return SharedPtrBaseImpl as NativeClassType<SharedPtrBase<T>>;
        });
    }
}
SharedPtrBase.prototype._Destroy = makefunc.js([0], void_t, {this:SharedPtrBase});
SharedPtrBase.prototype._DeleteThis = makefunc.js([8], void_t, {this:SharedPtrBase});
const sizeOfSharedPtrBase = SharedPtrBase[NativeType.size];

/**
 * wrapper for std::shared_ptr
 */
export abstract class SharedPtr<T> extends NativeClass {
    static readonly type:NativeClassType<any>;

    readonly p:T|null;
    readonly ref:SharedPtrBase<T>|null;

    abstract ctor_move(value:SharedPtr<T>):void;
    abstract [NativeType.ctor_copy](value:SharedPtr<T>):void;
    abstract [NativeType.ctor_move](value:SharedPtr<T>):void;
    abstract dispose():void;

    [NativeType.dtor]():void {
        if (this.ref !== null) this.ref.release();
    }
    assign(value:SharedPtr<T>):this {
        this[NativeType.dtor]();
        this[NativeType.ctor_copy](value);
        return this;
    }
    assign_move(value:SharedPtr<T>):this {
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
        const ctor:{new():SharedPtr<T>} = this.constructor as any;
        const ptr = dest.as(ctor);
        ptr.assign(this);
    }
    abstract create(vftable:VoidPointer):void;

    static make<T extends NativeClass>(type:Type<T>):NativeClassType<SharedPtr<T>> {
        const t = type as Type<T>;
        return Singleton.newInstance(SharedPtr, t, ()=>{
            const Base = SharedPtrBase.make(t);
            class TypedSharedPtr extends SharedPtr<NativeClass> {
                p:T|null;
                ref:SharedPtrBase<T>|null;

                [NativeType.ctor]():void {
                    this.setPointer(null, 0);
                    this.ref = null;
                }

                create(vftable:VoidPointer):void {
                    const size = Base[NativeType.size];
                    if (size === null) throw Error(`cannot allocate the non sized class`);
                    this.ref = capi.malloc(size).as(Base);
                    this.ref.vftable = vftable;
                    this.ref.construct();
                    this.setPointer(this.ref.add(sizeOfSharedPtrBase), 0);
                }
                [NativeType.ctor_copy](value:SharedPtr<T>):void {
                    this.setPointer((value as this).getPointer(0), 0);
                    this.ref = value.ref;
                    if (this.ref !== null) this.ref.addRef();
                }
                [NativeType.ctor_move](value:SharedPtr<T>):void {
                    this.setPointer((value as this).getPointer(0), 0);
                    this.ref = value.ref;
                    (value as this).setPointer(null, 0);
                    (value as this).ref = null;
                }
                ctor_move(value:SharedPtr<T>):void {
                    this.setPointer((value as any).getPointer(0), 0);
                    this.ref = value.ref;
                    (value as this).ref = null;
                }
                dispose():void {
                    if (this.ref !== null) {
                        this.ref.release();
                        this.ref = null;
                    }
                    this.setPointer(null, 0);
                }
            }
            Object.defineProperty(TypedSharedPtr, 'name', {value:templateName('std::shared_ptr', t.name)});
            TypedSharedPtr.define({
                p:t.ref(),
                ref:Base.ref(),
            } as any);
            return TypedSharedPtr as any;
        });
    }
}
