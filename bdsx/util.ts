
import * as util from 'util';

export function memdiff(dst:(number|null)[]|Uint8Array, src:(number|null)[]|Uint8Array):number[] {
    const size = src.length;
    if (dst.length !== size) throw Error(`size unmatched(dst[${dst.length}] != src[${src.length}])`);

    const diff:number[] = [];
    let needEnd = false;

    for (let i = 0; i !== size; i++) {
        const srcv = src[i];
        const dstv = dst[i];
        if (srcv === dstv || srcv === null || dstv === null) {
            if (!needEnd) continue;
            diff.push(i);
            needEnd = false;
        } else {
            if (needEnd) continue;
            diff.push(i);
            needEnd = true;
        }
    }
    if (needEnd) diff.push(size);
    return diff;
}
export function memdiff_contains(larger:number[]|undefined|null, smaller:number[]):boolean {
    const smaller_size = smaller.length;
    if (larger == null) {
        return smaller_size === 0;
    }
    let small_i = 0;
    const larger_size = larger.length;
    if (larger_size === 0) {
        return smaller_size === 0;
    }
    for (let i=0;i<larger_size;) {
        const large_from = larger[i++];
        const large_to = larger[i++];

        for (;;) {
            if (small_i === smaller_size) return true;

            const small_from = smaller[small_i];
            if (small_from < large_from) return false;
            if (small_from > large_to) break;
            if (small_from === large_to) return false;

            const small_to = smaller[small_i+1];
            if (small_to > large_to) return false;
            if (small_to === large_to) {
                small_i += 2;
                break;
            }
            small_i += 2;
        }
    }
    return true;
}
export function memcheck(code:Uint8Array, originalCode:number[], skip?:number[]):number[]|null {
    const diff = memdiff(code, originalCode);
    if (skip != null) {
        if (memdiff_contains(skip, diff)) return null;
    }
    return diff;
}

export function hexn(value:number, hexcount:number):string {
    const out:number[] = new Array(hexcount);
    for (let i=hexcount-1;i>=0;i--) {
        const n = value & 0xf;
        value >>= 4;
        if (n < 10) out[i] = n+0x30;
        else out[i] = n+(0x41-10);
    }
    return String.fromCharCode(...out);
}
export function hex(values:(number|null)[]|Uint8Array, nextLinePer?:number):string {
    const size = values.length;
    if (size === 0) return '';
    if (nextLinePer == null) nextLinePer = size;

    const out:number[] = [];
    for (let i=0;i<size;) {
        if (i !== 0 && (i % nextLinePer) === 0) out.push(10);

        const v = values[i++];
        if (v === null) {
            out.push(0x3f); // '?'
            out.push(0x3f); // '?'
        } else {
            const n1 = (v >> 4);
            if (n1 < 10) out.push(n1+0x30);
            else out.push(n1+(0x41-10));
            const n2 = (v & 0x0f);
            if (n2 < 10) out.push(n2+0x30);
            else out.push(n2+(0x41-10));
        }
        out.push(0x20); // ' '
    }
    out.pop();

    const LIMIT = 1024; // it's succeeded with 1024*8 but used a less number for safety
    let offset = LIMIT;
    if (out.length <= LIMIT) {
        return String.fromCharCode(...out);
    }

    // split for stack space
    let outstr = '';
    do {
        outstr += String.fromCharCode(...out.slice(offset-1024, offset));
        offset += LIMIT;
    } while (offset < out.length);
    outstr += String.fromCharCode(...out.slice(offset-1024));
    return outstr;
}
export function unhex(hex:string):Uint8Array {
    const hexes = hex.split(/[ \t\r\n]+/g);
    const out = new Uint8Array(hexes.length);
    for (let i=0;i<hexes.length;i++) {
        out[i] = parseInt(hexes[i], 16);
    }
    return out;
}
export const _tickCallback:()=>void = (process as any)._tickCallback;

/**
 * @param lineIndex first line is zero
 */
export function indexOfLine(context:string, lineIndex:number, p:number = 0):number {
    for (;;) {
        if (lineIndex === 0) return p;

        const idx = context.indexOf('\n', p);
        if (idx === -1) return -1;
        p = idx + 1;
        lineIndex --;
    }
}
/**
 * removeLine("a \n b \n c", 1, 2) === "a \n c"
 * @param lineFrom first line is zero
 * @param lineTo first line is one
 */
export function removeLine(context:string, lineFrom:number, lineTo:number):string {
    const idx = indexOfLine(context, lineFrom);
    if (idx === -1) return context;
    const next = indexOfLine(context, lineTo-lineFrom, idx);
    if (next === -1) return context.substr(0, idx-1);
    else return context.substr(0, idx)+context.substr(next);
}
/**
 * @param lineIndex first line is zero
 */
export function getLineAt(context:string, lineIndex:number):string {
    const idx = indexOfLine(context, lineIndex);
    if (idx === -1) return context;

    const next = context.indexOf('\n', idx);
    if (next === -1) return context.substr(idx);
    else return context.substring(idx, next);
}

export function isBaseOf<BASE extends { new(...args: any[]): any }>(t: unknown, base: BASE): t is BASE {
    if (typeof t !== 'function') return false;
    if (t === base) return true;
    return t.prototype instanceof base;
}

/**
 * @deprecated Use `util.inspect(v)` instead.
 */
export function anyToString(v:unknown):string {
    return util.inspect(v);
}

export function str2set(str:string):Set<number>{
    const out = new Set<number>();
    for (let i=0;i<str.length;i++) {
        out.add(str.charCodeAt(i));
    }
    return out;
}

