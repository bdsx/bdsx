import * as util from "util";
import { TypedArrayBuffer, TypedArrayBufferConstructor, abstract } from "./common";
import { NativePointer, VoidPointer } from "./core";
import { dll } from "./dll";
import { makefunc } from "./makefunc";
import { mangle } from "./mangle";
import { msAlloc } from "./msalloc";
import { NativeClass, NativeClassType } from "./nativeclass";
import { NativeType, Type } from "./nativetype";
import { Singleton } from "./singleton";
import { hex } from "./util";

export interface CxxVectorType<T> extends NativeClassType<CxxVector<T>> {
    new (address?: VoidPointer | boolean): CxxVector<T>;
    componentType: Type<T>;
}

const VECTOR_SIZE = 0x18;

function getVectorSymbol(type: Type<any>): string {
    return mangle.templateClass(["std", "vector"], type, mangle.templateClass(["std", "allocator"], type));
}

function getSize(bytes: number, compsize: number): number {
    if (bytes < 0 || bytes % compsize !== 0) {
        throw Error(`invalid vector size (bytes=${hex(bytes)}, compsize=${hex(compsize)})`);
    }
    return (bytes / compsize) | 0;
}

// primitive only
// internal util type for only cxxvector
type WITH_PRIM_ONLY<T> = T extends number ? CxxVector<T> : never;

/**
 * CxxVector-like with a JS array
 * @deprecated this API is for the legacy support.
 */
export class CxxVectorLike<T> {
    private warned = false;
    constructor(private readonly array: (T | null)[]) {}

    [NativeType.ctor](): void {
        this.array.length = 0;
    }
    [NativeType.dtor](): void {
        this.array.length = 0;
    }
    [NativeType.ctor_copy](from: CxxVectorLike<T>): void {
        this.setFromArray(from.array);
    }
    [NativeType.ctor_move](from: CxxVectorLike<T>): void {
        this.setFromArray(from.array);
        from.array.length = 0;
    }

    set(idx: number, component: T | null): void {
        const fromSize = this.array.length;
        const newSize = idx + 1;
        if (newSize > fromSize) {
            for (let i = fromSize; i < newSize; i = (i + 1) | 0) {
                this.array[i] = null;
            }
        }
        this.array[idx] = component;
    }

    get(idx: number): T {
        return (this.array[idx] || null)!;
    }

    back(): T | null {
        const n = this.array.length;
        if (n === 0) {
            return null;
        }
        return this.array[n - 1];
    }

    pop(): boolean {
        if (this.array.length === 0) {
            return false;
        }
        this.array.pop();
        return true;
    }

    push(...component: (T | null)[]): void {
        this.array.push(...component);
    }

    splice(start: number, deleteCount: number, ...items: (T | null)[]): void {
        const n = items.length;
        if (n < deleteCount) {
            let i = start + n;
            const offset = deleteCount - n;
            const newsize = this.size() - offset;
            for (; i < newsize; i = (i + 1) | 0) {
                this.set(i, this.get(i + offset));
            }
            this.resize(newsize);
        } else if (n > deleteCount) {
            const offset = n - deleteCount;
            const size = this.size();
            const newsize = size + offset;
            this.resize(newsize);
            const iend = start + n;
            for (let i = newsize - 1; i >= iend; i--) {
                this.set(i, this.get(i - offset));
            }
        }

        for (let i = 0; i !== n; i = (i + 1) | 0) {
            this.set(i + start, items[i]);
        }
    }

    resize(newSize: number): void {
        const oldSize = this.array.length;
        this.array.length = newSize;
        for (let i = oldSize; i < newSize; i = (i + 1) | 0) {
            this.array[i] = null;
        }
    }

    size(): number {
        return this.array.length;
    }

    sizeBytes(): number {
        if (!this.warned) {
            this.warned = true;
            console.trace("CxxVectorLike.sizeBytes, deprecated usage, it's not actual bytes");
        }
        return this.array.length * 8;
    }

    capacity(): number {
        return this.array.length;
    }

    toArray(): T[] {
        return this.array.slice() as T[];
    }

    setFromArray(array: (T | null)[]): void {
        const t = this.array;
        const n = (t.length = array.length);
        for (let i = 0; i !== n; i = (i + 1) | 0) {
            t[i] = array[i];
        }
    }

