import { VoidPointer } from "./core";
import { dll } from "./dll";
import { CxxString, Type } from "./nativetype";
import { CxxStringWrapper } from "./pointer";

const lesses = new WeakMap<Type<any>, (a:any, b:any)=>boolean>();

/**
 * std::less
 */
export const CxxLess = {
    /**
     * get defined std::less<type>
     *
     * it's just a kind of getter but uses 'make' for consistency.
     */
    make<T>(type:Type<T>):(a:T, b:T)=>boolean {
        const fn = lesses.get(type);
        if (fn == null) throw Error(`std::less<${type.name}> not found`);
        return fn;
    },

    /**
     * define std::less<type>
     */
    define<T>(type:Type<T>, less:(a:T, b:T)=>boolean):void {
        const fn = lesses.get(type);
        if (fn != null) throw Error(`std::less<${type.name}> is already defined`);
        lesses.set(type, less);
    }
};

export type CxxLess<T> = (a:T, b:T)=>boolean;


function compare(a:VoidPointer, alen:number, b:VoidPointer, blen:number):number {
    const diff = dll.vcruntime140.memcmp(a, b, Math.min(alen, blen));
    if (diff !== 0) return diff;
    if (alen < blen) return -1;
    if (alen > blen) return 1;
    return 0;
}

function compareString(a:string, b:string):number {
    const alen = a.length;
    const blen = b.length;
    const diff = dll.vcruntime140.memcmp(VoidPointer.fromAddressString(a), VoidPointer.fromAddressString(b), Math.min(alen, blen)*2);
    if (diff !== 0) return diff;
    if (alen < blen) return -1;
    if (alen > blen) return 1;
    return 0;
}

CxxLess.define(CxxStringWrapper, (a, b)=>compare(a, a.length, b, b.length) < 0);
CxxLess.define(CxxString, (a, b)=>compareString(a, b) < 0);
