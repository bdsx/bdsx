import { procHacker } from "./bds/proc";
import { abstract } from "./common";
import { NativePointer, VoidPointer } from "./core";
import { dll } from "./dll";
import { NativeClass, NativeClassType } from "./nativeclass";
import { int64_as_float_t, NativeType, Type } from "./nativetype";
import { Singleton } from "./singleton";
import { templateName } from "./templatename";

export interface CxxVectorType<T> extends NativeClassType<CxxVector<T>>
{
    new(address?:VoidPointer|boolean):CxxVector<T>;
    componentType:Type<any>;
}


const VECTOR_SIZE = 0x18;


/**
 * std::vector<T>
 * C++ standard dynamic array class
 */
export abstract class CxxVector<T> extends NativeClass implements Iterable<T> {
    // 	m_begin = nullptr; // 0x00
    // 	m_end = nullptr; // 0x08
    // 	m_cap = nullptr; // 0x10

    abstract componentType:Type<T>;
    static readonly componentType:Type<any>;

    [NativeType.ctor]():void {
        dll.vcruntime140.memset(this, 0, VECTOR_SIZE);
    }
    [NativeType.dtor]():void {
        const ptr = this.getPointer(0);
        dll.ucrtbase.free(ptr);
    }
    [NativeType.ctor_copy](from:CxxVector<T>):void {
        const sizeBytes = from.sizeBytes();
        const ptr = dll.ucrtbase.malloc(sizeBytes);
        const compsize = this.componentType[NativeType.size];
        const size = sizeBytes / compsize | 0;
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

    protected abstract _move_alloc(allocated:NativePointer, oldptr:VoidPointer, movesize:number):void;
    protected abstract _get(ptr:NativePointer, index:number):T;
    protected abstract _ctor(ptr:NativePointer, index:number):void;
    protected abstract _dtor(ptr:NativePointer, index:number):void;
    protected abstract _copy(to:NativePointer, from:T, index:number):void;

    private _resize(newsizeBytes:number, newcapBytes:number, oldptr:NativePointer, oldsizeBytes:number):void {
        const compsize = this.componentType[NativeType.size];
        const allocated = CxxVector._alloc16(newcapBytes);
        this.setPointer(allocated, 0);

        const oldsize = oldsizeBytes / compsize | 0;
        const newsize = newsizeBytes / compsize | 0;
        this._move_alloc(allocated, oldptr, Math.min(oldsize, newsize));
        dll.ucrtbase.free(oldptr);
        for (let i=oldsize;i<newsize;i++) {
            this._ctor(allocated, i);
            allocated.move(compsize);
        }
        this.setPointer(allocated, 8);
        allocated.move(newcapBytes - newsizeBytes);
        this.setPointer(allocated, 16);
    }

    set(idx:number, component:T):void {
        const type = this.componentType;

        const compsize = type[NativeType.size];
        let begptr = this.getPointer(0);
        const oldsizeBytes = this.getPointer(8).subptr(begptr);
        if (idx * compsize < oldsizeBytes) {
            begptr.move(idx * compsize);
            this._copy(begptr, component, idx);
            return;
        }

        const capBytes = this.getPointer(16).subptr(begptr);
        let newBytes = idx * compsize;
        if (newBytes >= capBytes) {
            newBytes += compsize;
            this._resize(newBytes, Math.max(capBytes*2, newBytes), begptr, oldsizeBytes);
            begptr = this.getPointer(0);
        }

        begptr.move(idx*compsize);
        this._copy(begptr, component, idx);
    }

    get(idx:number):T|null {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const compsize = this.componentType[NativeType.size];
        const size = endptr.subptr(beginptr) / compsize | 0;
        if (idx < 0 || idx >= size) return null;
        beginptr.move(idx * compsize);
        return this._get(beginptr, idx);
    }

    pop():boolean {
        const begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        if (endptr.equals(begptr)) return false;
        const compsize = this.componentType[NativeType.size];
        endptr.move(-compsize, -1);

        const idx = endptr.subptr(begptr) / compsize | 0;
        this._dtor(endptr, idx);
        this.setPointer(endptr, 8);
        return true;
    }

    push(component:T):void {
        let begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const compsize = this.componentType[NativeType.size];
        const idx = endptr.subptr(begptr) / compsize | 0;
        const capptr = this.getPointer(16);
        if (capptr.equals(endptr)) {
            const oldsizeBytes = endptr.subptr(begptr);
            const capBytes = capptr.subptr(begptr);
            const newsizeBytes = oldsizeBytes+compsize;
            this._resize(newsizeBytes, Math.max(capBytes*2, newsizeBytes), begptr, oldsizeBytes);
            begptr = this.getPointer(0);
        }
        begptr.move(idx*compsize);
        this._copy(begptr, component, idx);
    }

    resize(size:number):void {
        const compsize = this.componentType[NativeType.size];
        const begin = this.getPointer(0);
        const end = this.getPointer(8);
        const oldsizeBytes = end.subptr(begin);
        const osize = (oldsizeBytes / compsize)|0;
        if (size <= osize) {
            begin.move(size*compsize);
            this.setPointer(begin, 8);

            let i = size;
            while (!begin.equals(end)) {
                this._dtor(begin, i++);
                begin.move(compsize);
            }
            return;
        }
        const cap = this.getPointer(16);
        const capBytes = cap.subptr(begin);
        const newBytes = size*compsize;
        if (newBytes <= capBytes) {
            begin.move(newBytes);
            this.setPointer(begin, 8);

            let i = osize;
            while (!end.equals(begin)) {
                this._ctor(end, i++);
                end.move(compsize);
            }
            return;
        }
        this._resize(newBytes, Math.max(capBytes*2, newBytes), begin, oldsizeBytes);
    }

    size():number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        return endptr.subptr(beginptr) / this.componentType[NativeType.size] | 0;
    }