    [Symbol.iterator](): IterableIterator<T> {
        return this.array.values() as IterableIterator<T>;
    }
}

/**
 * std::vector<T>
 * C++ standard dynamic array class
 */
export abstract class CxxVector<T> extends NativeClass implements Iterable<T> {
    // 	m_begin = nullptr; // 0x00
    // 	m_end = nullptr; // 0x08
    // 	m_cap = nullptr; // 0x10

    abstract readonly componentType: Type<T>;
    static readonly componentType: Type<any>;

    [NativeType.ctor](): void {
        dll.vcruntime140.memset(this, 0, VECTOR_SIZE);
    }
    [NativeType.dtor](): void {
        const begin = this.getPointer(0);
        const ptr = begin.add();
        const end = this.getPointer(8);
        const capBytes = this.getPointer(16).subptr(begin);
        const compsize = this.componentType[NativeType.size];
        let idx = 0;
        while (!ptr.equalsptr(end)) {
            this._dtor(ptr, idx++);
            ptr.move(compsize);
        }
        msAlloc.deallocate(begin, capBytes);
        this._resizeCache(0);
    }
    [NativeType.ctor_copy](from: CxxVector<T>): void {
        const fromSizeBytes = from.sizeBytes();
        const ptr = msAlloc.allocate(fromSizeBytes);
        const compsize = this.componentType[NativeType.size];
        const size = getSize(fromSizeBytes, compsize);
        const srcptr = from.getPointer(0);
        this.setPointer(ptr, 0);
        for (let i = 0; i < size; i = (i + 1) | 0) {
            this._ctor(ptr, i);
            this._copy(ptr, from._get(srcptr, i), i);
            ptr.move(compsize);
            srcptr.move(compsize);
        }
        this.setPointer(ptr, 8);
        this.setPointer(ptr, 16);
    }
    [NativeType.ctor_move](from: CxxVector<T>): void {
        from._resizeCache(0);
        dll.vcruntime140.memcpy(this, from, VECTOR_SIZE);
        dll.vcruntime140.memset(from, 0, VECTOR_SIZE);
    }

    protected abstract _move_alloc(allocated: NativePointer, oldptr: VoidPointer, movesize: number): void;
    protected abstract _get(ptr: NativePointer, index: number): T;
    protected abstract _ctor(ptr: NativePointer, index: number): void;
    protected abstract _dtor(ptr: NativePointer, index: number): void;
    protected abstract _copy(to: NativePointer, from: T | null, index: number): void;
    protected abstract _ctor_move(to: NativePointer, from: T | null, index: number): void;
    protected abstract _ctor_copy(to: NativePointer, from: T | null, index: number): void;
    protected _resizeCache(n: number): void {
        // empty
    }

    private _reserve(newCapBytes: number, oldCapBytes: number, oldptr: NativePointer, oldSizeBytes: number): void {
        const compsize = this.componentType[NativeType.size];
        const allocated = msAlloc.allocate(newCapBytes);
        this.setPointer(allocated, 0);

        const size = getSize(oldSizeBytes, compsize);
        this._move_alloc(allocated, oldptr, size);
        msAlloc.deallocate(oldptr, oldCapBytes);
        this.setPointer(allocated, 8);
        allocated.move(newCapBytes - oldSizeBytes);
        this.setPointer(allocated, 16);
    }

    /**
     * @remark it initializes the new field. but doesn't destruct the old field.
     */
    private _resize(newSizeBytes: number, oldCapBytes: number, oldptr: NativePointer, oldSizeBytes: number): void {
        const newcapBytes = Math.max(newSizeBytes, oldCapBytes * 2);
        const compsize = this.componentType[NativeType.size];
        const allocated = msAlloc.allocate(newcapBytes);
        this.setPointer(allocated, 0);

        const oldSize = getSize(oldSizeBytes, compsize);
        const newSize = getSize(newSizeBytes, compsize);
        this._move_alloc(allocated, oldptr, Math.min(oldSize, newSize));
        msAlloc.deallocate(oldptr, oldCapBytes);
        for (let i = oldSize; i < newSize; i = (i + 1) | 0) {
            this._ctor(allocated, i);
            allocated.move(compsize);
        }
        this.setPointer(allocated, 8);
        allocated.move(newcapBytes - newSizeBytes);
        this.setPointer(allocated, 16);
    }

