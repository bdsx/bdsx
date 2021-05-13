import { asm, AsmMultiplyConstant, JumpOperation, OperationSize, Operator, Register } from "./assembler";
import { NativePointer, VoidPointer } from "./core";
import { bin64_t } from "./nativetype";
import { hex, unhex } from "./util";
import colors = require('colors');


interface OffsetInfo {
    offset:OperationSize|null;
    r1:Register;
    r2:Register;
}
function readConstNumber(size:OperationSize, ptr:NativePointer):number {
    switch (size) {
    case OperationSize.byte:
        return ptr.readInt8();
    case OperationSize.word:
        return ptr.readInt16();
    case OperationSize.dword:
        return ptr.readInt32();
    default:
        throw Error(`Unexpected operation size: ${size}`);
    }
}
function readConst(size:OperationSize, ptr:NativePointer):number|bin64_t {
    switch (size) {
    case OperationSize.void:
        return 0;
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
function walk_offset(rex:number, ptr:NativePointer):OffsetInfo|null {
    const v = ptr.readUint8();
    const r1 = (v & 0x7) | ((rex & 1) << 3);
    const r2 = ((v >> 3) & 0x7) | ((rex & 4) << 1);

    if ((v & 0xc0) !== 0xc0) {
        if (r1 === Register.rsp && ptr.readUint8() !== 0x24) {
            return null;
        }
    }
    if ((v & 0xc0) === 0) {
        if (r1 === Register.rbp) {
            return {
                offset: OperationSize.dword,
                r1:Register.rip,
                r2
            };
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
        offset: OperationSize.void,
        r1,
        r2,
    };
}
function walk_oper_r_c(oper:Operator, register:Register, chr:number, size:OperationSize):asm.Operation {
    return new asm.Operation(asm.code[`${Operator[oper]}_r_c`], [register, chr, size]);
}
function walk_oper_rp_c(oper:Operator, register:Register, multiply:AsmMultiplyConstant, offset:number, chr:number, size:OperationSize):asm.Operation {
    return new asm.Operation(asm.code[`${Operator[oper]}_rp_c`], [register, multiply, offset, chr, size]);
}
function walk_ojmp(jumpoper:JumpOperation, offset:number):asm.Operation {
    return new asm.Operation(asm.code[`${JumpOperation[jumpoper]}_c`], [offset]);
}
function walk_addr_oper(opername:string, dwordBit:number, readBit:number, info:OffsetInfo, size:OperationSize, ptr:NativePointer, isFloat:boolean):asm.Operation {
    const sig = isFloat ? 'f' : 'r';
    if (dwordBit === 0) size = OperationSize.byte;
    if (readBit){ // reverse
        if (info.offset === null){ // mov_r_r
            return new asm.Operation(asm.code[`${opername}_${sig}_${sig}`], [info.r2, info.r1, size]);
        } else {
            const offset = readConst(info.offset, ptr);
            return new asm.Operation(asm.code[`${opername}_${sig}_rp`], [info.r2, info.r1, 1, offset, size]);
        }
    } else {
        if (info.offset === null){ // mov_r_r
            return new asm.Operation(asm.code[`${opername}_${sig}_${sig}`], [info.r1, info.r2, size]);
        } else {
            const offset = readConst(info.offset, ptr);
            return new asm.Operation(asm.code[`${opername}_rp_${sig}`], [info.r1, 1, offset, info.r2, size]);
        }
    }
}

function walk_raw(ptr:NativePointer):asm.Operation|null {
    let rex = 0x40;
    let wordoper = false;
    let rexSetted = false;
    let size:OperationSize = OperationSize.dword;
    let foperSize:OperationSize = OperationSize.void;
    for (;;) {
        const v = ptr.readUint8();
        if (rexSetted && (v & 0xf8) === 0xb8) { // movabs
            return new asm.Operation(asm.code.movabs_r_c, [((rex&1) << 3) | (v&7), readConst(size, ptr)]);
        } else if ((v & 0xfe) === 0xf2) { // rep
            if (ptr.getUint8() === 0x0f) { // double or float operation
                foperSize = ((v & 1) !== 0) ? OperationSize.dword : OperationSize.qword;
                continue;
            } else { // rep
                if ((v & 1) !== 0) {
                    return new asm.Operation(asm.code.repz, []);
                } else {
                    return new asm.Operation(asm.code.repnz, []);
                }
            }
        } else if (v === 0x63) {
            const info = walk_offset(rex, ptr);
            if (info === null) {
                // bad
            } else {
                return walk_addr_oper('movsxd', 1, 0, info, size, ptr, false);
            }
        } else if (v === 0x65) {
            return new asm.Operation(asm.code.gs, []);
        } else if (v === 0x64) {
            return new asm.Operation(asm.code.fs, []);
        } else if (v === 0x2e) {
            return new asm.Operation(asm.code.cs, []);
        } else if (v === 0x26) {
            return new asm.Operation(asm.code.es, []);
        } else if (v === 0x36) {
            return new asm.Operation(asm.code.ss, []);
        } else if ((v&0xf2) === 0x40){ // rex
            rex = v;
            rexSetted = true;
            if (rex & 0x08) {
                size = OperationSize.qword;
            }
            continue;
        } else if (v === 0x66){ // data16
            wordoper = true;
            size = OperationSize.word;
            continue;
        } else if (v === 0x98) {
            if (wordoper) return new asm.Operation(asm.code.cbw, []);
            if (size === OperationSize.qword) return new asm.Operation(asm.code.cdqe, []);
            return new asm.Operation(asm.code.cwde, []);
        } else if (v === 0x90) { // nop
            return new asm.Operation(asm.code.nop, []);
        } else if (v === 0xcc) { // int3
            return new asm.Operation(asm.code.int3, []);
        } else if (v === 0xcd) { // int
            const code = ptr.readUint8();
            return new asm.Operation(asm.code.int_c, [code]);
        } else if (v === 0xc3) { // ret
            return new asm.Operation(asm.code.ret, []);
        } else if (v === 0xff) {
            const info = walk_offset(rex, ptr);
            if (info === null) {
                // bad
            } else {
                if (info.r2 === 4) {
                    if (info.offset === null) {
                        return new asm.Operation(asm.code.jmp_r, [info.r1]);
                    } else {
                        const offset = readConstNumber(info.offset, ptr);
                        return new asm.Operation(asm.code.jmp_rp, [info.r1, 1, offset]);
                    }
                } else if (info.r2 === 2) {
                    if (info.offset === null) {
                        return new asm.Operation(asm.code.call_r, [info.r1]);
                    } else {
                        const offset = readConstNumber(info.offset, ptr);
                        return new asm.Operation(asm.code.call_rp, [info.r1, 1, offset]);
                    }
                } else {
                    // bad
                }
            }
        } else if ((v & 0xc0) === 0x00){ // operation
            if ((v&6) === 6) {
                if (v === 0x0f) { // 0x0f
                    const v2 = ptr.readUint8();
                    if ((v2 & 0xf0) === 0x80) {
                        const jumpoper = v2 & 0xf;
                        const offset = ptr.readInt32();
                        return walk_ojmp(jumpoper, offset);
                    } else {
                        const info = walk_offset(rex, ptr);
                        if (info === null) { // xmm operations
                            // bad
                        } else if ((v2 & 0xfe) === 0x28) { // movaps read
                            if (foperSize === OperationSize.qword) {
                                // bad
                            } else if (foperSize === OperationSize.dword) {
                                // bad
                            } else { // packed
                                return walk_addr_oper('movaps', 1, (v2&1)^1, info, OperationSize.xmmword, ptr, true);
                            }
                        } else if ((v2 & 0xfe) === 0xbe) { // movsx
                            const wordbit = (v2&1);
                            const oper = walk_addr_oper('movsx', 1, 1, info, size, ptr, false);
                            oper.args.push(wordbit !== 0 ? OperationSize.word : OperationSize.byte);
                            return oper;
                        } else if ((v2 & 0xfe) === 0xb6) { // movzx
                            const wordbit = (v2&1);
                            const oper = walk_addr_oper('movzx', 1, 1, info, size, ptr, false);
                            oper.args.push(wordbit !== 0 ? OperationSize.word : OperationSize.byte);
                            return oper;
                        } else if ((v2 & 0xfe) === 0x10) { // read
                            const readbit = (v2&1)^1;
                            if (foperSize === OperationSize.qword) {
                                return walk_addr_oper('movsd', 1, readbit, info, OperationSize.qword, ptr, true);
                            } else if (foperSize === OperationSize.dword) {
                                return walk_addr_oper('movss', 1, readbit, info, OperationSize.dword, ptr, true);
                            } else { // packed
                                return walk_addr_oper('movups', 1, readbit, info, OperationSize.xmmword, ptr, true);
                            }
                        } else if (v2 === 0x5a) { // convert precision
                            if (foperSize === OperationSize.qword) {
                                return walk_addr_oper('cvtsd2ss', 1, 1, info, OperationSize.qword, ptr, true);
                            } else if (foperSize === OperationSize.dword) {
                                return walk_addr_oper('cvtsd2ss', 1, 1, info, OperationSize.dword, ptr, true);
                            } else {
                                if (wordoper) {
                                    return walk_addr_oper('cvtpd2ps', 1, 1, info, OperationSize.xmmword, ptr, true);
                                } else {
                                    return walk_addr_oper('cvtps2pd', 1, 1, info, OperationSize.xmmword, ptr, true);
                                }
                            }
                        } else if (v2 === 0x2c) { // truncated f2i
                            if (foperSize === OperationSize.qword) {
                                return walk_addr_oper('cvttsd2si', 1, 1, info, OperationSize.qword, ptr, true);
                            } else if (foperSize === OperationSize.dword) {
                                return walk_addr_oper('cvttss2si', 1, 1, info, OperationSize.qword, ptr, true);
                            } else {
                                if (wordoper) {
                                    return walk_addr_oper('cvttpd2pi', 1, 1, info, OperationSize.xmmword, ptr, true);
                                } else {
                                    return walk_addr_oper('cvttps2pi', 1, 1, info, OperationSize.xmmword, ptr, true);
                                }
                            }
                        } else if (v2 === 0x2d) { // f2i
                            if (foperSize === OperationSize.qword) {
                                return walk_addr_oper('cvtsd2si', 1, 1, info, OperationSize.qword, ptr, true);
                            } else if (foperSize === OperationSize.dword) {
                                return walk_addr_oper('cvtss2si', 1, 1, info, OperationSize.dword, ptr, true);
                            } else {
                                if (wordoper) {
                                    return walk_addr_oper('cvtpd2pi', 1, 1, info, OperationSize.xmmword, ptr, true);
                                } else {
                                    return walk_addr_oper('cvtps2pi', 1, 1, info, OperationSize.xmmword, ptr, true);
                                }
                            }
                        } else if (v2 === 0x2a) { // i2f
                            if (foperSize === OperationSize.qword) {
                                return walk_addr_oper('cvtsi2sd', 1, 1, info, size, ptr, true);
                            } else if (foperSize === OperationSize.dword) {
                                return walk_addr_oper('cvtsi2ss', 1, 1, info, size, ptr, true);
                            } else {
                                if (wordoper) {
                                    return walk_addr_oper('cvtpi2pd', 1, 1, info, OperationSize.mmword, ptr, true);
                                } else {
                                    return walk_addr_oper('cvtpi2ps', 1, 1, info, OperationSize.mmword, ptr, true);
                                }
                            }
                        }
                    }
                }
            } else {
                const oper = (v >> 3) & 7;
                if ((v & 0x04) !== 0) {
                    if ((v&1) === 0) size = OperationSize.byte;

                    const chr = ptr.readInt32();
                    return walk_oper_r_c(oper, Register.rax, chr, size);
                }
                const info = walk_offset(rex, ptr);
                if (info === null) break; // bad

                return walk_addr_oper(Operator[oper], v & 1, v & 2, info, size, ptr, false);
            }
        } else if ((v & 0xfe) === 0xe8) { // jmp or call dword
            const value = ptr.readInt32();
            if (v & 1) { // jmp
                return new asm.Operation(asm.code.jmp_c, [value]);
            } else { // call
                return new asm.Operation(asm.code.call_c, [value]);
            }
        } else if ((v & 0xf0) === 0x50){ // push or pop
            const reg = (v & 0x7)|((rex & 0x1) << 3);
            if (size === OperationSize.dword) size = OperationSize.qword;
            if (v & 0x08) return new asm.Operation(asm.code.pop_r, [reg, size]);
            else return new asm.Operation(asm.code.push_r, [reg, size]);
        } else if ((v & 0xfc) === 0x84) { // test or xchg
            const info = walk_offset(rex, ptr);
            if (info === null) break; // bad
            if ((v & 0x2) !== 0) { // xchg
                if (info.offset === null) {
                    return new asm.Operation(asm.code.xchg_r_r, [info.r1, info. r2, size]);
                } else {
                    const offset = readConstNumber(info.offset, ptr);
                    return new asm.Operation(asm.code.xchg_r_rp, [info.r1, info. r2, 1, offset, size]);
                }
            } else { // test
                if (info.offset === null) {
                    return new asm.Operation(asm.code.test_r_r, [info.r1, info. r2, size]);
                } else {
                    return new asm.Operation(asm.code.test_r_rp, [info.r1, info. r2, 1, info.offset, size]);
                }
            }
        } else if ((v & 0xfc) === 0x80) { // const operation
            const lowflag = v&3;
            if (lowflag === 2) break; // bad
            if (lowflag === 0) size = OperationSize.byte;
            let constsize = size === OperationSize.qword ? OperationSize.dword : size;
            if (lowflag === 3) constsize = OperationSize.byte;

            const info = walk_offset(rex, ptr);
            if (info === null) break; // bad

            if (info.offset === null) {
                const chr = readConstNumber(constsize, ptr);
                return walk_oper_r_c(info.r2 & 7, info.r1, chr, size);
            } else {
                const offset = readConstNumber(info.offset, ptr);
                const chr = readConstNumber(constsize, ptr);
                return walk_oper_rp_c(info.r2 & 7, info.r1, 1, offset, chr, size);
            }
        } else if ((v & 0xfe) === 0xc6){ // mov rp c
            const info = walk_offset(rex, ptr);
            if (info === null) break; // bad
            if (!(v & 0x01)) size = OperationSize.byte;
            if (info.offset === null) {
                const value = readConst(size, ptr);
                return new asm.Operation(asm.code.mov_r_c, [info.r1, value, size]);
            } else {
                const offset = readConst(info.offset, ptr);
                const value = readConst(size === OperationSize.qword ? OperationSize.dword : size, ptr);
                return new asm.Operation(asm.code.mov_rp_c, [info.r1, 1, offset, value, size]);
            }
        } else if ((v & 0xf8) === 0x88){ // mov variation
            if (v === 0xef) break; // bad

            const info = walk_offset(rex, ptr);
            if (info === null) break; // bad
            if (v === 0x8d){ // lea rp_c
                if (info.offset === null) break; // bad
                const offset = readConst(info.offset, ptr);
                return new asm.Operation(asm.code.lea_r_rp, [info.r2, info.r1, 1, offset, size]);
            }
            if (v & 0x04) size = OperationSize.word;
            return walk_addr_oper('mov', v & 1, v & 2, info, size, ptr, false);
        } else if ((v & 0xf0) === 0x70) {
            const jumpoper = v & 0xf;
            const offset = ptr.readInt8();
            return walk_ojmp(jumpoper, offset);
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
                console.error(colors.red('disasm.walk: Please send rua.kr this error'));
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
    export function check(hexstr:string|Uint8Array, quiet?:boolean):asm.Operations {
        const buffer = typeof hexstr === 'string' ? unhex(hexstr) : hexstr;
        const ptr = new NativePointer;
        ptr.setAddressFromBuffer(buffer);

        const opers:asm.Operation[] = [];
        if (!quiet) console.log();
        let oper:asm.Operation|null = null;
        let pos = 0;
        const size = buffer.length;
        while ((pos < size) && (oper = disasm.walk(ptr)) !== null) {
            const posend = pos + oper.size;
            if (!quiet) console.log(oper+'' + colors.gray(` // ${hex(buffer.subarray(pos, posend))}`));
            pos = posend;
            opers.push(oper);
        }

        return new asm.Operations(opers, pos);
    }
}
