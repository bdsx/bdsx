import { capi } from "./capi";
import { StructurePointer, VoidPointer } from "./core";
import { StaticPointer } from "./native";
import { NativeClass } from "./nativeclass";
import { CxxString, int64_as_float_t, NativeDescriptorBuilder, NativeType, Type } from "./nativetype";

export interface PointerType<T> extends Type<Pointer<T>>
{
    new(ptr?:VoidPointer|boolean):Pointer<T>;
}

export abstract class Pointer<T> extends NativeClass
{
    abstract p:T;
    abstract type:Type<T>;

    static make<T>(type:Type<T>):PointerType<T>
    {
        class TypedPointer extends Pointer<T>
        {
            p:any;
            type:Type<T>;
        }
        TypedPointer.prototype.type = type;
        TypedPointer[StructurePointer.contentSize] = type[NativeType.size]!;
        TypedPointer.define({
            p:type
        });
        return TypedPointer;
    }

    destruct():void
    {
        this.type[NativeType.dtor](this as any); // PrivatePointer is same class with StaticPointer
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
    static [NativeType.descriptor](this:{new():Pointer<any>},builder:NativeDescriptorBuilder, key:string, offset:number):void
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
                set(v:Pointer<any>){
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

export class CxxStringStructure extends NativeClass
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
CxxStringStructure.define({
    length:[int64_as_float_t, 0x10],
    capacity:[int64_as_float_t, 0x18]
});

export const CxxStringPointer = Pointer.make(CxxString);
export type CxxStringPointer = Pointer<CxxString>;
