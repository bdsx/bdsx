

import { Type, Primitive, NativePointer, SharedPointer, NetworkIdentifier, StaticPointer, std$_Allocate$16, free, Actor } from './native';

const Uint8 = Primitive.Uint8;
const Uint16 = Primitive.Uint16;
const Uint32 = Primitive.Uint32;
const Int8 = Primitive.Int8;
const Int16 = Primitive.Int16;
const Int32 = Primitive.Int32;
const Float32 = Primitive.Float32;
const Float64 = Primitive.Float64;

declare global
{
    interface StringConstructor extends Type<string>
    {
        get(ptr:NativePointer):string;
        set(ptr:NativePointer, value:string):void;
    }
}
declare module './native'
{
    namespace NativePointer
    {
        let size:number;
        function get(ptr:NativePointer):NativePointer;
        function set(ptr:NativePointer, value:NativePointer):void;
    }
    namespace SharedPointer
    {
        let size:number;
        function get(ptr:NativePointer):SharedPointer;
        function set(ptr:NativePointer, value:SharedPointer):void;
    }
    namespace NetworkIdentifier
    {
        let size:number;
        function get(ptr:NativePointer):NetworkIdentifier;
        function set(ptr:NativePointer, value:NetworkIdentifier):void;
    }
    namespace Actor
    {
        function get(ptr:NativePointer):Actor;
        function set(ptr:NativePointer, value:Actor):void;
    }
}
String.get = ptr=>{
    return ptr.getCxxString();
};
String.set = (ptr, value)=>{
    ptr.setCxxString(value);
};

NativePointer.size = 8;
NativePointer.get = function(ptr:NativePointer):NativePointer{
    return new NativePointer(ptr);
};
NativePointer.set = function(ptr:NativePointer, value:NativePointer):void{
    value.setPointer(ptr);
};

SharedPointer.size = 16;
SharedPointer.get = function(ptr:NativePointer):SharedPointer{
    return new SharedPointer(ptr);
};
SharedPointer.set = function(ptr:NativePointer, value:SharedPointer):void{
    value.assignTo(ptr);
};

NetworkIdentifier.size = 152;
NetworkIdentifier.get = NetworkIdentifier.fromPointer;
NetworkIdentifier.set = function(ptr:NativePointer, value:NetworkIdentifier):void{
    value.assignTo(ptr);
};

Actor.get = function(ptr:NativePointer):Actor{
    return Actor.fromPointer(ptr.getPointer());
};
Actor.set = function(ptr:NativePointer, value:Actor):void{
    ptr.setPointer(value);
};

export class TypedPointer<T>
{
    constructor(public readonly type:Type<T>, public readonly address:StaticPointer)
    {
    }
    
    get():T
    {
        return this.type.get(this.address);
    }
    set(value:T):void
    {
        this.type.set(this.address, value);
    }

    static readonly size:8;
    static get<T>(type:Type<T>, ptr:NativePointer):TypedPointer<T>
    {
        return new TypedPointer<T>(type, ptr.getPointer());
    }
    static set<T>(ptr:NativePointer, value:TypedPointer<T>):void
    {
        ptr.setPointer(value.address);
    }
}

export type NetworkIdentifierPtr = TypedPointer<NetworkIdentifier>;

export { 
    Primitive,
    Type, 
    Uint8,
    Uint16,
    Uint32,
    Int8,
    Int16,
    Int32,
    Float32,
    Float64,
};

type MakeProperty<T> = {
    [K in keyof T]: [number, K, Type<T[K]>];
};

export interface StructureType<T extends Structure> extends Type<T>
{
    new():T;
    structure: MakeProperty<T>[keyof T][];
}

export class Structure
{
    static get<T>(this:StructureType<T>, ptr:NativePointer):T
    {
        const instance = new this();
        let off = 0;
        for (const [offset, key, type] of this.structure)
        {            
            ptr.move(offset - off);
            off = offset;
            instance[key] = type.get(ptr);
        }
        ptr.move(-off);
        return instance;
    }

    static set<T>(this:StructureType<T>, ptr:NativePointer, instance:T):void
    {
        let off = 0;
        for (const [offset, key, type] of this.structure)
        {            
            ptr.move(offset - off);
            off = off;
            type.set(ptr, instance[key]);
        }
        ptr.move(-off);
    }
}

export class CxxVectorType<T> implements Type<CxxVector<T>>
{
    public readonly name:string;

    constructor(public readonly type:Type<T>)
    {
        this.name = `std::vector<${type.name}>`;
        if (this.type.size === undefined) throw Error("Cannot use unknown-sized type to CxxVector: "+type.name);
    }