    private _resizeWithoutInit(newSizeBytes: number, oldCapBytes: number, oldptr: NativePointer, oldSizeBytes: number): void {
        const newcapBytes = Math.max(newSizeBytes, oldCapBytes * 2);
        const compsize = this.componentType[NativeType.size];
        const allocated = msAlloc.allocate(newcapBytes);
        this.setPointer(allocated, 0);

        const oldSize = getSize(oldSizeBytes, compsize);
        const newSize = getSize(newSizeBytes, compsize);
        this._move_alloc(allocated, oldptr, Math.min(oldSize, newSize));
        msAlloc.deallocate(oldptr, oldCapBytes);
        if (newSizeBytes > oldSizeBytes) allocated.move(newSizeBytes - oldSizeBytes);
        this.setPointer(allocated, 8);
        allocated.move(newcapBytes - newSizeBytes);
        this.setPointer(allocated, 16);
    }

    set(idx: number, component: T | null): void {
        const type = this.componentType;

        const compsize = type[NativeType.size];
        let begptr = this.getPointer(0);
        const oldSizeBytes = this.getPointer(8).subptr(begptr);
        const targetOffset = idx * compsize;
        if (targetOffset < oldSizeBytes) {
            begptr.move(targetOffset);
            this._copy(begptr, component, idx);
            return;
        }

        const oldCapBytes = this.getPointer(16).subptr(begptr);
        const newSizeBytes = targetOffset + compsize;
        if (newSizeBytes > oldCapBytes) {
            this._resize(newSizeBytes, oldCapBytes, begptr, oldSizeBytes);
            begptr = this.getPointer(0);
        }

        begptr.move(newSizeBytes);
        this.setPointer(begptr, 8);
        begptr.move(-compsize, -1);
        this._copy(begptr, component, idx);
    }

    /**
     * @return null if not found, it does not return undefined
     */
    get(idx: number): T {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const compsize = this.componentType[NativeType.size];
        const bytes = endptr.subptr(beginptr);
        const size = getSize(bytes, compsize);
        if (idx < 0 || idx >= size) return null as any;
        beginptr.move(idx * compsize);
        return this._get(beginptr, idx);
    }

    back(): T | null {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        if (beginptr.equalsptr(endptr)) return null;
        const compsize = this.componentType[NativeType.size];
        endptr.move(-compsize, -1);
        const bytes = endptr.subptr(beginptr);
        const idx = getSize(bytes, compsize);
        return this._get(endptr, idx);
    }

    pop(): boolean {
        const begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        if (endptr.equalsptr(begptr)) return false;
        const compsize = this.componentType[NativeType.size];
        endptr.move(-compsize, -1);

        const idx = getSize(endptr.subptr(begptr), compsize);
        this._dtor(endptr, idx);
        this.setPointer(endptr, 8);
        return true;
    }

    /**
     * @return [pointer, index], begin of extended.
     * @remark don't use with n=0
     */
    private _prepare(n: number): { pointer: NativePointer; index: number } {
        let begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const capptr = this.getPointer(16);
        const oldbytes = endptr.subptr(begptr);
        const compsize = this.componentType[NativeType.size];
        const oldsize = getSize(oldbytes, compsize);

        if (n === 1) {
            if (capptr.equalsptr(endptr)) {
                const capBytes = capptr.subptr(begptr);
                const newBytes = oldbytes + compsize;
                this._resizeWithoutInit(newBytes, capBytes, begptr, oldbytes);
                begptr = this.getPointer(0);
                begptr.move(oldbytes);
            } else {
                begptr.move(oldbytes + compsize);
                this.setPointer(begptr, 8);
                begptr.move(-compsize, -1);
            }
            return { pointer: begptr, index: oldsize };
        } else {
            const newbytes = n * compsize + oldbytes;
            const capbytes = capptr.subptr(begptr);
            if (newbytes > capbytes) {
                this._resizeWithoutInit(newbytes, capbytes, begptr, oldbytes);
                begptr = this.getPointer(0);
                begptr.move(oldbytes);
            } else {
                begptr.move(compsize * n);
                this.setPointer(begptr, 8);
                begptr.move(oldbytes - newbytes, -1);
            }
            const idx = getSize(oldbytes, compsize);
            return { pointer: begptr, index: idx };
        }
    }

