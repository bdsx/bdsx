import { AbstractReader, AbstractWriter } from "./abstractstream";

export class BufferWriter extends AbstractWriter {
    constructor (public array:Uint8Array=new Uint8Array(64), public size:number=0) {
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
        const p = this.p;
        const reading = Math.min(length, this.array.length - p);
        if (reading > 0) {
            this.p += length;
            values.set(this.array.subarray(p, this.p), offset);
            return reading;
        } else {
            return 0;
        }
    }
    getBuffer(length:number):Buffer {
        const p = this.array.byteOffset + this.p;
        this.p += length;
        return Buffer.from(this.array.buffer, p, length);
    }

    remaining():Buffer {
        const p = this.array.byteOffset + this.p;
        this.p = this.array.length;
        return Buffer.from(this.array.buffer, p);
    }
}
