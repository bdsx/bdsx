import { bin } from "./bin";
import { BufferReader, BufferWriter } from "./writer/bufferstream";
import { bin64_t } from "./nativetype";
import { polynominal } from "./polynominal";
import { ParsingError, ParsingErrorContainer, SourcePosition, TextLineParser } from "./textparser";
import { getLineAt } from "./util";
import fs = require('fs');

export enum Register
{
    rip=-1,
    rax,
    rcx,
    rdx,
    rbx,
    rsp,
    rbp,
    rsi,
    rdi,
    r8,
    r9,
    r10,
    r11,
    r12,
    r13,
    r14,
    r15,
}

export enum FloatRegister
{
    xmm0,
    xmm1,
    xmm2,
    xmm3,
    xmm4,
    xmm5,
    xmm6,
    xmm7,
    xmm8,
    xmm9,
    xmm10,
    xmm11,
    xmm12,
    xmm13,
    xmm14,
    xmm15,
}

enum MovOper
{
    Register,
    Const,
    Read,
    Write,
    WriteConst,
    Lea,
}

enum FloatOper
{
    None,
    Convert_f2i,
    Convert_i2f,
    ConvertTruncated_f2i,
    ConvertPrecision,
}

export enum OperationSize
{
    void,
    byte,
    word,
    dword,
    qword,
    xmmword
}

const sizemap = new Map<string, {bytes: number, size:OperationSize}>([
    ['void', {bytes: 0, size: OperationSize.void} ],
    ['byte', {bytes: 1, size: OperationSize.byte} ],
    ['word', {bytes: 2, size: OperationSize.word} ],
    ['dword', {bytes: 4, size: OperationSize.dword} ],
    ['qword', {bytes: 8, size: OperationSize.qword} ],
    ['xmmword', {bytes: 16, size: OperationSize.xmmword} ],
]);

export enum Operator
{
    add,
    or,
    adc,
    sbb,
    and,
    sub,
    xor,
    cmp,
}

export enum JumpOperation
{
    jo,
    jno,
    jb,
    jae,
    je,
    jne,
    jbe,
    ja,
    js,
    jns,
    jp,
    jnp,
    jl,
    jge,
    jle,
    jg,
}

export interface Value64Castable
{
    [asm.splitTwo32Bits]():[number, number];
}

