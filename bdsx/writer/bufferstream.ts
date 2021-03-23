import { AbstractReader, AbstractWriter } from "./abstractstream";

export class BufferWriter extends AbstractWriter {
    constructor (public array:Uint8Array, public size:number) {
        super();
    }

    put(v:number):void {
        const osize = this.size;
        this.resize(osize+1);
        this.array[osize] = v;
    }
    putRepeat(v:number, count:number):void {
        const osize = this.size;
        this.resize(osize + count);
        this.array.fill(v, osize, count);
    }
    write(values:number[]|Uint8Array):void {
        const osize = this.size;
        this.resize(osize+values.length);
        this.array.set(values, osize);
    }

    resize(nsize:number):void {
        const osize = this.size;
        this.size = nsize;
        if (nsize > this.array.length) {
            const narray = new Uint8Array(Math.max(this.array.length*2, nsize, 32));
            narray.set(this.array.subarray(0, osize));
            this.array = narray;
        }
    }

    buffer():Uint8Array {
        return this.array.subarray(0, this.size);
    }
}

export class BufferReader extends AbstractReader {
    public p:number = 0;

    constructor(public array:Uint8Array) {
        super();
    }

    get():number {
        if (this.p >= this.array.length) throw RangeError('EOF');
        return this.array[this.p++];
    }
    read(values:Uint8Array, offset:number, length:number):number {
        const reading = Math.min(length, this.array.length - this.p);
        if (reading > 0) values.set(this.array.subarray(this.p, this.p+length), offset);
        return reading;
    }

    remaining():Uint8Array {
        const p = this.p;
        this.p = this.array.length;
        return this.array.subarray(p);
    }
}
