import { asm, Register, X64Assembler } from "./assembler";
import { VoidPointer } from "./core";

const FREE_REGS:Register[] = [
    Register.rax,
    Register.r10,
    Register.r11,
];

export class X64OpcodeTransporter extends X64Assembler {

    constructor(public readonly origin:VoidPointer, public readonly codesize:number) {
        super(new Uint8Array(32), 0);
    }

    public readonly freeregs = new Set<Register>(FREE_REGS);
    public inpos = 0;

    getUnusing():Register|null{
        for (const r of this.freeregs.values()) {
            return r;
        }
        return null;
    }

    asmFromOrigin(oper:asm.Operation):void {
        const splits = oper.splits;
        const basename = splits[0];
        let ripDependedParam:asm.ParameterRegisterPointer|asm.ParameterRegisterRegisterPointer|asm.ParameterFarPointer|null = null;
        const params = oper.parameters();
        for (const info of params) {
            switch (info.type) {
            case 'r':
                this.freeregs.delete(info.register);
                break;
            case 'rp':
            case 'fp':
                this.freeregs.delete(info.register);
                if (info.register === Register.rip) {
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
                if (tmpreg === null) throw Error(`Not enough free registers`);
                const jmp_r = (asm.code as any)[`${basename}_r`];
                if (jmp_r != null) {
                    this.mov_r_c(tmpreg, this.origin.add(offset));
                    jmp_r.call(this, tmpreg);
                } else {
                    const reversed = oper.reverseJump();
                    (this as any)[`${reversed}_label`]('!');
                    this.jmp64(this.origin.add(offset), tmpreg);
                    this.close_label('!');
                }
                this.inpos += oper.size;
                return;
            } else {
                // TOFIX: remap offset if the code size is changed when rewriting.
            }
        } else {
            if (ripDependedParam !== null) {
                const tmpreg = this.getUnusing();
                if (tmpreg === null) throw Error(`Not enough free registers`);
                oper.args[ripDependedParam.argi] = tmpreg;
                oper.args[ripDependedParam.argi+2] = 0;
                this.mov_r_c(tmpreg, this.origin.add(this.inpos + oper.size + ripDependedParam.offset));
                (this as any)[oper.splits.join('_')](...oper.args);
                this.inpos += oper.size;
                return;
            }
        }
        oper.code.apply(this, oper.args);
        this.inpos += oper.size;
    }

    moveCode(codes:asm.Operations, key:keyof any, required:number):void {
        let ended = false;
        for (const oper of codes.operations) {
            const basename = oper.splits[0];
            if (ended) {
                if (oper.code === asm.code.nop || oper.code === asm.code.int3) {
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

    end():void {
        const tmpreg = this.getUnusing();
        const originend = this.origin.add(this.codesize);
        if (tmpreg != null) this.jmp64(originend, tmpreg);
        else this.jmp64_notemp(originend);
    }
}
