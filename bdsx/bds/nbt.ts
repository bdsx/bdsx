import { bin } from "../bin";
import { abstract } from "../common";
import { AllocatedPointer, VoidPointer } from "../core";
import { CxxMap } from "../cxxmap";
import { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, CxxString, float32_t, float64_t, int16_t, int32_t, NativeType, uint8_t } from "../nativetype";
import { BinaryStream } from "./stream";
import util = require("util");

export class TagWrapper {
    public type: Tag.Type;
    public value: any;

    constructor(type:Tag.Type.End, value:undefined);
    constructor(type:Tag.Type.Byte, value:uint8_t);
    constructor(type:Tag.Type.Short, value:int16_t);
    constructor(type:Tag.Type.Int, value:int32_t);
    constructor(type:Tag.Type.Long, value:bin64_t);
    constructor(type:Tag.Type.Float, value:float32_t);
    constructor(type:Tag.Type.Double, value:float64_t);
    constructor(type:Tag.Type.ByteArray, value:Uint8Array);
    constructor(type:Tag.Type.String, value:CxxString);
    constructor(type:Tag.Type.List, value:TagWrapper[]);
    constructor(type:Tag.Type.Compound, value:Record<string, TagWrapper>);
    constructor(type:Tag.Type.IntArray, value:Int32Array);
    constructor(type:Tag.Type, value:any) {
        this.type = type;
        this.value = value;
    }

    toTag():EndTag|ByteTag|ShortTag|IntTag|LongTag|FloatTag|DoubleTag|ByteArrayTag|StringTag|ListTag|CompoundTag|IntArrayTag {
        const tag = Tag.create(this.type);
        switch (this.type) {
        case Tag.Type.Byte:
            (tag as ByteTag).value = this.value;
            break;
        case Tag.Type.Short:
            (tag as ShortTag).value = this.value;
            break;
        case Tag.Type.Int:
            (tag as IntTag).value = this.value;
            break;
        case Tag.Type.Long:
            (tag as LongTag).value = this.value;
            break;
        case Tag.Type.Float:
            (tag as FloatTag).value = this.value;
            break;
        case Tag.Type.Double:
            (tag as DoubleTag).value = this.value;
            break;
        case Tag.Type.ByteArray:
            (tag as ByteArrayTag).value.fromByteArray(this.value);
            break;
        case Tag.Type.String:
            (tag as any).setCxxString(this.value, 0x08);
            break;
        case Tag.Type.List:
            (tag as ListTag).construct();
            (tag as ListTag).type = this.value[0]?.type ?? Tag.Type.End;
            for (const wrapper of this.value as TagWrapper[]) {
                if (wrapper.type !== (tag as ListTag).type) {
                    throw new Error("List tag type mismatch.");
                }
                (tag as ListTag).tags.push(wrapper.toTag());
            }
            break;
        case Tag.Type.Compound:
            (tag as CompoundTag).tags.construct();
            for (const [key, wrapper] of Object.entries(this.value as Record<string, TagWrapper>)) {
                (tag as CompoundTag).tags.set(key, wrapper.toTag().toVariant());
            }
            break;
        case Tag.Type.IntArray:
            (tag as IntArrayTag).value.fromIntArray(this.value);
        }
        return tag;
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        if (this.type === Tag.Type.Long) {
            return `${Tag.Type[this.type]}Tag ${util.inspect(bin.toString(this.value), options)}`;
        }
        return `${Tag.Type[this.type]}Tag ${util.inspect(this.value, options)}`;
    }
}