    push(...component: (T | null)[]): void {
        const n = component.length;
        if (n === 0) return;

        const compsize = this.componentType[NativeType.size];
        const res = this._prepare(n);
        const ptr = res.pointer;
        let idx = res.index;
        for (const c of component) {
            this._ctor_copy(ptr, c, idx++);
            ptr.move(compsize);
        }
    }

    emplace(...component: (T | null)[]): void {
        const n = component.length;
        if (n === 0) return;

        const compsize = this.componentType[NativeType.size];
        const res = this._prepare(n);
        const ptr = res.pointer;
        let idx = res.index;
        for (const c of component) {
            this._ctor_move(ptr, c, idx++);
            ptr.move(compsize);
        }
    }

    join(glue: string): string {
        const iter = this.values();

        const res = iter.next();
        if (res.done) return "";
        let out = String(res.value);
        for (;;) {
            const res = iter.next();
            if (res.done) return out;
            out += glue;
            out += String(res.value);
        }
    }

    /**
     * extends one component and returns it without constructing it.
     * it's does not work with the primitive type
     */
    prepare<T extends NativeClass>(this: CxxVector<T>): T {
        const res = this._prepare(1);
        return this._get(res.pointer, res.index);
    }

    splice(start: number, deleteCount: number, ...items: (T | null)[]): void {
        const n = items.length;
        if (n < deleteCount) {
            let i = start + n;
            const offset = deleteCount - n;
            const newsize = this.size() - offset;
            for (; i < newsize; i = (i + 1) | 0) {
                this.set(i, this.get(i + offset));
            }
            this.resize(newsize);
        } else if (n > deleteCount) {
            const offset = n - deleteCount;
            const size = this.size();
            const newsize = size + offset;
            this.resize(newsize);
            const iend = start + n;
            for (let i = newsize - 1; i >= iend; i--) {
                this.set(i, this.get(i - offset));
            }
        }

        for (let i = 0; i !== n; i = (i + 1) | 0) {
            this.set(i + start, items[i]);
        }
    }

    reserve(newSize: number): void {
        const compsize = this.componentType[NativeType.size];
        const begin = this.getPointer(0);
        const end = this.getPointer(8);
        const oldSizeBytes = end.subptr(begin);
        const oldSize = getSize(oldSizeBytes, compsize);
        if (newSize <= oldSize) return;

        const newCapBytes = newSize * compsize;
        const cap = this.getPointer(16);
        const oldCapBytes = cap.subptr(begin);
        if (newCapBytes <= oldCapBytes) return;
        this._reserve(newCapBytes, oldCapBytes, begin, oldSizeBytes);
    }

    resize(newSize: number): void {
        const compsize = this.componentType[NativeType.size];
        const begin = this.getPointer(0);
        const end = this.getPointer(8);
        const oldSizeBytes = end.subptr(begin);
        const oldSize = getSize(oldSizeBytes, compsize);
        const newSizeBytes = newSize * compsize;
        if (newSize <= oldSize) {
            begin.move(newSizeBytes);
            this.setPointer(begin, 8);

            let i = newSize;
            while (!begin.equalsptr(end)) {
                this._dtor(begin, (i = (i + 1) | 0));
                begin.move(compsize);
            }
            this._resizeCache(newSize);
            return;
        }
        const cap = this.getPointer(16);
        const oldCapBytes = cap.subptr(begin);
        if (newSizeBytes <= oldCapBytes) {
            begin.move(newSizeBytes);
            this.setPointer(begin, 8);

            let i = oldSize;
            while (!end.equalsptr(begin)) {
                this._ctor(end, (i = (i + 1) | 0));
                end.move(compsize);
            }
            return;
        }
        this._resize(newSizeBytes, oldCapBytes, begin, oldSizeBytes);
    }

    empty(): boolean {
        return this.getBin64(0) === this.getBin64(8);
    }

