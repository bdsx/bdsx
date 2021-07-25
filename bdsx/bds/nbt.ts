import { bin } from "../bin";
import { abstract } from "../common";
import { NativePointer, VoidPointer } from "../core";
import { CxxMap } from "../cxxmap";
import { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, CxxString, float32_t, float64_t, int16_t, int32_t, uint8_t } from "../nativetype";
import { BinaryStream } from "./stream";
import util = require("util");

export class TagWrapper {
    public type: Tag.Type;
    public value: any;

    constructor(type: Tag.Type, value: any) {
        this.type = type;
        this.value = value;
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `${Tag.Type[this.type]}Tag ${util.inspect(this.value, options)}`;
    }
}

@nativeClass(0x08)
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
    getAsType(type:Tag.Type.End):void;
    getAsType(type:Tag.Type.Byte):uint8_t;
    getAsType(type:Tag.Type.Short):int16_t;
    getAsType(type:Tag.Type.Long):string;
    getAsType(type:Tag.Type.Float):float32_t;
    getAsType(type:Tag.Type.Double):float64_t;
    getAsType(type:Tag.Type.ByteArray):uint8_t[];
    getAsType(type:Tag.Type.String):CxxString[];
    getAsType(type:Tag.Type.List):TagWrapper[];
    getAsType(type:Tag.Type.Compound):Record<string, TagWrapper>;
    getAsType(type:Tag.Type.IntArray):int32_t[];
    getAsType(type:Tag.Type):any;
    getAsType(type:Tag.Type):any {
        switch (type) {
            case Tag.Type.Byte:
                return this.getUint8(0x08);
            case Tag.Type.Short:
                return this.getInt16(0x08);
            case Tag.Type.Int:
                return this.getInt32(0x08);
            case Tag.Type.Long:
                return bin.toString(this.getBin64(0x08));
            case Tag.Type.Float:
                return this.getFloat32(0x08);
            case Tag.Type.Double:
                return this.getFloat64(0x08);
            case Tag.Type.ByteArray:
                return this.as(ByteArrayTag).value.toByteArray();
            case Tag.Type.String:
                return this.getCxxString(0x08);
            case Tag.Type.List:
                return this.as(ListTag).toArray();
            case Tag.Type.Compound:
                return this.as(CompoundTag).toObject();
            case Tag.Type.IntArray:
                return this.as(IntArrayTag).value.toIntArray();
        }
        return null;
    }
    setAsType(type: Tag.Type, value: any):void {
        switch (type) {
            case Tag.Type.Byte:
                this.setUint8(value, 0x08);
            case Tag.Type.Short:
                this.setInt16(value, 0x08);
            case Tag.Type.Int:
                this.setInt32(value, 0x08);
            case Tag.Type.Long:
                this.setBin(bin.as64(value), 0x08);
            case Tag.Type.Float:
                this.setFloat32(value, 0x08);
            case Tag.Type.Double:
                this.setFloat64(value, 0x08);
            case Tag.Type.ByteArray:
                this.as(ByteArrayTag).value.fromByteArray(value);
            case Tag.Type.String:
                this.setCxxString(value, 0x08);
            case Tag.Type.List:
                this.as(ListTag).fromArray(value);
            case Tag.Type.Compound:
                this.as(CompoundTag).fromObject(value);
            case Tag.Type.IntArray:
                this.as(IntArrayTag).value.fromIntArray(value);
        }
    }
}

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
}

@nativeClass(null)
export class ByteTag extends Tag {
    @nativeField(uint8_t, 0x08)
    value:uint8_t;
}

@nativeClass(null)
export class ShortTag extends Tag {
    @nativeField(int16_t, 0x08)
    value:int16_t;
}

@nativeClass(null)
export class IntTag extends Tag {
    @nativeField(int32_t, 0x08)
    value:int32_t;
}

@nativeClass(null)
export class LongTag extends Tag {
    @nativeField(bin64_t, 0x08)
    value:bin64_t;
}

@nativeClass(null)
export class FloatTag extends Tag {
    @nativeField(float32_t, 0x08)
    value:float32_t;
}

@nativeClass(null)
export class DoubleTag extends Tag {
    @nativeField(float64_t, 0x08)
    value:float64_t;
}

@nativeClass()
export class TagMemoryChunk extends NativeClass {
    @nativeField(bin64_t)
    elements:bin64_t;
    @nativeField(bin64_t)
    size:bin64_t;
    @nativeField(BinaryStream.ref())
    buffer:BinaryStream|null;

    fromByteArray(value:number[]):void {
        throw new Error("Method not implemented.");
    }
    toByteArray():number[] {
        const out = [];
        if (!this.buffer) return [];
        const stream = this.buffer.as(NativePointer);
        for (let i = 0; i < bin.toNumber(this.size); i++) {
            out.push(stream.readUint8());
        }
        return out;
    }
    fromIntArray(value:number[]):void {
        throw new Error("Method not implemented.");
    }
    toIntArray():number[] {
        const out = [];
        if (!this.buffer) return [];
        const stream = this.buffer.as(NativePointer);
        for (let i = 0; i < bin.toNumber(this.size); i++) {
            out.push(stream.readInt32());
        }
        return out;
    }
}

@nativeClass(null)
export class ByteArrayTag extends Tag {
    @nativeField(TagMemoryChunk, 0x08)
    value:TagMemoryChunk;
}

@nativeClass(null)
export class StringTag extends Tag {
    @nativeField(float64_t, 0x08)
    value:float64_t;
}

@nativeClass(0x28)
export class ListTag extends Tag {
    @nativeField(CxxVector.make(Tag.ref()), 0x08)
    value:CxxVector<Tag>;
    @nativeField(uint8_t, 0x20)
    type:Tag.Type;

    fromArray(value:TagWrapper[]):void {
        this.type = value[0].type;
        this.value.splice(0, this.value.size());
        for (const wrapper of value) {
            const tag = Tag.create(wrapper.type);
            tag.setAsType(wrapper.type, wrapper.value);
            this.value.push(tag);
        }
        this.value.push(Tag.create(Tag.Type.End));
    }
    toArray():TagWrapper[] {
        const out:any[] = [];
        for (const tag of this.value.toArray()) {
            out.push(new TagWrapper(this.type, tag.getAsType(this.type)));
        }
        return out;
    }
}

/** @deprecated Unused */
@nativeClass(null)
export class IntArrayTag extends Tag {
    @nativeField(TagMemoryChunk, 0x08)
    value:TagMemoryChunk;
}

@nativeClass(0x40)
export class CompoundTagVariant extends Tag {
    @nativeField(uint8_t, 0x28)
    type:Tag.Type;
}

@nativeClass(null)
export class CompoundTag extends NativeClass {
    @nativeField(CxxMap.make(CxxString, CompoundTagVariant), 0x08)
    tags:CxxMap<CxxString, CompoundTagVariant>;

    put(name:string, tag:Tag):void {
        abstract();
    }

    fromObject(value:Record<string, TagWrapper>):void {
        this.tags.clear();
        for (const key in value) {
            const wrapper = value[key];
            const tag = Tag.create(wrapper.type);
            tag.setAsType(wrapper.type, wrapper.value);
            this.put(key, tag);
        }
    }

    toObject():Record<string, TagWrapper> {
        const out:Record<string, any> = {};
        for (const [key, tag] of this.tags.entires()) {
            out[key] = new TagWrapper(tag.type, tag.getAsType(tag.type));
        }
        return out;
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `CompoundTag ${util.inspect(this.toObject(), options)}`;
    }
}