const INT8_MIN = -0x80;
const INT8_MAX = 0x7f;
const INT16_MAX = 0x7fff;
const INT32_MIN = -0x80000000;
const INT32_MAX = 0x7fffffff;
const COMMENT_REGEXP = /[;#]/;

export type Value64 = number|string|Value64Castable;

function split64bits(value:Value64):[number, number] {
    switch (typeof value) {
    case 'string': 
        return bin.int32_2(value);
    case 'object':
        return value[asm.splitTwo32Bits]();
    case 'number': {
        const lowbits = value|0;
        let highbits = ((value-lowbits)/ 0x100000000);
        highbits = highbits >= 0 ? Math.floor(highbits) : Math.ceil(highbits);
        return [lowbits, highbits];
    }
    default:
        throw Error(`invalid constant value: ${value}`);
    }
}

function is32Bits(value:Value64):boolean {
    switch (typeof value) {
    case 'string': {
        const [low, high] = bin.int32_2(value);
        return high === (low >> 31);
    }
    case 'object': {
        const [low, high] = value[asm.splitTwo32Bits]();
        return high === (low >> 31);
    }
    case 'number':
        return value === (value|0);
    default:
        throw Error(`invalid constant value: ${value}`);
    }
}

class SplitedJump {
    constructor(
        public info:JumpInfo,
        public label:Label,
        public args:any[],
        public pos:SourcePosition|null) {

    }
}

class AsmChunk extends BufferWriter {
    public prev:AsmChunk|null = null;
    public next:AsmChunk|null = null;
    public jump:SplitedJump|null = null;
    public readonly labels:Label[] = [];
    public readonly unresolved:UnresolvedConstant[] = [];
    
    constructor(array:Uint8Array, size:number) {
        super(array, size);
    }

    connect(next:AsmChunk):void {
        if (this.next !== null) throw Error('Already connected chunk');
        if (next.prev !== null) throw Error('Already connected chunk');
        this.next = next;
        next.prev = this;
    }

    removeNext():boolean {
        const chunk = this.next;
        if (chunk === null) return false;

        this.jump = chunk.jump;
        chunk.jump = null;
        
        for (const label of chunk.labels) {
            label.chunk = this;
            label.offset += this.size;
        }
        this.labels.push(...chunk.labels);
        for (const jump of chunk.unresolved) {
            jump.offset += this.size;
        }
        this.unresolved.push(...chunk.unresolved);
        this.write(chunk.buffer());

        const next = chunk.next;
        this.next = next;
        if (next !== null) next.prev = this;

        chunk.unresolved.length = 0;
        chunk.labels.length = 0;
        chunk.next = null;
        chunk.prev = null;
        return true;
    }

    resolveAll():void {
        for (const unresolved of this.unresolved) {
            const addr = unresolved.address;

            const size = unresolved.bytes;
            let offset = addr.offset - unresolved.offset - size;
            if (addr.chunk === MEMORY_INDICATE_CHUNK) {
                offset -= addr.chunk!.size;
            } else  if (addr.chunk === null) {
                throw new ParsingError(`${addr.name}: Label not found`, unresolved.pos);
            } else if (addr.chunk !== this) {
                throw Error('Different chunk. internal problem.');
            }

            const arr = this.array;
            let i = unresolved.offset;
            
            const to = i + size;
            for (;i!==to;i++) {
                arr[i] = offset;
                offset >>= 8;
            }
        }
        this.unresolved.length = 0;
    }
}

enum LabelType {
    Unknown,
    Label,
    Proc,
}

class Identifier {
    constructor(
        public name:string) {
    }
}

class Constant extends Identifier {
    constructor(name:string, public value:number) {
        super(name);
    }
}

class AddressIdentifier extends Identifier {
    constructor(
        name:string,
        public chunk:AsmChunk|null, 
        public offset:number) {
        super(name);
    }
}

class Label extends AddressIdentifier {
    public type:LabelType = LabelType.Unknown;
    constructor(name:string) {
        super(name, null, 0);
    }
}

class Defination extends AddressIdentifier {

    constructor(name:string, 
        chunk:AsmChunk|null, 
        offset:number,
        public size:OperationSize|undefined) {
        super(name, chunk, offset);
    }
}

class JumpInfo {
    constructor(
        public readonly byteSize:number,
        public readonly dwordSize:number,
        public readonly addrSize:number,
        public readonly func:(this:X64Assembler, ...args:any[])=>X64Assembler,
        public readonly func_addr:((this:X64Assembler, ...args:any[])=>X64Assembler)|null) {
    }
}

class UnresolvedConstant {
    constructor(
        public offset:number,
        public readonly bytes:number,
        public readonly address:AddressIdentifier,
        public readonly pos:SourcePosition|null) {
    }
}

interface TypeInfo {
    size:OperationSize;
    bytes:number;
    align:number;
    arraySize:number;
}

const SIZE_MAX_VAL:{[key in OperationSize]?:number|bin64_t}= {
    [OperationSize.byte]: INT8_MAX,
    [OperationSize.word]: INT16_MAX,
    [OperationSize.dword]: INT32_MAX,
    [OperationSize.qword]: bin.make64(INT32_MAX, -1),
    [OperationSize.qword]: bin.make64(INT32_MAX, -1),
};

const MEMORY_INDICATE_CHUNK = new AsmChunk(new Uint8Array(0), 0);

export class X64Assembler {

    private memoryChunkSize = 0;
    private constChunk:AsmChunk|null = null;
    private chunk:AsmChunk;
    private readonly ids = new Map<string, Identifier>();

    private pos:SourcePosition|null = null;

    private _polynominalToAddress(text:string, offset:number, lineNumber:number):[Register|null, Register|null, number] {
        let res = polynominal.parse(text, lineNumber, offset);
        for (const [name, value] of this.ids) {
            if (!(value instanceof Constant)) continue;
            res = res.defineVariable(name, value.value);
        }
        const poly = res.asAdditive();
        let varcount = 0;

        function error(message:string, column:number=0, width:number = text.length):never {
            throw new ParsingError(message, {
                column: offset + column, 
                width: width, 
                line: lineNumber
            });
        }

        const regs:(Register|null)[] = [];
        for (const term of poly.terms) {
            if (term.variables.length > 1) {
                error(`polynominal is too complex, variables are multiplying`);
            }
            const v = term.variables[0];
            if (!v.degree.equalsConstant(1)) error(`polynominal is too complex, degree is not 1`);
            if (!(v.term instanceof polynominal.Name)) error('polynominal is too complex, complex term');
            
            const type = regmap.get(v.term.name.toLowerCase());
            if (type) {
                const [argname, reg, size] = type;
                if (argname.short !== 'r') error(`unexpected identifier: ${v.term.name}`, v.term.column, v.term.length);
                if (size !== OperationSize.qword) error(`unexpected register: ${v.term.name}`);
                
                varcount ++;
                if (varcount >= 3) error(`polynominal has too many variables`);
    
                regs.push(reg);
            } else {
                const identifier = this.ids.get(v.term.name);
                if (!identifier) error(`identifier not found: ${v.term.name}`, v.term.column, v.term.length);
                error(`Invalid identifier: ${v.term.name}`, v.term.column, v.term.length);
            }
        }
        if (regs.length > 3) error('Too many registers');
        while (regs.length < 2) regs.push(null);
        return [regs[0], regs[1], poly.constant];
    }

    constructor(buffer:Uint8Array, size:number) {
        this.chunk = new AsmChunk(buffer, size);
    }

    connect(cb:(asm:X64Assembler)=>this):this {
        return cb(this);
    }

    write(...values:number[]):this {
        this.chunk.write(values);
        return this;
    }
    
    writeBuffer(buffer:number[]|Uint8Array):this {
        this.chunk.write(buffer);
        return this;
    }

    writeInt16(value:number):this {
        return this.write(
            value&0xff,
            (value>>>8)&0xff);
    }

    writeInt32(value:number):this {
        return this.write(
            value&0xff,
            (value>>>8)&0xff,
            (value>>>16)&0xff,
            (value>>>24));
    }

    labels():Record<string, number> {
        this._normalize();
        const labels:Record<string, number> = {};
        for (const [name, label] of this.ids) {
            if (label instanceof Label) {
                labels[name] = label.offset;
            }
        }
        return labels;
    }

    exports():Record<string, number> {
        this._normalize();
        const labels:Record<string, number> = {};
        for (const [name, label] of this.ids) {
            if (label instanceof Defination) {
                labels[name] = label.offset;
            }
        }
        return labels;
    }

    buffer():Uint8Array {
        this._normalize();
        return new Uint8Array(this.chunk.array, this.chunk.array.byteOffset, this.chunk.size);
    }

    ret(): this {
        return this.write(0xc3);
    }

    nop(): this {
        return this.write(0x90);
    }

    debugBreak():this {
        return this.int3();
    }

    int3():this {
        return this.write(0xcc);
    }

    int(n:number):this {
        if (n === 3) return this.int3();
        return this.write(0xcd, n & 0xff);
    }

    private _target(opcode:number, r1:Register|FloatRegister, r3:Register|null, offset:number, oper:MovOper):this {
        if (oper === MovOper.Register || oper === MovOper.Const) {
            if (offset !== 0) throw Error('Register operation with offset');
            return this.write(opcode | 0xc0);
        }
        if (offset !== (offset|0)) throw Error('need int32 offset');
        if (r3 !== null) {
            this.write(opcode | 0x04);
            if (r1 === Register.rsp) {
                throw Error('Invalid opcode');
            }
        } else if (r1 === Register.rsp) {
            this.write(0x24);
        }
        if (r1 === Register.rip) {
            this.write(opcode | 0x05);
            this.writeInt32(offset);
            return this;
        } else if (offset === 0 && r1 !== Register.rbp) {
            // empty
        } else if (INT8_MIN <= offset && offset <= INT8_MAX) {
            opcode |= 0x40;
        } else {
            opcode |= 0x80;
        }
        this.write(opcode | (r1 & 7));
            
        if (opcode & 0x40) this.write(offset);
        else if (opcode & 0x80) {
            this.writeInt32(offset);
        }
        return this;
    }

    private _regex(r1:Register|FloatRegister, r2:Register|FloatRegister, r3:Register|FloatRegister|null, size:OperationSize, qwordIsDefault:boolean = false):void {
        if (size === OperationSize.word) this.write(0x66);
    
        let rex = 0x40;
        if (size === OperationSize.qword) rex |= 0x08;
        if (r1 >= Register.r8) rex |= 0x01;
        if (r2 >= Register.r8) rex |= 0x04;
        if (r3 !== null && r3 >= Register.r8) rex |= 0x02;
        if (rex !== 0x40) this.write(rex);
    }

    private _const(v:Value64, size:OperationSize):this {
        const [low32, high32] = split64bits(v);
        if (size === OperationSize.byte) {
            this.write(low32 & 0xff);
        } else if (size === OperationSize.word) {
            this.writeInt16(low32 & 0xffff);
        } else if (size === OperationSize.qword) {
            this.writeInt32(low32);
            this.writeInt32(high32);
        } else {
            this.writeInt32(low32);
        }
        return this;
    }

    private _mov(
        r1:Register, r2:Register, r3:Register|null,
        offset:number, value:Value64, 
        oper:MovOper, size:OperationSize):this {
        this._regex(r1, r2, r3, size);
        let opcode = ((r2&7) << 3);

        if (size === OperationSize.byte) {
            if (oper === MovOper.WriteConst) {
                this.write(0xc6);
            } else if (oper === MovOper.Const) {
                opcode |= 0xb0;
            }
        } else {
            if (oper === MovOper.WriteConst) {
                this.write(0xc7);
            } else if (oper === MovOper.Const) {
                if (size === OperationSize.qword && is32Bits(value)) {
                    size = OperationSize.dword;
                    this.write(0xc7);
                    opcode |= 0xc0;
                } else {
                    opcode |= 0xb8;
                }
            }
        }

        if (oper !== MovOper.Const && oper !== MovOper.WriteConst) {
            if (oper === MovOper.Lea && size !== OperationSize.dword && size !== OperationSize.qword) {
                throw Error('Invalid operation');
            }
    
            let memorytype = 0x88;
            if (oper === MovOper.Lea) memorytype |= 0x05;
            else if (oper === MovOper.Read) memorytype |= 0x02;
            if (size !== OperationSize.byte) memorytype |= 0x01;
            this.write(memorytype);
        }
    
        if (oper === MovOper.Const) {
            this.write(opcode);
        } else {
            this._target(opcode, r1, r3, offset, oper);
        }
    
        if (oper === MovOper.WriteConst) {
            this._const(value, size === OperationSize.qword ? OperationSize.dword : size);
        } else if (oper === MovOper.Const) {
            this._const(value, size);
        }
        return this;
    }

    private _jmp(isCall:boolean, r:Register, offset:number, oper:MovOper):this {
        if (r >= Register.r8) this.write(0x41);
        this.write(0xff);
        this._target(isCall ? 0x10 : 0x20, r, null, offset, oper);
        return this;
    }

    private _jmp_r(isCall:boolean, r:Register):this {
        return this._jmp(isCall, r, 0, MovOper.Register);
    }

    private _jmp_o(oper:JumpOperation, offset:number):this {
        if (INT8_MIN <= offset && offset <= INT8_MAX) {
            return this.write(0x70 | oper, offset);
        } else {
            this.write(0x0f);
            this.write(0x80 | oper);
            this.writeInt32(offset);
        }
        return this;
    }

    def(name:string, size:OperationSize, bytes:number, align:number):this {
        if (this.chunk.prev !== null) throw Error("building asm cannot use def");
        const memSize = this.memoryChunkSize;
        const offset = align <= 1 ? memSize : ((memSize + bytes - 1) / align | 0) * align;
        this.memoryChunkSize = offset + bytes;
        if (name === '') return this;
        if (this.ids.has(name)) throw Error(`${name} is already defined`);
        this.ids.set(name, new Defination(name, MEMORY_INDICATE_CHUNK, offset, size));
        return this;
    }
    
    lea_r_rp(dest:Register, src:Register, offset:number, size = OperationSize.qword):this {
        if (offset === 0) return this.mov_r_r(dest, src, size);
        return this._mov(src, dest, null, offset, 0, MovOper.Lea, size);
    }

    lea_r_rrp(dest:Register, src1:Register, src2:Register, offset:number, size = OperationSize.qword):this {
        return this._mov(src1, dest, src2, offset, 0, MovOper.Lea, size);
    }

    /**
     * move register to register
     */
    mov_r_r(dest:Register, src:Register, size = OperationSize.qword):this {
        return this._mov(dest, src, null, 0, 0, MovOper.Register, size);
    }

    /**
     * move const to register
     */
    mov_r_c(dest:Register, value:Value64, size = OperationSize.qword):this {
        return this._mov(dest, 0, null, 0, value, MovOper.Const, size);
    }

    /**
     * move const to register pointer
     */
    mov_rp_c(dest:Register, offset:number, value:number, size = OperationSize.qword):this {
        return this._mov(dest, 0, null, offset, value, MovOper.WriteConst, size);
    }

    /**
     * move register to register pointer
     */
    mov_rp_r(dest:Register, offset:number, src:Register, size = OperationSize.qword):this {
        return this._mov(dest, src, null, offset, 0, MovOper.Write, size);
    }

    /**
     * move register pointer to register
     */
    mov_r_rp(dest:Register, src:Register, offset:number, size = OperationSize.qword):this {
        return this._mov(src, dest, null, offset, 0, MovOper.Read, size);
    }

    /**
     * move gs to register
     */
    mov_r_gs(register:Register, value:number):this {
        if (register >= Register.r8) throw Error('unsupported');
        return this.write(0x65, 0x48, 0x8b, 0x04 | (register<<3), 0x25, 
            value & 0xff, 
            (value >> 8) & 0xff, 
            (value >> 16) & 0xff, 
            (value >> 24) & 0xff);
    }

    /**
     * jump with register
     */
    jmp_r(register:Register):this {
        return this._jmp_r(false, register);
    }

    /**
     * call with register
     */
    call_r(register:Register):this {
        return this._jmp_r(true, register);
    }

    /**
     * jump with register pointer
     */
    jmp_rp(register:Register, offset:number):this {
        return this._jmp(false, register, offset, MovOper.Read);
    }

    /**
     * call with register pointer
     */
    call_rp(register:Register, offset:number):this {
        return this._jmp(true, register, offset, MovOper.Read);
    }

    /**
     * mov tmpreg, 64bits
     * call tmpreg
     */
    call64(value:Value64, tempRegister:Register):this {
        this.mov_r_c(tempRegister, value);
        this.call_r(tempRegister);
        return this;
    }

    /**
     * mov tmpreg, 64bits
     * jmp tmpreg
     */
    jmp64(value:Value64, tempRegister:Register):this {
        this.mov_r_c(tempRegister, value);
        this.jmp_r(tempRegister);
        return this;
    }

    /**
     * mov [rsp-4], high32(v)
     * mov [rsp-8],  low32(v)
     * jmp [rsp-8]
     */
    jmp64_notemp(value:Value64):this {
        const [low32, high32] = split64bits(value);
        this.mov_rp_c(Register.rsp, -8, low32, OperationSize.dword);
        this.mov_rp_c(Register.rsp, -4, high32, OperationSize.dword);
        this.jmp_rp(Register.rsp, -8);
        return this;
    }

    jmp_c(offset:number):this {
        if (INT8_MIN <= offset && offset <= INT8_MAX) {
            return this.write(0xeb, offset);
        } else {
            this.write(0xe9);
            this.writeInt32(offset);
            return this;
        }
    }

    call_c(offset:number):this {
        this.write(0xe8);
        this.writeInt32(offset);
        return this;
    }

    private _movaps(r1:FloatRegister|Register, r2:FloatRegister, oper:MovOper, offset:number):this {
        this._regex(r1, r2, null, OperationSize.dword);
        this.write(0x0f);
        let v = 0x28;
        if (oper === MovOper.Write) v |= 1;
        this.write(v);
        this._target(((r2&7) << 3), r1, null, offset, oper);
        return this;
    }

    movaps_f_f(dest:FloatRegister, src:FloatRegister):this {
        return this._movaps(src, dest, MovOper.Register, 0);
    }

    movaps_f_rp(dest:FloatRegister, src:FloatRegister, offset:number):this {
        return this._movaps(src, dest, MovOper.Read, offset);
    }
    
    movaps_rp_f(dest:FloatRegister, src:FloatRegister, offset:number):this {
        return this._movaps(dest, src, MovOper.Write, offset);
    }

    movdqa_rp_f(dest:Register, offset:number, src:FloatRegister):this {
        this.write(0x66, 0x0f, 0x7f);
        this._target((src&7) << 3, dest, null, offset, MovOper.Write);
        return this;
    }
    
    movdqa_f_rp(dest:FloatRegister, src:Register, offset:number):this {
        this.write(0x66, 0x0f, 0x7f);
        this._target((dest&7) << 3, src, null, offset, MovOper.Read);
        return this;
    }

    jz_c(offset:number):this { return this._jmp_o(JumpOperation.je, offset); }
    jnz_c(offset:number):this { return this._jmp_o(JumpOperation.jne, offset); }
    jo_c(offset:number):this { return this._jmp_o(JumpOperation.jo, offset); }
    jno_c(offset:number):this { return this._jmp_o(JumpOperation.jno, offset); }
    jb_c(offset:number):this { return this._jmp_o(JumpOperation.jb, offset); }
    jae_c(offset:number):this { return this._jmp_o(JumpOperation.jae, offset); }
    je_c(offset:number):this { return this._jmp_o(JumpOperation.je, offset); }
    jne_c(offset:number):this { return this._jmp_o(JumpOperation.jne, offset); }
    jbe_c(offset:number):this { return this._jmp_o(JumpOperation.jbe, offset); }
    ja_c(offset:number):this { return this._jmp_o(JumpOperation.ja, offset); }
    js_c(offset:number):this { return this._jmp_o(JumpOperation.js, offset); }
    jns_c(offset:number):this { return this._jmp_o(JumpOperation.jns, offset); }
    jp_c(offset:number):this { return this._jmp_o(JumpOperation.jp, offset); }
    jnp_c(offset:number):this { return this._jmp_o(JumpOperation.jnp, offset); }
    jl_c(offset:number):this { return this._jmp_o(JumpOperation.jl, offset); }
    jge_c(offset:number):this { return this._jmp_o(JumpOperation.jge, offset); }
    jle_c(offset:number):this { return this._jmp_o(JumpOperation.jle, offset); }
    jg_c(offset:number):this { return this._jmp_o(JumpOperation.jg, offset); }

    /**
     * push register
     */
    push_r(register:Register):this {
        if (register >= Register.r8) this.write(0x41);
        this.write(0x50 | (register & 7));
        return this;
    }
    /**
     * push const
     */
    push_c(value:number):this {
        if (value !== (value|0)) throw Error('need int32 integer');
        if (INT8_MIN <= value && value <= INT8_MAX) {
            this.write(0x6A);
            this.write(value);
        } else {
            this.write(0x68);
            this.writeInt32(value);
        }
        return this;
    }
    push_rp(r:Register, offset:number):this {
        if (r >= Register.r8) this.write(0x41);
        this.write(0xff);
        this._target(0x30, r, null, offset, MovOper.Write);
        return this;
    }
    pop_r(r:Register):this {
        if (r >= Register.r8) this.write(0x41);
        this.write(0x58 | (r&7));
        return this;
    }
    private _test(r1:Register, r2:Register, offset:number, size:OperationSize, oper:MovOper):this{
        this._regex(r1, r2, null, size);
        if (size === OperationSize.byte) this.write(0x84);
        else this.write(0x85);
        this._target(((r2&7)<<3), r1, null, offset, oper);
        return this;
    }

    test_r_r(r1:Register, r2:Register, size:OperationSize = OperationSize.qword):this {
        return this._test(r1, r2, 0, size, MovOper.Register);
    }
    
    test_r_rp(r1:Register, r2:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._test(r1, r2, offset, size, MovOper.Read);
    }

    private _xchg(r1:Register, r2:Register, offset:number, size:OperationSize, oper:MovOper):this{
        this._regex(r1, r2, null, size);
        if (size === OperationSize.byte) this.write(0x86);
        else this.write(0x87);
        this._target(((r2&7)<<3), r1, null, offset, oper);
        return this;
    }

    xchg_r_r(r1:Register, r2:Register, size:OperationSize = OperationSize.qword):this {
        return this._xchg(r1, r2, 0, size, MovOper.Register);
    }
    
    xchg_r_rp(r1:Register, r2:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._xchg(r1, r2, offset, size, MovOper.Read);
    }


    private _oper(movoper:MovOper, oper:Operator, dest:Register, src:Register, offset:number, chr:number, size:OperationSize):this {
        if (chr !== (chr|0)) throw Error('need 32bits integer');

        this._regex(dest, 0, null, size);

        let lowflag = size === OperationSize.byte ? 0 : 1;
        if (movoper === MovOper.Register) {
            this.write(lowflag | (oper << 3));
            this._target(((src&7) << 3), dest, null, offset, movoper);
        } else {
            const is8bits = (INT8_MIN <= chr && chr <= INT8_MAX);
            if (!is8bits && size === OperationSize.byte) throw Error('need 8bits integer');
            if (!is8bits && dest === Register.rax && movoper === MovOper.Const) {
                this.write(0x04 | lowflag | (oper << 3));
                this.writeInt32(chr);
            } else {
                if (is8bits) {
                    if (lowflag !== 0) lowflag = 3;
                }
                this.write(0x80 | lowflag);
                this._target((oper << 3), dest, null, offset, movoper);
                if (is8bits) this.write(chr);
                else this.writeInt32(chr);
            }
        }
        return this;
    }

    cmp_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.cmp, dest, src, 0, 0, size);
    }
    sub_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.sub, dest, src, 0, 0, size);
    }
    add_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.add, dest, src, 0, 0, size);
    }
    sbb_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.sbb, dest, src, 0, 0, size);
    }
    adc_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.adc, dest, src, 0, 0, size);
    }
    xor_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.xor, dest, src, 0, 0, size);
    }
    or_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.or, dest, src, 0, 0, size);
    }
    and_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.and, dest, src, 0, 0, size);
    }

    cmp_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.cmp, dest, 0, 0, chr, size);
    }
    sub_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.sub, dest, 0, 0, chr, size);
    }
    add_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.add, dest, 0, 0, chr, size);
    }
    sbb_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.sbb, dest, 0, 0, chr, size);
    }
    adc_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.adc, dest, 0, 0, chr, size);
    }
    xor_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.xor, dest, 0, 0, chr, size);
    }
    or_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.or, dest, 0, 0, chr, size);
    }
    and_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.and, dest, 0, 0, chr, size);
    }

    cmp_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.cmp, dest, 0, offset, chr, size);
    }
    sub_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.sub, dest, 0, offset, chr, size);
    }
    add_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.add, dest, 0, offset, chr, size);
    }
    sbb_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.sbb, dest, 0, offset, chr, size);
    }
    adc_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.adc, dest, 0, offset, chr, size);
    }
    xor_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.xor, dest, 0, offset, chr, size);
    }
    or_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.or, dest, 0, offset, chr, size);
    }
    and_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.and, dest, 0, offset, chr, size);
    }

    cmp_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.cmp, src, dest, offset, 0, size);
    }
    sub_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.sub, src, dest, offset, 0, size);
    }
    add_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.add, src, dest, offset, 0, size);
    }
    sbb_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.sbb, src, dest, offset, 0, size);
    }
    adc_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.adc, src, dest, offset, 0, size);
    }
    xor_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.xor, src, dest, offset, 0, size);
    }
    or_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.or, src, dest, offset, 0, size);
    }
    and_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.and, src, dest, offset, 0, size);
    }

    cmp_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.cmp, dest, src, offset, 0, size);
    }
    sub_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.sub, dest, src, offset, 0, size);
    }
    add_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.add, dest, src, offset, 0, size);
    }
    sbb_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.sbb, dest, src, offset, 0, size);
    }
    adc_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.adc, dest, src, offset, 0, size);
    }
    xor_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.xor, dest, src, offset, 0, size);
    }
    or_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.or, dest, src, offset, 0, size);
    }
    and_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.and, dest, src, offset, 0, size);
    }

    shr_r_c(dest:Register, chr:number, size = OperationSize.qword):this {
        this._regex(dest, 0, null, size);
        this.write(0xc1);
        this.write(0xe8 | dest);
        this.write(chr%128);
        return this;
    }
    shl_r_c(dest:Register, chr:number, size = OperationSize.qword):this {
        this._regex(dest, 0, null, size);
        this.write(0xc1);
        this.write(0xe0 | dest);
        this.write(chr%128);
        return this;
    }
    
    movsx_r_rp(dest:Register, src:Register, offset:number, size:OperationSize):this {
        this._regex(src, dest, null, OperationSize.qword);
        switch (size) {
        case OperationSize.byte:
            this.write(0x0f);
            this.write(0xbe);
            break;
        case OperationSize.word:
            this.write(0x0f);
            this.write(0xbf);
            break;
        case OperationSize.dword:
            this.write(0x63);
            break;
        default:
            throw Error(`Invalid operand size, ${OperationSize[size] || size}`);
        }
        return this._target(dest << 3, src, null, offset, MovOper.Read);
    }
    movsxd_r_rp(dest:Register, src:Register, offset:number):this {
        return this.movsx_r_rp(dest, src, offset, OperationSize.qword);
    }

    movzx_r_rp(dest:Register, src:Register, offset:number):this {
        this._regex(src, dest, null, OperationSize.qword);
        this.write(0x0f);
        this.write(0xb6);
        return this._target(dest << 3, src, null, offset, MovOper.Read);
    }

    private _movsf(r1:Register|FloatRegister, r2:Register|FloatRegister, offset:number, oper:MovOper, foper:FloatOper, size:OperationSize, doublePrecision:boolean):this {
        if (doublePrecision) this.write(0xf2);
        else this.write(0xf3);
        this._regex(r1, r2, null, size);
        this.write(0x0f);
        switch (foper) {
        case FloatOper.ConvertPrecision: this.write(0x5a); break;
        case FloatOper.ConvertTruncated_f2i: this.write(0x2c); break;
        case FloatOper.Convert_f2i: this.write(0x2d); break;
        case FloatOper.Convert_i2f: this.write(0x2a); break;
        default:
            if (oper === MovOper.Write) this.write(0x11);
            else this.write(0x10);
            break;
        }
        return this._target(r2 << 3, r1, null, offset, oper);
    }

    movsd_rp_r(dest:Register, offset:number, src:FloatRegister):this {
        return this._movsf(dest, src, offset, MovOper.Write, FloatOper.None, OperationSize.dword, true);
    }
    movsd_r_rp(dest:FloatRegister, src:Register, offset:number):this {
        return this._movsf(src, dest, offset, MovOper.Read, FloatOper.None, OperationSize.dword, true);
    }
    movsd_r_r(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, 0, MovOper.Register, FloatOper.None, OperationSize.dword, true);
    }

    movss_rp_r(dest:Register, offset:number, src:FloatRegister):this {
        return this._movsf(dest, src, offset, MovOper.Write, FloatOper.None, OperationSize.dword, false);
    }
    movss_r_rp(dest:FloatRegister, src:Register, offset:number):this {
        return this._movsf(src, dest, offset, MovOper.Read, FloatOper.None, OperationSize.dword, false);
    }
    movss_r_r(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, 0, MovOper.Register, FloatOper.None, OperationSize.dword, false);
    }

    cvtsi2sd_r_r(dest:FloatRegister, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, 0, MovOper.Register, FloatOper.Convert_i2f, size, true);
    }
    cvtsi2sd_r_rp(dest:FloatRegister, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, offset, MovOper.Read, FloatOper.Convert_i2f, size, true);
    }
    cvttsd2si_r_r(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, 0, MovOper.Register, FloatOper.ConvertTruncated_f2i, size, true);
    }
    cvttsd2si_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, offset, MovOper.Read, FloatOper.ConvertTruncated_f2i, size, true);
    }

    cvtsi2ss_r_r(dest:FloatRegister, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, 0, MovOper.Register, FloatOper.Convert_i2f, size, false);
    }
    cvtsi2ss_r_rp(dest:FloatRegister, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, offset, MovOper.Read, FloatOper.Convert_i2f, size, false);
    }
    cvttss2si_r_r(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, 0, MovOper.Register, FloatOper.ConvertTruncated_f2i, size, false);
    }
    cvttss2si_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, offset, MovOper.Read, FloatOper.ConvertTruncated_f2i, size, false);
    }

    cvtsd2ss_r_r(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, 0, MovOper.Register, FloatOper.ConvertPrecision, OperationSize.dword, true);
    }
    cvtsd2ss_r_rp(dest:FloatRegister, src:Register, offset:number):this {
        return this._movsf(src, dest, offset, MovOper.Read, FloatOper.ConvertPrecision, OperationSize.dword, true);
    }
    cvtss2sd_r_r(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, 0, MovOper.Register, FloatOper.ConvertPrecision, OperationSize.dword, false);
    }
    cvtss2sd_r_rp(dest:FloatRegister, src:Register, offset:number):this {
        return this._movsf(src, dest, offset, MovOper.Read, FloatOper.ConvertPrecision, OperationSize.dword, false);
    }

    label(labelName:string, type:LabelType = LabelType.Label):this {
        const label = this._getJumpTarget(labelName);
        if ((label instanceof Defination) || label.chunk !== null) {
            throw Error(`${labelName} is already defined`);
        }
        label.chunk = this.chunk;
        label.offset = this.chunk.size;
        label.type = type;
        this.chunk.labels.push(label);

        let now = this.chunk;
        let prev = now.prev!;

        while (prev !== null && prev.jump!.label === label) {
            this._resolveLabelSizeForward(prev, prev.jump!);
            now = prev;
            prev = now.prev!;
        }
        return this;
    }

    private _getJumpTarget(labelName:string):Label|Defination {
        const id = this.ids.get(labelName);
        if (id) {
            if (id instanceof Defination) {
                if (id.size !== OperationSize.qword) throw Error(`${labelName} size unmatched`);
                return id;
            }
            if (!(id instanceof Label)) throw Error(`${labelName} is not label`);
            return id;
        }
        const label = new Label(labelName);
        this.ids.set(labelName, label);
        return label;
    }

    jmp_label(labelName:string):this {
        const label = this._getJumpTarget(labelName);
        if (label instanceof Defination) {
            this.jmp_rp(Register.rip, 0);
            this._registerUnresolvedConstant(true, label);
            return this;
        }
        if (label.chunk === null) {
            return this._genChunk(X64Assembler.jmp_c_info, label, []);
        }
        this._resolveLabelSizeBackward(this.chunk, new SplitedJump(X64Assembler.jmp_c_info, label, [], this.pos));
        return this;
    }
    call_label(labelName:string):this {
        const label = this._getJumpTarget(labelName);
        if (label instanceof Defination) {
            this.jmp_rp(Register.rip, 0);
            this._registerUnresolvedConstant(true, label);
            return this;
        }
        if (label.chunk === null) {
            this.call_c(0);
            this._registerUnresolvedConstant(true, label);
            return this;
        }
        this._resolveLabelSizeBackward(this.chunk, new SplitedJump(X64Assembler.call_c_info, label, [], this.pos));
        return this;
    }
    private _jmp_o_label(oper:JumpOperation, labelName:string):this {
        const label = this._getJumpTarget(labelName);
        if (!(label instanceof Label)) throw Error(`Unexpected identifier ${labelName}`);
        if (label.chunk === null) {
            return this._genChunk(X64Assembler.jmp_o_info, label, [oper]);
        }
        this._resolveLabelSizeBackward(this.chunk, new SplitedJump(X64Assembler.jmp_o_info, label, [oper], this.pos));
        return this;
    }

    private _registerUnresolvedConstant(isDword:boolean, id:AddressIdentifier):void {
        const size = isDword ? 4 : 1;
        this.chunk.unresolved.push(new UnresolvedConstant(this.chunk.size-size, size, id, this.pos));
        this.pos = null;
    }

    private _resolveLabelSize(chunk:AsmChunk, jump:SplitedJump, dwordSize:boolean):void {
        if (dwordSize) {
            jump.info.func.call(this, ...jump.args, 0);
            chunk.unresolved.push(new UnresolvedConstant(chunk.size-1, 1, jump.label, jump.pos));
        } else {
            jump.info.func.call(this, ...jump.args, INT32_MAX);
            chunk.unresolved.push(new UnresolvedConstant(chunk.size-4, 4, jump.label, jump.pos));
        }
        chunk.removeNext();
        if (chunk.next === null) this.chunk = chunk;
    }

    private _resolveLabelSizeBackward(jumpChunk:AsmChunk, jump:SplitedJump, dwordSize:boolean|null = null):void {
        if (jump.label.chunk === jumpChunk) {
            if (this.chunk !== jumpChunk) throw Error('is not front chunk');
            let offset = jump.label.offset - jumpChunk.size;
            offset -= jump.info.byteSize;
            if (offset < INT8_MIN || offset > INT8_MAX) {
                offset = offset - jump.info.dwordSize + jump.info.byteSize;
            }
            jump.info.func.call(this, ...jump.args, offset);
            return;
        }

        if (dwordSize === null) {
            let offset = 0;
            offset -= jumpChunk.size;
            offset -= jump.info.dwordSize;
            let chunk = jumpChunk.prev;
            for (;;) {
                if (chunk === null) {
                    throw Error(`${jump.label.name}: failed to find label chunk`);
                }
                offset -= chunk.size;
                offset -= chunk.jump!.info.dwordSize;
                if (chunk === jump.label.chunk) {
                    offset += jump.label.offset;
                    break;
                }
                chunk = chunk.prev!;
            }
            dwordSize = (offset < INT8_MIN || offset > INT8_MAX);
        }
        
        this._resolveLabelSize(jumpChunk, jump, dwordSize);
    }

    private _resolveLabelSizeForward(jumpChunk:AsmChunk, jump:SplitedJump, dwordSize:boolean|null = null):void {
        if (jump.label.chunk === jumpChunk) throw Error(`cannot forward to self chunk`);

        const orichunk = this.chunk;
        this.chunk = jumpChunk;
        
        if (dwordSize === null) {
            let chunk = jumpChunk.next!;
            if (chunk === jump.label.chunk) {
                jump.info.func.call(this, ...jump.args, jump.label.offset);
                jumpChunk.removeNext();
                if (jumpChunk.next === null) this.chunk = jumpChunk;
                else this.chunk = orichunk;
                return;
            }

            let offset = 0;
            for (;;) {
                offset += chunk.size;
                offset += chunk.jump!.info.dwordSize;
                chunk = chunk.next!;
                if (chunk === jump.label.chunk) {
                    offset += jump.label.offset;
                    break;
                }
            }
            dwordSize = (offset < INT8_MIN || offset > INT8_MAX);
        }
        
        this._resolveLabelSize(jumpChunk, jump, dwordSize);
    }

    private _genChunk(info:JumpInfo, label:Label, args:any[]):this {
        let chunk = this.chunk;
        let totalsize = 0;
        for (;;) {
            const prev = chunk.prev;
            if (prev === null) break;
            totalsize += chunk.size + info.byteSize;
            chunk = prev;
            if (totalsize >= 127) {
                this._resolveLabelSizeForward(chunk, chunk.jump!, true);
                chunk.removeNext();
            }
        }
        chunk = this.chunk;
        chunk.jump = new SplitedJump(info, label, args, this.pos);
        this.pos = null;
        const nbuf = new AsmChunk(new Uint8Array(64), 0);
        chunk.next = nbuf;
        nbuf.prev = chunk;
        this.chunk = nbuf;
        return this;
    }

    private _normalize():this {
        const errors = new ParsingErrorContainer;
        let prev = this.chunk.prev;
        while (prev !== null) {
            const jump = prev.jump!;
            const label = jump.label;
            if (label.chunk === null) {
                errors.add(new ParsingError(`${label.name}: Identifier not found`, jump.pos));
            } else {
                this._resolveLabelSizeForward(prev, jump);
            }
            prev = prev.prev;
        }

        if (this.chunk.next !== null || this.chunk.prev !== null) {
            throw Error(`All chunks don't merge. internal problem.`);
        }

        let chunk = this.chunk;
        if (this.constChunk !== null) {
            this.constChunk.connect(chunk);
            chunk = this.constChunk;
            this.constChunk = null;
            chunk.removeNext();
        }
        
        this.chunk = chunk;
        try {
            this.chunk.resolveAll();
        } catch (err) {
            if (err instanceof ParsingError) {
                errors.add(err);
            } else {
                throw err;
            }
        }
        if (errors.error !== null) {
            throw errors.error;
        }
        return this;
    }

    jz_label(label:string):this { return this._jmp_o_label(JumpOperation.je, label); }
    jnz_label(label:string):this { return this._jmp_o_label(JumpOperation.jne, label); }
    jo_label(label:string):this { return this._jmp_o_label(JumpOperation.jo, label); }
    jno_label(label:string):this { return this._jmp_o_label(JumpOperation.jno, label); }
    jb_label(label:string):this { return this._jmp_o_label(JumpOperation.jb, label); }
    jae_label(label:string):this { return this._jmp_o_label(JumpOperation.jae, label); }
    je_label(label:string):this { return this._jmp_o_label(JumpOperation.je, label); }
    jne_label(label:string):this { return this._jmp_o_label(JumpOperation.jne, label); }
    jbe_label(label:string):this { return this._jmp_o_label(JumpOperation.jbe, label); }
    ja_label(label:string):this { return this._jmp_o_label(JumpOperation.ja, label); }
    js_label(label:string):this { return this._jmp_o_label(JumpOperation.js, label); }
    jns_label(label:string):this { return this._jmp_o_label(JumpOperation.jns, label); }
    jp_label(label:string):this { return this._jmp_o_label(JumpOperation.jp, label); }
    jnp_label(label:string):this { return this._jmp_o_label(JumpOperation.jnp, label); }
    jl_label(label:string):this { return this._jmp_o_label(JumpOperation.jl, label); }
    jge_label(label:string):this { return this._jmp_o_label(JumpOperation.jge, label); }
    jle_label(label:string):this { return this._jmp_o_label(JumpOperation.jle, label); }
    jg_label(label:string):this { return this._jmp_o_label(JumpOperation.jg, label); }

    proc(name:string):this {
        return this.label(name, LabelType.Proc);
    }

    endp():this {
        for (const [labelName, label] of this.ids) {
            if (!(label instanceof Label)) continue;
            switch (label.type) {
            case LabelType.Label:
                this.ids.delete(labelName);
                break;
            case LabelType.Unknown:
                label.type = LabelType.Proc;
                break;
            }
        }
        return this;
    }

    const(name:string, value:number):this {
        if (this.ids.has(name)) throw Error(`${name} is already defined`);
        this.ids.set(name, new Constant(name, value));
        return this;
    }

    compileLine(lineText:string, lineNumber:number):void {
        const commentIdx = lineText.search(COMMENT_REGEXP);
        const parser = new TextLineParser(commentIdx === -1 ? lineText : lineText.substr(0, commentIdx), lineNumber);

        function setSize(nsize:OperationSize|undefined):void {
            if (nsize === undefined) return;
            if (size === null) {
                size = nsize;
                return;
            }
            if (size !== nsize) {
                parser.error(`Operation size unmatched (${OperationSize[size]} != ${OperationSize[nsize]})`);
            }
        }

        function parseType(type:string):TypeInfo {

            let arraySize = 0;
            let brace = type.indexOf('[');
            let type_base = type;
            if (brace !== -1) {
                type_base = type_base.substr(0, brace).trim();
                brace++;
                const braceEnd = type.indexOf(']', brace);
                if (braceEnd === -1) parser.error(`brace end not found: '${type}'`);
                
                const braceInner = type.substring(brace, braceEnd).trim();
                const trails = type.substr(braceEnd+1).trim();
                if (trails !== '') parser.error(`Unexpected characters '${trails}'`);
                const res = polynominal.parseToNumber(braceInner);
                if (res === null) parser.error(`Unexpected array length '${braceInner}'`);
                arraySize = res!;
            }

            const size = sizemap.get(type_base);
            if (size === undefined) parser.error(`Unexpected type name '${type}'`);

            return {bytes: size!.bytes * Math.max(arraySize, 1), size:size!.size, align:size!.bytes, arraySize};
        }

        const command_base = parser.readToSpace();
        if (command_base === '') return;
        let command = command_base;
        const callinfo:string[] = [command_base];

        const totalIndex = parser.matchedIndex;
        let size:OperationSize|null = null;

        let unresolvedConstant:Identifier|null = null;
        let unresolvedPos:SourcePosition|null = null;

        const args:any[] = [];
        if (!parser.eof()){
            let extendingCommand = false;
            let addressCommand = false;
            let jumpCommand = false;
            if (command === 'const') {
                const name = parser.readToSpace();
                const value = parser.readToSpace();
                const valueNum = polynominal.parseToNumber(value);
                if (valueNum === null) parser.error(`Unexpected number syntax '${value}'`);
                try {
                    this.const(name, valueNum!);
                } catch (err) {
                    parser.error(err.message);
                }
                return;
            } else if (command === 'def') {
                const name = parser.readTo(':');
                const type = parser.readAll();
                const res = parseType(type);
                try {
                    this.def(name, res.size, res.bytes, res.align);
                } catch (err) {
                    parser.error(err.message);
                }
                return;
            } else if (command === 'movsx' || command === 'movzx') {
                extendingCommand = true;
            } else if (command === 'lea') {
                addressCommand = true;
            } else if (command === 'proc') {
                try {
                    this.proc(parser.readAll().trim());
                } catch (err) {
                    parser.error(err.message);
                }
                return;
            } else if (command.startsWith('j')) {
                jumpCommand = true;
            }
            
            // TODO: parse string quot
            // store string
            
            while (!parser.eof()) {

                const qoutedString = parser.readQuotedString();
                if (qoutedString !== null) {
                    if (this.constChunk === null) this.constChunk = new AsmChunk(new Uint8Array(0), 0);
                    const id = new Defination('', this.constChunk, this.constChunk.size, OperationSize.void);
                    this.constChunk.write(Buffer.from(qoutedString, 'utf-8'));
                    this.constChunk.put(0);
                    command += '_rp';
                    callinfo.push('(register pointer)');
                    if (addressCommand) setSize(OperationSize.qword);
                    else setSize(id.size);
                    args.push(Register.rip);
                    args.push(0);
                    unresolvedConstant = id;
                    unresolvedPos = parser.getPosition();
                    parser.skipSpaces();
                    continue;
                }
                const param = parser.readTo(',');
                
                const constval = polynominal.parseToNumber(param);
                if (constval !== null) { // number
                    if (isNaN(constval)) {
                        return parser.error(`Unexpected number syntax ${callinfo.join(' ')}'`);
                    }
                    command += '_c';
                    callinfo.push('(constant)');
                    args.push(constval);
                } else if (param.endsWith(']')) { // memory access
                    let end = param.indexOf('[');
                    if (end === null) parser.error(`Unexpected bracket syntax ${param}'`);
                    const iparser = new TextLineParser(param.substr(0, end), lineNumber, parser.matchedIndex);
                    
                    end++;
                    const bracketInnerStart = parser.matchedIndex + end + 1;


                    const words = [...iparser.splitWithSpaces()];
                    if (words.length !== 0) {
                        if ((words.length !== 2) || words[1] !== 'ptr') {
                            parser.error(`Invalid address syntax: ${param}`);
                        }
                        const sizename = words[0];
                        const size = sizemap.get(sizename);
                        if (size === undefined || size.size === OperationSize.void) {
                            parser.error(`Unexpected size name: ${sizename}`);
                        }
                        if (addressCommand) setSize(OperationSize.qword);
                        else setSize(size!.size!);
                    }

                    const inner = param.substring(end, param.length-1);
                    const [r1, r2, c] = this._polynominalToAddress(inner, bracketInnerStart, lineNumber);
                    if (r1 === null) {

                        throw new ParsingError('need one register at least', {
                            column: bracketInnerStart,
                            width: inner.length, 
                            line: lineNumber
                        });
                    }

                    args.push(r1);
                    if (r2 === null) {
                        callinfo.push('(register pointer)');
                        command += `_rp`;
                    } else {
                        callinfo.push('(2 register pointer)');
                        command += `_rrp`;
                        args.push(r2);
                    }
                    args.push(c);
                } else {
                    const type = regmap.get(param.toLowerCase());
                    if (type) {
                        const [name, reg, size]  = type;
                        if (extendingCommand) {
                            if (size < OperationSize.dword || size > OperationSize.qword) {
                                parser.error(`Invalid operand size ${OperationSize[size] || size}`);
                            }
                        } else setSize(size);
                        command += '_'+name.short;
                        args.push(reg);
                        callinfo.push('('+name.name+')');
                    } else {
                        const id = this.ids.get(param);
                        if (id instanceof Constant) {
                            command += '_c';
                            callinfo.push('(constant)');
                            args.push(id.value);
                        } else if (id instanceof Defination) {
                            command += '_rp';
                            callinfo.push('(register pointer)');
                            if (id.size === OperationSize.void) parser.error(`Invalid operand type`);
                            args.push(Register.rip);
                            args.push(0);
                            unresolvedConstant = id;
                        } else if ((id instanceof Label) && !jumpCommand) {
                            command += '_rp';
                            callinfo.push('(register pointer)');
                            args.push(Register.rip);
                            args.push(0);
                            unresolvedConstant = id;
                        } else {
                            command += '_label';
                            args.push(param);
                            callinfo.push('(label)');
                        }
                        unresolvedPos = parser.getPosition();
                    }
                }
            }
        }

        parser.matchedIndex = totalIndex;
        parser.matchedWidth = parser.matchedIndex + parser.matchedWidth - totalIndex;

        if (command.endsWith(':')) {
            this.label(command.substr(0, command.length-1).trim());
            return;
        }

        command = command.toLowerCase();
        if (size !== null) args.push(size);

        const fn = (this as any)[command];
        if (typeof fn !== 'function') {
            parser.error(`Unexpected command '${callinfo.join(' ')}'`);
        }
        try {
            this.pos = unresolvedPos;
            fn.apply(this, args);
            if (unresolvedConstant instanceof Defination) {
                this.chunk.unresolved.push(new UnresolvedConstant(this.chunk.size-4, 4, unresolvedConstant, unresolvedPos));
            } else if (unresolvedConstant instanceof Label) {
                this.chunk.unresolved.push(new UnresolvedConstant(this.chunk.size-4, 4, unresolvedConstant, unresolvedPos));
            }
        } catch (err) {
            parser.error(err.message);
        }
    }

    compile(source:string, defines?:Record<string, number>|null, reportDirectWithFileName?:string|null):Uint8Array{
        let p = 0;
        let lineNumber = 1;
        if (defines != null) {
            for (const name in defines) {
                this.const(name, defines[name]);
            }
        }

        const errs = new ParsingErrorContainer;

        for (;;){
            const lineidx = source.indexOf('\n', p);
            const lineText = (lineidx === -1 ? source.substr(p) : source.substring(p,lineidx));
            try {
                this.compileLine(lineText, lineNumber);
            } catch (err) {
                if (err instanceof ParsingError) {
                    errs.add(err);
                    if (reportDirectWithFileName) {
                        err.report(reportDirectWithFileName, lineText);
                    }
                } else {
                    throw err;
                }
            }
            if (lineidx === -1) break;
            p = lineidx + 1;
            lineNumber++;
        }

        if (errs !== null && errs.error !== null) throw errs.error;

        function writeArray<T>(array:T[], writer:(value:T)=>void):void {
            for (const item of array) {
                writer(item);
            }
            out.put(0);
        }
        function writeAddress(id:AddressIdentifier):void {
            out.writeNullTerminatedString(id.name);
            out.writeVarUint(id.offset - address);
            address = id.offset;
        }

        const out = new BufferWriter(new Uint8Array(64), 0);
        const labels:Label[] = [];
        const defs:Defination[] = [];
        for (const id of this.ids.values()) {
            if (id instanceof Label) {
                labels.push(id);
            } else if (id instanceof Defination) {
                defs.push(id);
            }
        }
        defs.sort((a,b)=>a.offset-b.offset);
        labels.sort((a,b)=>a.offset-b.offset);

        let address = 0;
        writeArray(labels, writeAddress);
        address = 0;
        writeArray(defs, writeAddress);
        out.writeVarUint(this.memoryChunkSize - address);

        try {
            out.write(this.buffer());
            return out.buffer();
        } catch (err) {
            if (err instanceof ParsingError) {
                if (reportDirectWithFileName) {
                    err.report(reportDirectWithFileName, err.pos !== null ? getLineAt(source, err.pos.line-1) : null);
                }
                errs.add(err);
                throw errs;
            } else {
                throw err;
            }
        }
    }
    static load(bin:Uint8Array):X64Assembler {

        const reader = new BufferReader(bin);

        function readArray<T>(reader:()=>(T|null)):T[] {
            const out:T[] = [];
            for (;;) {
                const item = reader();
                if (item === null) return out;
                out.push(item);
            }
        }

        function readAddress():[string,number]|null {
            const name = reader.readNullTerminatedString();
            if (name === '') return null;

            const size = reader.readVarUint();
            const offset = address;
            address += size;
            return [name, offset];
        }

        let address = 0;
        const labels = readArray(readAddress);
        address = 0;
        const defs = readArray(readAddress);
        const memorySize = reader.readVarUint() + address;

        const buf = reader.remaining();
        const out = new X64Assembler(buf, buf.length);
        out.memoryChunkSize = memorySize;

        for (const [name, offset] of labels) {
            if (out.ids.has(name)) throw Error(`${name} is already defined`);
            const label = new Label(name);
            label.chunk = out.chunk;
            label.offset = offset;
            label.type = LabelType.Proc;
            out.ids.set(name, label);
        }
        for (const [name, offset] of defs) {
            if (out.ids.has(name)) throw Error(`${name} is already defined`);
            out.ids.set(name, new Defination(name, MEMORY_INDICATE_CHUNK, offset, undefined));
        }
        return out;
    }

    private static call_c_info = new JumpInfo(5, 5, 6, X64Assembler.prototype.call_c, X64Assembler.prototype.call_rp);
    private static jmp_c_info = new JumpInfo(2, 5, 6, X64Assembler.prototype.jmp_c, X64Assembler.prototype.jmp_rp);
    private static jmp_o_info = new JumpInfo(2, 6, -1, X64Assembler.prototype._jmp_o, null);
}