    size(): number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const bytes = endptr.subptr(beginptr);
        const compsize = this.componentType[NativeType.size];
        return getSize(bytes, compsize);
    }

    sizeBytes(): number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        return endptr.subptr(beginptr);
    }

    capacity(): number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(16);
        return getSize(endptr.subptr(beginptr), this.componentType[NativeType.size]);
    }

    toArray(): T[] {
        const n = this.size();
        const out: T[] = new Array(n);
        for (let i = 0; i !== n; i = (i + 1) | 0) {
            out[i] = this.get(i)!;
        }
        return out;
    }

    setFromArray(array: (T | null)[]): void {
        const n = array.length;
        const size = this.size();
        if (n > size) this.resize(n);
        for (let i = 0; i !== n; i = (i + 1) | 0) {
            this.set(i, array[i]);
        }
        if (n < size) this.resize(n);
    }

    /**
     * it works only with primitive types
     */
    toTypedArray<A extends TypedArrayBuffer>(this: WITH_PRIM_ONLY<T>, type: TypedArrayBufferConstructor<A>): A {
        abstract();
    }

    /**
     * it works only with primitive types
     */
    setFromTypedArray(this: WITH_PRIM_ONLY<T>, buffer: TypedArrayBuffer): void {
        abstract();
    }

    *values(): IterableIterator<T> {
        const n = this.size();
        for (let i = 0; i !== n; i = (i + 1) | 0) {
            yield this.get(i)!;
        }
    }
    [Symbol.iterator](): IterableIterator<T> {
        return this.values();
    }

    static make<T>(type: Type<T>): CxxVectorType<T> {
        return Singleton.newInstance<CxxVectorType<T>>(CxxVector, type, (): CxxVectorType<T> => {
            if (type[NativeType.size] === undefined) throw Error("CxxVector needs the component size");

            if (NativeClass.isNativeClassType(type)) {
                class VectorImpl extends CxxVector<NativeClass> {
                    componentType: NativeClassType<NativeClass>;
                    static readonly componentType: NativeClassType<NativeClass> = type as any;
                    private readonly cache: (NativeClass | undefined)[] = [];

                    protected _resizeCache(size: number): void {
                        this.cache.length = size;
                    }

                    protected _move_alloc(allocated: NativePointer, oldptr: VoidPointer, movesize: number): void {
                        const clazz = this.componentType;
                        const compsize = this.componentType[NativeType.size];
                        const oldptrmove = oldptr.add();
                        for (let i = 0; i < movesize; i = (i + 1) | 0) {
                            const new_item: NativeClass = allocated.as(clazz);
                            const old_item = this._get(oldptrmove, i);
                            this.cache[i] = new_item;

                            new_item[NativeType.ctor_move](old_item);
                            old_item[NativeType.dtor]();
                            allocated.move(compsize);
                            oldptrmove.move(compsize);
                        }
                        this.cache.length = 0;
                    }

                    protected _get(ptr: NativePointer, index: number): NativeClass {
                        const item = this.cache[index];
                        if (item != null && ptr.equalsptr(item)) return item;
                        const type = this.componentType;
                        return (this.cache[index] = ptr.as(type));
                    }
                    protected _dtor(ptr: NativePointer, index: number): void {
                        this._get(ptr, index)[NativeType.dtor]();
                    }
                    protected _ctor(ptr: NativePointer, index: number): void {
                        this._get(ptr, index)[NativeType.ctor]();
                    }
                    protected _copy(ptr: NativePointer, from: NativeClass | null, index: number): void {
                        this._get(ptr, index)[NativeType.setter](from!);
                    }
                    protected _ctor_copy(ptr: NativePointer, from: NativeClass | null, index: number): void {
                        this._get(ptr, index)[NativeType.ctor_copy](from!);
                    }
                    protected _ctor_move(ptr: NativePointer, from: NativeClass | null, index: number): void {
                        this._get(ptr, index)[NativeType.ctor_move](from!);
                    }
                }
                VectorImpl.prototype.componentType = type;
                VectorImpl.abstract({}, VECTOR_SIZE, 8);
                Object.defineProperties(VectorImpl, {
                    name: { value: `CxxVector<${type.name}>` },
                    symbol: { value: getVectorSymbol(type) },
                });
                return VectorImpl as any;
            } else {
                class VectorImpl extends CxxVector<T> {
                    componentType: Type<T>;
                    static readonly componentType: Type<T> = type;

                    protected _move_alloc(allocated: NativePointer, oldptr: VoidPointer, movesize: number): void {
                        const compsize = this.componentType[NativeType.size];
                        const oldptrmove = oldptr.add();
                        for (let i = 0; i < movesize; i = (i + 1) | 0) {
                            this.componentType[NativeType.ctor_move](allocated, oldptrmove);
                            this.componentType[NativeType.dtor](oldptrmove);
                            allocated.move(compsize);
                            oldptrmove.move(compsize);
                        }
                    }

                    protected _get(ptr: NativePointer): T {
                        const type = this.componentType;
                        return type[NativeType.getter](ptr);
                    }
                    protected _dtor(ptr: NativePointer): void {
                        const type = this.componentType;
                        type[NativeType.dtor](ptr);
                    }
                    protected _ctor(ptr: NativePointer): void {
                        const type = this.componentType;
                        type[NativeType.ctor](ptr);
                    }
                    protected _copy(ptr: NativePointer, from: T | null): void {
                        const type = this.componentType;
                        type[NativeType.setter](ptr, from);
                    }
                    protected _ctor_copy(ptr: NativePointer, from: T | null): void {
                        const type = this.componentType;
                        type[NativeType.ctor](ptr);
                        type[NativeType.setter](ptr, from);
                    }
                    protected _ctor_move(ptr: NativePointer, from: T | null): void {
                        const type = this.componentType;
                        type[NativeType.ctor](ptr);
                        type[NativeType.setter](ptr, from);
                    }

                    toTypedArray<T extends TypedArrayBuffer>(type: TypedArrayBufferConstructor<T>): T {
                        const beginptr = this.getPointer(0);
                        const endptr = this.getPointer(8);
                        const bytes = endptr.subptr(beginptr);
                        const n = Math.floor(bytes / type.BYTES_PER_ELEMENT);
                        const out = new type(n);
                        if (beginptr !== null) beginptr.copyTo(out, out.byteLength);
                        return out;
                    }

                    setFromTypedArray(buffer: TypedArrayBuffer): void {
                        const compsize = this.componentType[NativeType.size];
                        const bytes = buffer.byteLength;
                        const size = this.size();
                        const n = Math.ceil(bytes / compsize);
                        if (n > size) this.resize(n);
                        const beginptr = this.getPointer(0);
                        beginptr.setBuffer(buffer);
                    }
                }
                Object.defineProperty(VectorImpl, "name", {
                    value: getVectorSymbol(type),
                });
                VectorImpl.prototype.componentType = type;
                VectorImpl.abstract({}, VECTOR_SIZE, 8);
                return VectorImpl;
            }
        });
    }

    [util.inspect.custom](depth: number, options: Record<string, any>): unknown {
        return `CxxVector ${util.inspect(this.toArray(), options)}`;
    }
}

