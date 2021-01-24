import { capi } from "./capi";
import { VoidPointer } from "./core";
import { StaticPointer } from "./native";
import { NativeClass } from "./nativeclass";
import { CxxString, int64_as_float_t, NativeDescriptorBuilder, NativeType, Type } from "./nativetype";

export interface WrapperType<T> extends Type<Wrapper<T>>
{
    new(ptr?:VoidPointer|boolean):Wrapper<T>;
}

export abstract class Wrapper<T> extends NativeClass
{
    abstract value:T;
    abstract type:Type<T>;

    static make<T>(type:Type<T>):WrapperType<T>
    {
        class TypedWrapper extends Wrapper<T>
        {
            value:any;
            type:Type<T>;
        }
        TypedWrapper.prototype.type = type;
        TypedWrapper.define({value:type});
        return TypedWrapper;
    }

    static [NativeType.getter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, offset?:number):THIS
    {
        return ptr.getPointerAs(this, offset);
    }
    static [NativeType.setter]<THIS extends VoidPointer>(this:{new():THIS}, ptr:StaticPointer, value:THIS, offset?:number):void
    {
        ptr.setPointer(value, offset);
    }
    static [NativeType.ctor](ptr:StaticPointer):void
    {
    }
    static [NativeType.dtor](ptr:StaticPointer):void
    {
    }
    static [NativeType.ctor_copy](to:StaticPointer, from:StaticPointer):void
    {
        to.copyFrom(from, 8);
    }
    static [NativeType.ctor_move](to:StaticPointer, from:StaticPointer):void
    {
        to.copyFrom(from, 8);
    }
    static [NativeType.descriptor](this:{new():Wrapper<any>},builder:NativeDescriptorBuilder, key:string, offset:number):void
    {
        const type = this;
        let obj:VoidPointer|null = null;

        function init(ptr:StaticPointer)
        {
            obj = ptr.getPointerAs(type, offset);
            Object.defineProperty(ptr, key, {
                get(){
                    return obj;
                }, 
                set(v:Wrapper<any>){
                    obj = v;
                    ptr.setPointer(v, offset);
                }
            });
        }
        builder.desc[key] = {
            configurable: true,
            get(this:StaticPointer) {
                init(this);
                return obj;
            }
        };
    }
}

/** @deprecated renamed to WrapperType<T> */
export type PointerType<T> = WrapperType<T>;

/** @deprecated renamed to Wrapper<T> */
export abstract class Pointer<T> extends Wrapper<T>
{
    p:T;

    static make<T>(type:Type<T>):PointerType<T>
    {
        class TypedPointer extends Pointer<T>
        {
            p:any;
            value:any;
            type:Type<T>;
        }
        TypedPointer.prototype.type = type;
        TypedPointer.defineAsUnion({p:type, value:type});
        return TypedPointer;
    }
}

export class CxxStringWrapper extends NativeClass
{
    length:number;
    capacity:number;

    [NativeType.ctor]()
    {
        this.length = 0;
        this.capacity = 15;
    }

    [NativeType.dtor]()
    {
        if (this.capacity >= 0x10) capi.free(this.getPointer());
    }

    /**
     * @deprecated use .destruct
     */
    dispose():void
    {
        this.destruct();
    }
    
    get value():string
    {
        return this.getCxxString();
    }

    set value(str:string)
    {
        this.setCxxString(str);
    }

    get valueptr():VoidPointer
    {
        if (this.capacity >= 0x10) return this.getPointer();
        else return this as any;
    }
}
CxxStringWrapper.define({
    length:[int64_as_float_t, 0x10],
    capacity:[int64_as_float_t, 0x18]
});

/** @deprecated renamed to CxxStringWrapper */
export type CxxStringStructure = CxxStringWrapper;
/** @deprecated renamed to CxxStringWrapper */
export const CxxStringStructure = CxxStringWrapper;

/** @deprecated use CxxStringWrapper */
export const CxxStringPointer = Wrapper.make(CxxString);
/** @deprecated use CxxStringWrapper */
export type CxxStringPointer = Wrapper<CxxString>;