export function asm():X64Assembler {
    return new X64Assembler(new Uint8Array(64), 0);
}

function shex(v:number|bin64_t):string {
    if (typeof v === 'string') return '0x'+bin.toString(v, 16);
    if (v < 0) return '-0x'+(-v).toString(16);
    else return '0x'+v.toString(16);
}
function shex_o(v:number|bin64_t):string {
    if (typeof v === 'string') return '+0x'+bin.toString(v, 16);
    if (v < 0) return '-0x'+(-v).toString(16);
    else return '+0x'+v.toString(16);
}

const REVERSE_MAP:Record<string, string> = {
    jo: 'jno',
    jno: 'jo',
    jb: 'jae',
    jae: 'jb',
    je: 'jne',
    jne: 'je',
    jbe: 'ja',
    ja: 'jbe',
    js: 'jns',
    jns: 'js',
    jp: 'jnp',
    jnp: 'jp',
    jl: 'jge',
    jge: 'jl',
    jle: 'jg',
    jg: 'jle',
};

interface Code extends X64Assembler
{
    [key:string]: any;
}

class ArgName {
    constructor(
        public readonly name:string, 
        public readonly short:string) {
    }
    public static readonly Register=new ArgName('register', 'r');
    public static readonly Const=new ArgName('const', 'c');
}
const regmap = new Map<string, [ArgName, Register, OperationSize]>([
    ['rip', [ArgName.Register, Register.rip, OperationSize.qword]],
    ['rax', [ArgName.Register, Register.rax, OperationSize.qword]],
    ['rcx', [ArgName.Register, Register.rcx, OperationSize.qword]],
    ['rdx', [ArgName.Register, Register.rdx, OperationSize.qword]],
    ['rbx', [ArgName.Register, Register.rbx, OperationSize.qword]],
    ['rsp', [ArgName.Register, Register.rsp, OperationSize.qword]],
    ['rbp', [ArgName.Register, Register.rbp, OperationSize.qword]],
    ['rsi', [ArgName.Register, Register.rsi, OperationSize.qword]],
    ['rdi', [ArgName.Register, Register.rdi, OperationSize.qword]],
    ['r8', [ArgName.Register, Register.r8, OperationSize.qword]],
    ['r9', [ArgName.Register, Register.r9, OperationSize.qword]],
    ['r10', [ArgName.Register, Register.r10, OperationSize.qword]],
    ['r11', [ArgName.Register, Register.r11, OperationSize.qword]],
    ['r12', [ArgName.Register, Register.r12, OperationSize.qword]],
    ['r13', [ArgName.Register, Register.r13, OperationSize.qword]],
    ['r14', [ArgName.Register, Register.r14, OperationSize.qword]],
    ['r15', [ArgName.Register, Register.r15, OperationSize.qword]],

    ['eax', [ArgName.Register, Register.rax, OperationSize.dword]],
    ['ecx', [ArgName.Register, Register.rcx, OperationSize.dword]],
    ['edx', [ArgName.Register, Register.rdx, OperationSize.dword]],
    ['ebx', [ArgName.Register, Register.rbx, OperationSize.dword]],
    ['esp', [ArgName.Register, Register.rsp, OperationSize.dword]],
    ['ebp', [ArgName.Register, Register.rbp, OperationSize.dword]],
    ['esi', [ArgName.Register, Register.rsi, OperationSize.dword]],
    ['edi', [ArgName.Register, Register.rdi, OperationSize.dword]],
    ['r8d', [ArgName.Register, Register.r8, OperationSize.dword]],
    ['r9d', [ArgName.Register, Register.r9, OperationSize.dword]],
    ['r10d', [ArgName.Register, Register.r10, OperationSize.dword]],
    ['r11d', [ArgName.Register, Register.r11, OperationSize.dword]],
    ['r12d', [ArgName.Register, Register.r12, OperationSize.dword]],
    ['r13d', [ArgName.Register, Register.r13, OperationSize.dword]],
    ['r14d', [ArgName.Register, Register.r14, OperationSize.dword]],
    ['r15d', [ArgName.Register, Register.r15, OperationSize.dword]],
    
    ['ax', [ArgName.Register, Register.rax, OperationSize.word]],
    ['cx', [ArgName.Register, Register.rcx, OperationSize.word]],
    ['dx', [ArgName.Register, Register.rdx, OperationSize.word]],
    ['bx', [ArgName.Register, Register.rbx, OperationSize.word]],
    ['sp', [ArgName.Register, Register.rsp, OperationSize.word]],
    ['bp', [ArgName.Register, Register.rbp, OperationSize.word]],
    ['si', [ArgName.Register, Register.rsi, OperationSize.word]],
    ['di', [ArgName.Register, Register.rdi, OperationSize.word]],
    ['r8w', [ArgName.Register, Register.r8, OperationSize.word]],
    ['r9w', [ArgName.Register, Register.r9, OperationSize.word]],
    ['r10w', [ArgName.Register, Register.r10, OperationSize.word]],
    ['r11w', [ArgName.Register, Register.r11, OperationSize.word]],
    ['r12w', [ArgName.Register, Register.r12, OperationSize.word]],
    ['r13w', [ArgName.Register, Register.r13, OperationSize.word]],
    ['r14w', [ArgName.Register, Register.r14, OperationSize.word]],
    ['r15w', [ArgName.Register, Register.r15, OperationSize.word]],
    
    ['al', [ArgName.Register, Register.rax, OperationSize.byte]],
    ['cl', [ArgName.Register, Register.rcx, OperationSize.byte]],
    ['dl', [ArgName.Register, Register.rdx, OperationSize.byte]],
    ['bl', [ArgName.Register, Register.rbx, OperationSize.byte]],
    ['ah', [ArgName.Register, Register.rsp, OperationSize.byte]],
    ['ch', [ArgName.Register, Register.rbp, OperationSize.byte]],
    ['dh', [ArgName.Register, Register.rsi, OperationSize.byte]],
    ['bh', [ArgName.Register, Register.rdi, OperationSize.byte]],
    ['r8b', [ArgName.Register, Register.r8, OperationSize.byte]],
    ['r9b', [ArgName.Register, Register.r9, OperationSize.byte]],
    ['r10b', [ArgName.Register, Register.r10, OperationSize.byte]],
    ['r11b', [ArgName.Register, Register.r11, OperationSize.byte]],
    ['r12b', [ArgName.Register, Register.r12, OperationSize.byte]],
    ['r13b', [ArgName.Register, Register.r13, OperationSize.byte]],
    ['r14b', [ArgName.Register, Register.r14, OperationSize.byte]],
    ['r15b', [ArgName.Register, Register.r15, OperationSize.byte]],
]);

