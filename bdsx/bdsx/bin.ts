
function shrinkZero(values:number[]):void {
    for (let j=values.length-1; j>=0; j--) {
        if (values[j] !== 0) {
            values.length = j+1;
            break;
        }
    }
}

function add_with_offset(a:number[], b:string, offset:number):void {
    let minn:number;
    let maxn:number;
    const alen = a.length;
    const blen = offset + b.length;
    let maxoff:number;
    if (alen < blen) {
        minn = a.length;
        maxn = blen;
        maxoff = offset;
    } else {
        minn = blen;
        maxn = a.length;
        maxoff = 0;
    }
    let v = 0;
    let i=0;
    for (;i<minn;i++) {
        v += a[i];
        v += b.charCodeAt(i-offset);
        a[i] = v & 0xffff;
        v >>= 16;
    }
    if (alen < blen) {
        for (;i<maxn;i++) {
            v += b.charCodeAt(i-maxoff);
            a.push(v & 0xffff);
            v >>= 16;
        }
    } else {
        for (;i<maxn;i++) {
            v += a[i];
            a[i] = v & 0xffff;
            v >>= 16;
            if (v === 0) return;
        }
    }
    a.push(v);
}

export namespace bin {
    export function isZero(value:string):boolean {
        for (let i=0;i<value.length;i++) {
            if (value.charCodeAt(i) !== 0) return false;
        }
        return true;
    }
    export function uint8(value:string):number {
        return value.length !== 0 ? value.charCodeAt(0) & 0xff : 0;
    }
    export function uint16(value:string):number {
        return value.length !== 0 ? value.charCodeAt(0) : 0;
    }
    export function int32(value:string):number {
        if (value.length >= 2) {
            return (value.charCodeAt(1) << 16) | value.charCodeAt(0);
        } else if (value.length === 0) {
            return 0;
        } else {
            return value.charCodeAt(0);
        }
    }
    export function int32_high(value:string):number {
        if (value.length >= 4) {
            return (value.charCodeAt(3) << 16) | value.charCodeAt(2);
        } else if (value.length >= 3) {
            return value.charCodeAt(2);
        } else {
            return 0;
        }
    }
    export function int32_2(value:string):[number, number] {
        if (value.length >= 4) {
            return [
                (value.charCodeAt(1) << 16) | value.charCodeAt(0),
                (value.charCodeAt(3) << 16) | value.charCodeAt(2),
            ];
        }
        if (value.length >= 2) {
            if (value.length === 3) {
                return [
                    (value.charCodeAt(1) << 16) | value.charCodeAt(0),
                    value.charCodeAt(2),
                ];
            } else {
                return [
                    (value.charCodeAt(1) << 16) | value.charCodeAt(0),
                    0,
                ];
            }
        } else if (value.length === 0) {
            return [0, 0];
        } else {
            return [
                value.charCodeAt(0),
                0,
            ];
        }
    }
    export function make64(low:number, high:number):string {
        const v1 = low & 0xffff;
        const v2 = low >>> 16;
        const v3 = high & 0xffff;
        const v4 = high >>> 16;
        return String.fromCharCode(v1,v2,v3,v4);
    }
    export function make128(a:number, b:number, c:number, d:number):string {
        const a1 = a & 0xffff;
        const a2 = a >>> 16;
        const b1 = b & 0xffff;
        const b2 = b >>> 16;
        const c1 = c & 0xffff;
        const c2 = c >>> 16;
        const d1 = d & 0xffff;
        const d2 = d >>> 16;
        return String.fromCharCode(a1,a2,b1,b2,c1,c2,d1,d2);
    }
    export function toNumber(v:string):number {
        let out = 0;
        let mult = 1;
        const len = v.length;
        for (let i=0;i<len;i++) {
            out += v.charCodeAt(i) * mult;
            mult *= 0x10000;
        }
        return out;
    }
    export function makeVar(n:number):string {
        n = Math.floor(n);
        if (n < 0) n = 0;

        const out:number[] = [];
        for (let i=0;n !== 0;i++) {
            out[i] = n % 0x10000;
            n = Math.floor(n / 0x10000);
        }
        return String.fromCharCode(...out);
    }
    export function make(n:number, wordsize:number):string {
        n = Math.floor(n);
        if (n < 0) n = 0;

        const out:number[] = new Array(wordsize);
        for (let i=0;i<wordsize;i++) {
            out[i] = n % 0x10000;
            n = Math.floor(n / 0x10000);
        }
        return String.fromCharCode(...out);
    }
    export function fromBuffer(buffer:Uint8Array, pad:number = 0):string {
        const dest = new Uint16Array((buffer.length+1)>>1);
        const words = buffer.length & ~1;

        let j = 0;
        let i = 0;
        for (;i!==words;) {
            const low = buffer[i++];
            const high = buffer[i++];
            dest[j++] = (high << 16) | low;
        }
        if (i !== buffer.length) {
            const low = buffer[i];
            dest[j++] = (pad << 16) | low;
        }
        return String.fromCharCode(...dest);
    }
    /**
     * similar to parseInt but make it as a bin.
     * throw the error if it's not a number.
     */
    export function parse(v:string, radix?:number|null, wordsize?:number|null):string {
        let idx = 0;
        if (radix == null) {
            _loop: for (;;) {
                const chr = v.charCodeAt(idx);
                switch (chr) {
                case 0x09: case 0x0d: case 0x20: // space
                    idx++;
                    continue;
                case 0x30: // zero start
                    if (v.length === 1) return ''; // just '0'
                    idx++;
                    switch (v.charCodeAt(idx)) {
                    case 0x30: case 0x31: case 0x32: case 0x33: case 0x34:
                    case 0x35: case 0x36: case 0x37: case 0x38: case 0x39: // numeric
                        radix = 10;
                        break;
                    case 0x58: case 0x78: // X x
                        idx++;
                        radix = 16;
                        break;
                    case 0x42: case 0x62: // B b
                        idx++;
                        radix = 2;
                        break;
                    case 0x4f: case 0x6f: // O o
                        idx++;
                        radix = 8;
                        break;
                    default:
                        throw Error(`${v}: is not a number`);
                    }
                    break _loop;
                case 0x31: case 0x32: case 0x33: case 0x34:
                case 0x35: case 0x36: case 0x37: case 0x38: case 0x39: // numeric
                    radix = 10;
                    break _loop;
                default:
                    throw Error(`${v}: is not a number`);
                }
            }
        }
        if (radix < 2 || radix > 36) throw Error(`parse() radix argument must be between 2 and 36`);

        const values:number[] = [0];
        function mulRadix():void {
            n *= radix!;

            let i=1;
            let carry = n >>> 16;
            n &= 0xffff;

            for (;;) {
                if (i === values.length) {
                    if (carry !== 0) {
                        values.push(carry);
                    }
                    break;
                }
                const n = values[i] * radix! + carry;
                values[i++] = n & 0xffff;
                carry = n >>> 16;
            }
        }
        function carry():void {
            let i=1;
            for (;;) {
                if (i === values.length) {
                    values.push(1);
                    break;
                }
                const n = values[i];
                if (n === 0xffff) {
                    values[i] = 0;
                    continue;
                }
                values[i++] = n+1;
                break;
            }
        }
        let n = 0;

        for (;;) {
            if (idx === v.length) {
                values[0] = n;
                if (wordsize != null) {
                    const oldsize = values.length;
                    values.length = wordsize;
                    for (let i=oldsize;i<wordsize;i++) {
                        values[i] = 0;
                    }
                }
                return String.fromCharCode(...values);
            }
            mulRadix();
            const chr = v.charCodeAt(idx++);

            let add:number;
            if (0x30 <= chr && chr <= 0x39) {
                // numeric
                add = chr - 0x30;
            } else if (0x41 <= chr && chr <= 0x5a) {
                // upper case
                add = chr - (0x41 - 10);
            } else if (0x61 <= chr && chr <= 0x7a) {
                // lower case
                add = chr - (0x61 - 10);
            } else {
                throw Error(`${v}: is not a number`);
            }
            if (add >= radix) throw Error(`${v}: is not a number`);
            n += add;
            if (n > 0xffff) {
                n -= 0x10000;
                carry();
            }
        }
    }
    export function toString(v:string, radix = 10):string {
        if (radix < 2 || radix > 36) throw Error(`toString() radix argument must be between 2 and 36`);
        let len = v.length;
        do {
            if (len === 0) return '0';
            len--;
        }
        while(v.charCodeAt(len) === 0);
        len ++;
        v = v.substr(0, len);

        const out:number[] = [];
        for (;;) {
            const [quotient, remainder] = bin.divn(v, radix);
            if (remainder < 10) {
                out.push(remainder+0x30);
            } else {
                out.push(remainder+(0x61-10));
            }
            v = quotient;

            const last = v.length-1;
            if (v.charCodeAt(last) === 0) v = v.substr(0, last);
            if (v === '') break;
        }

        out.reverse();
        return String.fromCharCode(...out);
    }
    export function add(a:string, b:string):string {
        let maxtext:string;
        let minn:number;
        let maxn:number;
        if (a.length < b.length) {
            maxtext = b;
            minn = a.length;
            maxn = b.length;
        } else {
            maxtext = a;
            minn = b.length;
            maxn = a.length;
        }
        const values:number[] = new Array(maxn);
        let v = 0;
        let i=0;
        for (;i<minn;i++) {
            v += a.charCodeAt(i);
            v += b.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        for (;i<maxn;i++) {
            v += maxtext.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        // if (v !== 0) values.push(v);
        return String.fromCharCode(...values);
    }
    export function zero(wordsize:number):string {
        return '\0'.repeat(wordsize);
    }
    export function sub(a:string, b:string):string {
        const alen = a.length;
        const blen = b.length;
        const values:number[] = new Array(alen);
        let v = 0;
        for (let i=alen;i<blen;i++) {
            if (b.charCodeAt(i) !== 0) return bin.zero(alen);
        }
        let i=0;
        for (;i<blen;i++) {
            v += a.charCodeAt(i);
            v -= b.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        for (;i<alen;i++) {
            v += a.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        if (v !== 0) return bin.zero(alen);

        // shrinkZero(values);
        return String.fromCharCode(...values);
    }
    export function divn(a:string, b:number):[string, number] {
        const alen = a.length;
        const out:number[] = new Array(alen);
        let v = 0;
        for (let i=a.length-1;i>=0;i--) {
            v *= 0x10000;
            v += a.charCodeAt(i);
            out[i] = Math.floor(v / b);
            v %= b;
        }
        // shrinkZero(values);
        return [String.fromCharCode(...out), v];
    }
    export function muln(a:string, b:number):string {
        let v = 0;
        const n = a.length;
        const out:number[] = new Array(n);
        for (let i=0;i<n;i++) {
            v += a.charCodeAt(i)*b;
            out[i] = v % 0x10000;
            v = Math.floor(v / 0x10000);
        }
        // while (v !== 0)
        // {
        //     out.push(v % 0x10000);
        //     v = Math.floor(v / 0x10000);
        // }
        return String.fromCharCode(...out);
    }
    export function mul(a:string, b:string):string {
        const out:number[] = [];
        const alen = a.length;
        const blen = b.length;
        for (let j=0;j<blen;j++) {
            const bn = b.charCodeAt(j);
            for (let i=0;i<alen;i++) {
                add_with_offset(out, bin.muln(a, bn), j);
            }
        }
        return String.fromCharCode(...out);
    }
    export function bitand(a:string, b:string):string {
        const minlen = Math.min(a.length, b.length);
        const out = new Array(minlen);
        for (let i=0;i<minlen;i++) {
            out[i] = a.charCodeAt(i) & b.charCodeAt(i);
        }
        return String.fromCharCode(...out);
    }
    export function bitor(a:string, b:string):string {
        let minstr:string;
        let maxstr:string;
        if (a.length < b.length) {
            minstr = a;
            maxstr = b;
        } else {
            maxstr = a;
            minstr = b;
        }

        const minlen = minstr.length;
        const maxlen = maxstr.length;
        const out = new Array(maxlen);
        let i=0;
        for (;i<minlen;i++) {
            out[i] = maxstr.charCodeAt(i) | minstr.charCodeAt(i);
        }
        for (;i<maxlen;i++) {
            out[i] = maxstr.charCodeAt(i);
        }
        return String.fromCharCode(...out);
    }
    export function bitxor(a:string, b:string):string {
        let minstr:string;
        let maxstr:string;
        if (a.length < b.length) {
            minstr = a;
            maxstr = b;
        } else {
            maxstr = a;
            minstr = b;
        }

        const minlen = minstr.length;
        const maxlen = maxstr.length;
        const out = new Array(maxlen);
        let i=0;
        for (;i<minlen;i++) {
            out[i] = maxstr.charCodeAt(i) ^ minstr.charCodeAt(i);
        }
        for (;i<maxlen;i++) {
            out[i] = maxstr.charCodeAt(i);
        }
        return String.fromCharCode(...out);
    }
    /**
     * bitwise shift right
     */
    export function bitshr(a:string, shift:number):string {
        const len = a.length;
        const values:number[] = new Array(len);

        let srci = (shift+15) >> 4;
        shift -= (srci << 4) - 16;

        const ishift = 16 - shift;
        let dsti=0;
        let v = 0;
        if (srci !== 0) {
            v = a.charCodeAt(srci-1) >> shift;
        }
        while (srci<len) {
            const c = a.charCodeAt(srci++);
            v |= c << ishift;
            values[dsti++] = v;
            v <<= 16;
            v |= c >> shift;
        }
        while (dsti<len) {
            values[dsti++] = 0;
        }
        return String.fromCharCode(...values);
    }
    /**
     * bitwise shift right
     */
    export function bitshl(a:string, shift:number):string {
        const len = a.length;
        const values:number[] = new Array(len);

        let dsti = shift >> 4;
        shift &= 0xf;

        let srci=0;
        let v = 0;
        for (let i=0;i<dsti;i++) {
            values[i++] = 0;
        }
        while (dsti<len) {
            v |= a.charCodeAt(srci++) << shift;
            values[dsti++] = v;
            v >>= 16;
        }
        return String.fromCharCode(...values);
    }
    export function neg(a:string):string {
        const n = a.length;
        if (n === 0) return a;
        let carry = 0;

        const out = new Array(n);
        let i = 0;
        {
            const v = a.charCodeAt(0);
            out[i] = -v;
            carry = +(v === 0);
        }
        for (;i<n;i++) {
            carry = (~a.charCodeAt(i)) + carry;
            out[i] = carry & 0xffff;
            carry >>= 16;
        }
        return String.fromCharCode(...out);
    }
    export function reads32(str:string):number[] {
        const n = str.length;
        const dwords = n&~1;
        const outn = (n&1)+dwords;
        const out:number[] = new Array(outn);
        let i=0;
        for (;i<dwords;i++) {
            const i2 = i*2;
            out[i] = str.charCodeAt(i2) | (str.charCodeAt(i2+1) << 16);
        }
        if (dwords !== outn) {
            out[i] = str.charCodeAt(i*2);
        }
        return out;
    }
    /**
     * makes as hex bytes
     */
    export function hex(a:string):string {
        const out:number[] = [];
        function write(v:number):void {
            if (v < 10) {
                out.push(v+0x30);
            } else {
                out.push(v+(0x61-10));
            }
        }

        const n = a.length;
        for (let i=0;i<n;i++) {
            const v = a.charCodeAt(i);
            write((v >> 4) & 0xf);
            write(v & 0xf);
            write((v >> 12) & 0xf);
            write((v >> 8) & 0xf);
        }
        return String.fromCharCode(...out);
    }
    /**
     * similar with bin.hex(), but reversed byte by byte
     */
    export function reversedHex(a:string):string {
        const out:number[] = [];
        const write = (v:number):void=>{
            if (v < 10) {
                out.push(v+0x30);
            } else {
                out.push(v+(0x61-10));
            }
        };

        const n = a.length;
        for (let i=n-1;i>=0;i--) {
            const v = a.charCodeAt(i);
            write((v >> 12) & 0xf);
            write((v >> 8) & 0xf);
            write((v >> 4) & 0xf);
            write(v & 0xf);
        }
        return String.fromCharCode(...out);
    }
    export function as64(v:string):string {
        const n = v.length;
        if (n === 4) return v;
        if (n > 4) return v.substr(0, 4);
        return v+'\0'.repeat(4-n);
    }
    export function compare(a:string, b:string):number {
        const alen = a.length;
        const blen = b.length;

        let diff = alen - blen;
        if (diff < 0) {
            for (let i=alen; i!==blen;i++) {
                if (a.charCodeAt(i) === 0) continue;
                return 1;
            }
        } else if (diff > 0) {
            for (let i=blen; i!==alen;i++) {
                if (a.charCodeAt(i) === 0) continue;
                return -1;
            }
        }

        for (let i=blen-1;i>=0;i--) {
            diff = a.charCodeAt(i) - b.charCodeAt(i);
            if (diff !== 0) return diff;
        }
        return 0;
    }
    export const MAX_SAFE_INTEGER = makeVar(Number.MAX_SAFE_INTEGER);
}
