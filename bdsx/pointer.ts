import { StructurePointer, VoidPointer } from "./core";
import { StaticPointer } from "./native";
import { NativeClass } from "./nativeclass";
import { CxxString, NativeDescriptorBuilder, NativeType, Type } from "./nativetype";

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

interface CxxStringPointerType extends Type<CxxStringPointer>
{
    new(ptr?:VoidPointer|boolean):CxxStringPointer;
}

export const CxxStringPointer:CxxStringPointerType = Pointer.make(CxxString) as CxxStringPointerType;

Object.defineProperties(CxxStringPointer.prototype, {
    pptr:{
        get(this:CxxStringPointer){
            if (this.capacity >= 0x10) return this.getPointer();
            else return this as any;
        }
    },
    length:{
        get(this:CxxStringPointer){
            return this.getInt64AsFloat(0x10);
        }
    },
    capacity:{
        get(this:CxxStringPointer){
            return this.getInt64AsFloat(0x18);
        }
    },
});

export interface CxxStringPointer extends Pointer<CxxString>
{
    p:CxxString;
    pptr:StaticPointer;
    type:Type<CxxString>;
    length:number;
    capacity:number;
}

