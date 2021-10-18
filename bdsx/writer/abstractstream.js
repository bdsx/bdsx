"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractReader = exports.AbstractWriter = void 0;
const floatbits_1 = require("../floatbits");
const util_1 = require("util");
const UINT32_CAP = 0x100000000;
const UINT64_CAP = 0x10000000000000000;
const INT64_CAP = 0x8000000000000000;
class AbstractWriter {
    writeNullTerminatedString(text) {
        if (text.indexOf('\0') !== -1)
            throw Error('Cannot write null characters with writeNullTerminatedString');
        const encoder = new util_1.TextEncoder;
        this.write(encoder.encode(text));
        this.put(0);
    }
    writeVarString(text) {
        this.writeVarUint(text.length);
        const encoder = new util_1.TextEncoder;
        this.write(encoder.encode(text));
    }
    writeVarUint(n) {
        if (n < 0)
            throw Error('Number is not unsigned');
        for (;;) {
            const chr = n & 0x7f;
            n = Math.floor(n / 0x80);
            if (n !== 0) {
                this.put(chr | 0x80);
            }
            else {
                this.put(chr);
                return;
            }
        }
    }
    writeVarInt(n) {
        n |= 0;
        this.writeVarUint((n << 1) ^ (n >> 31));
    }
    writeUint8(n) {
        n |= 0;
        return this.put(n & 0xff);
    }
    writeInt8(n) {
        n |= 0;
        return this.put(n & 0xff);
    }
    writeUint16(n) {
        return this.writeInt16(n);
    }
    writeInt16(n) {
        n |= 0;
        this.put(n & 0xff);
        this.put((n >> 8) & 0xff);
    }
    writeUint32(n) {
        return this.writeInt32(n);
    }
    writeInt32(n) {
        n |= 0;
        this.put(n & 0xff);
        this.put((n >> 8) & 0xff);
        this.put((n >> 16) & 0xff);
        this.put((n >> 24) & 0xff);
    }
    writeUint64WithFloat(n) {
        if (n < 0) {
            this.writeInt32(0);
            this.writeInt32(0);
        }
        else if (n >= UINT64_CAP) {
            this.writeInt32(-1);
            this.writeInt32(-1);
        }
        else {
            this.writeUint32(n % UINT32_CAP);
            this.writeUint32(Math.floor(n / UINT32_CAP));
        }
    }
    writeInt64WithFloat(n) {
        if (n <= -INT64_CAP) {
            this.writeInt32(0);
            this.writeInt32(0x80000000);
        }
        else if (n >= INT64_CAP) {
            this.writeInt32(-1);
            this.writeInt32(0x7ffffffff);
        }
        else {
            if (n < 0) {
                const low = n % UINT32_CAP;
                const high = Math.floor(n / UINT32_CAP);
                if (low === 0) {
                    this.writeUint32(0);
                    this.writeUint32(~high + 1);
                }
                else {
                    this.writeUint32(~low + 1);
                    this.writeUint32(~high);
                }
            }
            else {
                this.writeUint32(n % UINT32_CAP);
                this.writeUint32(Math.floor(n / UINT32_CAP));
            }
        }
    }
    writeBin(bin) {
        const n = bin.length;
        for (let i = 0; i < n; i++) {
            const chr = bin.charCodeAt(i);
            this.put((chr & 0xff));
            this.put((chr >> 8) & 0xff);
        }
    }
    writeFloat32(n) {
        this.writeInt32(floatbits_1.floatbits.f32_to_bits(n));
    }
    writeFloat64(n) {
        const [low, high] = floatbits_1.floatbits.f64_to_bits(n);
        this.writeInt32(low);
        this.writeInt32(high);
    }
    writeBoolean(n) {
        this.put(+n);
    }
}
exports.AbstractWriter = AbstractWriter;
class AbstractReader {
    readVarUint() {
        let out = 0;
        let shift = 1;
        for (;;) {
            const n = this.get();
            if (!(n & 0x80))
                return out | (n * shift);
            out += (n & 0x7f) * shift;
            shift *= 0x80;
        }
    }
    readNullTerminatedString() {
        const decoder = new util_1.TextDecoder('utf-8');
        const array = [];
        for (;;) {
            const n = this.get();
            if (n === 0)
                return decoder.decode(new Uint8Array(array));
            array.push(n);
        }
    }
}
exports.AbstractReader = AbstractReader;
//# sourceMappingURL=abstractstream.js.map