@nativeClass(0x28)
export class Tag extends NativeClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    static create(type:Tag.Type.End):EndTag;
    static create(type:Tag.Type.Byte):ByteTag;
    static create(type:Tag.Type.Short):ShortTag;
    static create(type:Tag.Type.Int):IntTag;
    static create(type:Tag.Type.Long):LongTag;
    static create(type:Tag.Type.Float):FloatTag;
    static create(type:Tag.Type.Double):DoubleTag;
    static create(type:Tag.Type.ByteArray):ByteArrayTag;
    static create(type:Tag.Type.String):StringTag;
    static create(type:Tag.Type.List):ListTag;
    static create(type:Tag.Type.Compound):CompoundTag;
    static create(type:Tag.Type.IntArray):IntArrayTag;
    static create(type:Tag.Type):Tag;
    static create(type:Tag.Type):any {
        abstract();
    }

    getType():Tag.Type {
        switch ((this as any).constructor.name) {
        case "ByteTag":
            return Tag.Type.Byte;
        case "ShortTag":
            return Tag.Type.Short;
        case "IntTag":
            return Tag.Type.Int;
        case "LongTag":
            return Tag.Type.Long;
        case "FloatTag":
            return Tag.Type.Float;
        case "DoubleTag":
            return Tag.Type.Double;
        case "ByteArrayTag":
            return Tag.Type.ByteArray;
        case "StringTag":
            return Tag.Type.String;
        case "ListTag":
            return Tag.Type.List;
        case "CompoundTag":
            return Tag.Type.Compound;
        case "IntArrayTag":
            return Tag.Type.IntArray;
        default:
            return Tag.Type.End;
        }
    }

    toType(type:Tag.Type):ByteTag|ShortTag|IntTag|LongTag|FloatTag|DoubleTag|ByteArrayTag|StringTag|ListTag|CompoundTag|IntArrayTag|EndTag {
        switch (type) {
        case Tag.Type.End:
            return this.as(EndTag);
        case Tag.Type.Byte:
            return this.as(ByteTag);
        case Tag.Type.Short:
            return this.as(ShortTag);
        case Tag.Type.Int:
            return this.as(IntTag);
        case Tag.Type.Long:
            return this.as(LongTag);
        case Tag.Type.Float:
            return this.as(FloatTag);
        case Tag.Type.Double:
            return this.as(DoubleTag);
        case Tag.Type.ByteArray:
            return this.as(ByteArrayTag);
        case Tag.Type.String:
            return this.as(StringTag);
        case Tag.Type.List:
            return this.as(ListTag);
        case Tag.Type.Compound:
            return this.as(CompoundTag);
        case Tag.Type.IntArray:
            return this.as(IntArrayTag);
        default:
            throw new Error("Unhandled tag variant type: " + type);
        }
    }

    toVariant():CompoundTagVariant {
        const type = this.getType();
        const tag = this.toType(type);
        const variant = CompoundTagVariant.construct();
        switch (type) {
        case Tag.Type.Byte:
            variant.valueAsByteTag = (tag as ByteTag).value;
            break;
        case Tag.Type.Short:
            variant.valueAsShortTag = (tag as ShortTag).value;
            break;
        case Tag.Type.Int:
            variant.valueAsIntTag = (tag as IntTag).value;
            break;
        case Tag.Type.Long:
            variant.valueAsLongTag = (tag as LongTag).value;
            break;
        case Tag.Type.Float:
            variant.valueAsFloatTag = (tag as FloatTag).value;
            break;
        case Tag.Type.Double:
            variant.valueAsDoubleTag = (tag as DoubleTag).value;
            break;
        case Tag.Type.ByteArray:
            variant.valueAsByteArrayTag.fromByteArray((tag as ByteArrayTag).value.toByteArray());
            break;
        case Tag.Type.String:
            variant.valueAsStringTag = (tag as StringTag).value;
            break;
        case Tag.Type.List:
            (variant as any).setUint8((tag as ListTag).type, 0x20);
            variant.valueAsListTag.construct((tag as ListTag).tags);
            break;
        case Tag.Type.Compound: {
            const map = CxxMap.make(CxxString, CompoundTagVariant)[NativeType.getter](variant as any, 0x08);
            map.construct();
            for (const [key, variant] of (tag as CompoundTag).tags.entries()) {
                map.set(key, variant);
            }
            break;
        }
        case Tag.Type.IntArray:
            variant.valueAsIntArrayTag.fromIntArray((tag as IntArrayTag).value.toIntArray());
        }
        variant.type = type;
        return variant;
    }

    toWrapper():TagWrapper {
        return this.toType(this.getType()).toWrapper();
    }

    toJSON():TagWrapper {
        return this.toWrapper();
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return this.toWrapper();
    }
}
// export const TagPointer = Wrapper.make(Tag.ref());
// export type TagPointer = typeof TagPointer;

export namespace Tag {
    export enum Type {
        End,
        Byte,
        Short,
        Int,
        Long,
        Float,
        Double,
        ByteArray,
        String,
        List,
        Compound,
        IntArray,
    }
}

@nativeClass(null)
export class EndTag extends Tag {
    toWrapper():TagWrapper {
        return  new TagWrapper(Tag.Type.End, undefined);
    }
}

@nativeClass(null)
export class ByteTag extends Tag {
    @nativeField(uint8_t, 0x08)
    value:uint8_t;

    toWrapper():TagWrapper {
        return  new TagWrapper(Tag.Type.Byte, this.value);
    }
}

