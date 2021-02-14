import { TextDecoder } from "util";
import { bin } from "./bin";
import { bin64_t } from "./nativetype";
import { polynominal } from "./polynominal";
import colors = require('colors');
import fs = require('fs');
import path = require('path');
import { ParsingError, TextLineParser } from "./textparser";

export enum Register
{
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
    byte,
    word,
    dword,
    qword,
    xmmword
}

const sizemap = new Map<string, {bytes: number, size:OperationSize|null}>([
    ['void', {bytes: 0, size: null} ],
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
class AsmChunk {
    public prev:AsmChunk|null = null;
    public next:AsmChunk|null = null;
    public jumpInfo:JumpInfo|null = null;
    public jumpLabel:string|null = null;
    public jumpArgs:any[]|null = null;
    public readonly labels:Label[] = [];
    public readonly externs:Extern[] = [];
    public readonly unresolved:UnresolvedConstant[] = [];
    
    constructor(public array:Uint8Array, public size:number) {
    }

    put(v:number):this {
        const osize = this.size;
        const nsize = osize + 1;
        this.size = nsize;
        if (nsize > this.array.length) {
            const narray = new Uint8Array(this.array.length*2);
            narray.set(this.array.subarray(0, osize));
            this.array = narray;
        }
        this.array[osize] = v;
        return this;
    }

    write(values:number[]|Uint8Array):this {
        const n = values.length;
        const osize = this.size;
        const nsize = osize + n;
        this.size = nsize;
        
        if (nsize > this.array.length) {
            const narray = new Uint8Array(Math.max(this.array.length*2, nsize));
            narray.set(this.array.subarray(0, osize));
            this.array = narray;
        }
        this.array.set(values, osize);
        return this;
    }

    buffer():Uint8Array {
        return this.array.subarray(0, this.size);
    }

    removeNext():boolean {
        const chunk = this.next;
        if (chunk === null) return false;

        this.jumpLabel = chunk.jumpLabel;
        this.jumpInfo = chunk.jumpInfo;
        this.jumpArgs = chunk.jumpArgs;
        
        for (const label of chunk.labels) {
            label.chunk = this;
            label.offset += this.size;
        }
        this.labels.push(...chunk.labels);
        for (const extern of chunk.externs) {
            const values = extern.map.get(chunk)!;
            for (let i=0;i<values.length;i++) {
                values[i] += this.size;
            }
            extern.adds(this, values);
        }
        for (const jump of chunk.unresolved) {
            jump.offset += this.size;   
        }
        this.unresolved.push(...chunk.unresolved);
        this.write(chunk.buffer());

        const next = chunk.next;
        this.next = next;
        if (next !== null) next.prev = this;

        chunk.externs.length = 0;
        chunk.labels.length = 0;
        chunk.jumpLabel = null;
        chunk.jumpInfo = null;
        chunk.jumpArgs = null;
        chunk.next = null;
        chunk.prev = null;
        return true;
    }

    resolveAll():void {
        for (const unresolved of this.unresolved) {
            const addr = unresolved.address;

            const size = unresolved.bytes;
            let offset = addr.offset - unresolved.offset - size;
            if (addr instanceof Label) {
                if (addr.type === LabelType.Unknown) throw Error(`${addr}: Label not found`);
                console.assert(addr.chunk === this, 'chunk is remained');
            } else if (addr instanceof Defination) {
                offset -= addr.chunk!.size;
            } else {
                throw Error(`Unexpected type ${addr.constructor.name}`);
            }

            const arr = this.array;
            let i = unresolved.offset;
            
            const to = i + size;
            for (;i!==to;i++) {
                arr[i++] = offset;
                offset >>= 8;
            }
        }
        this.unresolved.length = 0;
    }
}

enum LabelType {
    Unknown,
    Label,
    Proc
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
    constructor(
        name:string,
        chunk:AsmChunk|null, 
        offset:number,
        public type:LabelType) {
        super(name, chunk, offset);
    }
}

class Defination extends AddressIdentifier {

    constructor(name:string, 
        chunk:AsmChunk|null, 
        offset:number,
        public exports:boolean, 
        public size:OperationSize|null) {
        super(name, chunk, offset);
    }
}

class Extern extends Identifier {
    public readonly map = new Map<AsmChunk, number[]>();
    constructor(name:string, public size:OperationSize) {
        super(name);
    }

    add(chunk:AsmChunk, offset:number):void {
        const dest = this.map.get(chunk);
        if (dest) dest.push(offset);
        else {
            this.map.set(chunk, [offset]);
            chunk.externs.push(this);
        }
    }
    adds(chunk:AsmChunk, offsets:number[]):void {
        const dest = this.map.get(chunk);
        if (dest) dest.push(...offsets);
        else {
            this.map.set(chunk, offsets);
            chunk.externs.push(this);
        }
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
        public readonly address:AddressIdentifier) {
    }
}

interface TypeInfo {
    size:OperationSize|null;
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


// TODO: externconst를 상수에서 가져온다


export class X64Assembler {

    private memoryChunk = new AsmChunk(new Uint8Array(0), 0);
    private chunk:AsmChunk;
    private readonly ids = new Map<string, Identifier>();

    private _polynominalToAddress(text:string):[Register|null, Register|null, number, Extern[]] {
        let res = polynominal.parse(text);
        for (const [name, value] of this.ids) {
            if (!(value instanceof Constant)) continue;
            res = res.defineVariable(name, value.value);
        }
        const poly = res.asAdditive();
        let varcount = 0;

        const externs:Extern[] = [];
        const regs:(Register|null)[] = [];
        for (const term of poly.terms) {
            if (term.variables.length > 1) {
                throw new ParsingError(`polynominal is too complex, variables are multiplying`, 0, text.length);
            }
            const v = term.variables[0];
            if (!v.degree.equalsConstant(1)) throw new ParsingError(`polynominal is too complex, degree is not 1`, 0, text.length);
            if (!(v.term instanceof polynominal.Name)) throw new ParsingError('polynominal is too complex, complex term', 0, text.length);
            
            const type = regmap.get(v.term.name.toLowerCase());
            if (type) {
                const [argname, reg, size] = type;
                if (argname.short !== 'r') throw new ParsingError(`unexpected identifier: ${v.term.name}`, v.term.column, v.term.length);
                if (size !== OperationSize.qword) throw new ParsingError(`unexpected register: ${v.term.name}`, 0, text.length);
                
                varcount ++;
                if (varcount >= 3) throw new ParsingError(`polynominal has too many variables`, 0, text.length);
    
                regs.push(reg);
            } else {
                const identifier = this.ids.get(v.term.name);
                if (!identifier) throw new ParsingError(`identifier not found: ${v.term.name}`, v.term.column, v.term.length);
                if (!(identifier instanceof Extern)) throw new ParsingError(`Invalid identifier: ${v.term.name}`, v.term.column, v.term.length);
                externs.push(identifier);
            }
        }
        if (regs.length > 3) throw new ParsingError('Too many registers', 0, text.length);
        while (regs.length < 2) regs.push(null);
        return [regs[0], regs[1], poly.constant, externs];
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
        if (offset === 0 && r1 !== Register.rbp) {
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

    load_externconst(name:string, offsets:number[], size:OperationSize):this {
        if (this.chunk.prev !== null) throw Error("building asm cannot use externconsts");
        if (this.ids.has(name)) throw Error(`${name} is already defined`);
        const extern = new Extern(name, size);
        this.ids.set(name, extern);
        extern.adds(this.chunk, offsets);
        this.chunk.externs.push(extern);
        return this;
    }

    define_externconst(name:string, size:OperationSize):this {
        if (this.chunk.prev !== null) throw Error("building asm cannot use externconsts");
        if (this.ids.has(name)) throw Error(`${name} is already defined`);
        const extern = new Extern(name, size);
        this.ids.set(name, extern);
        this.chunk.externs.push(extern);
        return this;
    }

    use_externconst(name:string, offset:number):this {
        const id = this.ids.get(name);
        if (!(id instanceof Extern)) throw Error(`${name} is not externconst`);
        id.add(this.chunk, this.chunk.size + offset);
        return this;
    }

    def(name:string, size:OperationSize|null, bytes:number, align:number, exports:boolean):this {
        if (this.chunk.prev !== null) throw Error("building asm cannot use externconst");
        const memSize = this.memoryChunk.size;
        const offset = align <= 1 ? memSize : ((memSize + bytes - 1) / align | 0) * align;
        this.memoryChunk.size = offset + bytes;
        if (name === '') return this;
        if (this.ids.has(name)) throw Error(`${name} is already defined`);
        this.ids.set(name, new Defination(name, this.memoryChunk, offset, exports, size));
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

    jmp_cp(offset:number):this {
        this.write(0xff, 0x25);
        this.writeInt32(offset);
        return this;
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

    call_cp(offset:number):this {
        this.write(0xff, 0x15);
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
            throw Error(`movsx: invalid operand size`);
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
        const label = this._getLabel(labelName, this.chunk, this.chunk.size);
        if (label instanceof Defination) {
            throw Error(`${labelName} is already defined`);
        }
        if (label.type !== type) {
            if (label.type === LabelType.Unknown) {
                label.type = type;
            } else {
                throw Error(`${labelName}: label dupplicated`);
            }
        }
        this.chunk.labels.push(label);

        let now = this.chunk;
        let prev = now.prev!;

        while (prev !== null && prev.jumpLabel === labelName) {
            this._resolveIdSize(prev, label, true);
            now = prev;
            prev = now.prev!;
        }
        return this;
    }

    private _getLabel(labelName:string, chunk:AsmChunk|null, offset:number = 0):Label|Defination {
        const id = this.ids.get(labelName);
        if (id) {
            if (id instanceof Defination) {
                if (id.size !== OperationSize.qword) throw Error(`${labelName} size unmatched`);
                return id;
            }
            if (!(id instanceof Label)) throw Error(`${labelName} is not label`);
            return id;
        }
        const label = new Label(labelName, chunk, offset, LabelType.Unknown);
        this.ids.set(labelName, label);
        return label;
    }

    jmp_label(labelName:string):this {
        this.chunk.jumpInfo = X64Assembler.jmp_c_info;
        this.chunk.jumpLabel = labelName;
        this.chunk.jumpArgs = [];

        const id = this.ids.get(labelName);
        if (!id) return this._genChunk();
        if (!(id instanceof AddressIdentifier)) throw Error(`unexpected identifier ${labelName}`);
        return this._resolveIdSize(this.chunk, id, false);
    }
    call_label(labelName:string):this {
        const label = this._getLabel(labelName, null);
        if (label.chunk === null) {
            this.call_c(0);
            this.chunk.unresolved.push(new UnresolvedConstant(this.chunk.size-4, 4, label));
            return this;
        }
        this.chunk.jumpInfo = X64Assembler.call_c_info;
        this.chunk.jumpLabel = labelName;
        this.chunk.jumpArgs = [];
        return this._resolveIdSize(this.chunk, label, false);
    }
    private _jmp_o_label(oper:JumpOperation, labelName:string):this {
        this.chunk.jumpInfo = X64Assembler.jmp_o_info;
        this.chunk.jumpLabel = labelName;
        this.chunk.jumpArgs = [oper];

        const label = this.ids.get(labelName);
        if (!label) return this._genChunk();
        if (!(label instanceof AddressIdentifier)) throw Error(`unexpected identifier ${labelName}`);
        return this._resolveIdSize(this.chunk, label, false);
    }

    private _resolveIdSize(jumpChunk:AsmChunk, id:AddressIdentifier, forward:boolean):this {
        if (id instanceof Defination) {
            const info = jumpChunk.jumpInfo!;
            const func = info.func_addr;
            if (func === null) throw Error(`Invalid operand: ${id.name}`);
            if (this.chunk.prev === null) {
                func.call(this, ...jumpChunk.jumpArgs!, id.offset - this.memoryChunk.size - this.chunk.size - info.addrSize);
            } else {
                func.call(this, ...jumpChunk.jumpArgs!, INT32_MAX);
                jumpChunk.unresolved.push(new UnresolvedConstant(jumpChunk.size-4, 4, id));
            }
            jumpChunk.jumpLabel = null;
            jumpChunk.jumpInfo = null;
            jumpChunk.jumpArgs = null;
            return this;
        }

        if (id.chunk === jumpChunk) {
            if (forward === true) throw Error(`cannot forward to self chunk`);
            if (this.chunk !== jumpChunk) throw Error('is not front chunk');
            const info = jumpChunk.jumpInfo!;
            let offset = id.offset - jumpChunk.size;
            offset -= info.byteSize;
            if (offset < INT8_MIN || offset > INT8_MAX) {
                offset = offset - info.dwordSize + info.byteSize;
            }
            info.func.call(this, ...jumpChunk.jumpArgs!, offset);
            
            jumpChunk.jumpLabel = null;
            jumpChunk.jumpInfo = null;
            jumpChunk.jumpArgs = null;
            return this;
        }

        const orichunk = this.chunk;
        this.chunk = jumpChunk;
        let offset = 0;
        if (forward) {
            let chunk = jumpChunk.next!;
            if (chunk === id.chunk) {
                const info = jumpChunk.jumpInfo!;
                info.func.call(this, ...jumpChunk.jumpArgs!, id.offset);
                jumpChunk.removeNext();
                if (jumpChunk.next === null) this.chunk = jumpChunk;
                else this.chunk = orichunk;
                return this;
            }

            for (;;) {
                offset += chunk.size;
                offset += chunk.jumpInfo!.dwordSize;
                chunk = chunk.next!;
                if (chunk === id.chunk) {
                    offset += id.offset;
                    break;
                }
            }
        } else {
            let chunk = jumpChunk;
            for (;;) {
                offset -= chunk.jumpInfo!.dwordSize;
                offset -= chunk.size;
                if (chunk === id.chunk) {
                    offset += id.offset;
                    break;
                }
                chunk = chunk.prev!;
                if (chunk === null) {
                    throw Error(`${id.name}: failed to find label chunk`);
                }
            }
        }
        
        if (INT8_MIN <= offset && offset <= INT8_MAX) {
            jumpChunk.jumpInfo!.func.call(this, ...jumpChunk.jumpArgs!, 0);
            jumpChunk.unresolved.push(new UnresolvedConstant(jumpChunk.size-1, 1, id));
        } else {
            jumpChunk.jumpInfo!.func.call(this, ...jumpChunk.jumpArgs!, INT32_MAX);
            jumpChunk.unresolved.push(new UnresolvedConstant(jumpChunk.size-4, 4, id));
        }
        jumpChunk.removeNext();
        if (jumpChunk.next === null) this.chunk = jumpChunk;
        else this.chunk = orichunk;
        return this;
    }
    private _genChunk():this {
        const nbuf = new AsmChunk(new Uint8Array(64), 0);
        this.chunk.next = nbuf;
        nbuf.prev = this.chunk;
        this.chunk = nbuf;
        return this;
    }
    private _normalize():this {
        let prev = this.chunk.prev;
        while (prev !== null) {
            const labelName = prev.jumpLabel!;
            const label = this.ids.get(labelName);
            if (!label) throw Error(`${labelName}: Label not found`);
            if (!(label instanceof Label)) throw Error(`${labelName} is not label`);
            this._resolveIdSize(prev, label, true);
            prev = prev.prev;
        }

        console.assert(this.chunk.next === null && this.chunk.prev === null, `chunk is remained`);
        this.chunk.resolveAll();
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

    compileLine(lineText:string):void {
        const commentIdx = lineText.search(COMMENT_REGEXP);
        const parser = new TextLineParser(commentIdx === -1 ? lineText : lineText.substr(0, commentIdx));

        function setSize(nsize:OperationSize):void {
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
        let unresolvedOffset:Extern[]|null = null;

        const args:any[] = [];
        if (!parser.eof()){
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
            } else if (command === 'externconst') {
                const name = parser.readTo(':');
                const type = parser.readAll();
                const res = parseType(type);
                if (res.size === null) parser.error(`cannot use '${type}' at externconst`);
                try {
                    this.define_externconst(name, res.arraySize !== 0 ? OperationSize.qword : res.size!);
                } catch (err) {
                    parser.error(err.message);
                }
                return;
            } else if (command === 'exportdef') {
                const name = parser.readTo(':');
                const type = parser.readAll();
                const res = parseType(type);
                try {
                    this.def(name, res.size, res.bytes, res.align, true);
                } catch (err) {
                    parser.error(err.message);
                }
                return;
            } else if (command === 'def') {
                const name = parser.readTo(':');
                const type = parser.readAll();
                const res = parseType(type);
                try {
                    this.def(name, res.size, res.bytes, res.align, false);
                } catch (err) {
                    parser.error(err.message);
                }
                return;
            }
            
            for (const param of parser.split(',')){

                const constval = polynominal.parseToNumber(param);
                if (constval !== null) { // number
                    if (isNaN(constval)) {
                        return parser.error(`Unexpected number syntax ${callinfo.join(' ')}'`);
                    }
                    command += '_c';
                    callinfo.push('(constant)');
                    args.push(constval);
                } else if (param.endsWith(']')) { // memory access
                    const ctx = parser.enter('[');
                    if (ctx === null) parser.error(`Unexpected bracket syntax ${param}'`);
                    const bracketStart = parser.matchedIndex + parser.matchedWidth;
                    const words = [...parser.splitWithSpaces()];
                    if (words.length !== 0) {
                        if ((words.length !== 2) || words[1] !== 'ptr') parser.error(`Invalid address syntax: ${param}`);
                        const sizename = words[0];
                        const size = sizemap.get(sizename);
                        if (size === undefined || size.size === null) {
                            parser.error(`Unexpected size name: ${sizename}`);
                        }
                        setSize(size!.size!);
                    }
                    parser.leave(ctx!);

                    let inner = parser.readAll();
                    inner = inner.substr(0, inner.length-1);
                    try {
                        const [r1, r2, c, externs] = this._polynominalToAddress(inner);
                        unresolvedOffset = externs;
                        if (r1 === null) {
                            callinfo.push('(constant address)');
                            command += `_cp`;
                        } else {
                            args.push(r1);
                            if (r2 === null) {
                                callinfo.push('(register pointer)');
                                command += `_rp`;
                            } else {
                                callinfo.push('(2 register pointer)');
                                command += `_rrp`;
                                args.push(r2);
                            }
                        }
                        args.push(c);
                    } catch (err) {
                        if (err instanceof ParsingError) {
                            err.column += bracketStart + 1;
                        }
                        throw err;
                    }
                } else {
                    const type = regmap.get(param.toLowerCase());
                    if (type) {
                        setSize(type[2]);
                        command += '_'+type[0].short;
                        args.push(type[1]);
                        callinfo.push('('+type[0].name+')');
                    } else {
                        const id = this.ids.get(param);
                        if (id instanceof Constant) {
                            command += '_c';
                            callinfo.push('(constant)');
                            args.push(id.value);
                        } else if (id instanceof Extern) {
                            command += '_c';
                            callinfo.push('(constant)');
                            args.push(SIZE_MAX_VAL[id.size]);
                            unresolvedConstant = id;
                        } else if (id instanceof Defination) {
                            command += '_cp';
                            callinfo.push('(constant pointer)');
                            if (id.size === null) parser.error(`Invalid operand type`);
                            args.push(SIZE_MAX_VAL[id.size!]);
                            unresolvedConstant = id;
                        } else {
                            command += '_label';
                            args.push(param);
                            callinfo.push('(label)');
                        }
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
        switch (command) {
        case 'proc_label':
            command = 'proc';
            break;
        }
        const fn = (this as any)[command];
        if (typeof fn !== 'function') {
            parser.error(`Unexpected command '${callinfo.join(' ')}'`);
        }
        try {
            fn.apply(this, args);
            if (unresolvedConstant instanceof Extern) {
                unresolvedConstant.add(this.chunk, this.chunk.size-4);
            } else if (unresolvedConstant instanceof Defination) {
                this.chunk.unresolved.push(new UnresolvedConstant(this.chunk.size-4,4,unresolvedConstant));
            }
            // TODO: apply unresolvedOffset

        } catch (err) {
            parser.error(err.message);
        }
    }

    private static call_c_info = new JumpInfo(5, 5, 6, X64Assembler.prototype.call_c, X64Assembler.prototype.call_cp);
    private static jmp_c_info = new JumpInfo(2, 5, 6, X64Assembler.prototype.jmp_c, X64Assembler.prototype.jmp_cp);
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

const writingMap = new Set<string>();

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
    export class CompileError extends Error {
        errors:ParsingError[] = [];
        sourcePath?:string;
        
        add(error:ParsingError):void {
            this.errors.push(error);
        }

        report():void {
            const sourcePath = this.sourcePath || 'asmcode';
            for (const err of this.errors) {
                err.report(sourcePath);
            }
        }
    }
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

    export function compile(source:string, reportDirectWithFileName?:string|null):Uint8Array{
        let p = 0;
        let lineNumber = 1;
        const generator = asm();
        let names = '';

        let errs:CompileError|null = null;

        for (;;){
            const lineidx = source.indexOf('\n', p);
            const lineText = (lineidx === -1 ? source.substr(p) : source.substring(p,lineidx));
            try {
                generator.compileLine(lineText);
            } catch (err) {
                if (err instanceof ParsingError) {
                    err.line = lineNumber;
                    err.lineText = lineText;
                    if (errs === null) errs = new CompileError(`${err.message}, line:${lineNumber}`);
                    errs.errors.push(err);
                    if (reportDirectWithFileName) {
                        err.report(reportDirectWithFileName);
                    }
                } else {
                    throw err;
                }
            }
            if (lineidx === -1) break;
            p = lineidx + 1;
            lineNumber++;
        }

        if (errs !== null && errs.errors.length !== 0) throw errs;

        names += '\0';
        return Buffer.concat([Buffer.from(names, 'utf-8'), generator.buffer()]);
    }

    export function load(bin:Uint8Array):X64Assembler {

        let p = 0;
        function readVarUint():number {
            let out = 0;
            let shift = 0;
            if (p >= bin.length) throw Error('Out of bounds');
            const n = bin[p++];
            for (;;) {
                if (!(n&0x80)) return out | (n << shift);
                out += (n & 0x7f) << shift;
                shift += 7;
            }
        }

        function readString():string|null {
            const next = bin.indexOf(0, p);
            if (next === p) {
                p++;
                return null;
            }
            if (next === -1) throw Error(`Invalid asm.bin`);
            const name = decoder.decode(bin.subarray(p, next));
            p = next + 1;
            return name;
        }

        let memorySize = 0;

        const decoder = new TextDecoder('utf-8');
        const labels:Record<string, number> = {};

        for (;;){
            const name = readString();
            if (name === null) break;

            const size = readVarUint();
            // '!' = dummy space
            if (name !== '!') {
                labels[name] = memorySize;
            }
            memorySize += size;
        }
        interface ExternInfo {
            name:string;
            offsets:number[];
            size:OperationSize;
        }
        const externs:ExternInfo[] = [];
        for (;;){
            const name = readString();
            if (name === null) break;

            const size = readVarUint();
            const offsets:number[] = [];
            const info:ExternInfo = {name, offsets, size};
            let offset = memorySize;
            for (;;) {
                const move = readVarUint();
                if (move === 0) break;
                offsets.push(offset);
                offset += move;
            }
            externs.push(info);
        }
        const buf = bin.subarray(p);
        const out = new X64Assembler(buf, buf.length);
        for (const {name, offsets, size} of externs) {
            out.load_externconst(name, offsets, size);
        }
        return out;
    }
    
    export function loadFromFile(src:string, reportDirect:boolean = false):X64Assembler{
        try {
            const binpath = src.substr(0, src.lastIndexOf('.')+1)+'bin';
            const binpathLower = binpath.toLowerCase();
            if (writingMap.has(binpathLower)) throw Error(`${binpath} is writing!`);
    
            let buffer:Uint8Array;
            if (checkModified(src, binpath)){
                buffer = asm.compile(fs.readFileSync(src, 'utf-8'), reportDirect ? src : null);
                writingMap.add(binpathLower);
                fs.writeFile(binpath, buffer, ()=>{
                    writingMap.delete(binpathLower);
                });
            } else {
                buffer = fs.readFileSync(binpath);
            }
    
            return asm.load(buffer);
        } catch (err) {
            if (err instanceof CompileError) {
                err.sourcePath = path.resolve(src);
            }
            throw err;
        }
    }

}