function checkModified(ori:string, out:string):boolean{
    const ostat = fs.statSync(ori);

    try{
        const nstat = fs.statSync(out);
        return ostat.mtimeMs >= nstat.mtimeMs;
    } catch (err){
        return true;
    }
}

export namespace asm
{
    export const code:Code = X64Assembler.prototype;
    export const splitTwo32Bits = Symbol('splitTwo32Bits');
    export class Operation {
        public size = -1;
        private _splits:string[]|null = null;

        constructor(
            public readonly code:(this:X64Assembler, ...args:any[])=>X64Assembler,
            public readonly args:any[]) {
        }

        get splits():string[] {
            if (this._splits !== null) return this._splits;
            const name = this.code.name;
            return this._splits = name.split('_');
        }

        reverseJump():string|null{
            return REVERSE_MAP[this.splits[0]] || null;
        }

        registers():Register[] {
            const out:Register[] = [];
            const splits = this.splits;
            let argi = 0;
            for (let i=1;i<splits.length;i++) {
                const type = splits[i];
                if (type === 'r') {
                    const r = this.args[argi];
                    if (typeof r !== 'number' || r < 0 || r >= 16) {
                        throw Error(`${this.code.name}: Invalid parameter ${r} at ${i}`);
                    }
                    out.push(r);
                    argi ++;
                } else if (type === 'rp') {
                    argi += 2;
                } else {
                    argi ++;
                }
            }
            return out;
        }

