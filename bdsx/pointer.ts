import { CircularDetector } from "./circulardetector";
import { abstract, Encoding, TypeFromEncoding } from "./common";
import { AllocatedPointer, NativePointer, StaticPointer, VoidPointer } from "./core";
import { dll } from "./dll";
import { nativeClass, NativeClass, NativeClassType, nativeField } from "./nativeclass";
import { CxxString, int64_as_float_t, NativeDescriptorBuilder, NativeType, Type } from "./nativetype";
import util = require('util');

export interface WrapperType<T> extends NativeClassType<Wrapper<T>> {
    new(ptr?:boolean):Wrapper<T>;
    readonly type:Type<any>;
}
export interface PtrType<T> extends WrapperType<T> {
}

export abstract class Wrapper<T> extends NativeClass {
    abstract value:T;
    readonly abstract type:Type<T>;
    static readonly type:Type<unknown>;

    static make<T>(type:Type<T>):WrapperType<T>{
        class TypedWrapper extends Wrapper<T>{
            value:any;
            type:Type<T>;
            static readonly type:Type<T> = type;
        }
        Object.defineProperty(TypedWrapper, 'name', {value: type.name});
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

export type Pointer = any; // legacy
export declare const Pointer:any; // legacy

const bufferKeeper = Symbol();

export abstract class Ptr<T> extends Wrapper<T> {
    get(index:number):T {
        const size = this.type[NativeType.size];
        if (size == null) throw Error(`${this.type.name}: unknown size`);
        return this.type[NativeType.getter](this as any, index*size);
    }
    set(value:T, index:number):void {
        const size = this.type[NativeType.size];
        if (size == null) throw Error(`${this.type.name}: unknown size`);
        this.type[NativeType.setter](this as any, value, index*size);
    }
    static create<T>(this:PtrType<T>, count:number):Ptr<T> {
        const size = this.type[NativeType.size];
        if (size == null) throw Error(`${this.type.name}: unknown size`);
        const buffer = new AllocatedPointer(size * count);
        const ptr = buffer.as(this);
        (ptr as any)[bufferKeeper] = buffer; // make a reference for avoiding GC
        return ptr as Ptr<T>;
    }
    static make<T>(type:Type<T>):PtrType<T>{
        return Wrapper.make(type.ref());
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