    get(ptr:NativePointer):CxxVector<T>
    {
        return new CxxVector<T>(ptr, this.type);
    }

    set(ptr:NativePointer, value:CxxVector<T>):void
    {
        console.assert(ptr.equals(value.address));
    }
}

export class CxxVector<T>
{
    private readonly ctor_move:(to:StaticPointer, from:StaticPointer)=>void;
    private readonly ctor:(to:StaticPointer)=>void;
    private readonly dtor:(to:StaticPointer)=>void;

    constructor(public readonly address:StaticPointer, public readonly type:Type<T>)
    {
        if (!this.type.size) throw Error("CxxVector type needs size");

        this.ctor = this.type.ctor || (()=>{});
        this.dtor = this.type.dtor || (()=>{});

        if (this.type.ctor_move)
        {
            this.ctor_move = this.type.ctor_move;
        }
        else if (this.type.ctor_copy)
        {
            this.ctor_move = (to, from)=>{
                this.type.ctor_copy!(to, from);
                this.dtor(from);
            };
        }
        else
        {
            this.ctor_move = (to, from)=>{
                this.ctor(to);
                this.type.set(to, this.type.get(from));
                this.dtor(from);
            };
        }
    }

    private _resize(newsizeBytes:number, newcapBytes:number, oldptr:NativePointer, oldsizeBytes:number):void
    {
        const compsize = this.type.size!;
        const allocated = std$_Allocate$16(newsizeBytes);
        this.address.setPointer(allocated, 0);

        const oldptrmove = new NativePointer(oldptr);
        const oldsize = oldsizeBytes / compsize | 0;
        for (let i=0;i<oldsize;i++)
        {
            this.ctor_move(allocated, oldptrmove);
            allocated.move(compsize);
            oldptrmove.move(compsize);
        }
        free(oldptr);
        this.address.setPointer(allocated, 8);
        allocated.move(newcapBytes - newsizeBytes);
        this.address.setPointer(allocated, 16);
    }
    
    set(idx:number, component:T):void
    {
        const compsize = this.type.size!;
        let begptr = this.address.getPointer(0);
        const oldsizeBytes = this.address.getPointer(8).subptr(begptr);
        if (idx * compsize < oldsizeBytes)
        {
            begptr.move(idx * compsize);
            this.type.set(begptr, component);
            return;
        }

        const cap = this.address.getPointer(16).subptr(begptr);
        if (idx >= cap)
        {
            const newsize = idx+1;
            this._resize(newsize * compsize, Math.max(cap*2, newsize), begptr, oldsizeBytes);
            begptr = this.address.getPointer(0);
        }

        begptr.move(oldsizeBytes);
        for (let i=oldsizeBytes / compsize | 0; i < idx; i++)
        {
            this.ctor(begptr);
            begptr.move(compsize);
        }
        this.ctor(begptr);
        this.type.set(begptr, component);
    }

    get(idx:number):T|null
    {
        const beginptr = this.address.getPointer(0);
        const endptr = this.address.getPointer(8);
        const compsize = this.type.size!;
        const size = endptr.subptr(beginptr) / compsize | 0;
        if (idx >= size) return null;
        beginptr.move(idx * compsize);
        return this.type.get(beginptr);
    }

    pop():T|null
    {
        const beginptr = this.address.getPointer(8);
        const endptr = this.address.getPointer(16);
        if (endptr.equals(beginptr)) return null;
        endptr.move(-this.type.size!);
        const out = this.type.get(endptr);
        this.dtor(endptr);
        this.address.setPointer(endptr, 8);
        return out;
    }

    push(component:T):void
    {
        let endptr = this.address.getPointer(8);
        const capptr = this.address.getPointer(16);
        if (capptr.equals(endptr))
        {
            const begptr = this.address.getPointer(0);
            const oldsizeBytes = endptr.subptr(begptr);
            const capBytes = capptr.subptr(begptr);
            const newsizeBytes = oldsizeBytes+this.type.size!;
            this._resize(newsizeBytes, Math.max(capBytes*2, newsizeBytes), begptr, oldsizeBytes);
            endptr = this.address.getPointer(8);
        }
        this.ctor(endptr);
        this.type.set(endptr, component);
        endptr.add(this.type.size!);
        this.address.setPointer(endptr, 8);
    }

    size():number
    {
        const beginptr = this.address.getPointer(0);
        const endptr = this.address.getPointer(8);
        return endptr.subptr(beginptr) / this.type.size! | 0;
    }
}
