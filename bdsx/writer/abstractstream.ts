import { floatbits } from "../floatbits";
import { TextDecoder, TextEncoder } from "util";


const UINT32_CAP = 0x100000000;
const UINT64_CAP = 0x10000000000000000;
const INT64_CAP = 0x8000000000000000;

export abstract class AbstractWriter {
    abstract put(v:number):void;
    abstract putRepeat(v:number, count:number):void;
    abstract write(values:Uint8Array):void;

    writeNullTerminatedString(text:string):void {
        if (text.indexOf('\0') !== -1) throw Error('Cannot write null characters with writeNullTerminatedString');
        const encoder = new TextEncoder;
        this.write(encoder.encode(text));
        this.put(0);
    }

    writeVarString(text:string):void {
        this.writeVarUint(text.length);
        const encoder = new TextEncoder;
        this.write(encoder.encode(text));
    }

    writeVarUint(n:number):void {
        if (n < 0) throw Error('Number is not unsigned');
        for (;;) {
            const chr = n&0x7f;
            n = Math.floor(n / 0x80);
            if (n !== 0) {
                this.put(chr|0x80);
            } else {
                this.put(chr);
                return;
            }
        }
    }

    writeVarInt(n:number):void {
        n |= 0;
        this.writeVarUint((n << 1) ^ (n >> 31));
    }

    writeUint8(n:number):void {
        n |= 0;
        return this.put(n&0xff);
    }

    writeInt8(n:number):void {
        n |= 0;
        return this.put(n&0xff);
    }

    writeUint16(n:number):void {
        return this.writeInt16(n);
    }

    writeInt16(n:number):void {
        n |= 0;
        this.put(n&0xff);
        this.put((n >> 8)&0xff);
    }

    writeUint32(n:number):void {
        return this.writeInt32(n);
    }

    writeInt32(n:number):void {
        n |= 0;
        this.put(n&0xff);
        this.put((n >> 8)&0xff);
        this.put((n >> 16)&0xff);
        this.put((n >> 24)&0xff);
    }

    writeUint64WithFloat(n:number):void {
        if (n < 0) {
            this.writeInt32(0);
            this.writeInt32(0);
        } else if (n >= UINT64_CAP) {
            this.writeInt32(-1);
            this.writeInt32(-1);
        } else {
            this.writeUint32(n % UINT32_CAP);
            this.writeUint32(Math.floor(n / UINT32_CAP));
        }
    }

    writeInt64WithFloat(n:number):void {
        if (n <= -INT64_CAP) {
            this.writeInt32(0);
            this.writeInt32(0x80000000);
        } else if (n >= INT64_CAP) {
            this.writeInt32(-1);
            this.writeInt32(0x7ffffffff);
        } else {
            if (n < 0) {
                const low = n % UINT32_CAP;
                const high = Math.floor(n / UINT32_CAP);
                if (low === 0) {
                    this.writeUint32(0);
                    this.writeUint32(~high + 1);
                } else {
                    this.writeUint32(~low + 1);
                    this.writeUint32(~high);
                }
            } else {
                this.writeUint32(n % UINT32_CAP);
                this.writeUint32(Math.floor(n / UINT32_CAP));
            }
        }
    }

    writeBin(bin:string):void {
        const n = bin.length;
        for (let i=0;i<n;i++) {
            const chr = bin.charCodeAt(i);
            this.put((chr&0xff));
            this.put((chr>>8)&0xff);
        }
    }

    writeFloat32(n:number):void {
        this.writeInt32(floatbits.f32_to_bits(n));
    }

    writeFloat64(n:number):void {
        const [low, high] = floatbits.f64_to_bits(n);
        this.writeInt32(low);
        this.writeInt32(high);
    }

    writeBoolean(n:boolean):void {
        this.put(+n);
    }
}

export abstract class AbstractReader {
    abstract get():number;
    abstract read(values:Uint8Array, offset:number, length:number):number;

    readVarUint():number {
        let out = 0;
        let shift = 1;
        for (;;) {
            const n = this.get();
            if (!(n&0x80)) return out | (n * shift);
            out += (n & 0x7f) * shift;
            shift *= 0x80;
        }
    }

    readNullTerminatedString():string {
        const decoder = new TextDecoder('utf-8');
        const array:number[] = [];
        for (;;) {
            const n = this.get();
            if (n === 0) return decoder.decode(new Uint8Array(array));
            array.push(n);
        }
    }

}
