import { abstract, RawTypeId } from "./common";
import { makefunc, StaticPointer, VoidPointer } from "./core";
import { NativeType, Type, uint32_t } from "./nativetype";
import { NativeClass, NativeClassType } from "./nativeclass";
import { Singleton } from "./singleton";

class RefCounter extends NativeClass
{
    vftable:VoidPointer;
    useRef:uint32_t;
    weakRef:uint32_t;

    addRef():void
    {
        this.interlockedIncrement32(8); // useRef
        this.interlockedIncrement32(16); // weakRef
    }
    release():void
    {
        if (this.interlockedDecrement32(8) == 0)
        {
            this._Destroy();
        }
        if (this.interlockedDecrement32(16) == 0)
        {
            this._DeleteThis();
        }
    }
    _DeleteThis():void
    {
        abstract();
    }
    _Destroy():void
    {
        abstract();
    }
}
RefCounter.prototype._Destroy = makefunc.js([0], RawTypeId.Void, {this:RefCounter});
RefCounter.prototype._DeleteThis = makefunc.js([8], RawTypeId.Void, {this:RefCounter});
RefCounter.abstract({
    vftable:VoidPointer,
    useRef:uint32_t,
    weakRef:uint32_t,
    // data?
});

export interface SharedPtrType<T extends NativeClass> extends Type<SharedPtr<T>>
{
    new(ptr?:VoidPointer|boolean):SharedPtr<T>;
}

export abstract class SharedPtr<T extends NativeClass> extends NativeClass
{
    static readonly type:NativeClassType<any>;

    p:T|null;
    ref:RefCounter|null;

    [NativeType.ctor]():void
    {
        this.p = null;
        this.ref = null;
    }
    [NativeType.dtor]():void
    {
    	if (this.ref !== null) this.ref.release();
    }
    [NativeType.ctor_copy](value:SharedPtr<T>):void
    {
    	this.p = value.p;
    	this.ref = value.ref;
    	if (this.ref !== null) this.ref.addRef();
    }
    [NativeType.ctor_move](value:SharedPtr<T>):void
    {
    	this.p = value.p;
        this.ref = value.ref;
        value.p = null;
        value.ref = null;
    }
    ctor_move(value:SharedPtr<T>):void
    {
    	this.p = value.p;
    	this.ref = value.ref;
    	value.ref = null;
    }
    assign(value:SharedPtr<T>):this
    {
        this[NativeType.dtor]();
        this[NativeType.ctor_copy](value);
    	return this;
    }
    assign_move(value:SharedPtr<T>):this
    {
        this[NativeType.dtor]();
        this[NativeType.ctor_move](value);
    	return this;
    }
    exists():boolean
    {
    	return this.ref !== null;
    }
    addRef():void
    {
        this.ref!.addRef();
    }
    assignTo(dest:StaticPointer):void
    {
        const ctor:{new():SharedPtr<T>} = this.constructor as any;
        const ptr = dest.as(ctor);
        ptr.assign(this);
    }
    dispose():void
    {
    	if (this.ref !== null)
    	{
    		this.ref.release();
    		this.ref = null;
    	}
    	this.p = null;
    }

    static make<T extends NativeClass>(cls:{new():T, ref():any}):SharedPtrType<T>
    {
        return sharedPtrSingleton.newInstance(cls, ()=>{
            class TypedSharedPtr extends SharedPtr<NativeClass>
            {
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
export class SharedPointer extends StaticPointer
{
    constructor(private readonly sharedptr:SharedPtr<any>)
    {
        super(sharedptr.p);
    }

    assignTo(dest:StaticPointer)
    {
        this.assignTo(dest);
    }

    dispose():void
    {
        this.sharedptr.dispose();
    }
}