import { nativeClass, NativeClass } from "bdsx/nativeclass";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { int32_t } from "../nativetype";


@nativeClass(null)
export class Tag extends NativeClass {}

export namespace Tag {
    export enum Type {
        CompoundTag = 10
    }
}

@nativeClass(0x10)
export class CompoundTag extends Tag {
    putInt(name: string, val:number) {
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
    // not done
    // ?clone@CompoundTag@@QEBA?AV?$unique_ptr@VCompoundTag@@U?$default_delete@VCompoundTag@@@std@@@std@@XZ
    clone(): CompoundTag {
        abstract();
    }
    // ?contains@CompoundTag@@QEBA_NV?$basic_string_span@$$CBD$0?0@gsl@@W4Type@Tag@@@Z
    // ?contains@CompoundTag@@QEBA_NV?$basic_string_span@$$CBD$0?0@gsl@@@Z
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
    // ?copy@CompoundTag@@UEBA?AV?$unique_ptr@VTag@@U?$default_delete@VTag@@@std@@@std@@XZ
    copy(): CompoundTag {
        abstract();
    }
    // ?deepCopy@CompoundTag@@QEAAXAEBV1@@Z
    deepCopy(other: CompoundTag) {
        abstract();
    }
    // ?equals@CompoundTag@@UEBA_NAEBVTag@@@Z
    equals(other: Tag): boolean {
        abstract();
    }
    // ?getBoolean@CompoundTag@@QEBA_NV?$basic_string_span@$$CBD$0?0@gsl@@@Z
    getBooleanValue(name: string): boolean {
        abstract();
    }
    // ?getByteArray@CompoundTag@@QEBAAEBUTagMemoryChunk@@V?$basic_string_span@$$CBD$0?0@gsl@@@Z
    getByteArray(name: string): VoidPointer {
        abstract();
    }
    // ?getCompound@CompoundTag@@QEAAPEAV1@V?$basic_string_span@$$CBD$0?0@gsl@@@Z
    getCompound(name: string): CompoundTag {
        abstract();
    }
    // ?getFloat@CompoundTag@@QEBAMV?$basic_string_span@$$CBD$0?0@gsl@@@Z
    getFloat(name: string): number {
        abstract();
    }
    // ?getInt64@CompoundTag@@QEBA_JV?$basic_string_span@$$CBD$0?0@gsl@@@Z
    getInt64(name: string): number {
        abstract();
    }
    // ?getList@CompoundTag@@QEAAPEAVListTag@@V?$basic_string_span@$$CBD$0?0@gsl@@@Z
    getList(name: string): ListTag {
        abstract();
    }
    // ?isEmpty@CompoundTag@@QEBA_NXZ
    isEmpty(): boolean {
        abstract();
    }
    // ?put@CompoundTag@@QEAAAEAVTag@@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@$$QEAV2@@Z
    put(name: string, value: Tag) {
        abstract();
    }
    //?putBoolean@CompoundTag@@QEAAXV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@_N@Z
    putBoolean(name: string, value: boolean) {
        abstract();
    }
    putByte(name: string, value: number) {
        abstract();
    }
    putByteArray(name: string, value: VoidPointer) {
        abstract();
    }
    putCompound(name: string, value: CompoundTag) {
        abstract();
    }
    putFloat(name: string, value: number) {
        abstract();
    }
    putInt64(name: string, value: number) {
        abstract();
    }
    putShort(name: string, value: number) {
        abstract();
    }
    putString(name: string, value: string) {
        abstract();
    }
    remove(name: string) {
        abstract();
    }
}

@nativeClass(null)
export class ListTag extends Tag {
    getCompound(index: int32_t): CompoundTag | null {
        abstract();
    }
    size(): number {
        abstract();
    }
}

