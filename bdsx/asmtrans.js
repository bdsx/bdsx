"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X64OpcodeTransporter = void 0;
const assembler_1 = require("./assembler");
const FREE_REGS = [
    assembler_1.Register.rax,
    assembler_1.Register.r10,
    assembler_1.Register.r11,
];
class X64OpcodeTransporter extends assembler_1.X64Assembler {
    constructor(origin, codesize) {
        super(new Uint8Array(32), 0);
        this.origin = origin;
        this.codesize = codesize;
        this.freeregs = new Set(FREE_REGS);
        this.inpos = 0;
    }
    getUnusing() {
        for (const r of this.freeregs.values()) {
            return r;
        }
        return null;
    }
    asmFromOrigin(oper) {
        const splits = oper.splits;
        const basename = splits[0];
        let ripDependedParam = null;
        const params = oper.parameters();
        for (const info of params) {
            switch (info.type) {
                case 'r':
                    this.freeregs.delete(info.register);
                    break;
                case 'rp':
                case 'fp':
                    this.freeregs.delete(info.register);
                    if (info.register === assembler_1.Register.rip) {
                        ripDependedParam = info;
                    }
                    break;
                case 'rrp':
                    this.freeregs.delete(info.register);
                    this.freeregs.delete(info.register2);
                    break;
            }
        }
        if ((basename.startsWith('j') || basename === 'call') && splits.length === 2 && splits[1] === 'c') {
            // jump
            const offset = this.inpos + oper.args[0] + oper.size;
            if (offset < 0 || offset > this.codesize) {
                const tmpreg = this.getUnusing();
                if (tmpreg === null)
                    throw Error(`Not enough free registers`);
                const jmp_r = assembler_1.asm.code[`${basename}_r`];
                if (jmp_r != null) {
                    this.mov_r_c(tmpreg, this.origin.add(offset));
                    jmp_r.call(this, tmpreg);
                }
                else {
                    const reversed = oper.reverseJump();
                    this[`${reversed}_label`]('!');
                    this.jmp64(this.origin.add(offset), tmpreg);
                    this.close_label('!');
                }
                this.inpos += oper.size;
                return;
            }
            else {
                // TOFIX: remap offset if the code size is changed when rewriting.
            }
        }
        else {
            if (ripDependedParam !== null) {
                const tmpreg = this.getUnusing();
                if (tmpreg === null)
                    throw Error(`Not enough free registers`);
                oper.args[ripDependedParam.argi] = tmpreg;
                oper.args[ripDependedParam.argi + 2] = 0;
                this.mov_r_c(tmpreg, this.origin.add(this.inpos + oper.size + ripDependedParam.offset));
                this[oper.splits.join('_')](...oper.args);
                this.inpos += oper.size;
                return;
            }
        }
        oper.code.apply(this, oper.args);
        this.inpos += oper.size;
    }
    moveCode(codes, key, required) {
        let ended = false;
        for (const oper of codes.operations) {
            const basename = oper.splits[0];
            if (ended) {
                if (oper.code === assembler_1.asm.code.nop || oper.code === assembler_1.asm.code.int3) {
                    continue;
                }
                throw Error(`Failed to hook ${String(key)}, Too small area to patch, require=${required}, actual=${this.inpos}`);
            }
            if (basename === 'ret' || basename === 'jmp' || basename === 'call') {
                ended = true;
            }
            this.asmFromOrigin(oper);
        }
    }
    end() {
        const tmpreg = this.getUnusing();
        const originend = this.origin.add(this.codesize);
        if (tmpreg != null)
            this.jmp64(originend, tmpreg);
        else
            this.jmp64_notemp(originend);
    }
}
exports.X64OpcodeTransporter = X64OpcodeTransporter;
//# sourceMappingURL=asmtrans.js.map