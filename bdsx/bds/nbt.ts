import { nativeClass, NativeClass } from "bdsx/nativeclass";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { int32_t } from "../nativetype";


@nativeClass(null)
export class Tag extends NativeClass {}

export namespace Tag {
    export enum Type {
        EndTag,
        ByteTag,
        ShortTag,
        IntTag,
        Int64Tag,
        FloatTag,
        DoubleTag,
        ByteArrayTag,
        StringTag,
        ListTag,
        CompoundTag,
        IntArrayTag
    }
}

@nativeClass(0x10)
export class CompoundTag extends Tag {
    putInt(name: string, val:number): number {
        abstract();
    }
    getInt(name: string): number {
        abstract();
    }
    get(name: string): Tag | null {
        abstract();
    }
    getStringValue(name: string): string {
        abstract();
    }
    getShort(name: string): number {
        abstract();
    }
    getByte(name: string): number {
        abstract();
    }
    static create(): CompoundTag {
        const tag = new CompoundTag(true);
        tag.construct();
        return tag;
    }
    clone(): CompoundTag {
        abstract();
    }
    contains(name: string, type?: Tag.Type): boolean {
        if(!type) return this._containsAll(name);
        return this._containsType(name, type);
    }
    _containsAll(name: string): boolean {
        abstract();
    }
    _containsType(name: string, type: Tag.Type): boolean {
        abstract();
    }
    copy(): CompoundTag {
        abstract();
    }
    deepCopy(other: CompoundTag): void {
        abstract();
    }
    equals(other: Tag): boolean {
        abstract();
    }
    getBooleanValue(name: string): boolean {
        abstract();
    }
    getByteArray(name: string): VoidPointer {
        abstract();
    }
    getCompound(name: string): CompoundTag {
        abstract();
    }
    getFloat(name: string): number {
        abstract();
    }
    getInt64(name: string): number {
        abstract();
    }
    getList(name: string): ListTag {
        abstract();
    }
    isEmpty(): boolean {
        abstract();
    }
    put(name: string, value: Tag): Tag {
        abstract();
    }
    putBoolean(name: string, value: boolean): void {
        abstract();
    }
    putByte(name: string, value: number): number {
        abstract();
    }
    putByteArray(name: string, value: VoidPointer): VoidPointer {
        abstract();
    }
    putCompound(name: string, value: CompoundTag): CompoundTag {
        abstract();
    }
    putFloat(name: string, value: number): number {
        abstract();
    }
    putInt64(name: string, value: number): number {
        abstract();
    }
    putShort(name: string, value: number): number {
        abstract();
    }
    putString(name: string, value: string): string {
        abstract();
    }
    remove(name: string): boolean {
        abstract();
    }
}

@nativeClass(0x10)
export class ListTag extends Tag {
    size(): number {
        abstract();
    }
    append(tag: Tag): void {
        abstract();
    }
    copy(): Tag {
        abstract();
    }
    copyList(): ListTag {
        abstract();
    }
    deleteChildren(): void {
        abstract();
    }
    equals(other: Tag): boolean {
        abstract();
    }
    get(index: number): Tag {
        abstract();
    }
    getCompound(index: number): CompoundTag {
        abstract();
    }
    getDouble(index: number): number {
        abstract();
    }
    getFloat(index: number): number {
        abstract();
    }
    getInt(index: number): number {
        abstract();
    }
    getStringValue(index: number): string {
        abstract();
    }
}

