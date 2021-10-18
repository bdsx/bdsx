"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disasm = void 0;
const assembler_1 = require("./assembler");
const core_1 = require("./core");
const util_1 = require("./util");
const colors = require("colors");
function readConstNumber(size, ptr) {
    switch (size) {
        case assembler_1.OperationSize.void:
            return 0;
        case assembler_1.OperationSize.byte:
            return ptr.readInt8();
        case assembler_1.OperationSize.word:
            return ptr.readInt16();
        case assembler_1.OperationSize.dword:
            return ptr.readInt32();
        default:
            throw Error(`Unexpected operation size: ${size}`);
    }
}
function readConst(size, ptr) {
    switch (size) {
        case assembler_1.OperationSize.void:
            return 0;
        case assembler_1.OperationSize.byte:
            return ptr.readInt8();
        case assembler_1.OperationSize.word:
            return ptr.readInt16();
        case assembler_1.OperationSize.dword:
            return ptr.readInt32();
        case assembler_1.OperationSize.qword:
            return ptr.readBin64();
        default:
            throw Error(`Unexpected operation size: ${size}`);
    }
}
function walk_offset(rex, ptr) {
    const v = ptr.readUint8();
    let r1 = (v & 0x7) | ((rex & 1) << 3);
    const r2 = ((v >> 3) & 0x7) | ((rex & 4) << 1);
    let r3 = null;
    let multiply = 1;
    if ((v & 0xc0) !== 0xc0) {
        if (r1 === assembler_1.Register.rsp) {
            const next = ptr.readUint8();
            if (next !== 0x24) {
                r1 = next & 0x7;
                r3 = (next >> 3) & 0x7;
                multiply = 1 << (next >> 6);
            }
        }
    }
    if ((v & 0xc0) === 0) {
        if (r1 === assembler_1.Register.rbp) {
            if (r3 !== null) {
                return {
                    offset: assembler_1.OperationSize.dword,
                    r1: r3,
                    r2,
                    r3: null,
                    multiply,
                };
            }
            else {
                return {
                    offset: assembler_1.OperationSize.dword,
                    r1: r3 !== null ? r1 : assembler_1.Register.rip,
                    r2,
                    r3,
                    multiply,
                };
            }
        }
    }
    switch (v & 0xc0) {
        case 0x40:
            return {
                offset: assembler_1.OperationSize.byte,
                r1,
                r2,
                r3,
                multiply,
            };
        case 0x80:
            return {
                offset: assembler_1.OperationSize.dword,
                r1,
                r2,
                r3,
                multiply,
            };
        case 0xc0:
            return {
                offset: null,
                r1,
                r2,
                r3,
                multiply,
            };
    }
    return {
        offset: assembler_1.OperationSize.void,
        r1,
        r2,
        r3,
        multiply,
    };
}
function walk_oper_r_c(oper, register, chr, size) {
    return new assembler_1.asm.Operation(assembler_1.asm.code[`${assembler_1.Operator[oper]}_r_c`], [register, chr, size]);
}
function walk_oper_rp_c(oper, register, multiply, offset, chr, size) {
    return new assembler_1.asm.Operation(assembler_1.asm.code[`${assembler_1.Operator[oper]}_rp_c`], [register, multiply, offset, chr, size]);
}
function walk_ojmp(jumpoper, offset) {
    return new assembler_1.asm.Operation(assembler_1.asm.code[`${assembler_1.JumpOperation[jumpoper]}_c`], [offset]);
}
function walk_addr_binary_oper(opername, dwordBit, readBit, info, size, ptr, isFloat) {
    const sig = isFloat ? 'f' : 'r';
    if (dwordBit === 0)
        size = assembler_1.OperationSize.byte;
    let name;
    let args;
    if (readBit !== 0) { // reverse
        if (info.offset === null) { // mov_r_r
            name = `${opername}_${sig}_${sig}`;
            args = [info.r2, info.r1];
        }
        else {
            const offset = readConst(info.offset, ptr);
            name = `${opername}_${sig}_rp`;
            args = [info.r2, info.r1, 1, offset];
        }
    }
    else {
        if (info.offset === null) { // mov_r_r
            name = `${opername}_${sig}_${sig}`;
            args = [info.r1, info.r2];
        }
        else {
            const offset = readConst(info.offset, ptr);
            name = `${opername}_rp_${sig}`;
            args = [info.r1, 1, offset, info.r2];
        }
    }
    if (size !== null)
        args.push(size);
    return new assembler_1.asm.Operation(assembler_1.asm.code[name], args);
}
function walk_addr_unary_oper(opername, dwordBit, info, size, ptr, isFloat) {
    const sig = isFloat ? 'f' : 'r';
    if (dwordBit === 0)
        size = assembler_1.OperationSize.byte;
    let name;
    let args;
    if (info.offset === null) { // mov_r_r
        name = `${opername}_${sig}`;
        args = [info.r1];
    }
    else {
        name = `${opername}_rp`;
        const offset = readConst(info.offset, ptr);
        args = [info.r1, 1, offset];
    }
    if (size !== null)
        args.push(size);
    return new assembler_1.asm.Operation(assembler_1.asm.code[name], args);
}
function walk_raw(ptr) {
    let rex = 0x40;
    let wordoper = false;
    let rexSetted = false;
    let size = assembler_1.OperationSize.dword;
    let foperSize = assembler_1.OperationSize.void;
    for (;;) {
        const v = ptr.readUint8();
        if (rexSetted && (v & 0xf8) === 0xb8) { // movabs
            return new assembler_1.asm.Operation(assembler_1.asm.code.movabs_r_c, [((rex & 1) << 3) | (v & 7), readConst(size, ptr)]);
        }
        else if ((v & 0xfe) === 0xf2) { // rep
            if (ptr.getUint8() === 0x0f) { // double or float operation
                foperSize = ((v & 1) !== 0) ? assembler_1.OperationSize.dword : assembler_1.OperationSize.qword;
                continue;
            }
            else { // rep
                if ((v & 1) !== 0) {
                    return new assembler_1.asm.Operation(assembler_1.asm.code.repz, []);
                }
                else {
                    return new assembler_1.asm.Operation(assembler_1.asm.code.repnz, []);
                }
            }
        }
        else if (v === 0x63) {
            const info = walk_offset(rex, ptr);
            if (info === null) {
                // bad
            }
            else {
                return walk_addr_binary_oper('movsxd', 1, 1, info, size, ptr, false);
            }
        }
        else if (v === 0x65) {
            return new assembler_1.asm.Operation(assembler_1.asm.code.gs, []);
        }
        else if (v === 0x64) {
            return new assembler_1.asm.Operation(assembler_1.asm.code.fs, []);
        }
        else if (v === 0x2e) {
            return new assembler_1.asm.Operation(assembler_1.asm.code.cs, []);
        }
        else if (v === 0x26) {
            return new assembler_1.asm.Operation(assembler_1.asm.code.es, []);
        }
        else if (v === 0x36) {
            return new assembler_1.asm.Operation(assembler_1.asm.code.ss, []);
        }
        else if ((v & 0xf2) === 0x40) { // rex
            rex = v;
            rexSetted = true;
            if (rex & 0x08) {
                size = assembler_1.OperationSize.qword;
            }
            continue;
        }
        else if (v === 0x66) { // data16
            wordoper = true;
            size = assembler_1.OperationSize.word;
            continue;
        }
        else if (v === 0x98) {
            if (wordoper)
                return new assembler_1.asm.Operation(assembler_1.asm.code.cbw, []);
            if (size === assembler_1.OperationSize.qword)
                return new assembler_1.asm.Operation(assembler_1.asm.code.cdqe, []);
            return new assembler_1.asm.Operation(assembler_1.asm.code.cwde, []);
        }
        else if (v === 0x90) { // nop
            return new assembler_1.asm.Operation(assembler_1.asm.code.nop, []);
        }
        else if (v === 0xcc) { // int3
            return new assembler_1.asm.Operation(assembler_1.asm.code.int3, []);
        }
        else if (v === 0xcd) { // int
            const code = ptr.readUint8();
            return new assembler_1.asm.Operation(assembler_1.asm.code.int_c, [code]);
        }
        else if (v === 0xc3) { // ret
            return new assembler_1.asm.Operation(assembler_1.asm.code.ret, []);
        }
        else if (v === 0xff) {
            const info = walk_offset(rex, ptr);
            if (info === null) {
                // bad
            }
            else {
                switch (info.r2) {
                    case assembler_1.FFOperation.inc:
                        return walk_addr_unary_oper('inc', 1, info, size, ptr, false);
                    case assembler_1.FFOperation.dec:
                        return walk_addr_unary_oper('dec', 1, info, size, ptr, false);
                    case assembler_1.FFOperation.call:
                        return walk_addr_unary_oper('call', 1, info, null, ptr, false);
                    case assembler_1.FFOperation.call_far: {
                        if (info.offset === null) {
                            break; // bad
                        }
                        const offset = readConst(info.offset, ptr);
                        const args = [info.r1, 1, offset];
                        if (size !== null)
                            args.push(size);
                        return new assembler_1.asm.Operation(assembler_1.asm.code.call_fp, args);
                    }
                    case assembler_1.FFOperation.jmp:
                        return walk_addr_unary_oper('jmp', 1, info, null, ptr, false);
                    case assembler_1.FFOperation.jmp_far: {
                        if (info.offset === null) {
                            break; // bad
                        }
                        const offset = readConst(info.offset, ptr);
                        const args = [info.r1, 1, offset];
                        if (size !== null)
                            args.push(size);
                        return new assembler_1.asm.Operation(assembler_1.asm.code.jmp_fp, args);
                    }
                    case assembler_1.FFOperation.push:
                        return walk_addr_unary_oper('push', 1, info, null, ptr, false);
                }
            }
        }
        else if ((v & 0xc0) === 0x00) { // operation
            if ((v & 6) === 6) {
                if (v === 0x0f) { // 0x0f
                    const v2 = ptr.readUint8();
                    if ((v2 & 0xf0) === 0x80) {
                        const jumpoper = v2 & 0xf;
                        const offset = ptr.readInt32();
                        return walk_ojmp(jumpoper, offset);
                    }
                    else if ((v2 & 0xf0) === 0x90) {
                        const jumpoper = v2 & 0xf;
                        const info = walk_offset(rex, ptr);
                        if (info === null) { // xmm operations
                            // bad
                        }
                        else {
                            const opername = 'set' + assembler_1.JumpOperation[jumpoper].substr(1);
                            return walk_addr_unary_oper(opername, 1, info, null, ptr, false);
                        }
                    }
                    else {
                        const info = walk_offset(rex, ptr);
                        if (info === null) { // xmm operations
                            // bad
                        }
                        else
                            switch (v2 & 0xfe) {
                                case 0x28: // movaps read
                                    if (foperSize === assembler_1.OperationSize.qword) {
                                        // bad
                                    }
                                    else if (foperSize === assembler_1.OperationSize.dword) {
                                        // bad
                                    }
                                    else { // packed
                                        return walk_addr_binary_oper('movaps', 1, (v2 & 1) ^ 1, info, assembler_1.OperationSize.xmmword, ptr, true);
                                    }
                                    break;
                                case 0xbe: { // movsx
                                    const wordbit = (v2 & 1);
                                    const oper = walk_addr_binary_oper('movsx', 1, 1, info, size, ptr, false);
                                    oper.args.push(wordbit !== 0 ? assembler_1.OperationSize.word : assembler_1.OperationSize.byte);
                                    return oper;
                                }
                                case 0xb6: { // movzx
                                    const wordbit = (v2 & 1);
                                    const oper = walk_addr_binary_oper('movzx', 1, 1, info, size, ptr, false);
                                    oper.args.push(wordbit !== 0 ? assembler_1.OperationSize.word : assembler_1.OperationSize.byte);
                                    return oper;
                                }
                                case 0x10: { // read
                                    const readbit = (v2 & 1) ^ 1;
                                    if (foperSize === assembler_1.OperationSize.qword) {
                                        return walk_addr_binary_oper('movsd', 1, readbit, info, assembler_1.OperationSize.qword, ptr, true);
                                    }
                                    else if (foperSize === assembler_1.OperationSize.dword) {
                                        return walk_addr_binary_oper('movss', 1, readbit, info, assembler_1.OperationSize.dword, ptr, true);
                                    }
                                    else { // packed
                                        return walk_addr_binary_oper('movups', 1, readbit, info, assembler_1.OperationSize.xmmword, ptr, true);
                                    }
                                }
                                default:
                                    if (v2 === 0x5a) { // convert precision
                                        if (foperSize === assembler_1.OperationSize.qword) {
                                            return walk_addr_binary_oper('cvtsd2ss', 1, 1, info, assembler_1.OperationSize.qword, ptr, true);
                                        }
                                        else if (foperSize === assembler_1.OperationSize.dword) {
                                            return walk_addr_binary_oper('cvtsd2ss', 1, 1, info, assembler_1.OperationSize.dword, ptr, true);
                                        }
                                        else {
                                            if (wordoper) {
                                                return walk_addr_binary_oper('cvtpd2ps', 1, 1, info, assembler_1.OperationSize.xmmword, ptr, true);
                                            }
                                            else {
                                                return walk_addr_binary_oper('cvtps2pd', 1, 1, info, assembler_1.OperationSize.xmmword, ptr, true);
                                            }
                                        }
                                    }
                                    else if (v2 === 0x2c) { // truncated f2i
                                        if (foperSize === assembler_1.OperationSize.qword) {
                                            return walk_addr_binary_oper('cvttsd2si', 1, 1, info, assembler_1.OperationSize.qword, ptr, true);
                                        }
                                        else if (foperSize === assembler_1.OperationSize.dword) {
                                            return walk_addr_binary_oper('cvttss2si', 1, 1, info, assembler_1.OperationSize.qword, ptr, true);
                                        }
                                        else {
                                            if (wordoper) {
                                                return walk_addr_binary_oper('cvttpd2pi', 1, 1, info, assembler_1.OperationSize.xmmword, ptr, true);
                                            }
                                            else {
                                                return walk_addr_binary_oper('cvttps2pi', 1, 1, info, assembler_1.OperationSize.xmmword, ptr, true);
                                            }
                                        }
                                    }
                                    else if (v2 === 0x2d) { // f2i
                                        if (foperSize === assembler_1.OperationSize.qword) {
                                            return walk_addr_binary_oper('cvtsd2si', 1, 1, info, assembler_1.OperationSize.qword, ptr, true);
                                        }
                                        else if (foperSize === assembler_1.OperationSize.dword) {
                                            return walk_addr_binary_oper('cvtss2si', 1, 1, info, assembler_1.OperationSize.dword, ptr, true);
                                        }
                                        else {
                                            if (wordoper) {
                                                return walk_addr_binary_oper('cvtpd2pi', 1, 1, info, assembler_1.OperationSize.xmmword, ptr, true);
                                            }
                                            else {
                                                return walk_addr_binary_oper('cvtps2pi', 1, 1, info, assembler_1.OperationSize.xmmword, ptr, true);
                                            }
                                        }
                                    }
                                    else if (v2 === 0x2a) { // i2f
                                        if (foperSize === assembler_1.OperationSize.qword) {
                                            return walk_addr_binary_oper('cvtsi2sd', 1, 1, info, size, ptr, true);
                                        }
                                        else if (foperSize === assembler_1.OperationSize.dword) {
                                            return walk_addr_binary_oper('cvtsi2ss', 1, 1, info, size, ptr, true);
                                        }
                                        else {
                                            if (wordoper) {
                                                return walk_addr_binary_oper('cvtpi2pd', 1, 1, info, assembler_1.OperationSize.mmword, ptr, true);
                                            }
                                            else {
                                                return walk_addr_binary_oper('cvtpi2ps', 1, 1, info, assembler_1.OperationSize.mmword, ptr, true);
                                            }
                                        }
                                    }
                                    break;
                            }
                    }
                }
            }
            else {
                const oper = (v >> 3) & 7;
                if ((v & 0x04) !== 0) {
                    if ((v & 1) === 0)
                        size = assembler_1.OperationSize.byte;
                    const chr = ptr.readInt32();
                    return walk_oper_r_c(oper, assembler_1.Register.rax, chr, size);
                }
                const info = walk_offset(rex, ptr);
                if (info === null)
                    break; // bad
                return walk_addr_binary_oper(assembler_1.Operator[oper], v & 1, v & 2, info, size, ptr, false);
            }
        }
        else if ((v & 0xfe) === 0xe8) { // jmp or call dword
            const value = ptr.readInt32();
            if (v & 1) { // jmp
                return new assembler_1.asm.Operation(assembler_1.asm.code.jmp_c, [value]);
            }
            else { // call
                return new assembler_1.asm.Operation(assembler_1.asm.code.call_c, [value]);
            }
        }
        else if ((v & 0xf0) === 0x50) { // push or pop
            const reg = (v & 0x7) | ((rex & 0x1) << 3);
            if (size === assembler_1.OperationSize.dword)
                size = assembler_1.OperationSize.qword;
            if (v & 0x08)
                return new assembler_1.asm.Operation(assembler_1.asm.code.pop_r, [reg, size]);
            else
                return new assembler_1.asm.Operation(assembler_1.asm.code.push_r, [reg, size]);
        }
        else if ((v & 0xf0) === 0xb0) { // mov r c
            const isDword = (v & 0x8) !== 0;
            const reg = (v & 0x7) | ((rex & 1) << 3);
            const value = isDword ? ptr.readUint32() : ptr.readUint8();
            return new assembler_1.asm.Operation(assembler_1.asm.code.mov_r_c, [reg, value, isDword ? assembler_1.OperationSize.dword : assembler_1.OperationSize.byte]);
        }
        else if ((v & 0xfc) === 0x84) { // test or xchg
            const info = walk_offset(rex, ptr);
            if (info === null)
                break; // bad
            if ((v & 0x2) !== 0) { // xchg
                if (info.offset === null) {
                    return new assembler_1.asm.Operation(assembler_1.asm.code.xchg_r_r, [info.r1, info.r2, size]);
                }
                else {
                    const offset = readConstNumber(info.offset, ptr);
                    return new assembler_1.asm.Operation(assembler_1.asm.code.xchg_r_rp, [info.r1, info.r2, 1, offset, size]);
                }
            }
            else { // test
                if (info.offset === null) {
                    return new assembler_1.asm.Operation(assembler_1.asm.code.test_r_r, [info.r1, info.r2, size]);
                }
                else {
                    const offset = readConstNumber(info.offset, ptr);
                    return new assembler_1.asm.Operation(assembler_1.asm.code.test_r_rp, [info.r1, info.r2, 1, offset, size]);
                }
            }
        }
        else if ((v & 0xfc) === 0x80) { // const operation
            const lowflag = v & 3;
            if (lowflag === 2)
                break; // bad
            if (lowflag === 0)
                size = assembler_1.OperationSize.byte;
            let constsize = size === assembler_1.OperationSize.qword ? assembler_1.OperationSize.dword : size;
            if (lowflag === 3)
                constsize = assembler_1.OperationSize.byte;
            const info = walk_offset(rex, ptr);
            if (info === null)
                break; // bad
            if (info.offset === null) {
                const chr = readConstNumber(constsize, ptr);
                return walk_oper_r_c(info.r2 & 7, info.r1, chr, size);
            }
            else {
                const offset = readConstNumber(info.offset, ptr);
                const chr = readConstNumber(constsize, ptr);
                return walk_oper_rp_c(info.r2 & 7, info.r1, 1, offset, chr, size);
            }
        }
        else if ((v & 0xfe) === 0xc6) { // mov rp c
            const info = walk_offset(rex, ptr);
            if (info === null)
                break; // bad
            if (!(v & 0x01))
                size = assembler_1.OperationSize.byte;
            if (info.offset === null) {
                const value = readConst(size, ptr);
                return new assembler_1.asm.Operation(assembler_1.asm.code.mov_r_c, [info.r1, value, size]);
            }
            else {
                const offset = readConst(info.offset, ptr);
                const value = readConst(size === assembler_1.OperationSize.qword ? assembler_1.OperationSize.dword : size, ptr);
                return new assembler_1.asm.Operation(assembler_1.asm.code.mov_rp_c, [info.r1, 1, offset, value, size]);
            }
        }
        else if ((v & 0xf8) === 0x88) { // mov variation
            if (v === 0xef)
                break; // bad
            const info = walk_offset(rex, ptr);
            if (info === null)
                break; // bad
            if (v === 0x8d) { // lea
                if (info.offset === null)
                    break; // bad
                const offset = readConst(info.offset, ptr);
                if (info.r3 !== null) {
                    return new assembler_1.asm.Operation(assembler_1.asm.code.lea_r_rrp, [info.r2, info.r1, info.r3, info.multiply, offset, size]);
                }
                else {
                    return new assembler_1.asm.Operation(assembler_1.asm.code.lea_r_rp, [info.r2, info.r1, info.multiply, offset, size]);
                }
            }
            if (v & 0x04)
                size = assembler_1.OperationSize.word;
            return walk_addr_binary_oper('mov', v & 1, v & 2, info, size, ptr, false);
        }
        else if ((v & 0xf0) === 0x70) {
            const jumpoper = v & 0xf;
            const offset = ptr.readInt8();
            return walk_ojmp(jumpoper, offset);
        }
        break;
    }
    return null;
}
var disasm;
(function (disasm) {
    function walk(ptr, opts) {
        const low = ptr.getAddressLow();
        const high = ptr.getAddressHigh();
        function getMovedDistance() {
            return (ptr.getAddressHigh() - high) * 0x100000000 + (ptr.getAddressLow() - low);
        }
        const res = walk_raw(ptr);
        if (res !== null) {
            res.size = getMovedDistance();
            return res;
        }
        if (opts == null)
            opts = {};
        ptr.setAddress(low, high);
        if (opts.fallback != null) {
            let res = opts.fallback(ptr);
            if (res === null) {
                // fail
                ptr.setAddress(low, high);
            }
            else {
                if (typeof res === 'object') {
                    // size from the ptr distance
                    res.size = getMovedDistance();
                }
                else {
                    const size = res == null ? getMovedDistance() : res;
                    ptr.setAddress(low, high);
                    const buffer = ptr.readBuffer(size);
                    res = new assembler_1.asm.Operation(assembler_1.asm.code.writeBuffer, [buffer]);
                    res.size = size;
                }
                return res;
            }
        }
        let size = 16;
        let opcode = '';
        while (size !== 0) {
            try {
                opcode = (0, util_1.hex)(ptr.getBuffer(size));
                break;
            }
            catch (err) {
                // access violation
                size--;
            }
        }
        if (!opts.quiet) {
            console.error(colors.red('disasm.walk: unimplemented opcode, failed'));
            console.error(colors.red('disasm.walk: Please send rua.kr this error'));
            console.trace(colors.red(`opcode: ${opcode || '[failed to read]'}`));
        }
        return null;
    }
    disasm.walk = walk;
    function process(ptr, size, opts) {
        const operations = [];
        const nptr = ptr.as(core_1.NativePointer);
        let oper = null;
        let ressize = 0;
        while ((ressize < size) && (oper = disasm.walk(nptr, opts)) !== null) {
            operations.push(oper);
            ressize += oper.size;
        }
        return new assembler_1.asm.Operations(operations, ressize);
    }
    disasm.process = process;
    /**
     * @param opts it's a quiet option if it's boolean,
     */
    function check(hexstr, opts) {
        const buffer = typeof hexstr === 'string' ? (0, util_1.unhex)(hexstr) : hexstr;
        const ptr = new core_1.NativePointer;
        ptr.setAddressFromBuffer(buffer);
        let quiet;
        if (typeof opts === 'boolean') {
            quiet = opts;
            opts = {
                quiet: opts
            };
        }
        else {
            quiet = !!(opts && opts.quiet);
        }
        const opers = [];
        if (!quiet)
            console.log();
        let oper = null;
        let pos = 0;
        const size = buffer.length;
        while ((pos < size) && (oper = disasm.walk(ptr, opts)) !== null) {
            const posend = pos + oper.size;
            if (!quiet)
                console.log(oper + '' + colors.gray(` // ${(0, util_1.hex)(buffer.subarray(pos, posend))}`));
            pos = posend;
            opers.push(oper);
        }
        return new assembler_1.asm.Operations(opers, pos);
    }
    disasm.check = check;
})(disasm = exports.disasm || (exports.disasm = {}));
//# sourceMappingURL=disassembler.js.map