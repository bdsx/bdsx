import * as util from "util";
import { bin } from "../bin";
import { capi } from "../capi";
import { abstract, TypedArrayBuffer } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { CxxMap } from "../cxxmap";
import { CxxVector } from "../cxxvector";
import { AbstractClass, nativeClass, NativeClass, NativeClassType, nativeField } from "../nativeclass";
import { bin64_t, CxxString, float32_t, float64_t, int16_t, int32_t, int64_as_float_t, NativeType, uint8_t, void_t } from "../nativetype";
import { Wrapper } from "../pointer";
import { addSlashes, hexn, stripSlashes } from "../util";

interface NBTStringifyable {
    stringify(indent?:number|string):string;
    writeTo(writer:NBTWriter):void;
}

@nativeClass()
export class TagMemoryChunk extends NativeClass {
    /** Total count of elements */
    @nativeField(int64_as_float_t)
    elements:int64_as_float_t;
    /** Total size in bytes */
    @nativeField(int64_as_float_t)
    size:int64_as_float_t;
    @nativeField(StaticPointer)
    buffer:StaticPointer|null;

    [NativeType.ctor]():void {
        this.elements = 0;
        this.size = 0;
        this.buffer = null;
    }
    [NativeType.dtor]():void {
        const buf = this.buffer;
        if (buf !== null) capi.free(buf);
    }
    [NativeType.ctor_copy](v:TagMemoryChunk):void {
        this.elements = v.elements;
        const size = this.size = v.size;
        const buffer = v.buffer;
        if (buffer !== null) {
            (this.buffer = capi.malloc(size)).copyFrom(buffer, size);
        } else {
            this.buffer = null;
        }
    }

    getComponentSize():number {
        return this.size / this.elements;
    }

    getAs<T extends TypedArrayBuffer>(type:new(count?:number)=>T):T {
        const buf = this.buffer;
        const n = this.elements;
        const out = new type(n);
        if (buf !== null) buf.copyTo(out, out.byteLength);
        return out;
    }

    set(buffer:TypedArrayBuffer):void {
        const count = buffer.length;
        const bytes = buffer.byteLength;
        this.elements = count;
        this.size = bytes;

        const oldbuf = this.buffer;
        if (oldbuf !== null) capi.free(oldbuf);
        const newbuf = capi.malloc(bytes);
        this.buffer = newbuf;
        newbuf.setBuffer(buffer);
    }
}

@nativeClass()
export class Tag extends NativeClass implements NBTStringifyable {
    @nativeField(VoidPointer)
    vftable:VoidPointer;

    toString():string {
        abstract();
    }
    getId():Tag.Type {
        abstract();
    }
    equals(tag:Tag):boolean {
        abstract();
    }

    value():any {
        abstract();
    }
    dispose():void {
        this.destruct();
        capi.free(this);
    }