@nativeClass(null)
export class ShortTag extends Tag {
    @nativeField(int16_t, 0x08)
    value:int16_t;

    toWrapper():TagWrapper {
        return  new TagWrapper(Tag.Type.Short, this.value);
    }
}

@nativeClass(null)
export class IntTag extends Tag {
    @nativeField(int32_t, 0x08)
    value:int32_t;

    toWrapper():TagWrapper {
        return  new TagWrapper(Tag.Type.Int, this.value);
    }
}

@nativeClass(null)
export class LongTag extends Tag {
    @nativeField(bin64_t, 0x08)
    value:bin64_t;

    toWrapper():TagWrapper {
        return new TagWrapper(Tag.Type.Long, this.value);
    }
}

@nativeClass(null)
export class FloatTag extends Tag {
    @nativeField(float32_t, 0x08)
    value:float32_t;

    toWrapper():TagWrapper {
        return  new TagWrapper(Tag.Type.Float, this.value);
    }
}

@nativeClass(null)
export class DoubleTag extends Tag {
    @nativeField(float64_t, 0x08)
    value:float64_t;

    toWrapper():TagWrapper {
        return  new TagWrapper(Tag.Type.Double, this.value);
    }
}

@nativeClass()
export class TagMemoryChunk extends NativeClass {
    @nativeField(bin64_t)
    elements:bin64_t;
    /** Total size in bytes possibly, but the size of each element is also 1 as it's always uint8_t, IntArrayTag is not used */
    @nativeField(bin64_t)
    size:bin64_t;
    @nativeField(BinaryStream.ref())
    buffer:BinaryStream;

    get length():number {
        return bin.toNumber(this.elements);
    }
    set length(value:number) {
        this.elements = bin.make(value, 8);
    }

    fromByteArray(value:Uint8Array):void {
        this.length = value.length;
        this.size = bin.make(this.length, 8);
        this.buffer = new AllocatedPointer(this.length) as any;
        for (let i = 0; i < value.length; i++) {
            (this.buffer as any).setUint8(value[i], i);
        }
    }
    toByteArray():Uint8Array {
        const out = new Uint8Array(this.length);
        if (!this.buffer) return new Uint8Array();
        for (let i = 0; i < this.length; i++) {
            out[i] = (this.buffer as any).getUint8(i);
        }
        return out;
    }

    fromIntArray(value:Int32Array):void {
        this.length = value.length;
        this.size = bin.make(this.length * 4, 8);
        this.buffer = new AllocatedPointer(this.length * 4) as any;
        for (let i = 0; i < value.length; i++) {
            (this.buffer as any).setUint8(value[i], i * 4);
        }
    }
    toIntArray():Int32Array {
        const out = new Int32Array(this.length);
        if (!this.buffer) return new Int32Array();
        for (let i = 0; i < this.length; i++) {
            out[i] = (this.buffer as any).getUint8(i * 4);
        }
        return out;
    }
}

@nativeClass(null)
export class ByteArrayTag extends Tag {
    @nativeField(TagMemoryChunk, 0x08)
    value:TagMemoryChunk;

    toWrapper():TagWrapper {
        return new TagWrapper(Tag.Type.ByteArray, this.value.toByteArray());
    }
}

@nativeClass(null)
export class StringTag extends Tag {
    @nativeField(CxxString, 0x08)
    value:CxxString;

    toWrapper():TagWrapper {
        const out = new TagWrapper(Tag.Type.String, this.value);
        return out;
    }
}

@nativeClass(0x28)
export class ListTag extends Tag {
    @nativeField(CxxVector.make(Tag.ref()), 0x08)
    tags:CxxVector<Tag>;
    @nativeField(uint8_t, 0x20)
    type:Tag.Type;

    push(tag:Tag):void {
        this.tags.push(tag);
    }

    get value():Tag[] {
        return this.tags.toArray();
    }
    set value(value:Tag[]) {
        this.type = value[0].getType();
        this.tags.push(...value);
    }

    toWrapper():TagWrapper {
        const out = new TagWrapper(Tag.Type.List, []);
        for (const tag of this.tags) {
            out.value.push(tag.toType(this.type).toWrapper());
        }
        return out;
    }
}

/** @deprecated Unused */
@nativeClass(null)
export class IntArrayTag extends Tag {
    @nativeField(TagMemoryChunk, 0x08)
    value:TagMemoryChunk;

    toWrapper():TagWrapper {
        return new TagWrapper(Tag.Type.IntArray, this.value.toIntArray());
    }
}

