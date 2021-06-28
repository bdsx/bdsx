
const hashkey = Symbol('hash');
const nextlink = Symbol('hash_next');

export interface Hashable
{
    [hashkey]?:number;
    [nextlink]?:Hashable|null;
    hash():number;
    equals(other:this):boolean;
}

const INITIAL_CAP = 16;

export class HashSet<T extends Hashable> implements Iterable<T> {
    private array:(T|null)[] = new Array(INITIAL_CAP);
    public size = 0;

    constructor() {
        for (let i=0;i<INITIAL_CAP;i++) {
            this.array[i] = null;
        }
    }

    private _resetCap(n:number):void {
        const narray = new Array(n);
        for (let i=0;i<n;i++) {
            narray[i] = null;
        }

        for (let item of this.array) {
            for (;;) {
                if (item === null) break;
                const next:T|null = item[nextlink] as T;

                const idx = item[hashkey]! % narray.length;
                item[nextlink] = narray[idx];
                narray[idx] = item;

                item = next;
            }
        }
        this.array.length = 0;
        this.array = narray;
    }

    [Symbol.iterator]():IterableIterator<T> {
        return this.keys();
    }

    keys():IterableIterator<T> {
        return this.values();
    }

    *values():IterableIterator<T> {
        for (let item of this.array) {
            for (;;) {
                if (item === null) break;
                yield item;
                item = item[nextlink] as T;
            }
        }
    }

    get(item:T):T|null {
        let hash = item[hashkey];
        if (hash == null) hash = item[hashkey] = item.hash()>>>0;

        const idx = hash % this.array.length;
        let found = this.array[idx];
        for (;;) {
            if (found === null) return null;
            if (found[hashkey] === hash) return found;
            found = found[nextlink] as T;
        }
    }

    has(item:T):boolean {
        let hash = item[hashkey];
        if (hash == null) hash = item[hashkey] = item.hash()>>>0;

        const idx = hash % this.array.length;
        let found = this.array[idx];
        for (;;) {
            if (found === null) return false;
            if (found[hashkey] === hash) return true;
            found = found[nextlink] as T;
        }
    }

    delete(item:T):boolean {
        let hash = item[hashkey];
        if (hash == null) hash = item[hashkey] = item.hash()>>>0;

        const idx = hash % this.array.length;
        let found = this.array[idx];
        if (found === null) return false;
        if (found[hashkey] === hash && item.equals(found)) {
            this.array[idx] = found[nextlink] as T;
            found[nextlink] = null;
            this.size--;
            return true;
        }
        for (;;) {
            const next = found![nextlink] as T;
            if (next === null) return false;

            if (next[hashkey] === hash && next.equals(found)) {
                found![nextlink] = next[nextlink];
                next[nextlink] = null;
                this.size--;
                return true;
            }
            found = next;
        }
    }

    add(item:T):this {
        this.size ++;
        const cap = this.array.length;
        if (this.size > (cap * 3 >> 2)) {
            this._resetCap(cap * 3 >> 1);
        }

        let hash = item[hashkey];
        if (hash == null) hash = item[hashkey] = item.hash()>>>0;

        const idx = hash % cap;
        item[nextlink] = this.array[idx];
        this.array[idx] = item;
        return this;
    }
}
