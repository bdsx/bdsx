import { procHacker } from "./bds/proc";
import { abstract } from "./common";
import { NativePointer, VoidPointer } from "./core";
import { dll } from "./dll";
import { RawTypeId } from "./makefunc";
import { NativeClass, NativeClassType } from "./nativeclass";
import { NativeType, Type } from "./nativetype";
import { Singleton } from "./singleton";

export interface CxxVectorType<T> extends Type<CxxVector<T>>
{
    new(address?:VoidPointer|boolean):CxxVector<T>;
    componentType:Type<any>;
}


const VECTOR_SIZE = 12;


const singleton = new Singleton<CxxVectorType<any>>();


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

    constructor(address?:VoidPointer|boolean) {
        super(address);
    }

    [NativeType.ctor]():void {
        dll.vcruntime140.memset(this, 0, VECTOR_SIZE);
    }
    [NativeType.dtor]():void {
        const ptr = this.getPointer(0);
        dll.ucrtbase.free(ptr);
    }

    protected abstract _move_alloc(allocated:NativePointer, oldptr:VoidPointer, movesize:number):void;
    protected abstract _get(ptr:NativePointer, index:number):T;
    protected abstract _ctor(ptr:NativePointer, index:number):void;
    protected abstract _dtor(ptr:NativePointer, index:number):void;
    protected abstract _copy(to:NativePointer, from:T, index:number):void;

    private _resize(newsizeBytes:number, newcapBytes:number, oldptr:NativePointer, oldsizeBytes:number):void {
        const compsize = this.componentType[NativeType.size]!;
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

        const compsize = type[NativeType.size]!;
        let begptr = this.getPointer(0);
        const oldsizeBytes = this.getPointer(8).subptr(begptr);
        if (idx * compsize < oldsizeBytes) {
            begptr.move(idx * compsize);
            this._copy(begptr, component, idx);
            return;
        }

        const capBytes = this.getPointer(16).subptr(begptr);
        if (idx >= capBytes) {
            const newBytes = (idx+1) * compsize;
            this._resize(newBytes, Math.max(capBytes*2, newBytes), begptr, oldsizeBytes);
            begptr = this.getPointer(0);
        }

        begptr.move(idx*compsize);
        this._copy(begptr, component, idx);
    }

    get(idx:number):T|null {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const compsize = this.componentType[NativeType.size]!;
        const size = endptr.subptr(beginptr) / compsize | 0;
        if (idx < 0 || idx >= size) return null;
        beginptr.move(idx * compsize);
        return this._get(beginptr, idx);
    }

    pop():boolean {
        const begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        if (endptr.equals(begptr)) return false;
        const compsize = this.componentType[NativeType.size]!;
        endptr.move(-compsize, -1);

        const idx = endptr.subptr(begptr) / compsize | 0;
        this._dtor(endptr, idx);
        this.setPointer(endptr, 8);
        return true;
    }

    push(component:T):void {
        let begptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const compsize = this.componentType[NativeType.size]!;
        const idx = endptr.subptr(begptr) / compsize | 0;
        const capptr = this.getPointer(16);
        if (capptr.equals(endptr)) {
            const oldsizeBytes = endptr.subptr(begptr);
            const capBytes = capptr.subptr(begptr);
            const newsizeBytes = oldsizeBytes+this.componentType[NativeType.size]!;
            this._resize(newsizeBytes, Math.max(capBytes*2, newsizeBytes), begptr, oldsizeBytes);
            begptr = this.getPointer(0);
        }
        begptr.move(idx*compsize);
        this._copy(begptr, component, idx);
    }

    size():number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        return endptr.subptr(beginptr) / this.componentType[NativeType.size]! | 0;
    }

    capacity():number {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(16);
        return endptr.subptr(beginptr) / this.componentType[NativeType.size]! | 0;
    }

    toArray():T[] {
        const n = this.size();
        const out:T[] = new Array(n);
        for (let i=0;i<n;i++) {
            out[i] = this.get(i)!;
        }
        return out;
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
        return singleton.newInstance(type, ()=>{
            if ((type as any)[NativeType.size] === undefined) throw Error("CxxVector needs the component size");

            if (NativeClass.isNativeClassType(type)) {
                class VectorImpl extends CxxVector<NativeClass> {
                    componentType:NativeClassType<NativeClass>;
                    static readonly componentType:NativeClassType<NativeClass> = type as any;
                    private readonly cache:(NativeClass|undefined)[] = [];

                    protected _move_alloc(allocated:NativePointer, oldptr:VoidPointer, movesize:number):void {
                        const clazz = this.componentType;
                        const compsize = this.componentType[NativeType.size]!;
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
                VectorImpl.abstract({}, 0x18);
                return VectorImpl;
            } else {
                class VectorImpl extends CxxVector<T> {
                    componentType:Type<T>;
                    static readonly componentType:Type<T> = type as any;

                    protected _move_alloc(allocated:NativePointer, oldptr:VoidPointer, movesize:number):void {
                        const compsize = this.componentType[NativeType.size]!;
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
                VectorImpl.prototype.componentType = type as any;
                VectorImpl.abstract({}, 0x18);
                return VectorImpl;
            }
        });
    }

    static _alloc16(size:number):NativePointer {
        abstract();
    }
}

CxxVector._alloc16 = procHacker.js("std::_Allocate<16,std::_Default_allocate_traits,0>", NativePointer, null, RawTypeId.FloatAsInt64);