@nativeClass(0x40)
export class CompoundTagVariant extends NativeClass {
    @nativeField(Tag)
    tagStorage:Tag;
    @nativeField(uint8_t)
    type:Tag.Type;

    @nativeField(uint8_t, {offset:0x08, noInitialize:true})
    valueAsByteTag:uint8_t;
    @nativeField(int16_t, {offset:0x08, noInitialize:true})
    valueAsShortTag:int16_t;
    @nativeField(int32_t, {offset:0x08, noInitialize:true})
    valueAsIntTag:int32_t;
    @nativeField(bin64_t, {offset:0x08, noInitialize:true})
    valueAsLongTag:bin64_t;
    @nativeField(float32_t, {offset:0x08, noInitialize:true})
    valueAsFloatTag:float32_t;
    @nativeField(float64_t, {offset:0x08, noInitialize:true})
    valueAsDoubleTag:float64_t;
    @nativeField(TagMemoryChunk, {offset:0x08, noInitialize:true})
    valueAsByteArrayTag:TagMemoryChunk;
    @nativeField(CxxString, {offset:0x08, noInitialize:true})
    valueAsStringTag:CxxString;
    @nativeField(CxxVector.make(Tag.ref()), {offset:0x08, noInitialize:true})
    valueAsListTag:CxxVector<Tag>;
    @nativeField(CxxMap.make(CxxString, CompoundTagVariant), {offset:0x08, noInitialize:true})
    valueAsCompoundTag:CxxMap<CxxString, CompoundTagVariant>;
    @nativeField(TagMemoryChunk, {offset:0x08, noInitialize:true})
    valueAsIntArrayTag:TagMemoryChunk;

    [NativeType.ctor_copy](from:CompoundTagVariant):void {
        this.type = from.type;
        switch (this.type) {
        case Tag.Type.Byte:
            this.valueAsByteTag = from.valueAsByteTag;
            break;
        case Tag.Type.Short:
            this.valueAsShortTag = from.valueAsShortTag;
            break;
        case Tag.Type.Int:
            this.valueAsIntTag = from.valueAsIntTag;
            break;
        case Tag.Type.Long:
            this.valueAsLongTag = from.valueAsLongTag;
            break;
        case Tag.Type.Float:
            this.valueAsFloatTag = from.valueAsFloatTag;
            break;
        case Tag.Type.Double:
            this.valueAsDoubleTag = from.valueAsDoubleTag;
            break;
        case Tag.Type.ByteArray:
            this.valueAsByteArrayTag.fromByteArray(from.valueAsByteArrayTag.toByteArray());
            break;
        case Tag.Type.String:
            this.valueAsStringTag = from.valueAsStringTag;
            break;
        case Tag.Type.List:
            this.setUint8(from.getUint8(0x20), 0x20);
            this.valueAsListTag.construct(from.valueAsListTag);
            break;
        case Tag.Type.Compound:
            this.valueAsCompoundTag.construct();
            for (const [key, variant] of from.valueAsCompoundTag.entries()) {
                this.valueAsCompoundTag.set(key, variant);
            }
            break;
        case Tag.Type.IntArray:
            this.valueAsIntArrayTag.fromIntArray(from.valueAsIntArrayTag.toIntArray());
        }
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return this.tagStorage.toType(this.type).toWrapper();
    }
}

@nativeClass(null)
export class CompoundTag extends Tag {
    @nativeField(CxxMap.make(CxxString, CompoundTagVariant), 0x08)
    tags:CxxMap<CxxString, CompoundTagVariant>;

    get(key:string):EndTag|ByteTag|ShortTag|IntTag|LongTag|FloatTag|DoubleTag|StringTag|ListTag|CompoundTag|undefined {
        const variant = this.tags.get(key);
        return variant?.tagStorage.toType(variant.type);
    }

    set(key:string, tag:Tag):void {
        const variant = tag.toVariant();
        this.tags.set(key, variant);
    }

    get value():Record<string, Tag> {
        const out:Record<string, Tag> = {};
        for (const [key, variant] of this.tags.entries()) {
            out[key] = variant.tagStorage.toType(variant.type);
        }
        return out;
    }
    set value(value:Record<string, Tag>) {
        this.tags.clear();
        for (const key in value) {
            const tag = value[key];
            this.set(key, tag);
        }
    }

    toWrapper():TagWrapper {
        const out = new TagWrapper(Tag.Type.Compound, {});
        for (const [key, tag] of this.tags.entries()) {
            out.value[key] = tag.tagStorage.toType(tag.type).toWrapper();
        }
        return out;
    }
}