        toString():string {
            const {code, args} = this;
            const name = code.name;
            const splited = name.split('_');
            const cmd = splited.shift()!;
            let i=0;
            const ptridx:number[] = [];
            const argstr:string[] = [];
            for (const item of splited) {
                const v = args[i++];
                switch (item) {
                case 'r':
                    argstr.push(Register[v]);
                    break;
                case 'f':
                    argstr.push(FloatRegister[v]);
                    break;
                case 'c':
                    argstr.push(shex(v));
                    break;
                case 'rp':
                    ptridx.push(argstr.length);
                    argstr.push(`[${Register[v]}${shex_o(args[i++])}]`);
                    break;
                }
            }
            const size = args[i];
            if (size !== undefined) {
                const sizestr = OperationSize[size];
                for (const j of ptridx) {
                    argstr[j] = sizestr+' ptr '+argstr[j];
                }
            }
            return cmd+' '+argstr.join(', ');
        }
    }
    export class Operations {
        constructor(
            public readonly operations:asm.Operation[], 
            public readonly size:number) {
        }

        toString():string {
            const out:string[] = [];
            for (const oper of this.operations) {
                out.push(oper.toString());
            }
            return out.join('\n');
        }

        asm():X64Assembler {
            const code = asm();
            for (const {code: opcode, args} of this.operations) {
                opcode.apply(code, args);
            }
            return code;
        }
    }

    export function compile(source:string, defines?:Record<string, number>|null, reportDirectWithFileName?:string|null):Uint8Array{
        return asm().compile(source, defines, reportDirectWithFileName);
    }

    export function load(bin:Uint8Array):X64Assembler {
        return X64Assembler.load(bin);
    }
    
    export function loadFromFile(src:string, defines?:Record<string, number>|null, reportDirect:boolean = false):X64Assembler{
        const binpath = src.substr(0, src.lastIndexOf('.')+1)+'bin';

        let buffer:Uint8Array;
        if (checkModified(src, binpath)){
            buffer = asm.compile(fs.readFileSync(src, 'utf-8'), defines, reportDirect ? src : null);
            fs.writeFileSync(binpath, buffer);
        } else {
            buffer = fs.readFileSync(binpath);
        }

        return asm.load(buffer);
    }

}