export function arrayEquals(arr1:ArrayLike<any>, arr2:ArrayLike<any>, count?:number):boolean {
    if (count == null) {
        count = arr1.length;
        if (count !== arr2.length) return false;
    }
    for (let i=0;i<count;i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

export function assertDeepEquals(a:unknown, b:unknown):void {
    if (a === b) return;
    _failed:{
        if (typeof a !== 'object' || typeof b !== 'object') {
            break _failed;
        }
        if (a === null || b === null) {
            break _failed;
        }
        if (a.constructor !== b.constructor) {
            break _failed;
        }
        assertDeepEquals(Object.getPrototypeOf(a), Object.getPrototypeOf(b));
        for (const [key, value] of Object.entries(a)) {
            if (!(key in b)) {
                break _failed;
            }
            assertDeepEquals(value, (b as any)[key]);
        }
        for (const key of Object.keys(b)) {
            if (!(key in a)) {
                break _failed;
            }
        }
    }
    throw Error('assertion failed');
}

export function makeSignature(sig:string):number {
    if (sig.length > 4) throw Error('too long');
    let out = 0;
    for (let i=0;i<4;i++) {
        out += sig.charCodeAt(i) << (i*8);
    }
    return out;
}

export function checkPowOf2(n:number):void {
    let mask = n - 1;
    mask |= (mask >> 16);
    mask |= (mask >> 8);
    mask |= (mask >> 4);
    mask |= (mask >> 2);
    mask |= (mask >> 1);
    mask ++;
    if (mask !== n) throw Error(`${n} is not pow of 2`);
}

export function numberWithFillZero(n:number, width:number, radix?:number):string {
    const text = (n>>>0).toString(radix);
    if (text.length >= width) return text;
    return '0'.repeat(width-text.length)+text;
}

export function filterToIdentifierableString(name:string):string {
    name = name.replace(/[^a-zA-Z_$0-9]/g, '');
    try {
        eval(`((${name})=>{})`)(); // Rjlintkh suggestion
    } catch {
        return '_'+name;
    }
    return name;
}

export function printOnProgress(message:string):void {
    process.stdout.cursorTo(0);
    process.stdout.write(message);
    process.stdout.clearLine(1);
    console.log();
}

export function getEnumKeys<T extends Record<string, number|string>>(enumType:T):(keyof T)[] {
    const NUMBERIC = /^[1-9]\d*$/;
    return Object.keys(enumType).filter(v => typeof v === 'string' && v !== '0' && !NUMBERIC.test(v));
}

const ADDSLASHES_REPLACE_MAP:Record<string, string> = {
    __proto__:null as any,
    '\0':'\\0',
    '\r':'\\r',
    '\n':'\\n',
    '"':'\\"',
    "'":"\\'",
    "\\":"\\\\",
};
const STRIPSLASHES_REPLACE_MAP:Record<string, string> = {
    __proto__:null as any,
    '\\':'\\',
    'n':'\n',
    'r':'\r',
    'b':'\b',
    'v':'\v',
    'f':'\f',
    't':'\t',
    '"':'"',
    "'":"'",
    '0':'\0',
};
export function addSlashes(str:string):string {
    return str.replace(/[\r\n"'\\]/g, chr=>ADDSLASHES_REPLACE_MAP[chr]);
}

export function stripSlashes(str:string):string {
    return str.replace(/(?:\\([\\nrbvft"'0])|\\u([0-9]{4})|\\x([0-9]{2}))/g, (matched, escape, xcode, ucode)=>{
        if (xcode != null) {
            return String.fromCharCode(parseInt(xcode, 16));
        } else if (ucode != null) {
            return String.fromCharCode(parseInt(ucode, 16));
        } else {
            return STRIPSLASHES_REPLACE_MAP[escape];
        }
    });
}

export function hashString(v:string):number {
    const n = v.length;
    let out = 0;
    let shift = 0;
    for (let i=0;i<n;i++) {
        const chr = (v.charCodeAt(i) + i) | 0;
        out = (out + ((chr << shift) | (chr >>> (32-shift)))) | 0;
        shift = (shift + 7) & 0x1f;
    }
    out = (out + n) | 0;
    return out >>> 0;
}

export function timeout(timeout:number):Promise<void> {
    return new Promise(resolve=>{
        setTimeout(resolve, timeout);
    });
}

export const ESCAPE = "§";

export const TextFormat = {
    BLACK: ESCAPE + "0",
    DARK_BLUE: ESCAPE + "1",
    DARK_GREEN: ESCAPE + "2",
    DARK_AQUA: ESCAPE + "3",
    DARK_RED: ESCAPE + "4",
    DARK_PURPLE: ESCAPE + "5",
    GOLD: ESCAPE + "6",
    GRAY: ESCAPE + "7",
    DARK_GRAY : ESCAPE + "8",
    BLUE: ESCAPE + "9",
    GREEN: ESCAPE + "a",
    AQUA: ESCAPE + "b",
    RED: ESCAPE + "c",
    LIGHT_PURPLE: ESCAPE + "d",
    YELLOW: ESCAPE + "e",
    WHITE: ESCAPE + "f",
    RESET: ESCAPE + "r",
    OBFUSCATED: ESCAPE + "k",
    BOLD: ESCAPE + "l",
    STRIKETHROUGH: ESCAPE + "m",
    UNDERLINE: ESCAPE + "n",
    ITALIC: ESCAPE + "o",
    THIN: ESCAPE + "¶",
} as const;
