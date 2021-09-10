import { NativePointer, VoidPointer } from "./core";
import { dll } from "./dll";
import { makefunc } from "./makefunc";
import { msAlloc } from "./msalloc";
import { NativeClass, NativeClassType } from "./nativeclass";
import { NativeType, Type } from "./nativetype";
import { Singleton } from "./singleton";
import { templateName } from "./templatename";
import util = require('util');

export interface CxxVectorType<T> extends NativeClassType<CxxVector<T>>
{
    new(address?:VoidPointer|boolean):CxxVector<T>;
    componentType:Type<any>;
}

const VECTOR_SIZE = 0x18;


function getSize(bytes:number, compsize:number):number {
    if (bytes % compsize !== 0) {
        throw Error(`invalid vector size (bytes=0x${bytes.toString(16)}, compsize=0x${compsize.toString(16)})`);
    }
    return bytes / compsize | 0;
}

/**
 * std::vector<T>
 * C++ standard dynamic array class
 */
export abstract class CxxVector<T> extends NativeClass implements Iterable<T> {
    // 	m_begin = nullptr; // 0x00
    // 	m_end = nullptr; // 0x08
    // 	m_cap = nullptr; // 0x10

    abstract readonly componentType:Type<T>;
    static readonly componentType:Type<any>;

    [NativeType.ctor]():void {
        dll.vcruntime140.memset(this, 0, VECTOR_SIZE);
    }
    [NativeType.dtor]():void {
        const begin = this.getPointer(0);
        const ptr = begin.add();
        const end = this.getPointer(8);
        const capBytes = this.getPointer(16).subptr(begin);
        const compsize = this.componentType[NativeType.size];
        let idx = 0;
        while (!ptr.equals(end)) {
            this._dtor(ptr, idx++);
            ptr.move(compsize);
        }
        msAlloc.deallocate(begin, capBytes);
        this._resizeCache(0);
    }
    [NativeType.ctor_copy](from:CxxVector<T>):void {
        const fromSizeBytes = from.sizeBytes();
        const ptr = msAlloc.allocate(fromSizeBytes);
        const compsize = this.componentType[NativeType.size];
        const size = getSize(fromSizeBytes, compsize);
        const srcptr = from.getPointer(0);
        this.setPointer(ptr, 0);
        for (let i=0;i<size;i++) {
            this._ctor(ptr, i);
            this._copy(ptr, from._get(srcptr, i), i);
            ptr.move(compsize);
            srcptr.move(compsize);
        }
        this.setPointer(ptr, 8);
        this.setPointer(ptr, 16);
    }
    [NativeType.ctor_move](from:CxxVector<T>):void {
        from._resizeCache(0);
        dll.vcruntime140.memcpy(this, from, VECTOR_SIZE);
        dll.vcruntime140.memset(from, 0, VECTOR_SIZE);
    }

    protected abstract _move_alloc(allocated:NativePointer, oldptr:VoidPointer, movesize:number):void;
    protected abstract _get(ptr:NativePointer, index:number):T;
    protected abstract _ctor(ptr:NativePointer, index:number):void;
    protected abstract _dtor(ptr:NativePointer, index:number):void;
    protected abstract _copy(to:NativePointer, from:T, index:number):void;
    protected _resizeCache(n:number):void {
        // empty
    }

    private _resize(newSizeBytes:number, oldCapBytes:number, oldptr:NativePointer, oldSizeBytes:number):void {
        const newcapBytes = Math.max(newSizeBytes, oldCapBytes*2);
        const compsize = this.componentType[NativeType.size];
        const allocated = msAlloc.allocate(newcapBytes);
        this.setPointer(allocated, 0);

        const oldSize = getSize(oldSizeBytes, compsize);
        const newSize = getSize(newSizeBytes, compsize);
        this._move_alloc(allocated, oldptr, Math.min(oldSize, newSize));
        msAlloc.deallocate(oldptr, oldCapBytes);
        for (let i=oldSize;i<newSize;i++) {
            this._ctor(allocated, i);
            allocated.move(compsize);
        }
        this.setPointer(allocated, 8);
        allocated.move(newcapBytes - newSizeBytes);
        this.setPointer(allocated, 16);
    }