    sizeBytes():number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        return endptr.subptr(beginptr);
    }

    capacity():number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(16);
        return endptr.subptr(beginptr) / this.componentType[NativeType.size] | 0;
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
        this.resize(n);
        for (let i=0;i<n;i++) {
            this.set(i, array[i]);
        }
    }

    *[Symbol.iterator]():IterableIterator<T> {
        const n = this.size();
        for (let i=0;i<n;i++) {
            yield this.get(i)!;
        }
    }

    /**
     * @deprecated use .destruct()
     */
    dispose():void {
        this[NativeType.dtor]();
    }

    static make<T>(type:Type<T>):CxxVectorType<T> {
        return Singleton.newInstance<CxxVectorType<T>>(CxxVector, type, ()=>{
            if (type[NativeType.size] === undefined) throw Error("CxxVector needs the component size");

            if (NativeClass.isNativeClassType(type)) {
                class VectorImpl extends CxxVector<NativeClass> {
                    componentType:NativeClassType<NativeClass>;
                    static readonly componentType:NativeClassType<NativeClass> = type as any;
                    private readonly cache:(NativeClass|undefined)[] = [];

                    protected _move_alloc(allocated:NativePointer, oldptr:VoidPointer, movesize:number):void {
                        const clazz = this.componentType;
                        const compsize = this.componentType[NativeType.size];
                        const oldptrmove = oldptr.add();
                        for (let i=0;i<movesize;i++) {
                            const new_item:NativeClass = allocated.as(clazz);
                            const old_item = this._get(allocated, i);
                            this.cache![i] = new_item;
                            new_item[NativeType.ctor_move](old_item);
                            old_item[NativeType.dtor]();

                            this.componentType[NativeType.ctor_move](allocated, oldptrmove);
                            allocated.move(compsize);
                            oldptrmove.move(compsize);
                        }
                    }

                    protected _get(ptr:NativePointer, index:number):NativeClass{
                        const item = this.cache[index];
                        if (item !== undefined) return item;
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
                VectorImpl.prototype.componentType = type as any;
                VectorImpl.abstract({}, VECTOR_SIZE, 8);
                return VectorImpl as any;
            } else {
                class VectorImpl extends CxxVector<T> {
                    componentType:Type<T>;
                    static readonly componentType:Type<T> = type as any;

                    protected _move_alloc(allocated:NativePointer, oldptr:VoidPointer, movesize:number):void {
                        const compsize = this.componentType[NativeType.size];
                        const oldptrmove = oldptr.add();
                        for (let i=0;i<movesize;i++) {
                            this.componentType[NativeType.ctor_move](allocated, oldptrmove);
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
                Object.defineProperty(VectorImpl, 'name', {value:templateName('std::vector', type.name, templateName('std::allocator', type.name))});
                VectorImpl.prototype.componentType = type as any;
                VectorImpl.abstract({}, VECTOR_SIZE, 8);
                return VectorImpl as any;
            }
        });
    }

    static _alloc16(size:number):NativePointer {
        abstract();
    }
}

CxxVector._alloc16 = procHacker.js("std::_Allocate<16,std::_Default_allocate_traits,0>", NativePointer, null, int64_as_float_t);
