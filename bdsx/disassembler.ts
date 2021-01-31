import { OperationSize, Operator, Register, X64Assembler } from "./assembler";
import { NativePointer, VoidPointer } from "./core";
import colors = require('colors');
import { hex } from "./util";
import { bin64_t } from "./nativetype";
import { bin } from "./bin";


function shex(v:number|bin64_t):string
{
    if (typeof v === 'string') return '0x'+bin.toString(v, 16);
    if (v < 0) return '-0x'+(-v).toString(16);
    else return '0x'+v.toString(16);
}
function shex_o(v:number|bin64_t):string
{
    if (typeof v === 'string') return '+0x'+bin.toString(v, 16);
    if (v < 0) return '-0x'+(-v).toString(16);
    else return '+0x'+v.toString(16);
}
function readConst(size:OperationSize, ptr:NativePointer):number|bin64_t
{
    switch (size)
    {
    case OperationSize.byte:
        return ptr.readInt8();
    case OperationSize.word:
        return ptr.readInt16();
    case OperationSize.dword:
        return ptr.readInt32();
    case OperationSize.qword:
        return ptr.readBin64();
    default:
        throw Error(`Unexpected operation size: ${size}`);
    }
}
function walk_offset(rex:number, ptr:NativePointer):{offset:OperationSize|null, r1:Register, r2:Register}|null
{
    const v = ptr.readUint8();
    const r1 = (v & 0x7) | ((rex & 1) << 3);
    const r2 = ((v >> 3) & 0x7) | ((rex & 4) << 1);

    if ((v & 0xc0) !== 0xc0)
    {
        if (r1 === Register.rsp && ptr.readUint8() !== 0x24)
        {
            return null;
        }
    }

    switch (v & 0xc0)
    {
    case 0x40:
        return {
            offset: OperationSize.byte, 
            r1,
            r2,
        };
    case 0x80:
        return {
            offset: OperationSize.dword, 
            r1,
            r2,
        };
    case 0xc0:
        return {
            offset: null, 
            r1,
            r2,
        };
    }
    return {
        offset: 0, 
        r1,
        r2,
    };
}
function walk_raw(ptr:NativePointer):disasm.Operation|null
{
    let rex = 0x40;
    let size:OperationSize = 0;
    for (;;)
    {
        const v = ptr.readUint8();
        if ((v&0xf6) === 0x40) // rex
        {
            rex = v;
            size = (rex & 0x08) ? OperationSize.qword : OperationSize.dword;
            continue;
        }
        if (v === 0x66) // data16
        {
            rex = v;
            size = OperationSize.word;
            continue;
        }
        else if ((v & 0xf0) === 0x50) // push or pop
        {
            const reg = (v & 0x7)|((rex & 0x1) << 3);
            if (v & 0x08) return [X64Assembler.prototype.pop_r, [reg]];
            else return [X64Assembler.prototype.push_r, [reg]];
        }
        else if ((v&0xfd) === 0x81) // operation
        {
            let constsize = (v&2) ? OperationSize.byte : OperationSize.dword;
            const info = walk_offset(rex, ptr);
            if (info === null) break;
            if (info.offset === null)
            {
                const chr = readConst(constsize, ptr);
                switch (info.r2 & 0x7)
                {
                    case Operator.add: return [X64Assembler.prototype.add_r_c, [info.r1, chr, size]];
                    case Operator.or: return [X64Assembler.prototype.or_r_c, [info.r1, chr, size]];
                    case Operator.adc: return [X64Assembler.prototype.adc_r_c, [info.r1, chr, size]];
                    case Operator.sbb: return [X64Assembler.prototype.sbb_r_c, [info.r1, chr, size]];
                    case Operator.and: return [X64Assembler.prototype.and_r_c, [info.r1, chr, size]];
                    case Operator.sub: return [X64Assembler.prototype.sub_r_c, [info.r1, chr, size]];
                    case Operator.xor: return [X64Assembler.prototype.xor_r_c, [info.r1, chr, size]];
                    case Operator.cmp: return [X64Assembler.prototype.cmp_r_c, [info.r1, chr, size]];
                }
            }
            else
            {
                const offset = readConst(info.offset, ptr);
                const chr = readConst(constsize, ptr);
                switch (info.r2 & 0x7)
                {
                    case Operator.add: return [X64Assembler.prototype.add_rp_c, [info.r1, offset, chr, size]];
                    case Operator.or: return [X64Assembler.prototype.or_rp_c, [info.r1, offset, chr, size]];
                    case Operator.adc: return [X64Assembler.prototype.adc_rp_c, [info.r1, offset, chr, size]];
                    case Operator.sbb: return [X64Assembler.prototype.sbb_rp_c, [info.r1, offset, chr, size]];
                    case Operator.and: return [X64Assembler.prototype.and_rp_c, [info.r1, offset, chr, size]];
                    case Operator.sub: return [X64Assembler.prototype.sub_rp_c, [info.r1, offset, chr, size]];
                    case Operator.xor: return [X64Assembler.prototype.xor_rp_c, [info.r1, offset, chr, size]];
                    case Operator.cmp: return [X64Assembler.prototype.cmp_rp_c, [info.r1, offset, chr, size]];
                }
            }
        }
        else if ((v&0xfe) === 0xc6) // mov rp c
        {
            const info = walk_offset(rex, ptr);
            if (info === null) break;
            if (!(v & 0x01)) size = OperationSize.byte;
            if (info.offset === null)
            {
                const value = readConst(size, ptr);
                return [X64Assembler.prototype.mov_r_c, [info.r1, value, size]];
            }
            else
            {
                const offset = readConst(info.offset, ptr);
                const value = readConst(size === OperationSize.qword ? OperationSize.dword : size, ptr);
                return [X64Assembler.prototype.mov_rp_c, [info.r1, offset, value, size]];
            }
        }
        else if ((v&0xf8) === 0x88) // mov variation
        {
            if (v === 0xef) break; // bad

            const info = walk_offset(rex, ptr);
            if (info === null) break;
            if (v === 0x8d) // lea rp_c
            {
                if (info.offset === null) break; // bad
                const offset = readConst(info.offset, ptr);
                return [X64Assembler.prototype.lea_r_rp, [info.r2, info.r1, offset, size]];
            }
            if (v & 0x04) size = OperationSize.word;
            else if (!(v & 0x01)) size = OperationSize.byte;
            if (v & 0x02) // reverse
            {
                if (info.offset === null) // mov_r_r
                {
                    return [X64Assembler.prototype.mov_r_r, [info.r2, info.r1, size]];
                }
                const offset = readConst(info.offset, ptr);
                return [X64Assembler.prototype.mov_r_rp, [info.r2, info.r1, offset, size]];
            }
            else
            {
                if (info.offset === null) // mov_r_r
                {
                    return [X64Assembler.prototype.mov_r_r, [info.r1, info.r2, size]];
                }
                const offset = readConst(info.offset, ptr);
                return [X64Assembler.prototype.mov_rp_r, [info.r1, offset, info.r2, size]];
            }
        }
        break;
    }
    return null;
}

