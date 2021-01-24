import { proc } from "./bds/proc";
import { abstract, RawTypeId } from "./common";
import { makefunc, NativePointer, VoidPointer } from "./core";
import { dll } from "./dll";
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
export abstract class CxxVector<T> extends NativeClass implements Iterable<T>
{
    // 	m_begin = nullptr; // 0x00
    // 	m_end = nullptr; // 0x08
    // 	m_cap = nullptr; // 0x10

    abstract componentType:Type<T>;
    static readonly componentType:Type<any>;
    readonly cache:T[]|null;

    constructor(address?:VoidPointer|boolean)
    {
        super(address);
    }

    [NativeType.ctor]():void
    {
        this.fill(0, VECTOR_SIZE);
    }
    [NativeType.dtor]():void
    {
        const ptr = this.getPointer(0);
        dll.ucrtbase.free(ptr);
    }

    protected abstract _move_alloc(allocated:NativePointer, oldptr:VoidPointer, oldsize:number, newsize:number):void;

    private _resize(newsizeBytes:number, newcapBytes:number, oldptr:NativePointer, oldsizeBytes:number):void
    {
        const compsize = this.componentType[NativeType.size]!;
        const allocated = CxxVector._alloc16(newcapBytes);
        this.setPointer(allocated, 0);

        const oldsize = oldsizeBytes / compsize | 0;
        const newsize = newsizeBytes / compsize | 0;
        this._move_alloc(allocated, oldptr, oldsize, newsize);
        dll.ucrtbase.free(oldptr);
        this.setPointer(allocated, 8);
        allocated.move(newcapBytes - newsizeBytes);
        this.setPointer(allocated, 16);
    }
    
    set(idx:number, component:T):void
    {
        const type = this.componentType;

        const compsize = type[NativeType.size]!;
        let begptr = this.getPointer(0);
        const oldsizeBytes = this.getPointer(8).subptr(begptr);
        if (idx * compsize < oldsizeBytes)
        {
            begptr.move(idx * compsize);
            this.componentType[NativeType.setter](begptr, component);
            return;
        }

        const cap = this.getPointer(16).subptr(begptr);
        if (idx >= cap)
        {
            const newsize = idx+1;
            this._resize(newsize * compsize, Math.max(cap*2, newsize), begptr, oldsizeBytes);
            begptr = this.getPointer(0);
        }

        begptr.move(oldsizeBytes);
        for (let i=oldsizeBytes / compsize | 0; i < idx; i++)
        {
            this.componentType[NativeType.ctor](begptr);
            begptr.move(compsize);
        }
        this.componentType[NativeType.ctor](begptr);
        this.componentType[NativeType.setter](begptr, component);
    }

    get(idx:number):T|null
    {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        const compsize = this.componentType[NativeType.size]!;
        const size = endptr.subptr(beginptr) / compsize | 0;
        if (idx >= size) return null;
        beginptr.move(idx * compsize);
        return this.componentType[NativeType.getter](beginptr);
    }

    pop():T|null
    {
        const beginptr = this.getPointer(8);
        const endptr = this.getPointer(16);
        if (endptr.equals(beginptr)) return null;
        endptr.move(-this.componentType[NativeType.size]!);
        const out = this.componentType[NativeType.getter](endptr);
        this.componentType[NativeType.dtor](endptr);
        this.setPointer(endptr, 8);
        return out;
    }

    push(component:T):void
    {
        let endptr = this.getPointer(8);
        const capptr = this.getPointer(16);
        if (capptr.equals(endptr))
        {
            const begptr = this.getPointer(0);
            const oldsizeBytes = endptr.subptr(begptr);
            const capBytes = capptr.subptr(begptr);
            const newsizeBytes = oldsizeBytes+this.componentType[NativeType.size]!;
            this._resize(newsizeBytes, Math.max(capBytes*2, newsizeBytes), begptr, oldsizeBytes);
            endptr = this.getPointer(8);
        }

        this.componentType[NativeType.ctor](endptr);
        this.componentType[NativeType.setter](endptr, component);
        endptr.add(this.componentType[NativeType.size]!);
        this.setPointer(endptr, 8);
    }

    size():number
    {
        const beginptr = this.getPointer(0);
        const endptr = this.getPointer(8);
        return endptr.subptr(beginptr) / this.componentType[NativeType.size]! | 0;
    }

    toArray():T[]
    {
        const n = this.size();
        const out:T[] = new Array(n);
        for (let i=0;i<n;i++)
        {
            out[i] = this.get(i)!;
        }
        return out;
    }

    *[Symbol.iterator]():IterableIterator<T>
    {
        const n = this.size();
        for (let i=0;i<n;i++)
        {
            yield this.get(i)!;
        }
    }

    dispose():void
    {
        this[NativeType.dtor]();
    }

    static make<T>(type:{new():T}|{[NativeType.getter]:T}):CxxVectorType<T>
    {
        return singleton.newInstance(type, ()=>{
            if ((type as any)[NativeType.size] === undefined) throw Error("CxxVector needs the component size");

            if (NativeClass.isNativeClassType(type))
            {
                class VectorImpl extends CxxVector<NativeClass>
                {
                    componentType:NativeClassType<NativeClass>;
                    static readonly componentType:NativeClassType<NativeClass> = type as any;
                    cache:NativeClass[] = [];

                    protected _move_alloc(allocated:NativePointer, oldptr:VoidPointer, oldsize:number, newsize:number):void
                    {
                        const clazz = this.componentType;
                        const compsize = this.componentType[NativeType.size]!;
                        const oldptrmove = new NativePointer(oldptr);
                        const ncache:NativeClass[] = new Array(newsize);
                        const ocache = this.cache;
                        for (let i=0;i<oldsize;i++)
                        {
                            const new_item:NativeClass = allocated.as(clazz);
                            const old_item = ocache[i];
                            ncache[i] = new_item;
                            new_item[NativeType.ctor_move](old_item);
                            old_item[NativeType.dtor]();

                            this.componentType[NativeType.ctor_move](allocated, oldptrmove);
                            allocated.move(compsize);
                            oldptrmove.move(compsize);
                        }
                        this.cache = ncache;
                    }
                }
                VectorImpl.prototype.componentType = type as any;
                VectorImpl.abstract({}, 0x18);
                return VectorImpl;
            }
            else
            {
                class VectorImpl extends CxxVector<T>
                {
                    componentType:Type<T>;
                    static readonly componentType:Type<T> = type as any;
                    
                    protected _move_alloc(allocated:NativePointer, oldptr:VoidPointer, oldsize:number):void
                    {
                        const compsize = this.componentType[NativeType.size]!;
                        const oldptrmove = new NativePointer(oldptr);
                        for (let i=0;i<oldsize;i++)
                        {
                            this.componentType[NativeType.ctor_move](allocated, oldptrmove);
                            allocated.move(compsize);
                            oldptrmove.move(compsize);
                        }
                    }
                }
                VectorImpl.prototype.componentType = type as any;
                VectorImpl.abstract({}, 0x18);
                return VectorImpl;
            }
        });
    }

    /**
     * it's same with malloc, even malloc also aligned with 16 bytes(but non standard).
     * i just implement it to make it closer to native
     */
    static _alloc16(size:number):NativePointer
    {
        abstract();
    }
}

CxxVector._alloc16 = makefunc.js(proc["std::_Allocate<16,std::_Default_allocate_traits,0>"], NativePointer, null, RawTypeId.FloatAsInt64);