    allocateClone():this {
        const TagType = this.constructor as NativeClassType<Tag>;
        return TagType.allocate(this) as this;
    }
    stringify(indent?:number|string):string {
        const writer = indent != null ? new IndentedNBTWriter(indent) : new NBTWriter;
        this.writeTo(writer);
        return writer.data;
    }
    writeTo(writer:NBTWriter):void {
        // empty
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `${this.constructor.name} ${util.inspect((this as any).data, options)}`;
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

@nativeClass()
export class EndTag extends Tag {
    value():null {
        return null;
    }
}

@nativeClass()
export class ByteTag extends Tag {
    @nativeField(uint8_t)
    data:uint8_t;

    value():NBT.Byte {
        return NBT.byte(this.data);
    }
    constructWith(data:uint8_t):void_t {
        this.construct();
        this.data = data;
    }
    stringify(indent?:number|string):string {
        return this.data+'b';
    }
    writeTo(writer:NBTWriter):void {
        writer.data += this.data;
        writer.data += 'b';
    }
    static constructWith(data:uint8_t):ByteTag {
        const tag = new ByteTag(true);
        tag.constructWith(data);
        return tag;
    }
    /**
     * @return should be deleted with tag.delete()
     */
    static allocateWith(data:uint8_t):ByteTag {
        const tag = ByteTag.allocate();
        tag.data = data;
        return tag;
    }
}

@nativeClass()
export class ShortTag extends Tag {
    @nativeField(int16_t)
    data:int16_t;

    value():NBT.Short {
        return NBT.short(this.data);
    }
    constructWith(data:int16_t):void {
        this.construct();
        this.data = data;
    }
    stringify(indent?:number|string):string {
        return this.data+'s';
    }
    writeTo(writer:NBTWriter):void {
        writer.data += this.data;
        writer.data += 's';
    }
    static constructWith(data:int16_t):ShortTag {
        const tag = new ShortTag(true);
        tag.constructWith(data);
        return tag;
    }
    /**
     * @return should be deleted with tag.delete()
     */
    static allocateWith(data:int16_t):ShortTag {
        const tag = ShortTag.allocate();
        tag.data = data;
        return tag;
    }
}

@nativeClass()
export class IntTag extends Tag {
    @nativeField(int32_t)
    data:int32_t;

    value():NBT.Int {
        return new NBT.Int(this.data);
    }
    constructWith(data:int32_t):void {
        this.construct();
        this.data = data;
    }
    stringify(indent?:number|string):string {
        return this.data+'';
    }
    writeTo(writer:NBTWriter):void {
        writer.data += this.data;
    }
    static constructWith(data:int32_t):IntTag {
        const tag = new IntTag(true);
        tag.constructWith(data);
        return tag;
    }
    /**
     * @return should be deleted with IntTag.delete(x)
     */
    static allocateWith(data:int32_t):IntTag {
        const tag = IntTag.allocate();
        tag.data = data;
        return tag;
    }
}

// Notice that in bedrock_server.exe, LongTag is called Int64Tag. However, in Tag::getTagName, Int64Tag returns TAG_Long.

@nativeClass()
export class Int64Tag extends Tag {
    @nativeField(bin64_t)
    data:bin64_t;

    get dataAsString():string {
        return bin.toString(this.data);
    }
    set dataAsString(data:string) {
        this.data = bin.parse(data, 10, 4);
    }

    value():NBT.Int64 {
        return new NBT.Int64(this.data);
    }
    constructWith(data:bin64_t):void {
        this.construct();
        this.data = data;
    }
    constructWithString(data:string):void {
        this.construct();
        this.dataAsString = data;
    }
    stringify(indent?:number|string):string {
        return bin.toString(this.data)+'l';
    }
    writeTo(writer:NBTWriter):void {
        writer.data += bin.toString(this.data);
        writer.data += 'l';
    }

    static constructWith(data:bin64_t):Int64Tag {
        const tag = new Int64Tag(true);
        tag.constructWith(data);
        return tag;
    }
    static constructWithString(data:string):Int64Tag {
        const tag = new Int64Tag(true);
        tag.constructWithString(data);
        return tag;
    }
    static allocateWith(data:bin64_t):Int64Tag {
        const tag = Int64Tag.allocate();
        tag.data = data;
        return tag;
    }
    static allocateWithString(data:string):Int64Tag {
        const tag = Int64Tag.allocate();
        tag.dataAsString = data;
        return tag;
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `LongTag ${this.dataAsString.yellow}`;
    }
}

@nativeClass()
export class FloatTag extends Tag {
    @nativeField(float32_t)
    data:float32_t;

    value():NBT.Float {
        return NBT.float(this.data);
    }
    constructWith(data:float32_t):void {
        this.construct();
        this.data = data;
    }
    stringify(indent?:number|string):string {
        return this.data+'f';
    }
    writeTo(writer:NBTWriter):void {
        writer.data += this.data;
        writer.data += 'f';
    }
    static constructWith(data:float32_t):FloatTag {
        const tag = new FloatTag(true);
        tag.constructWith(data);
        return tag;
    }
    static allocateWith(data:float32_t):FloatTag {
        const tag = FloatTag.allocate();
        tag.data = data;
        return tag;
    }
}

@nativeClass()
export class DoubleTag extends Tag {
    @nativeField(float64_t)
    data:float64_t;

    value():NBT.Double {
        return NBT.double(this.data);
    }
    constructWith(data:float64_t):void {
        this.construct();
        this.data = data;
    }
    stringify(indent?:number|string):string {
        return this.data+'d';
    }
    writeTo(writer:NBTWriter):void {
        writer.data += this.data;
        writer.data += 'd';
    }
    static constructWith(data:float64_t):DoubleTag {
        const tag = new DoubleTag(true);
        tag.constructWith(data);
        return tag;
    }
    static allocateWith(data:float64_t):DoubleTag {
        const tag = DoubleTag.allocate();
        tag.data = data;
        return tag;
    }
}

@nativeClass()
export class ByteArrayTag extends Tag {
    @nativeField(TagMemoryChunk)
    data:TagMemoryChunk;

    value():Uint8Array {
        return this.data.getAs(Uint8Array);
    }
    constructWith(data:Uint8Array):void {
        abstract();
    }
    set(array:TypedArrayBuffer|number[]):void {
        if (array instanceof Array) array = new Uint8Array(array);
        this.data.set(array);
    }
    get(idx:number):uint8_t {
        const data = this.data;
        if (idx < 0 || idx >= data.size) return undefined as any;
        const buffer = data.buffer!; // it must be not null
        return buffer.getUint8(idx);
    }
    size():number {
        return this.data.size;
    }
    toUint8Array():Uint8Array {
        return this.data.getAs(Uint8Array);
    }
    writeTo(writer:NBTWriter):void {
        writer.byteArray(this.toUint8Array());
    }

    static constructWith(data:Uint8Array):ByteArrayTag {
        const tag = new ByteArrayTag(true);
        tag.constructWith(data);
        return tag;
    }
    static allocateWith(data:TypedArrayBuffer|number[]):ByteArrayTag {
        const v = ByteArrayTag.allocate();
        v.set(data);
        return v;
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `ByteArrayTag ${util.inspect(this.data.getAs(Uint8Array), options)}`;
    }
}

@nativeClass()
export class StringTag extends Tag {
    @nativeField(CxxString)
    data:CxxString;

    value():string {
        return this.data;
    }
    constructWith(data:CxxString):void {
        this.construct();
        this.data = data;
    }
    stringify(indent?:number|string):string {
        return '"'+addSlashes(this.data)+'"';
    }
    writeTo(writer:NBTWriter):void {
        writer.data += '"';
        writer.data += addSlashes(this.data);
        writer.data += '"';
    }

    static constructWith(data:string):StringTag {
        const tag = new StringTag(true);
        tag.constructWith(data);
        return tag;
    }
    static allocateWith(data:string):StringTag {
        const v = StringTag.allocate();
        v.data = data;
        return v;
    }
}

@nativeClass()
export class ListTag<T extends Tag = Tag> extends Tag {
    @nativeField(CxxVector.make(Tag.ref()))
    data:CxxVector<T>;
    @nativeField(uint8_t, 0x20)
    type:Tag.Type;

    value():any[] {
        return this.data.toArray().map(tag=>tag.value());
    }
    [NativeType.ctor_copy](list:ListTag<T>):void {
        this.construct();

        const src = list.data;
        const dst = this.data;

        const size = src.size();
        dst.resize(size);
        for (let i=0;i<size;i++) {
            dst.set(i, src.get(i).allocateClone());
        }
    }

    get<_T extends Tag = T>(idx:number):_T {
        return this.data.get(idx) as any;
    }
    set(idx:number, tag:T):void {
        this.type = tag.getId();
        return this.data.set(idx, tag);
    }

    push(tag:Tag):void {
        this.pushAllocated(tag.allocateClone());
    }

    /**
     * @param tag it should be allocated by `Tag.allocate()`. it will be destructed inside of the function
     */
    pushAllocated(tag:Tag):void {
        abstract();
    }

    /**
     * @return should be deleted by tag.delete()
     */
    pop():T|null {
        const back = this.data.back();
        this.data.pop();
        return back;
    }
    size():number {
        abstract();
    }

    constructWith(data:T[]):void {
        this.construct();
        for (const e of data) {
            this.push(e);
        }
    }
    writeTo(writer:NBTWriter):void {
        writer.list(this.data);
    }

    static constructWith<T extends Tag = Tag>(data?:T[]):ListTag<T> {
        const tag = new ListTag<T>(true);
        if (data != null) tag.constructWith(data);
        return tag;
    }
    static allocateWith<T extends Tag = Tag>(data?:T[]):ListTag<T> {
        const tag = ListTag.allocate() as ListTag<T>;
        if (data != null) {
            for (const e of data) {
                tag.push(e);
            }
        }
        return tag;
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `ListTag ${util.inspect(this.data.toArray(), options)}`;
    }
}

@nativeClass(0x30)
export class CompoundTagVariant extends AbstractClass {
    get():Tag {
        return Tag.from(this as any)!;
    }
    set(tag:Tag):void {
        const v = tag.allocateClone();
        this.emplace(v);
        v.dispose();
    }
    emplace(tag:Tag):void {
        abstract();
    }
}

@nativeClass()
export class CompoundTag extends Tag {
    @nativeField(CxxMap.make(CxxString, CompoundTagVariant))
    data:CxxMap<CxxString, CompoundTagVariant>;

    value():Record<string, any> {
        const out:Record<string, NBT> = {};
        for (const [key, value] of this.data.entries()) {
            out[key] = value.get().value();
        }
        return out;
    }

    size():number {
        return this.data.size();
    }
    constructWith(data:Record<string, Tag>):void {
        this.construct();
        for (const [k, v] of Object.entries(data)) {
            this.set(k, v);
        }
    }
    get<T extends Tag>(key:string):T|null {
        abstract();
    }
    /**
     * @param tag it should be allocated by `Tag.allocate()`. it will be destructed inside of the function
     */
    setAllocated(key:string, tag:Tag):void {
        abstract();
    }
    set(key:string, tag:Tag):void {
        this.setAllocated(key, tag.allocateClone());
    }
    has(key:string):boolean {
        abstract();
    }
    delete(key:string):boolean {
        abstract();
    }
    clear():void {
        abstract();
    }
    writeTo(writer:NBTWriter):void {
        writer.compound(this.data.entries());
    }

    static allocateWith(data:Record<string, Tag>):CompoundTag {
        const tag = CompoundTag.allocate();
        for (const [k, v] of Object.entries(data)) {
            tag.set(k, v);
        }
        return tag;
    }

    [NativeType.ctor_copy](from:CompoundTag):void {
        this.construct();
        for (const [k, v] of from.data.entries()) {
            this.set(k, v.get());
        }
    }
    [NativeType.ctor_move](from:CompoundTag):void {
        this.construct();
        for (const [k, v] of from.data.entries()) {
            this.set(k, v.get());
        }
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        const map = new Map<CxxString, Tag>();
        for (const [key, variant] of this.data.entries()) {
            map.set(key, variant.get());
        }
        return `CompoundTag ${util.inspect(map, options).substr(4)}`;
    }
}

@nativeClass()
export class IntArrayTag extends Tag {
    @nativeField(TagMemoryChunk)
    data:TagMemoryChunk;

    value():Int32Array {
        return this.data.getAs(Int32Array);
    }

    constructWith(data:Int32Array):void {
        this.construct();
        this.data.set(data);
    }

    set(array:Int32Array|number[]):void {
        if (!(array instanceof Int32Array)) array = new Int32Array(array);
        this.data.set(array);
    }

    get(idx:number):int32_t {
        const data = this.data;
        if (idx < 0 || idx >= data.elements) return undefined as any;
        const buffer = data.buffer!; // it must be not null
        return buffer.getInt32(idx*4);
    }

    size():number {
        return this.data.elements;
    }

    toInt32Array():Int32Array {
        return this.data.getAs(Int32Array);
    }

    writeTo(writer:NBTWriter):void {
        writer.intArray(this.toInt32Array());
    }

    static allocateWith(data:Int32Array|number[]):IntArrayTag {
        const tag = IntArrayTag.allocate();
        tag.set(data);
        return tag;
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `IntArrayTag ${util.inspect(this.data.getAs(Int32Array), options)}`;
    }
}

export type NBT = Int32Array|Uint8Array|NBT.Compound|NBT[]|NBT.Primitive|NBT.Numeric|number|string|Tag|boolean|null;

export namespace NBT {
    export type Mixed = NBT|Tag|MixedCompound;

    export interface MixedCompound {
        [key:string]:Mixed;
    }
    export interface Compound {
        [key:string]:NBT;
    }

    export abstract class Primitive implements NBTStringifyable {
        abstract allocate():Tag;
        stringify(indent?:number|string):string {
            const writer = indent != null ? new IndentedNBTWriter(indent) : new NBTWriter;
            this.writeTo(writer);
            return writer.data;
        }
        writeTo(writer:NBTWriter):void {
            // empty
        }
    }

    export abstract class Numeric extends Primitive {
        constructor(protected _value:number) {
            super();
        }
        abstract get value(): number;
        abstract set value(n: number);
        toExponential(fractionDigits?:number|undefined):string {
            return this._value.toExponential(fractionDigits);
        }
        toFixed(fractionDigits?:number|undefined):string {
            return this._value.toFixed(fractionDigits);
        }
        toLocaleString(locales?:string|string[]|undefined, options?:Intl.NumberFormatOptions|undefined):string {
            return this._value.toLocaleString(locales, options);
        }
        toPrecision(precision?: number): string {
            return this._value.toPrecision(precision);
        }
        toString(radix?: number): string {
            return this._value.toString(radix);
        }
        valueOf():number {
            return this._value;
        }
    }
    export class Byte extends Numeric {
        constructor(n:number) {
            super(n & 0xff);
        }
        get value(): number {
            return this._value;
        }
        set value(n:number) {
            this._value = n & 0xff;
        }
        allocate():ByteTag {
            return ByteTag.allocateWith(this._value);
        }
        stringify(indent?:number|string):string {
            return this._value+'b';
        }
        writeTo(writer:NBTWriter):void {
            writer.data += this._value;
            writer.data += 'b';
        }
        [util.inspect.custom](depth:number, options:Record<string, any>):string {
            return options.stylize('NBT.byte(', 'special')+options.stylize(this._value, 'number')+options.stylize(')', 'special');
        }
    }
    export class Short extends Numeric {
        constructor(n:number) {
            super(n << 16 >> 16);
        }
        get value(): number {
            return this._value;
        }
        set value(n:number) {
            this._value = n << 16 >> 16;
        }
        allocate():ShortTag {
            return ShortTag.allocateWith(this._value);
        }
        stringify(indent?:number|string):string {
            return this._value+'s';
        }
        writeTo(writer:NBTWriter):void {
            writer.data += this._value;
            writer.data += 's';
        }
        [util.inspect.custom](depth:number, options:Record<string, any>):string {
            return options.stylize('NBT.short(', 'special')+options.stylize(this._value, 'number')+options.stylize(')', 'special');
        }
    }
    export class Int extends Numeric {
        constructor(n:number) {
            super(n|0);
        }
        get value(): number {
            return this._value;
        }
        set value(n:number) {
            this._value = n|0;
        }
        allocate():IntTag {
            return IntTag.allocateWith(this._value);
        }
        stringify(indent?:number|string):string {
            return this._value+'';
        }
        writeTo(writer:NBTWriter):void {
            writer.data += this._value;
        }
        [util.inspect.custom](depth:number, options:Record<string, any>):string {
            return options.stylize('NBT.int(', 'special')+options.stylize(this._value, 'number')+options.stylize(')', 'special');
        }
    }

    const INT64_AS_STR_THRESHOLD = bin.make(0x1000000000000, 4);
    export class Int64 extends Primitive {
        private _value:bin64_t;
        constructor(n:bin64_t) {
            super();
            this._value = n.length < 4 ? n + '\0'.repeat(4-n.length) : n.substr(0, 4);
        }
        get value():bin64_t {
            return this._value;
        }
        set value(n:bin64_t) {
            this._value = n.length < 4 ? n + '\0'.repeat(4-n.length) : n.substr(0, 4);
        }
        allocate():Int64Tag {
            return Int64Tag.allocateWith(this._value);
        }
        stringify(indent?:number|string):string {
            return bin.toString(this._value)+'l';
        }
        writeTo(writer:NBTWriter):void {
            writer.data += bin.toString(this._value);
            writer.data += 'l';
        }
        [util.inspect.custom](depth:number, options:Record<string, any>):string {
            let param:string;
            if (bin.compare(this._value, INT64_AS_STR_THRESHOLD) > 0) {
                const v = this._value;
                const bin64 = `"\\u${hexn(v.charCodeAt(0), 4)}\\u${hexn(v.charCodeAt(1), 4)}\\u${hexn(v.charCodeAt(2), 4)}\\u${hexn(v.charCodeAt(3), 4)}"`;
                param = options.stylize(bin64, 'string');
            } else {
                param = options.stylize(bin.toString(this._value), 'number');
            }
            return options.stylize('NBT.int64(', 'special')+param+options.stylize(')', 'special');
        }
    }
    export class Float extends Numeric {
        constructor(n:number) {
            super(Math.fround(n));
        }
        get value(): number {
            return this._value;
        }
        set value(n:number) {
            this._value = Math.fround(n);
        }
        allocate():FloatTag {
            return FloatTag.allocateWith(this._value);
        }
        stringify(indent?:number|string):string {
            return this._value+'f';
        }
        writeTo(writer:NBTWriter):void {
            writer.data += this._value;
            writer.data += 'f';
        }
        [util.inspect.custom](depth:number, options:Record<string, any>):string {
            return options.stylize('NBT.float(', 'special')+options.stylize(this._value, 'number')+options.stylize(')', 'special');
        }
    }
    export class Double extends Numeric {
        set value(n:number) {
            this._value = n;
        }
        get value(): number {
            return this._value;
        }
        allocate():DoubleTag {
            return DoubleTag.allocateWith(this._value);
        }
        writeTo(writer:NBTWriter):void {
            writer.data += this._value;
            writer.data += 'd';
        }
        [util.inspect.custom](depth:number, options:Record<string, any>):string {
            return options.stylize('NBT.double(', 'special')+options.stylize(this._value, 'number')+options.stylize(')', 'special');
        }
    }

    export function byte(n:number):Byte {
        return new Byte(n);
    }
    export function short(n:number):Short {
        return new Short(n);
    }
    export function int(n:number):Int {
        return new Int(n);
    }
    export function int64(n:bin64_t|number):Int64 {
        return new Int64(typeof n === 'number' ? bin.make(n, 4) : n);
    }
    export function float(n:number):Float {
        return new Float(n);
    }
    export function double(n:number):Double {
        return new Double(n);
    }
    export function byteArray(values:number[]):Uint8Array {
        return new Uint8Array(values);
    }
    export function intArray(values:number[]):Int32Array {
        return new Int32Array(values);
    }
    export function end():null {
        return null;
    }

    /**
     * it will allocate the native NBT from the JS NBT.
     * boolean -> ByteTag
     * number -> IntTag
     * null -> end
     */
    export function allocate(nbt:Mixed):Tag {
        switch (typeof nbt) {
        case 'boolean': return ByteTag.allocateWith(+nbt);
        case 'number': return IntTag.allocateWith(nbt);
        case 'string': return StringTag.allocateWith(nbt);
        case 'object': {
            if (nbt === null) {
                return EndTag.allocate();
            }
            if (nbt instanceof Int32Array) {
                return IntArrayTag.allocateWith(nbt);
            }
            if (nbt instanceof Uint8Array) {
                return ByteArrayTag.allocateWith(nbt);
            }
            if (nbt instanceof Array) {
                const list = ListTag.allocate();
                for (const v of nbt) {
                    list.pushAllocated(allocate(v));
                }
                return list;
            }
            if (nbt instanceof Primitive) {
                return nbt.allocate();
            }
            if (nbt instanceof Tag) {
                return nbt.allocateClone();
            }
            const allocated = CompoundTag.allocate();
            for (const [key, value] of Object.entries(nbt)) {
                allocated.setAllocated(key, allocate(value));
            }
            return allocated;
        }
        default: throw TypeError(`invalid type of NBT. ${typeof nbt}`);
        }
    }

    /** Converts a Stringified Named Binary Tag (SNBT) string into a Named Binary Tag (NBT) tag. */
    export function parse(text: string):NBT {
        let p = 0;
        let lastNumberIsDecimal = false;
        function unexpectedToken():never {
            if (p === text.length) {
                throw SyntaxError('Unexpected end of SNBT input');
            } else {
                throw SyntaxError(`Unexpected token ${text.charAt(p)} in SNBT at position ${p}`);
            }
        }
        function skipSpace():void {
            nonSpaceExp.lastIndex = p;
            const res = nonSpaceExp.exec(text);
            if (res !== null) {
                p = res.index;
            } else {
                p = text.length;
            }
        }
        function readStringContinue(endchr:string):string {
            let i = p;
            let next:number;
            for (;;) {
                next = text.indexOf(endchr, i);
                if (next === -1) throw SyntaxError('Unexpected end of SNBT input');
                i = next+1;
                const backslash = getBackslashCount(text, next);
                if ((backslash & 1) === 0) {
                    // even
                    break;
                }
            }
            const value = stripSlashes(text.substring(p, next));
            p = i;
            return value;
        }
        function readNameContinue():string {
            const prev = p;
            nonVariableCharacter.lastIndex = p + 1;
            const res = nonVariableCharacter.exec(text);
            if (res !== null) {
                p = res.index;
            } else {
                p = text.length;
            }
            return text.substring(prev, p);
        }
        function checkToken(keyCode:number):void {
            skipSpace();
            if (text.charCodeAt(p) !== keyCode) {
                unexpectedToken();
            }
        }
        function passToken(keyCode:number):void {
            checkToken(keyCode);
            p++;
        }
        function passChar(keyCode:number):void {
            if (text.charCodeAt(p) !== keyCode) {
                unexpectedToken();
            }
            p++;
        }
        function readNumberString():string {
            skipSpace();
            const prev = p;
            let chr = text.charCodeAt(p);
            if (chr === 0x2d) {
                p++;
                chr = text.charCodeAt(p);
            }
            if (chr < 0x30 || chr > 0x39) {
                unexpectedToken();
            }
            p++;

            _notNumber:{
                for (;;) {
                    const chr = text.charCodeAt(p);
                    if (0x30 <= chr && chr <= 0x39) {
                        p++;
                    } else if (chr === 0x2e) { // .
                        p++;
                        lastNumberIsDecimal = true;
                        break;
                    } else {
                        lastNumberIsDecimal = false;
                        break _notNumber;
                    }
                }

                for (;;) {
                    const chr = text.charCodeAt(p);
                    if (0x30 <= chr && chr <= 0x39) {
                        p++;
                    } else {
                        break _notNumber;
                    }
                }
            }

            return text.substring(prev, p);
        }
        function readNumberStringSuffix(suffix1:number, suffix2:number):string {
            const num = readNumberString();
            switch (text.charCodeAt(p)) {
            case suffix1: case suffix2:
                p++;
                return num;
            default:
                unexpectedToken();
            }
        }
        function readArrayContinue<T>(reader:()=>T):T[] {
            skipSpace();
            const chr = text.charCodeAt(p);
            if (chr === 0x5d) { // ]
                p++;
                return [];
            }

            const array:T[] = [];
            array.push(reader());
            for (;;) {
                skipSpace();
                const chr = text.charCodeAt(p);
                switch (chr) {
                case 0x5d: // ]
                    p++;
                    return array;
                case 0x2c: { // ,
                    p++;
                    array.push(reader());
                    break;
                }
                default:
                    unexpectedToken();
                }
            }
        }
        function readKeyContinue():string {
            const chr = text.charCodeAt(p);
            let key:string;
            if (chr === 0x22) { // "
                p++;
                key = readStringContinue('"');
            } else if (chr === 0x27) { // '
                p++;
                key = readStringContinue("'");
            } else if (chr >= 0x80 || (0x41 <= chr && chr <= 0x5a) || (0x61 <= chr && chr < 0x7a) || chr === 0x24 || chr === 0x5f) {
                // variable format
                key = readNameContinue();
            } else {
                unexpectedToken();
            }
            passToken(0x3a); // :
            return key;
        }
        function readValue():NBT {
            skipSpace();
            const chr = text.charCodeAt(p);
            switch (chr) {
            case 0x22: // "
                p++;
                return readStringContinue('"');
            case 0x27: // '
                p++;
                return readStringContinue("'");
            case 0x5b: { // [
                p++;
                skipSpace();
                const firstchr = text.charCodeAt(p);
                switch (firstchr) {
                case 0x5d: // ]
                    p++;
                    return [];
                case 0x42: // B
                    p++;
                    passToken(0x3b);
                    return new Uint8Array(readArrayContinue(()=>+readNumberStringSuffix(0x42, 0x62) & 0xff));
                case 0x49: // I
                    p++;
                    passToken(0x3b);
                    return new Int32Array(readArrayContinue(()=>+readNumberString() | 0));
                case 0x4c: // L, long array, not available, convert to List
                    p++;
                    passToken(0x3b);
                    return readArrayContinue<NBT>(()=>new NBT.Int64(bin.parse(readNumberStringSuffix(0x4c, 0x6c), 10, 4)));
                default:
                    return readArrayContinue(readValue);
                }
                break;
            }
            case 0x7b: { // {
                const obj:NBT.Compound = {};
                p++;
                skipSpace();
                if (text.charCodeAt(p) === 0x7d) {
                    p++;
                    return obj;
                }
                const key = readKeyContinue();
                obj[key] = readValue();

                for (;;) {
                    skipSpace();
                    switch (text.charCodeAt(p)) {
                    case 0x7d: // }
                        p++;
                        return obj;
                    case 0x2c: { // ,
                        p++;
                        skipSpace();
                        const key = readKeyContinue();
                        obj[key] = readValue();
                        break;
                    }
                    default:
                        unexpectedToken();
                    }
                }
                break;
            }
            case 0x74: // t
                p++;
                passChar(0x72); // r
                passChar(0x75); // u
                passChar(0x65); // e
                return new NBT.Byte(1);
            case 0x66: // f
                p++;
                passChar(0x61); // a
                passChar(0x6c); // l
                passChar(0x73); // s
                passChar(0x65); // e
                return new NBT.Byte(0);
            default: {
                const num = readNumberString();
                switch (text.charCodeAt(p)) {
                case 0x42: case 0x62: // B b
                    p++;
                    return new NBT.Byte(+num);
                case 0x53: case 0x73: // S s
                    p++;
                    return new NBT.Short(+num);
                case 0x4c: case 0x6c: // L l
                    p++;
                    return new NBT.Int64(bin.parse(num, 10, 4));
                case 0x46: case 0x66: // F f
                    p++;
                    return new NBT.Float(+num);
                case 0x44: case 0x64: // D d
                    p++;
                    return new NBT.Double(+num);
                default:
                    if (lastNumberIsDecimal) return new NBT.Double(+num);
                    return new NBT.Int(+num);
                }
            }
            }
        }

        const value = readValue();
        skipSpace();
        if (text.length !== p) {
            unexpectedToken();
        }
        return value;
    }

    /** Converts a Named Binary Tag (NBT) tag to a Stringified Named Binary Tag (SNBT) string. */
    export function stringify(tag: Tag|NBT, indent?: number):string {
        if (tag instanceof Tag) {
            return tag.stringify(indent);
        } else {
            const writer = indent != null ? new IndentedNBTWriter(indent) : new NBTWriter;
            writer.any(tag);
            return writer.data;
        }
    }
}

const nonSpaceExp = /[^ \n\r\t]/g;
const nonVariableCharacter = /[^a-zA-Z0-9_$\u0080-\uffff]/g;
const validVariableCharacter = /^[a-zA-Z$_$\u0080-\uffff][a-zA-Z0-9_$\u0080-\uffff]*$/;

function getBackslashCount(data:string, i:number):number {
    let backslashCount = -1;
    do {
        i--;
        backslashCount++;
    } while (data.charCodeAt(i) === 0x5c); // \\
    return backslashCount;
}

class NBTWriter {
    public data = '';

    byteArray(array:Uint8Array):void {
        if (array.length !== 0) {
            this.data += '[B;';
            this.data += array.join('b,');
            this.data += 'b]';
        } else {
            this.data += '[B;]';
        }
    }

    intArray(array:Int32Array):void {
        if (array.length !== 0) {
            this.data += '[I;';
            this.data += array.join(',');
            this.data += ']';
        } else {
            this.data += '[I;]';
        }
    }

    list(array:Iterable<NBT|Tag>):void {
        this.data += '[';
        let first = true;
        for (const e of array) {
            if (first) first = false;
            else this.data += ',';
            this.any(e);
        }
        this.data += ']';
    }

    compound(map:Iterable<[string, NBT|Tag|CompoundTagVariant]>):void {
        this.data += '{';
        let first = true;
        for (const [k, _v] of map) {
            if (first) first = false;
            else this.data += ',';
            if (validVariableCharacter.test(k)) {
                this.data += k;
                this.data += ':';
            } else {
                this.data += '"';
                this.data += addSlashes(k);
                this.data += '":';
            }
            this.any(_v);
        }
        this.data += '}';
    }

    any(nbt:NBT|Tag|CompoundTagVariant):void {
        switch (typeof nbt) {
        case 'number':
            this.data += nbt;
            break;
        case 'string':
            this.data += '"';
            this.data += addSlashes(nbt);
            this.data += '"';
            break;
        case 'boolean':
            this.data += +nbt;
            this.data += 'b';
            break;
        case 'object': {
            if (nbt === null) {
                break;
            }
            if (nbt instanceof Int32Array) {
                this.intArray(nbt);
            } else if (nbt instanceof Uint8Array) {
                this.byteArray(nbt);
            } else if (nbt instanceof Array) {
                this.list(nbt);
            } else if (nbt instanceof NBT.Primitive) {
                nbt.writeTo(this);
            } else if (nbt instanceof Tag) {
                nbt.writeTo(this);
            } else if (nbt instanceof CompoundTagVariant) {
                nbt.get().writeTo(this);
            } else {
                this.compound(Object.entries(nbt));
            }
            break;
        }
        default: throw TypeError(`invalid type of NBT. ${typeof nbt}`);
        }
    }
}

class IndentedNBTWriter extends NBTWriter {
    public data = '';

    private indentLine:string;
    private readonly indentOne:string;

    constructor(indent:number|string) {
        super();
        if (typeof indent === 'string') {
            this.indentOne = indent;
        } else {
            this.indentOne = ' '.repeat(indent);
        }
        this.indentLine = '\n';
    }

    byteArray(array:Uint8Array):void {
        if (array.length !== 0) {
            this.data += '[B;';
            const indentLine = this.indentLine + this.indentOne;
            this.data += indentLine;
            this.data += array.join('b,'+indentLine);
            this.data += 'b';
            this.data += this.indentLine;
            this.data += ']';
        } else {
            this.data += '[B;]';
        }
    }

    intArray(array:Int32Array):void {
        if (array.length !== 0) {
            this.data += '[I;';
            const indentLine = this.indentLine + this.indentOne;
            this.data += indentLine;
            this.data += array.join(','+indentLine);
            this.data += this.indentLine;
            this.data += ']';
        } else {
            this.data += '[I;]';
        }
    }

    list(array:Iterable<NBT|Tag>):void {
        this.data += '[';
        const parentLine = this.indentLine;
        this.indentLine += this.indentOne;
        let first = true;
        for (const e of array) {
            if (first) first = false;
            else this.data += ',';
            this.data += this.indentLine;
            this.any(e);
        }
        this.indentLine = parentLine;
        if (!first) this.data += parentLine;
        this.data += ']';
    }

    compound(map:Iterable<[string, NBT|Tag]>):void {
        this.data += '{';
        const parentLine = this.indentLine;
        this.indentLine += this.indentOne;
        let first = true;
        for (const [k, _v] of map) {
            if (first) first = false;
            else this.data += ',';
            this.data += this.indentLine;
            if (validVariableCharacter.test(k)) {
                this.data += k;
                this.data += ': ';
            } else {
                this.data += '"';
                this.data += addSlashes(k);
                this.data += '": ';
            }
            this.any(_v);
        }
        this.indentLine = parentLine;
        if (!first) this.data += parentLine;
        this.data += '}';
    }
}
