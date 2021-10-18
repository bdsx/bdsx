"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferReader = exports.BufferWriter = void 0;
const abstractstream_1 = require("./abstractstream");
class BufferWriter extends abstractstream_1.AbstractWriter {
    constructor(array, size) {
        super();
        this.array = array;
        this.size = size;
    }
    put(v) {
        const osize = this.size;
        this.resize(osize + 1);
        this.array[osize] = v;
    }
    putRepeat(v, count) {
        const osize = this.size;
        this.resize(osize + count);
        this.array.fill(v, osize, count);
    }
    write(values) {
        const osize = this.size;
        this.resize(osize + values.length);
        this.array.set(values, osize);
    }
    resize(nsize) {
        const osize = this.size;
        this.size = nsize;
        if (nsize > this.array.length) {
            const narray = new Uint8Array(Math.max(this.array.length * 2, nsize, 32));
            narray.set(this.array.subarray(0, osize));
            this.array = narray;
        }
    }
    buffer() {
        return this.array.subarray(0, this.size);
    }
}
exports.BufferWriter = BufferWriter;
class BufferReader extends abstractstream_1.AbstractReader {
    constructor(array) {
        super();
        this.array = array;
        this.p = 0;
    }
    get() {
        if (this.p >= this.array.length)
            throw RangeError('EOF');
        return this.array[this.p++];
    }
    read(values, offset, length) {
        const reading = Math.min(length, this.array.length - this.p);
        if (reading > 0)
            values.set(this.array.subarray(this.p, this.p + length), offset);
        return reading;
    }
    remaining() {
        const p = this.p;
        this.p = this.array.length;
        return this.array.subarray(p);
    }
}
exports.BufferReader = BufferReader;
//# sourceMappingURL=bufferstream.js.map