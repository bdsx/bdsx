import { abstract } from "./common";
import { NativePointer, VoidPointer } from "./core";
import { dll } from "./dll";
import { StaticPointer } from "./native";
import { NativeClass } from "./nativeclass";
import { CxxString, int64_as_float_t, NativeDescriptorBuilder, NativeType, Type } from "./nativetype";

export interface WrapperType<T> extends Type<Wrapper<T>>
{
    /**
     * @deprecated use ptr.as(*Pointer) or ptr.add() to clone pointers
     */
    new(ptr:VoidPointer):Wrapper<T>;

    new(ptr?:boolean):Wrapper<T>;
}

export abstract class Wrapper<T> extends NativeClass {
    abstract value:T;
    abstract type:Type<T>;

    static make<T>(type:Type<T>):WrapperType<T>{
        class TypedWrapper extends Wrapper<T>{
            value:any;
            type:Type<T>;
        }
        TypedWrapper.prototype.type = type;
        TypedWrapper.define({value:type});
        return TypedWrapper;
    }

    static [NativeType.ctor_copy](to:StaticPointer, from:StaticPointer):void{
        to.copyFrom(from, 8);
    }
    static [NativeType.ctor_move](to:StaticPointer, from:StaticPointer):void {
        to.copyFrom(from, 8);
    }
    static [NativeType.descriptor](this:{new():Wrapper<any>},builder:NativeDescriptorBuilder, key:string, offset:number):void {
        const type = this;
        let obj:VoidPointer|null = null;

        function init(ptr:StaticPointer):void {
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
export abstract class Pointer<T> extends Wrapper<T> {
    p:T;

    static make<T>(type:Type<T>):PointerType<T> {
        class TypedPointer extends Pointer<T> {
            p:any;
            value:any;
            type:Type<T>;
        }
        TypedPointer.prototype.type = type;
        TypedPointer.defineAsUnion({p:type, value:type});
        return TypedPointer;
    }
}

export class CxxStringWrapper extends NativeClass {
    length:number;
    capacity:number;

    [NativeType.ctor]():void {
        abstract();
    }

    [NativeType.dtor]():void {
        abstract();
    }

    /**
     * @deprecated use .destruct
     */
    dispose():void {
        this.destruct();
    }
    
    get value():string {
        return this.getCxxString();
    }

    set value(str:string) {
        this.setCxxString(str);
    }

    get valueptr():NativePointer {
        if (this.capacity >= 0x10) return this.getPointer();
        else return this.add();
    }

    reserve(nsize:number):void {
        const capacity = this.capacity;
        if (nsize > capacity) {
            const orivalue = this.valueptr;
            this.capacity = nsize;
            const dest = dll.ucrtbase.malloc(nsize + 1);
            dest.copyFrom(orivalue, this.length);
            if (capacity >= 0x10) dll.ucrtbase.free(orivalue);
            this.setPointer(dest);
            if (dest === null) {
                this.setString("[out of memory]\0");
                this.capacity = 15;
                this.length = 15;
                return;
            }
        }
    }

    resize(nsize:number):void {
        this.reserve(nsize);
        this.length = nsize;
    }
}
CxxStringWrapper.define({
    length:[int64_as_float_t, 0x10],
    capacity:[int64_as_float_t, 0x18]
});
const strctor = CxxString[NativeType.ctor];
const strdtor = CxxString[NativeType.dtor];
CxxStringWrapper.prototype[NativeType.ctor] = function(this:CxxStringWrapper) { return strctor(this as any); };
CxxStringWrapper.prototype[NativeType.dtor] = function(this:CxxStringWrapper) { return strdtor(this as any); };

/** @deprecated renamed to CxxStringWrapper */
export type CxxStringStructure = CxxStringWrapper;
/** @deprecated renamed to CxxStringWrapper */
export const CxxStringStructure = CxxStringWrapper;

/** @deprecated use CxxStringWrapper */
export const CxxStringPointer = Wrapper.make(CxxString);
/** @deprecated use CxxStringWrapper */
export type CxxStringPointer = Wrapper<CxxString>;
