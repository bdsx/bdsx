import { bin } from "./bin";
import { cgate, FunctionFromTypes_js, makefunc, MakeFuncOptions, NativePointer, ParamType, ReturnType, StaticPointer, VoidPointer } from "./core";
import { dll } from "./dll";
import { bin64_t } from "./nativetype";

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
    Lea
}

export enum OperationSize
{
    byte,
    word,
    dword,
    qword
}

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

const INT8_MIN = -0x80;
const INT8_MAX = 0x7f;

type Value64 = number|string|VoidPointer|Uint8Array;

function split64bits(value:Value64):[number, number] {
    switch (typeof value) {
    case 'string': 
        return bin.int32_2(value);
    case 'object':
        if (value instanceof Uint8Array) {
            const ptr = new NativePointer;
            ptr.setAddressFromBuffer(value);
            value = ptr;
        }
        return [value.getAddressLow(), value.getAddressHigh()];
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
    case 'object':
        if (value instanceof Uint8Array) {
            const ptr = new NativePointer;
            ptr.setAddressFromBuffer(value);
            value = ptr;
        }
        return value.getAddressHigh() === (value.getAddressLow() >> 31);
    case 'number':
        return value === (value|0);
    default:
        throw Error(`invalid constant value: ${value}`);
    }
}

class AsmChunk {
    public array = new Uint8Array(64);
    public size = 0;

    public prev:AsmChunk|null = null;
    public next:AsmChunk|null = null;
    public jumpInfo:JumpInfo|null = null;
    public jumpLabel:string|null = null;
    public jumpArgs:any[]|null = null;
    public readonly labels:AsmLabel[] = [];
    public readonly unresolvedJumps:AsmUnresolvedJump[] = [];

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
        for (const jump of chunk.unresolvedJumps) {
            jump.offset += this.size;   
        }
        this.unresolvedJumps.push(...chunk.unresolvedJumps);
        this.write(chunk.buffer());

        const next = chunk.next;
        this.next = next;
        if (next !== null) next.prev = this;

        chunk.labels.length = 0;
        chunk.labels.length = 0;
        chunk.jumpLabel = null;
        chunk.jumpInfo = null;
        chunk.jumpArgs = null;
        chunk.next = null;
        chunk.prev = null;
        return true;
    }
}

class AsmLabel {
    constructor(
        public chunk:AsmChunk, 
        public offset:number) {
    }
}

class JumpInfo {
    constructor(
        public readonly byteSize:number,
        public readonly dwordSize:number,
        public readonly func:(this:X64Assembler, ...args:any[])=>X64Assembler) {
    }
}

class AsmUnresolvedJump {
    constructor(
        public offset:number,
        public readonly isDword:boolean,
        public readonly label:AsmLabel) {
    }
}

export class X64Assembler {

    private chunk = new AsmChunk;
    private readonly labels:Record<string, AsmLabel> = {entry:new AsmLabel(this.chunk, 0)};

    size():number {
        return this.chunk.size;
    }

    connect(cb:(asm:X64Assembler)=>this):this {
        return cb(this);
    }