class CxxVectorToArrayImpl<T> extends NativeType<T[]> {
    public readonly type: CxxVectorType<T>;

    constructor(public readonly compType: Type<T>) {
        super(
            getVectorSymbol(compType),
            `CxxVectorToArray<${compType.name}>`,
            VECTOR_SIZE,
            8,
            v => v instanceof Array,
            undefined,
            (ptr, offset) => ptr.addAs(this.type, offset).toArray(),
            (ptr, v, offset) => ptr.addAs(this.type, offset).setFromArray(v),
            (stackptr, offset) => stackptr.getPointerAs(this.type, offset).toArray(),
            undefined,
            ptr => ptr.fill(0, VECTOR_SIZE),
            ptr => {
                const beg = ptr.getPointer(0);
                const cap = ptr.getPointer(16);
                msAlloc.deallocate(beg, cap.subptr(beg));
            },
            (to, from) => to.as(this.type)[NativeType.ctor_copy](from.as(this.type)),
            (to, from) => {
                dll.vcruntime140.memcpy(to, from, VECTOR_SIZE);
                dll.vcruntime140.memset(from, 0, VECTOR_SIZE);
            },
        );
        this.type = CxxVector.make(this.compType);
        this[makefunc.paramHasSpace] = true;
    }
}
export namespace CxxVectorToArray {
    export const name = "CxxVectorToArray";
    export function make<T>(compType: Type<T>): NativeType<T[]> {
        return Singleton.newInstance<NativeType<T[]>>(CxxVectorToArrayImpl, compType, () => new CxxVectorToArrayImpl<T>(compType));
    }
}

export type CxxVectorToArray<T> = T[];