    set(idx:number, component:T):void {
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

    get(idx:number):T {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const compsize = this.componentType[NativeType.size];
        const bytes = endptr.subptr(beginptr);
        const size = getSize(bytes, compsize);
        if (idx < 0 || idx >= size) return null as any;
        beginptr.move(idx * compsize);
        return this._get(beginptr, idx);
    }

    back():T|null {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        if (beginptr.equals(endptr)) return null;
        const compsize = this.componentType[NativeType.size];
        endptr.move(-compsize, -1);
        const bytes = endptr.subptr(beginptr);
        const idx = getSize(bytes, compsize);
        return this._get(endptr, idx);
    }

    pop():boolean {
        const begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        if (endptr.equals(begptr)) return false;
        const compsize = this.componentType[NativeType.size];
        endptr.move(-compsize, -1);

        const idx = getSize(endptr.subptr(begptr), compsize);
        this._dtor(endptr, idx);
        this.setPointer(endptr, 8);
        return true;
    }

    push(...component:T[]):void {
        const n = component.length;
        if (n === 0) return;

        let begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const capptr = this.getPointer(16);
        const oldbytes = endptr.subptr(begptr);
        const compsize = this.componentType[NativeType.size];
        const oldsize = getSize(oldbytes, compsize);

        if (n === 1) {
            if (capptr.equals(endptr)) {
                const capBytes = capptr.subptr(begptr);
                const newBytes = oldbytes+compsize;
                this._resize(newBytes, capBytes, begptr, oldbytes);
                begptr = this.getPointer(0);
                begptr.move(oldbytes);
            } else {
                begptr.move(oldbytes+compsize);
                this.setPointer(begptr, 8);
                begptr.move(-compsize, -1);
                this._ctor(begptr, oldsize);
            }
            this._copy(begptr, component[0], oldsize);
        } else {
            const newbytes = n*compsize + oldbytes;
            const capbytes = capptr.subptr(begptr);
            if (newbytes > capbytes) {
                this._resize(newbytes, capbytes, begptr, oldbytes);
                begptr = this.getPointer(0);
                begptr.move(oldbytes);
            } else {
                const to = oldsize + n;
                for (let i=oldsize;i<to;i++) {
                    this._ctor(begptr, i);
                    begptr.move(compsize);
                }
                this.setPointer(begptr, 8);
                begptr.move(oldbytes-newbytes, -1);
            }
            let idx = getSize(oldbytes, compsize);
            for (const c of component) {
                this._copy(begptr, c, idx++);
                begptr.move(compsize);
            }
        }
    }

    splice(start:number, deleteCount:number, ...items:T[]):void {
        const n = items.length;
        if (n < deleteCount) {
            let i = start+n;
            const offset = deleteCount-n;
            const newsize = this.size() - offset;
            for (;i<newsize;i++) {
                this.set(i, this.get(i+offset));
            }
            this.resize(newsize);
        } else if (n > deleteCount) {
            const offset = n-deleteCount;
            const size = this.size();
            const newsize = size+offset;
            this.resize(newsize);
            const iend = start + n;
            for (let i=newsize-1;i>=iend;i--) {
                this.set(i, this.get(i-offset));
            }
        }

        for (let i=0;i<n;i++) {
            this.set(i+start, items[i]);
        }
    }

    resize(newSize:number):void {
        const compsize = this.componentType[NativeType.size];
        const begin = this.getPointer(0);
        const end = this.getPointer(8);
        const oldSizeBytes = end.subptr(begin);
        const oldSize = getSize(oldSizeBytes, compsize);
        const newSizeBytes = newSize*compsize;
        if (newSize <= oldSize) {
            begin.move(newSizeBytes);
            this.setPointer(begin, 8);

            let i = newSize;
            while (!begin.equals(end)) {
                this._dtor(begin, i++);
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
            while (!end.equals(begin)) {
                this._ctor(end, i++);
                end.move(compsize);
            }
            return;
        }
        this._resize(newSizeBytes, oldCapBytes, begin, oldSizeBytes);
    }

    size():number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const bytes = endptr.subptr(beginptr);
        const compsize = this.componentType[NativeType.size];
        return getSize(bytes, compsize);
    }

    sizeBytes():number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        return endptr.subptr(beginptr);
    }

