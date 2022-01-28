import { CircularDetector } from "./circulardetector";
import { abstract, Encoding, TypeFromEncoding } from "./common";
import { NativePointer, StaticPointer, VoidPointer } from "./core";
import { dll } from "./dll";
import { nativeClass, NativeClass, NativeClassType, nativeField } from "./nativeclass";
import { CxxString, int64_as_float_t, NativeDescriptorBuilder, NativeType, Type } from "./nativetype";
import util = require('util');
import { msAlloc } from "./msalloc";

export interface WrapperType<T> extends NativeClassType<Wrapper<T>> {
    new(ptr?:boolean):Wrapper<T>;
    create(this:{new(b?:boolean):Wrapper<T>}, value:T):Wrapper<T>;
}

export abstract class Wrapper<T> extends NativeClass {
    abstract value:T;
    abstract type:Type<T>;

    static create<T>(this:new(b?:boolean)=>Wrapper<T>, value:T):Wrapper<T> {
        const out = new this(true);
        out.value = value;
        return out;
    }
    static make<T>(type:(new()=>T)|NativeType<T>):WrapperType<T>{
        class TypedWrapper extends Wrapper<T>{
            value:any;
            type:Type<T>;
            static constructWith<T2>(this:new(b?:boolean)=>Wrapper<T2>, v:T2):Wrapper<T2> {
                const wrapper = TypedWrapper.construct();
                wrapper.value = v;
                return wrapper as any;
            }
        }
        Object.defineProperty(TypedWrapper, 'name', {value: type.name});
        TypedWrapper.prototype.type = type as any;
        TypedWrapper.define({value:type as any});
        return TypedWrapper;
    }

    static [NativeType.ctor_copy](to:StaticPointer, from:StaticPointer):void{
        to.copyFrom(from, 8);
    }
    static [NativeType.ctor_move](to:StaticPointer, from:StaticPointer):void {
        to.copyFrom(from, 8);
    }
    static [NativeType.descriptor](this:{new():Wrapper<any>},builder:NativeDescriptorBuilder, key:string, info:NativeDescriptorBuilder.Info):void {
        const {offset} = info;
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
                },
            });
        }
        builder.desc[key] = {
            configurable: true,
            get(this:StaticPointer) {
                init(this);
                return obj;
            },
        };
    }
}

@nativeClass()
export class CxxStringWrapper extends NativeClass {
    @nativeField(int64_as_float_t, 0x10)
    length:int64_as_float_t;
    @nativeField(int64_as_float_t, 0x18)
    capacity:int64_as_float_t;

    [NativeType.ctor]():void {
        abstract();
    }

    [NativeType.dtor]():void {
        abstract();
    }

    [NativeType.ctor_copy](other:CxxStringWrapper):void {
        abstract();
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

    valueAs<T extends Encoding>(encoding:T):TypeFromEncoding<T> {
        return this.getCxxString(0, encoding);
    }

    reserve(nsize:number):void {
        const capacity = this.capacity;
        if (nsize > capacity) {
            const orivalue = this.valueptr;
            this.capacity = nsize;

            const dest = msAlloc.allocate(nsize + 1);
            dest.copyFrom(orivalue, this.length);
            if (capacity >= 0x10) msAlloc.deallocate(orivalue, capacity);
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

    static constructWith(str:string):CxxStringWrapper {
        const v = CxxStringWrapper.construct();
        v.value = str;
        return v;
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        const obj = new (CircularDetector.makeTemporalClass(this.constructor.name, this, options));
        obj.value = this.value;
        return obj;
    }
}

CxxStringWrapper.prototype[NativeType.ctor] = function(this:CxxStringWrapper) { return CxxString[NativeType.ctor](this as any); };
CxxStringWrapper.prototype[NativeType.dtor] = function(this:CxxStringWrapper) { return CxxString[NativeType.dtor](this as any); };
CxxStringWrapper.prototype[NativeType.ctor_copy] = function(this:CxxStringWrapper, other:CxxStringWrapper) {
    return CxxString[NativeType.ctor_copy](this as any, other as any);
};
CxxStringWrapper.prototype[NativeType.ctor_move] = function(this:CxxStringWrapper, other:CxxStringWrapper) {
    return CxxString[NativeType.ctor_move](this as any, other as any);
};
