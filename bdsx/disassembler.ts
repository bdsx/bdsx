import { asm, JumpOperation, OperationSize, Operator, Register } from "./assembler";
import { NativePointer, VoidPointer } from "./core";
import { bin64_t } from "./nativetype";
import { hex } from "./util";
import colors = require('colors');

function readConst(size:OperationSize, ptr:NativePointer):number|bin64_t {
    switch (size) {
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
function walk_offset(rex:number, ptr:NativePointer):{offset:OperationSize|null, r1:Register, r2:Register}|null {
    const v = ptr.readUint8();
    const r1 = (v & 0x7) | ((rex & 1) << 3);
    const r2 = ((v >> 3) & 0x7) | ((rex & 4) << 1);

    if ((v & 0xc0) !== 0xc0) {
        if (r1 === Register.rsp && ptr.readUint8() !== 0x24) {
            return null;
        }
    }

    switch (v & 0xc0) {
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
function walk_raw(ptr:NativePointer):asm.Operation|null {
    let rex = 0x40;
    let size:OperationSize = 0;
    for (;;) {
        const v = ptr.readUint8();
        if ((v&0xf2) === 0x40){ // rex
            rex = v;
            size = (rex & 0x08) ? OperationSize.qword : OperationSize.dword;
            size = (rex & 0x08) ? OperationSize.qword : OperationSize.dword;
            continue;
        }
        if (v === 0x66){ // data16
            rex = v;
            size = OperationSize.word;
            continue;
        } else if ((v & 0xf0) === 0x50){ // push or pop
            const reg = (v & 0x7)|((rex & 0x1) << 3);
            if (v & 0x08) return new asm.Operation(asm.code.pop_r, [reg]);
            else return new asm.Operation(asm.code.push_r, [reg]);
        } else if ((v & 0xfd) === 0x81){ // operation
            const constsize = (v&2) ? OperationSize.byte : OperationSize.dword;
            const info = walk_offset(rex, ptr);
            if (info === null) break;
            if (info.offset === null) {
                const chr = readConst(constsize, ptr);
                switch (info.r2 & 0x7) {
                case Operator.add: return new asm.Operation(asm.code.add_r_c, [info.r1, chr, size]);
                case Operator.or: return new asm.Operation(asm.code.or_r_c, [info.r1, chr, size]);
                case Operator.adc: return new asm.Operation(asm.code.adc_r_c, [info.r1, chr, size]);
                case Operator.sbb: return new asm.Operation(asm.code.sbb_r_c, [info.r1, chr, size]);
                case Operator.and: return new asm.Operation(asm.code.and_r_c, [info.r1, chr, size]);
                case Operator.sub: return new asm.Operation(asm.code.sub_r_c, [info.r1, chr, size]);
                case Operator.xor: return new asm.Operation(asm.code.xor_r_c, [info.r1, chr, size]);
                case Operator.cmp: return new asm.Operation(asm.code.cmp_r_c, [info.r1, chr, size]);
                }
            } else {
                const offset = readConst(info.offset, ptr);
                const chr = readConst(constsize, ptr);
                switch (info.r2 & 0x7) {
                case Operator.add: return new asm.Operation(asm.code.add_rp_c, [info.r1, offset, chr, size]);
                case Operator.or: return new asm.Operation(asm.code.or_rp_c, [info.r1, offset, chr, size]);
                case Operator.adc: return new asm.Operation(asm.code.adc_rp_c, [info.r1, offset, chr, size]);
                case Operator.sbb: return new asm.Operation(asm.code.sbb_rp_c, [info.r1, offset, chr, size]);
                case Operator.and: return new asm.Operation(asm.code.and_rp_c, [info.r1, offset, chr, size]);
                case Operator.sub: return new asm.Operation(asm.code.sub_rp_c, [info.r1, offset, chr, size]);
                case Operator.xor: return new asm.Operation(asm.code.xor_rp_c, [info.r1, offset, chr, size]);
                case Operator.cmp: return new asm.Operation(asm.code.cmp_rp_c, [info.r1, offset, chr, size]);
                }
            }
        } else if ((v & 0xfe) === 0xc6){ // mov rp c
            const info = walk_offset(rex, ptr);
            if (info === null) break;
            if (!(v & 0x01)) size = OperationSize.byte;
            if (info.offset === null) {
                const value = readConst(size, ptr);
                return new asm.Operation(asm.code.mov_r_c, [info.r1, value, size]);
            } else {
                const offset = readConst(info.offset, ptr);
                const value = readConst(size === OperationSize.qword ? OperationSize.dword : size, ptr);
                return new asm.Operation(asm.code.mov_rp_c, [info.r1, offset, value, size]);
            }
        } else if ((v & 0xf8) === 0x88){ // mov variation
            if (v === 0xef) break; // bad

            const info = walk_offset(rex, ptr);
            if (info === null) break; // bad
            if (v === 0x8d){ // lea rp_c
                if (info.offset === null) break; // bad
                const offset = readConst(info.offset, ptr);
                return new asm.Operation(asm.code.lea_r_rp, [info.r2, info.r1, offset, size]);
            }
            if (v & 0x04) size = OperationSize.word;
            else if (!(v & 0x01)) size = OperationSize.byte;
            if (v & 0x02){ // reverse
                if (info.offset === null){ // mov_r_r
                    return new asm.Operation(asm.code.mov_r_r, [info.r2, info.r1, size]);
                } else {
                    const offset = readConst(info.offset, ptr);
                    return new asm.Operation(asm.code.mov_r_rp, [info.r2, info.r1, offset, size]);
                }
            } else {
                if (info.offset === null){ // mov_r_r
                    return new asm.Operation(asm.code.mov_r_r, [info.r1, info.r2, size]);
                } else {
                    const offset = readConst(info.offset, ptr);
                    return new asm.Operation(asm.code.mov_rp_r, [info.r1, offset, info.r2, size]);
                }
            }
        } else if (v === 0x85) { // test
            const info = walk_offset(rex, ptr);
            if (info === null) break; // bad
            if (info.offset === null) {
                return new asm.Operation(asm.code.test_r_r, [info.r1, info. r2, size]);
            } else {
                return new asm.Operation(asm.code.test_r_rp, [info.r1, info. r2, info.offset, size]);
            }
        } else if (v === 0x0f || (v & 0xf0) === 0x70) { 
            let offset = 0;
            let jumpoper:JumpOperation;
            if (v === 0x0f) {
                const code = ptr.readUint8();
                if ((code & 0xf0) !== 0x80) break; // bad
                jumpoper = code & 0xf;
                offset = ptr.readInt32();
            } else {
                jumpoper = v & 0xf;
                offset = ptr.readInt8();
            }
            switch (jumpoper) {
            case JumpOperation.jo: return new asm.Operation(asm.code.jo_c, [offset]);
            case JumpOperation.jno: return new asm.Operation(asm.code.jno_c, [offset]);
            case JumpOperation.jb: return new asm.Operation(asm.code.jb_c, [offset]);
            case JumpOperation.jae: return new asm.Operation(asm.code.jae_c, [offset]);
            case JumpOperation.je: return new asm.Operation(asm.code.je_c, [offset]);
            case JumpOperation.jne: return new asm.Operation(asm.code.jne_c, [offset]);
            case JumpOperation.jbe: return new asm.Operation(asm.code.jbe_c, [offset]);
            case JumpOperation.ja: return new asm.Operation(asm.code.ja_c, [offset]);
            case JumpOperation.js: return new asm.Operation(asm.code.js_c, [offset]);
            case JumpOperation.jns: return new asm.Operation(asm.code.jns_c, [offset]);
            case JumpOperation.jp: return new asm.Operation(asm.code.jp_c, [offset]);
            case JumpOperation.jnp: return new asm.Operation(asm.code.jnp_c, [offset]);
            case JumpOperation.jl: return new asm.Operation(asm.code.jl_c, [offset]);
            case JumpOperation.jge: return new asm.Operation(asm.code.jge_c, [offset]);
            case JumpOperation.jle: return new asm.Operation(asm.code.jle_c, [offset]);
            case JumpOperation.jg: return new asm.Operation(asm.code.jg_c, [offset]);
            }
        }
        break;
    }
    return null;
}

export namespace disasm
{
    export function walk(ptr:NativePointer):asm.Operation|null {
        const low = ptr.getAddressLow();
        const high = ptr.getAddressHigh();
            
        const res = walk_raw(ptr);
        if (res !== null) {
            res.size = (ptr.getAddressHigh()-high)*0x100000000 + (ptr.getAddressLow()-low);
            return res;
        }

        ptr.setAddress(low, high);
        let size = 16;
        while (size !== 0) {
            try {
                console.error(colors.red('disasm.walk: unimplemented opcode, failed'));
                console.error(colors.red('disasm.walk: Please tell rua.kr about it'));
                console.trace(colors.red(`opcode: ${hex(ptr.getBuffer(size))}`));
                break;
            } catch (err) {
                size--;
            }
        }
        return null;
    }
    export function process(ptr:VoidPointer, size:number):asm.Operations {
        const operations:asm.Operation[] = [];
        const nptr = ptr.as(NativePointer);
        let oper:asm.Operation|null = null;
        let ressize = 0;
        while ((ressize < size) && (oper = disasm.walk(nptr)) !== null) {
            operations.push(oper);
            ressize += oper.size;
        }
        return new asm.Operations(operations, ressize);
    }
}