export namespace disasm
{
    export type Operation = [(this:X64Assembler, ...args:any[])=>X64Assembler, any[]];
    export function stringify(oper:Operation):string
    {
        const [func, args] = oper;
        const name = func.name;
        const splited = name.split('_');
        let line = splited.shift()!;
        let i=0;
        for (const item of splited)
        {
            const v = args[i++];
            switch (item)
            {
            case 'r':
                line += ' ';
                line += Register[v];
                break;
            case 'c':
                line += ' ';
                line += shex(v);
                break;
            case 'rp':
                line += ' [';
                line += Register[v];
                line += shex_o(args[i++]);
                line += ']';
                break;
            }
            line += ',';
        }
        return line.substr(0, line.length-1);
    }
    export class Code
    {
        constructor(
            public readonly operations:Operation[], 
            public readonly size:number)
        {
        }

        toString():string
        {
            let out:string[] = [];
            for (const oper of this.operations)
            {
                out.push(stringify(oper));
            }
            return out.join('\n');
        }
    }
    export function walk(ptr:NativePointer):Operation|null
    {
        const low = ptr.getAddressLow();
        const high = ptr.getAddressHigh();
            
        const res = walk_raw(ptr);
        if (res !== null)
        {
            return res;
        }

        ptr.setAddress(low, high);
        let size = 16;
        while (size !== 0)
        {
            try
            {
                console.error(colors.red('disasm.walk: unimplemented opcode, failed'));
                console.error(colors.red('disasm.walk: Please tell rua.kr about it'));
                console.trace(colors.red(`undefined opcode: ${hex(ptr.getBuffer(size))}`));
                break;
            }
            catch (err)
            {
                size--;
            }
        }
        return null;
    }
    export function process(ptr:VoidPointer, size:number):Code
    {
        const operations:Operation[] = [];
        const nptr = new NativePointer(ptr);
        const end = nptr.add(size);
        let oper:Operation|null = null;
        while ((oper = disasm.walk(nptr)) !== null) {
            operations.push(oper);
            const diff = nptr.subptr(end);
            if (diff >= 0) return new Code(operations, diff + size);
        }
        return new Code(operations, nptr.subptr(end) + size);
    }
}
