
import fs = require('fs');

export function memdiff(dst:number[]|Uint8Array, src:number[]|Uint8Array):number[] {
    const size = src.length;
    if (dst.length !== size) throw Error(`size unmatched(dst[${dst.length}] != src[${src.length}])`);

    const diff:number[] = [];
    let needEnd = false;

    for (let i = 0; i !== size; i++) {
        if (src[i] === dst[i]) {
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
export function memdiff_contains(larger:number[], smaller:number[]):boolean {
    let small_i = 0;
    const smaller_size = smaller.length;
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
    if (skip !== undefined) {
        if (memdiff_contains(skip, diff)) return null;
    }
    return diff;
}
export function hex(values:number[]|Uint8Array, nextLinePer?:number):string {
    const size = values.length;
    if (size === 0) return '';
    if (nextLinePer === undefined) nextLinePer = size;
    
    const out:number[] = [];
    for (let i=0;i<size;) {
        if (i !== 0 && (i % nextLinePer) === 0) out.push(10);
        
        const v = values[i++];
        const n1 = (v >> 4);
        if (n1 < 10) out.push(n1+0x30);
        else out.push(n1+(0x41-10));
        const n2 = (v & 0x0f);
        if (n2 < 10) out.push(n2+0x30);
        else out.push(n2+(0x41-10));
        out.push(0x20);
    }
    out.pop();
    return String.fromCharCode(...out);
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

export function isDirectory(file:string):boolean {
    try {
        return fs.statSync(file).isDirectory();
    } catch (err) {
        return false;
    }
}

export function isFile(filepath:string):boolean {
    try {
        return fs.statSync(filepath).isFile();
    } catch (err) {
        return false;
    }
}

export function isBaseOf<BASE>(t: unknown, base: { new(...args: any[]): BASE }): t is { new(...args: any[]): BASE } {
    if (typeof t !== 'function') return false;
    if (t === base) return true;
    return t.prototype instanceof base;
}

export function anyToString(v:unknown):string {
    const circular = new WeakSet<Record<string, any>>();

    let out = '';
    function writeArray(v:unknown[]):void {
        if (v.length === 0) {
            out += '[]';
            return;
        }
        out += '[ ';
        out += v[0];
        for (let i=1;i<v.length;i++) {
            out += ', ';
            write(v[i]);
        }
        out += '] ';
    }
    function writeObject(v:Record<string, any>|null):void {
        if (v === null) {
            out += 'null';
            return;
        }
        if (circular.has(v)) {
            out += '[Circular]';
            return;
        }
        circular.add(v);
        if (v instanceof Array) {
            writeArray(v);
        } else {
            const entires = Object.entries(v);
            if (entires.length === 0) {
                out += '{}';
                return;
            }
            out += '{ ';
            {
                const [name, value] = entires[0];
                out += name;
                out += ': ';
                write(value);
            }
            for (let i=1;i<entires.length;i++) {
                const [name, value] = entires[i];
                out += ', ';
                out += name;
                out += ': ';
                write(value);
            }
            out += ' }';
        }
    }
    function write(v:unknown):void {
        switch (typeof v) {
        case 'object':
            writeObject(v);
            break;
        case 'string':
            out += JSON.stringify(v);
            break;
        default:
            out += v;
            break;
        }
    }
    if (typeof v === 'object') {
        writeObject(v);
    } else {
        return v+'';
    }
    return out;
}