    write(...values:number[]):this {
        this.chunk.write(values);
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

    buffer():Uint8Array {
        this._normalize();
        return this.chunk.buffer();
    }

    alloc():StaticPointer {
        const mem = cgate.allocExecutableMemory(this.chunk.size);
        mem.setBuffer(this.buffer());
        return mem;
    }
    
    allocs():{entry:StaticPointer; [key:string]:StaticPointer; } {
        const mem = this.alloc();
        const out:Record<string, StaticPointer> = {};
        for (const key in this.labels) {
            const pos = this.labels[key];
            if (typeof pos !== 'number') {
                throw Error(`${key} label is not determined`);
            }
            out[key] = mem.add(pos);
        }
        return out as any;
    }
    
    make<OPTS extends MakeFuncOptions<any>|null, RETURN extends ReturnType, PARAMS extends ParamType[]>(
        returnType: RETURN, opts?: OPTS, ...params: PARAMS):
        FunctionFromTypes_js<StaticPointer, OPTS, PARAMS, RETURN> {
        return makefunc.js(this.alloc(), returnType, opts,  ...params);
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

    private _target(opcode:number, r:Register, offset:number, oper:MovOper):void {
        if (oper === MovOper.Register || oper === MovOper.Const) {
            if (offset !== 0) throw Error('Register operation with offset');
            this.write(opcode | 0xc0);
            return;
        }
        if (offset !== (offset|0)) throw Error('needs int32 offset');
        if (offset === 0 && r !== Register.rbp) {
            // empty
        } else if (INT8_MIN <= offset && offset <= INT8_MAX) {
            opcode |= 0x40;
        } else {
            opcode |= 0x80;
        }
        this.write(opcode);
    
        if (r === Register.rsp) this.write(0x24);
        if (opcode & 0x40) this.write(offset);
        else if (opcode & 0x80) {
            this.writeInt32(offset);
        }
    }

    private _regex(r1:Register, r2:Register, size:OperationSize):void {
        if (size === OperationSize.word) this.write(0x66);
    
        let rex = 0x40;
        if (size === OperationSize.qword) rex |= 0x08;
        if (r1 >= Register.r8) rex |= 0x01;
        if (r2 >= Register.r8) rex |= 0x04;
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
        r1:Register, r2:Register, 
        offset:number, value:Value64, 
        oper:MovOper, size:OperationSize):this {
        this._regex(r1, r2, size);
        let opcode = (r1&7) | ((r2&7) << 3);

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
            this._target(opcode, r1, offset, oper);
        }
    
        if (oper === MovOper.WriteConst) {
            this._const(value, size === OperationSize.qword ? OperationSize.dword : size);
        } else if (oper === MovOper.Const) {
            this._const(value, size);
        }
        return this;
    }

    private _oper(movoper:MovOper, oper:Operator, dest:Register, src:Register, offset:number, chr:number, size:number):this {
        if (chr !== (chr|0)) throw Error('needs 32bit integer');

        this._regex(dest, 0, size);

        if (movoper === MovOper.Register) {
            this.write(0x01 | (oper << 3));
            this._target((dest&7) | ((src&7) << 3), dest, offset, movoper);
        } else {
            const is8bits = (INT8_MIN <= chr && chr <= INT8_MAX);
            if (!is8bits && dest === Register.rax) {
                this.write(0x05 | (oper << 3));
                this.writeInt32(chr);
            } else {
                this.write(0x81 | (+is8bits << 1));
                this._target((oper << 3) | (dest&7), dest, offset, movoper);
                if (is8bits) this.write(chr);
                else this.writeInt32(chr);
            }
        }
        return this;
    }

    private _jmp(isCall:boolean, r:Register, offset:number, oper:MovOper):this {
        if (r >= Register.r8) this.write(0x41);
        this.write(0xff);
        this._target((isCall ? 0x10 : 0x20) | (r & 7), r, offset, oper);
        return this;
    }

    private _jmp_r(isCall:boolean, r:Register):this {
        return this._jmp(isCall, r, 0, MovOper.Register);
    }

    private _jmp_o(oper:JumpOperation, offset:number, alwaysDwordSpace:boolean = false):this {
        if (!alwaysDwordSpace && INT8_MIN <= offset && offset <= INT8_MAX) {
            return this.write(0x70 | oper, offset);
        } else {
            this.write(0x0f);
            this.write(0x80 | oper);
            this.writeInt32(offset);
        }
        return this;
    }

    /**
     * lea
     */
    lea_r_rp(dest:Register, src:Register, offset:number, size = OperationSize.qword):this {
        if (offset === 0) return this.mov_r_r(dest, src, size);
        return this._mov(src, dest, offset, 0, MovOper.Lea, size);
    }

    /**
     * move register to register
     */
    mov_r_r(dest:Register, src:Register, size = OperationSize.qword):this {
        return this._mov(dest, src, 0, 0, MovOper.Register, size);
    }

    /**
     * move const to register
     */
    mov_r_c(dest:Register, value:Value64, size = OperationSize.qword):this {
        return this._mov(dest, 0, 0, value, MovOper.Const, size);
    }

    /**
     * move const to register pointer
     */
    mov_rp_c(dest:Register, offset:number, value:number, size = OperationSize.qword):this {
        return this._mov(dest, 0, offset, value, MovOper.WriteConst, size);
    }

    /**
     * move register to register pointer
     */
    mov_rp_r(dest:Register, offset:number, src:Register, size = OperationSize.qword):this {
        return this._mov(dest, src, offset, 0, MovOper.Write, size);
    }

    /**
     * move register pointer to register
     */
    mov_r_rp(dest:Register, src:Register, offset:number, size = OperationSize.qword):this {
        return this._mov(src, dest, offset, 0, MovOper.Read, size);
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

    jmp_rpip(offset:number):this {
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

    jmp_c(offset:number, alwaysDwordSpace:boolean = false):this {
        if (!alwaysDwordSpace && INT8_MIN <= offset && offset <= INT8_MAX) {
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

    movdqa_rp_f(dest:Register, offset:number, src:FloatRegister):this {
        this.write(0x66, 0x0f, 0x7f);
        this._target((dest&7) | ((src&7) << 3), dest, offset, MovOper.Write);
        return this;
    }
    
    movdqa_f_rp(dest:FloatRegister, src:Register, offset:number):this {
        this.write(0x66, 0x0f, 0x7f);
        this._target((src&7) | ((dest&7) << 3), src, offset, MovOper.Read);
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
        if (value !== (value|0)) throw Error('needs int32 integer');
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
        this._target(0x30 | (r & 7), r, offset, MovOper.Write);
        return this;
    }
        
    pop_r(r:Register):this {
        if (r >= Register.r8) this.write(0x41);
        this.write(0x58 | (r&7));
        return this;
    }

    private _test(r1:Register, r2:Register, offset:number, size:OperationSize, oper:MovOper):this{
        this._regex(r1, r2, size);
        if (size === OperationSize.byte) this.write(0x84);
        else this.write(0x85);
        this._target(((r2&7)<<3) | (r1&7), r1, offset, oper);
        return this;
    }

    test_r_r(r1:Register, r2:Register, size:OperationSize = OperationSize.qword):this {
        return this._test(r1, r2, 0, size, MovOper.Register);
    }
    
    test_r_rp(r1:Register, r2:Register, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._test(r1, r2, offset, size, MovOper.Read);
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
        this._regex(dest, 0, size);
        this.write(0xc1);
        this.write(0xe8 | dest);
        this.write(chr%128);
        return this;
    }
    shl_r_c(dest:Register, chr:number, size = OperationSize.qword):this {
        this._regex(dest, 0, size);
        this.write(0xc1);
        this.write(0xe0 | dest);
        this.write(chr%128);
        return this;
    }

    label(key:string):this {
        const label = new AsmLabel(this.chunk, this.chunk.size);
        this.labels[key] = label;
        this.chunk.labels.push(label);

        let now = this.chunk;
        let prev = now.prev!;

        while (prev !== null && prev.jumpLabel === key) {
            this._resolveJump(prev, label, true);
            now = prev;
            prev = now.prev!;
        }
        return this;
    }

    jmp_label(labelName:string):this {
        this.chunk.jumpInfo = X64Assembler.jmp_c_info;
        this.chunk.jumpLabel = labelName;
        this.chunk.jumpArgs = [];

        const label = this.labels[labelName];
        if (!label) return this._genChunk();
        return this._resolveJump(this.chunk, label, false);
    }
    private _jmp_o_label(oper:JumpOperation, labelName:string):this {
        this.chunk.jumpInfo = X64Assembler.jmp_o_info;
        this.chunk.jumpLabel = labelName;
        this.chunk.jumpArgs = [oper];

        const label = this.labels[labelName];
        if (!label) return this._genChunk();
        return this._resolveJump(this.chunk, label, false);
    }

    private _resolveJump(jumpChunk:AsmChunk, label:AsmLabel, forward:boolean):this {
        if (label.chunk === jumpChunk) {
            if (forward === true) throw Error(`cannot forward to self chunk`);
            if (this.chunk !== jumpChunk) throw Error('is not front chunk');
            const info = jumpChunk.jumpInfo!;
            let offset = label.offset - jumpChunk.size;
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
            if (chunk === label.chunk) {
                const info = jumpChunk.jumpInfo!;
                info.func.call(this, ...jumpChunk.jumpArgs!, label.offset);
                jumpChunk.removeNext();
                if (jumpChunk.next === null) this.chunk = jumpChunk;
                else this.chunk = orichunk;
                return this;
            }

            for (;;) {
                offset += chunk.size;
                offset += chunk.jumpInfo!.dwordSize;
                chunk = chunk.next!;
                if (chunk === label.chunk) {
                    offset += label.offset;
                    break;
                }
            }
        } else {
            let chunk = jumpChunk;
            for (;;) {
                offset -= chunk.jumpInfo!.dwordSize;
                offset -= chunk.size;
                if (chunk === label.chunk) {
                    offset += label.offset;
                    break;
                }
                chunk = chunk.prev!;
            }
        }
        
        if (INT8_MIN <= offset && offset <= INT8_MAX) {
            jumpChunk.jumpInfo!.func.call(this, ...jumpChunk.jumpArgs!, 0);
            jumpChunk.unresolvedJumps.push(new AsmUnresolvedJump(jumpChunk.size-1, false, label));
        } else {
            jumpChunk.jumpInfo!.func.call(this, ...jumpChunk.jumpArgs!, 0, true);
            jumpChunk.unresolvedJumps.push(new AsmUnresolvedJump(jumpChunk.size-4, true, label));
        }
        jumpChunk.removeNext();
        if (jumpChunk.next === null) this.chunk = jumpChunk;
        else this.chunk = orichunk;
        return this;
    }
    private _genChunk():this {
        const nbuf = new AsmChunk;
        this.chunk.next = nbuf;
        nbuf.prev = this.chunk;
        this.chunk = nbuf;
        return this;
    }
    private _normalize():this {
        let prev = this.chunk.prev;
        while (prev !== null) {
            const labelName = prev.jumpLabel!;
            const label = this.labels[labelName];
            if (!label) throw Error(`${labelName}: Label not found`);
            this._resolveJump(prev, label, true);
            prev = prev.prev;
        }

        console.assert(this.chunk.next === null && this.chunk.prev === null, `chunk is remained`);
        for (const jump of this.chunk.unresolvedJumps) {
            console.assert(jump.label.chunk === this.chunk, 'chunk is remained');

            const arr = this.chunk.array;
            let i = jump.offset;
            if (jump.isDword) {
                const offset = jump.label.offset - jump.offset - 4;
                arr[i++] = offset;
                arr[i++] = offset >> 8;
                arr[i++] = offset >> 16;
                arr[i] = offset >> 24;
            } else {
                const offset = jump.label.offset - jump.offset - 1;
                console.assert(INT8_MIN <= offset && offset <= INT8_MAX, 'offset out of bounds');
                arr[i] = offset;
            }
        }
        this.chunk.unresolvedJumps.length = 0;
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


    private static jmp_c_info = new JumpInfo(2, 5, X64Assembler.prototype.jmp_c);
    private static jmp_o_info = new JumpInfo(2, 6, X64Assembler.prototype._jmp_o);
}

export function asm():X64Assembler {
    return new X64Assembler;
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

export namespace asm
{
    export const code = X64Assembler.prototype;
    export function const_str(str:string, encoding:BufferEncoding='utf-8'):Buffer {
        const buf = Buffer.from(str+'\0', encoding);
        dll.ChakraCore.JsAddRef(buf, null);
        return buf;
    }
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
            for (let i=1;i<splits.length;i++) {
                if (splits[i] === 'r') {
                    const r = this.args[i-1];
                    if (typeof r !== 'number' || r < 0 || r >= 16) {
                        throw Error(`${this.code.name}: Invalid parameter ${r} at ${i}`);
                    }
                    out.push(r);
                }
            }
            return out;
        }
        toString():string {
            const {code, args} = this;
            const name = code.name;
            const splited = name.split('_');
            let line = splited.shift()!;
            let i=0;
            for (const item of splited) {
                const v = args[i++];
                switch (item) {
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

        buffer():Uint8Array {
            return this.asm().buffer();
        }
    }
}

export function debugGate(func:VoidPointer):VoidPointer {
    return asm().debugBreak().jmp64(func, Register.rax).alloc();
}
