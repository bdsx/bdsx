
export class ArrayMap<KEY, T> implements Iterable<[KEY, T[]]> {
    private readonly map = new Map<KEY, T[]>();

    has(key:KEY):boolean {
        const arr = this.map.get(key);
        if (arr == null) return false;
        return arr.length !== 0;
    }

    count(key:KEY):number {
        const arr = this.map.get(key);
        if (arr == null) return 0;
        return arr.length;
    }

    push(key:KEY, value:T):void {
        const array = this.map.get(key);
        if (array != null) array.push(value);
        else this.map.set(key, [value]);
    }

    pop(key:KEY):T|undefined {
        const array = this.map.get(key);
        if (array == null) return undefined;
        const out = array.pop();
        if (array.length === 0) {
            this.map.delete(key);
        }
        return out;
    }

    delete(key:KEY):boolean {
        return this.map.delete(key);
    }

    clear():void {
        this.map.clear();
    }

    keys():IterableIterator<KEY> {
        return this.map.keys();
    }

    values():IterableIterator<T[]> {
        return this.map.values();
    }

    /**
     * @deprecated Typo!
     */
    entires():IterableIterator<[KEY, T[]]> {
        return this.map.entries();
    }

    entries():IterableIterator<[KEY, T[]]> {
        return this.map.entries();
    }

    [Symbol.iterator]():IterableIterator<[KEY, T[]]> {
        return this.map.entries();
    }
}
