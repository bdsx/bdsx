import { abstract } from "./common";
import { StaticPointer, VoidPointer } from "./core";
import { makefunc, RawTypeId } from "./makefunc";
import { defineNative, NativeClass, NativeClassType, nativeField } from "./nativeclass";
import { NativeType, Type, uint32_t } from "./nativetype";
import { Singleton } from "./singleton";

@defineNative(null)
class RefCounter extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(uint32_t)
    useRef:uint32_t;
    @nativeField(uint32_t)
    weakRef:uint32_t;
    // data?

    addRef():void {
        this.interlockedIncrement32(8); // useRef
        this.interlockedIncrement32(16); // weakRef
    }
    release():void {
        if (this.interlockedDecrement32(8) === 0) {
            this._Destroy();
        }
        if (this.interlockedDecrement32(16) === 0) {
            this._DeleteThis();
        }
    }
    _DeleteThis():void {
        abstract();
    }
    _Destroy():void {
        abstract();
    }
}
RefCounter.prototype._Destroy = makefunc.js([0], RawTypeId.Void, {this:RefCounter});
RefCounter.prototype._DeleteThis = makefunc.js([8], RawTypeId.Void, {this:RefCounter});

export interface SharedPtrType<T extends NativeClass> extends Type<SharedPtr<T>>
{
    new(ptr?:VoidPointer|boolean):SharedPtr<T>;
}

/**
 * wrapper for std::shared_ptr
 */
export abstract class SharedPtr<T extends NativeClass> extends NativeClass {
    static readonly type:NativeClassType<any>;

    p:T|null;
    ref:RefCounter|null;

    [NativeType.ctor]():void {
        this.p = null;
        this.ref = null;
    }
    [NativeType.dtor]():void {
        if (this.ref !== null) this.ref.release();
    }
    [NativeType.ctor_copy](value:SharedPtr<T>):void {
        this.p = value.p;
        this.ref = value.ref;
        if (this.ref !== null) this.ref.addRef();
    }
    [NativeType.ctor_move](value:SharedPtr<T>):void {
        this.p = value.p;
        this.ref = value.ref;
        value.p = null;
        value.ref = null;
    }
    ctor_move(value:SharedPtr<T>):void {
        this.p = value.p;
        this.ref = value.ref;
        value.ref = null;
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
    dispose():void {
        if (this.ref !== null) {
            this.ref.release();
            this.ref = null;
        }
        this.p = null;
    }

    static make<T extends NativeClass>(cls:{new():T, ref():any}):SharedPtrType<T> {
        return sharedPtrSingleton.newInstance(cls, ()=>{
            class TypedSharedPtr extends SharedPtr<NativeClass> {
            }
            TypedSharedPtr.define({
                p:cls.ref(),
                ref:RefCounter.ref(),
            });
            return TypedSharedPtr as SharedPtrType<T>;
        });
    }
}
const sharedPtrSingleton = new Singleton<SharedPtrType<any>>();

/**
 * @deprecated 
 */
export class SharedPointer extends StaticPointer {
    constructor(private readonly sharedptr:SharedPtr<any>) {
        super(sharedptr.p);
    }

    assignTo(dest:StaticPointer):void {
        this.assignTo(dest);
    }

    dispose():void {
        this.sharedptr.dispose();
    }
}