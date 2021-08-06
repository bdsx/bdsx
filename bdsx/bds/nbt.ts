import { bin } from "../bin";
import { abstract } from "../common";
import { AllocatedPointer, StaticPointer, VoidPointer } from "../core";
import { CxxMap } from "../cxxmap";
import { CxxVector } from "../cxxvector";
import { makefunc } from "../makefunc";
import { MantleClass, nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, CxxString, float32_t, float64_t, int16_t, int32_t, int64_as_float_t, NativeType, uint8_t } from "../nativetype";
import { CxxStringWrapper, Wrapper } from "../pointer";
import util = require("util");

console.warn("nbt.ts is still in development.".red);

// Notice that in bedrock_server.exe, LongTag is called Int64Tag. However, in Tag::getTagName, Int64Tag returns TAG_Long.

@nativeClass()
export class TagMemoryChunk extends NativeClass {
    /** Total count of elements */
    @nativeField(int64_as_float_t)
    elements:int64_as_float_t;
    /** Total size in bytes */
    @nativeField(int64_as_float_t)
    size:int64_as_float_t;
    @nativeField(MantleClass.ref())
    buffer:MantleClass;

    getComponentSize():number {
        return this.size / this.elements;
    }

    toUint8Array():Uint8Array {
        if (!this.buffer) return new Uint8Array();
        const out = new Uint8Array(this.elements);
        for (let i = 0; i < this.elements; i++) {
            out[i] = this.buffer.getUint8(i);
        }
        return out;
    }

    fromUint8Array(from:Uint8Array):void {
        this.elements = from.length;
        this.size = this.elements;
        this.buffer = new AllocatedPointer(this.size) as any;
        for (let i = 0; i < this.elements; i++) {
            this.buffer.setUint8(from[i], i);
        }
    }

    toInt32Array():Int32Array {
        if (!this.buffer) return new Int32Array();
        const out = new Int32Array(this.elements);
        for (let i = 0; i < this.elements; i++) {
            out[i] = this.buffer.getInt32(i * 4);
        }
        return out;
    }

    fromInt32Array(from:Int32Array):void {
        this.elements = from.length;
        this.size = this.elements * 4;
        this.buffer = new AllocatedPointer(this.size) as any;
        for (let i = 0; i < this.elements; i++) {
            this.buffer.setInt32(from[i], i * 4);
        }
    }
}

@nativeClass()
export class Tag extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;

    protected _toString(str:CxxStringWrapper):string {
        abstract();
    }
    toString():string {
        return this._toString(CxxStringWrapper.construct());
    }
    getId():Tag.Type {
        abstract();
    }
    equals(tag:this):boolean {
        abstract();
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `${this.constructor.name} ${util.inspect((this as any).data, options)}`;
    }

    static [NativeType.getter](ptr:StaticPointer, offset?:number):Tag {
        return Tag._singletoning(ptr.add(offset, offset! >> 31))!;
    }
    static [makefunc.getFromParam](stackptr:StaticPointer, offset?:number):Tag|null {
        return Tag._singletoning(stackptr.getNullablePointer(offset));
    }
    static all():IterableIterator<Tag> {
        abstract();
    }
    private static _singletoning(ptr:StaticPointer|null):Tag|null {
        abstract();
    }
}

export namespace Tag {
    export enum Type {
        End,
        Byte,
        Short,
        Int,
        Int64,
        Float,
        Double,
        ByteArray,
        String,
        List,
        Compound,
        IntArray,
    }
}

export const TagPointer = Wrapper.make(Tag.ref());
export type TagPointer = Wrapper<Tag>;

@nativeClass(0x08)
export class EndTag extends Tag {
    static constructWith():EndTag {
        abstract();
    }
}

@nativeClass(0x10)
export class ByteTag extends Tag {
    @nativeField(uint8_t)
    data:uint8_t;

    static constructWith(data:uint8_t):ByteTag {
        abstract();
    }
}

@nativeClass(0x10)
export class ShortTag extends Tag {
    @nativeField(int16_t)
    data:int16_t;

    static constructWith(data:int16_t):ShortTag {
        abstract();
    }
}

@nativeClass(0x10)
export class IntTag extends Tag {
    @nativeField(int32_t)
    data:int32_t;

    static constructWith(data:int32_t):IntTag {
        abstract();
    }
}

@nativeClass(0x10)
export class Int64Tag extends Tag {
    @nativeField(bin64_t)
    data:bin64_t;

    static constructWith(data:bin64_t):Int64Tag {
        abstract();
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `LongTag ${util.inspect(bin.toString(this.data), options)}`;
    }
}

@nativeClass(0x10)
export class FloatTag extends Tag {
    @nativeField(float32_t)
    data:float32_t;

    static constructWith(data:float32_t):FloatTag {
        abstract();
    }
}

@nativeClass(0x10)
export class DoubleTag extends Tag {
    @nativeField(float64_t)
    data:float64_t;

    static constructWith(data:float64_t):DoubleTag {
        abstract();
    }
}

@nativeClass(0x20)
export class ByteArrayTag extends Tag {
    @nativeField(TagMemoryChunk)
    data:TagMemoryChunk;

    static constructWith(data:Uint8Array):ByteArrayTag {
        abstract();
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `ByteArrayTag ${util.inspect(this.data.toUint8Array(), options)}`;
    }
}

@nativeClass(0x28)
export class StringTag extends Tag {
    @nativeField(CxxString)
    data:CxxString;

    static constructWith(data:CxxString):StringTag {
        abstract();
    }
}

@nativeClass(0x28)
export class ListTag extends Tag {
    @nativeField(CxxVector.make(Tag.ref()))
    data:CxxVector<Tag>;
    @nativeField(uint8_t, 0x20)
    type:Tag.Type;

    get(idx:number):Tag {
        return this.data.get(idx);
    }
    set(idx:number, tag:Tag):void {
        this.type = tag.getId();
        return this.data.set(idx, tag);
    }
    push(tag:Tag):void {
        abstract();
    }
    size():number {
        abstract();
    }

    static constructWith(data:Tag[]):ListTag {
        abstract();
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `ListTag ${util.inspect(this.data.toArray(), options)}`;
    }
}

@nativeClass(0x28)
export class CompoundTag extends Tag {
    @nativeField(CxxMap.make(CxxString, Tag))
    data:CxxMap<CxxString, Tag>;

    set(key:CxxString, tag:Tag):Tag {
        abstract();
    }
    static constructWith(data:Record<string, Tag>):CompoundTag {
        abstract();
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        const map = new Map<CxxString, Tag>(this.data.toArray());
        return `CompoundTag ${util.inspect(map, options).substr(4)}`;
    }
}

@nativeClass(0x20)
export class IntArrayTag extends Tag {
    @nativeField(TagMemoryChunk)
    data:TagMemoryChunk;

    static constructWith(data:Int32Array):IntArrayTag {
        abstract();
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `IntArrayTag ${util.inspect(this.data.toInt32Array(), options)}`;
    }
}