    capacity():number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(16);
        return getSize(endptr.subptr(beginptr), this.componentType[NativeType.size]);
    }

    toArray():T[] {
        const n = this.size();
        const out:T[] = new Array(n);
        for (let i=0;i<n;i++) {
            out[i] = this.get(i)!;
        }
        return out;
    }

    setFromArray(array:T[]):void {
        const n = array.length;
        const size = this.size();
        if (n > size) this.resize(n);
        for (let i=0;i<n;i++) {
            this.set(i, array[i]);
        }
        if (n < size) this.resize(n);
    }

    *[Symbol.iterator]():IterableIterator<T> {
        const n = this.size();
        for (let i=0;i<n;i++) {
            yield this.get(i)!;
        }
    }

    static make<T>(type:{prototype:T}):CxxVectorType<T> {
        const t = type as Type<T>;
        return Singleton.newInstance<CxxVectorType<T>>(CxxVector, t, ():CxxVectorType<T>=>{
            if (t[NativeType.size] == null) throw Error("CxxVector needs the component size");

            if (NativeClass.isNativeClassType(t)) {
                class VectorImpl extends CxxVector<NativeClass> {
                    componentType:NativeClassType<NativeClass>;
                    static readonly componentType:NativeClassType<NativeClass> = t as any;
                    private readonly cache:(NativeClass|undefined)[] = [];

                    protected _resizeCache(size:number):void {
                        this.cache.length = size;
                    }

                    protected _move_alloc(allocated:NativePointer, oldptr:VoidPointer, movesize:number):void {
                        const clazz = this.componentType;
                        const compsize = this.componentType[NativeType.size];
                        const oldptrmove = oldptr.add();
                        for (let i=0;i<movesize;i++) {
                            const new_item:NativeClass = allocated.as(clazz);
                            const old_item = this._get(oldptrmove, i);
                            this.cache[i] = new_item;

                            new_item[NativeType.ctor_move](old_item);
                            old_item[NativeType.dtor]();
                            allocated.move(compsize);
                            oldptrmove.move(compsize);
                        }
                        this.cache.length = 0;
                    }

                    protected _get(ptr:NativePointer, index:number):NativeClass{
                        const item = this.cache[index];
                        if (item != null) return item;
                        const type = this.componentType;
                        return this.cache[index] = ptr.as(type);
                    }
                    protected _dtor(ptr:NativePointer, index:number):void{
                        this._get(ptr, index)[NativeType.dtor]();
                    }
                    protected _ctor(ptr:NativePointer, index:number):void{
                        this._get(ptr, index)[NativeType.ctor]();
                    }
                    protected _copy(ptr:NativePointer, from:NativeClass, index:number):void{
                        this._get(ptr, index)[NativeType.setter](from);
                    }
                }
                Object.defineProperty(VectorImpl, 'name', {value:getVectorName(t)});
                VectorImpl.prototype.componentType = t;
                VectorImpl.abstract({}, VECTOR_SIZE, 8);
                return VectorImpl as any;
            } else {
                class VectorImpl extends CxxVector<T> {
                    componentType:Type<T>;
                    static readonly componentType:Type<T> = t;

                    protected _move_alloc(allocated:NativePointer, oldptr:VoidPointer, movesize:number):void {
                        const compsize = this.componentType[NativeType.size];
                        const oldptrmove = oldptr.add();
                        for (let i=0;i<movesize;i++) {
                            this.componentType[NativeType.ctor_move](allocated, oldptrmove);
                            this.componentType[NativeType.dtor](oldptrmove);
                            allocated.move(compsize);
                            oldptrmove.move(compsize);
                        }
                    }

                    protected _get(ptr:NativePointer):T{
                        const type = this.componentType;
                        return type[NativeType.getter](ptr);
                    }
                    protected _dtor(ptr:NativePointer):void{
                        const type = this.componentType;
                        type[NativeType.dtor](ptr);
                    }
                    protected _ctor(ptr:NativePointer):void{
                        const type = this.componentType;
                        type[NativeType.ctor](ptr);
                    }
                    protected _copy(ptr:NativePointer, from:T):void{
                        const type = this.componentType;
                        type[NativeType.setter](ptr, from);
                    }
                }
                Object.defineProperty(VectorImpl, 'name', {value:getVectorName(t)});
                VectorImpl.prototype.componentType = t;
                VectorImpl.abstract({}, VECTOR_SIZE, 8);
                return VectorImpl;
            }
        });
    }

    [util.inspect.custom](depth:number, options:Record<string, any>):unknown {
        return `CxxVector ${util.inspect(this.toArray(), options)}`;
    }
}

function getVectorName(type:Type<any>):string {
    return templateName('std::vector', type.name, templateName('std::allocator', type.name));
}

class CxxVectorToArrayImpl<T> extends NativeType<T[]> {
    public readonly type:CxxVectorType<T>;

    constructor(public readonly compType:Type<T>) {
        super(getVectorName(compType), VECTOR_SIZE, 8,
            v=>v instanceof Array,
            undefined,
            (ptr, offset)=>ptr.addAs(this.type, offset, offset! >> 31).toArray(),
            (ptr, v, offset)=>ptr.addAs(this.type, offset, offset! >> 31).setFromArray(v),
            stackptr=>stackptr.getPointerAs(this.type).toArray(),
            (stackptr, param, offset)=>{
                const buf = new this.type(true);
                buf.construct();
                buf.setFromArray(param);
                makefunc.temporalDtors.push(()=>buf.destruct());
                stackptr.setPointer(buf, offset);
            },
            ptr=>dll.vcruntime140.memset(ptr, 0, VECTOR_SIZE),
            ptr=>{
                const beg = ptr.getPointer(0);
                const cap = ptr.getPointer(16);
                msAlloc.deallocate(beg, cap.subptr(beg));
            },
            (to, from)=>to.as(this.type)[NativeType.ctor_copy](from.as(this.type)),
            (to, from)=>{
                dll.vcruntime140.memcpy(to, from, VECTOR_SIZE);
                dll.vcruntime140.memset(from, 0, VECTOR_SIZE);
            }
        );
        this.type = CxxVector.make(this.compType);
    }
}

export namespace CxxVectorToArray {
    export function make<T>(compType:Type<T>):NativeType<T[]> {
        return Singleton.newInstance<NativeType<T[]>>(CxxVectorToArrayImpl, compType, ()=>new CxxVectorToArrayImpl<T>(compType));
    }
}

export type CxxVectorToArray<T> = T[];
