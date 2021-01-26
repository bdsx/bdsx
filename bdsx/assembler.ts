import { bin } from "./bin";
import { cgate, FunctionFromTypes_js, makefunc, MakeFuncOptions, ParamType, ReturnType, StaticPointer, VoidPointer } from "./core";
import { dll } from "./dll";

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
};

export enum JumpOperation
{
    jo = 0x00,
    jno = 0x01,
    jb = 0x02,
    jae = 0x03,
    je = 0x04,
    jne = 0x05,
    jbe = 0x06,
    ja = 0x07,
    js = 0x08,
    jns = 0x09,
    jp = 0x0a,
    jnp = 0x0b,
    jl = 0x0c,
    jge = 0x0d,
    jle = 0x0e,
    jg = 0x0f,
}

const INT8_MIN = -0x80;
const INT8_MAX = 0x7f;

type Value64 = number|string|VoidPointer;

function split64bits(value:Value64):[number, number]
{
    switch (typeof value)
    {
    case 'string': 
        return bin.int32_2(value);
    case 'object':
        return [value.getAddressLow(), value.getAddressHigh()];
    case 'number':
        const lowbits = value|0;
        let highbits = ((value-lowbits)/ 0x100000000);
        highbits = highbits >= 0 ? Math.floor(highbits) : Math.ceil(highbits);
        return [lowbits, highbits];
    default:
        throw Error(`invalid constant value: ${value}`);
    }
}

function is32Bits(value:Value64):boolean
{
    switch (typeof value)
    {
    case 'string': 
        const [low, high] = bin.int32_2(value);
        return high === (low >> 31);
    case 'object':
        return value.getAddressHigh() === (value.getAddressLow() >> 31);
    case 'number':
        return value === (value|0);
    default:
        throw Error(`invalid constant value: ${value}`);
    }
}

export class X64Assembler {
    private array = new Uint8Array(64);
    private _size = 0;
    private readonly addrmap:Record<string, number> = {entry:0};

    size():number
    {
        return this._size;
    }

    connect(cb:(asm:X64Assembler)=>this):this
    {
        return cb(this);
    }

    write(...values:number[]):this
    {
        const n = values.length;
        const osize = this._size;
        const nsize = osize + n;
        this._size = nsize;
        
        if (nsize > this.array.length)
        {
            const narray = new Uint8Array(Math.max(this.array.length*2, nsize));
            narray.set(this.array.subarray(0, osize));
            this.array = narray;
        }
        this.array.set(values, osize);
        return this;
    }

    writeInt16(value:number):this
    {
        return this.write(
            value&0xff,
            (value>>>8)&0xff);
    }

    writeInt32(value:number):this
    {
        return this.write(
            value&0xff,
            (value>>>8)&0xff,
            (value>>>16)&0xff,
            (value>>>24));
    }

    buffer():Uint8Array
    {
        return this.array.subarray(0, this._size);
    }

    alloc():StaticPointer
    {
        const mem = cgate.allocExecutableMemory(this._size);
        mem.setBuffer(this.array.subarray(0, this._size));
        return mem;
    }
    
    allocs():{entry:StaticPointer; [key:string]:StaticPointer; }
    {
        const mem = cgate.allocExecutableMemory(this._size);
        mem.setBuffer(this.array.subarray(0, this._size));

        const out:Record<string, StaticPointer> = {};
        for (const key in this.addrmap)
        {
            out[key] = mem.add(this.addrmap[key]);
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

    int3():this
    {
        return this.write(0xcc);
    }

    int(n:number):this
    {
        if (n === 3) return this.int3();
        return this.write(0xcd, n & 0xff);
    }

    label(key:string):this
    {
        this.addrmap[key] = this.size();
        return this;
    }

    private _target(opcode:number, r:Register, offset:number, oper:MovOper)
    {
        if (oper === MovOper.Register || oper === MovOper.Const)
        {
            if (offset !== 0) throw Error('Register operation with offset');
            this.write(opcode | 0xc0);
            return;
        }
        if (offset !== (offset|0)) throw Error('needs int32 offset');
        if (offset === 0 && r !== Register.rbp) {}
        else if (INT8_MIN <= offset && offset <= INT8_MAX)
        {
            opcode |= 0x40;
        }
        else
        {
            opcode |= 0x80;
        }
        this.write(opcode);
    
        if (r === Register.rsp) this.write(0x24);
        if (opcode & 0x40) this.write(offset);
        else if (opcode & 0x80)
        {
            this.writeInt32(offset);
        }
    }

    private _regex(r1:Register, r2:Register, size:OperationSize):void
    {
        if (size == OperationSize.word) this.write(0x66);
    
        let rex = 0x40;
        if (size === OperationSize.qword) rex |= 0x08;
        if (r1 >= Register.r8) rex |= 0x01;
        if (r2 >= Register.r8) rex |= 0x04;
        if (rex !== 0x40) this.write(rex);
    }

    private _const(v:Value64, size:OperationSize):this
    {
        const [low32, high32] = split64bits(v);
        if (size === OperationSize.byte)
        {
            this.write(low32 & 0xff);
        }
        else if (size === OperationSize.word)
        {
            this.writeInt16(low32 & 0xffff);
        }
        else if (size === OperationSize.qword)
        {
            this.writeInt32(low32);
            this.writeInt32(high32);
        }
        else
        {
            this.writeInt32(low32);
        }
        return this;
    }

    private _mov(
        r1:Register, r2:Register, 
        offset:number, value:Value64, 
        oper:MovOper, size:OperationSize):this
    {
        this._regex(r1, r2, size);
        let opcode = (r1&7) | ((r2&7) << 3);

        if (size === OperationSize.byte)
        {
            if (oper === MovOper.WriteConst)
            {
                this.write(0xc6);
            }
            else if (oper === MovOper.Const)
            {
                opcode |= 0xb0;
            }
        }
        else
        {
            if (oper === MovOper.WriteConst)
            {
                this.write(0xc7);
            }
            else if (oper === MovOper.Const)
            {
                if (size === OperationSize.qword && is32Bits(value))
                {
                    size = OperationSize.dword;
                    this.write(0xc7);
                    opcode |= 0xc0;
                }
                else
                {
                    opcode |= 0xb8;
                }
            }
        }
        

        if (oper !== MovOper.Const && oper !== MovOper.WriteConst)
        {
            if (oper === MovOper.Lea && size !== OperationSize.dword && size !== OperationSize.qword)
            {
                throw Error('Invalid operation');
            }
    
            let memorytype = 0x88;
            if (oper === MovOper.Lea) memorytype |= 0x05;
            else if (oper === MovOper.Read) memorytype |= 0x02;
            if (size !== OperationSize.byte) memorytype |= 0x01;
            this.write(memorytype);
        }
    
        if (oper === MovOper.Const)
        {
            this.write(opcode);
        }
        else
        {
            this._target(opcode, r1, offset, oper);
        }
    
        if (oper === MovOper.WriteConst)
        {
            this._const(value, size === OperationSize.qword ? OperationSize.dword : size);
        }
        else if (oper === MovOper.Const)
        {
            this._const(value, size);
        }
        return this;
    }

    private _oper(movoper:MovOper, oper:Operator, dest:Register, src:Register, offset:number, chr:number, size:number):this
    {
        if (chr !== (chr|0)) throw Error('needs 32bit integer');

        this._regex(dest, 0, size);

        if (movoper === MovOper.Register)
        {
            this.write(0x01 | (oper << 3));
            this._target((dest&7) | ((src&7) << 3), dest, offset, movoper);
        }
        else
        {
            const is8bits = (INT8_MIN <= chr && chr <= INT8_MAX);
            if (!is8bits && dest === Register.rax)
            {
                this.write(0x05 | (oper << 3));
                this.writeInt32(chr);
            }
            else
            {
                this.write(0x81 | (+is8bits << 1));
                this._target((oper << 3) | (dest&7), dest, offset, movoper);
                if (is8bits) this.write(chr);
                else this.writeInt32(chr);
            }
        }
        return this;
    }

    private _jmp(isCall:boolean, r:Register, offset:number, oper:MovOper):this
    {
        if (r >= Register.r8) this.write(0x41);
        this.write(0xff);
        this._target((isCall ? 0x10 : 0x20) | (r & 7), r, offset, oper);
        return this;
    }

    private _jmp_r(isCall:boolean, r:Register):this
    {
        return this._jmp(isCall, r, 0, MovOper.Register);
    }

    private _jmp_o(oper:JumpOperation, offset:number):this
    {
        if (INT8_MIN <= offset && offset <= INT8_MAX)
        {
            return this.write(0x70 | oper, offset);
        }
        else
        {
            this.write(0x0f);
            this.write(0x80 | oper);
            this.writeInt32(offset);
        }
        return this;
    }

    /**
     * lea
     */
    lea_r_rp(dest:Register, src:Register, offset:number, size = OperationSize.qword):this
    {
        if (offset === 0) return this.mov_r_r(dest, src, size);
        return this._mov(src, dest, offset, 0, MovOper.Lea, size);
    }

    /**
     * move register to register
     */
    mov_r_r(dest:Register, src:Register, size = OperationSize.qword):this
    {
        return this._mov(dest, src, 0, 0, MovOper.Register, size);
    }

    /**
     * move const to register
     */
    mov_r_c(dest:Register, value:Value64, size = OperationSize.qword):this
    {
        return this._mov(dest, 0, 0, value, MovOper.Const, size);
    }

    /**
     * move const to register pointer
     */
    mov_rp_c(dest:Register, offset:number, value:number, size = OperationSize.qword):this
    {
        return this._mov(dest, 0, offset, value, MovOper.WriteConst, size);
    }

    /**
     * move register to register pointer
     */
    mov_rp_r(dest:Register, offset:number, src:Register, size = OperationSize.qword):this
    {
        return this._mov(dest, src, offset, 0, MovOper.Write, size);
    }

    /**
     * move register pointer to register
     */
    mov_r_rp(dest:Register, src:Register, offset:number, size = OperationSize.qword):this
    {
        return this._mov(src, dest, offset, 0, MovOper.Read, size);
    }

    /**
     * move gs to register
     */
    mov_r_gs(register:Register, value:number):this
    {
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
    jmp_r(register:Register):this
    {
        return this._jmp_r(false, register);
    }

    /**
     * call with register
     */
    call_r(register:Register):this
    {
        return this._jmp_r(true, register);
    }

    /**
     * jump with register pointer
     */
    jmp_rp(register:Register, offset:number):this
    {
        return this._jmp(false, register, offset, MovOper.Read);
    }

    jmp_rpip(offset:number):this
    {
        this.write(0xff, 0x25);
        this.writeInt32(offset);
        return this;
    }

    /**
     * call with register pointer
     */
    call_rp(register:Register, offset:number):this
    {
        return this._jmp(true, register, offset, MovOper.Read);
    }

    /**
     * mov tmpreg, 64bits
     * call tmpreg
     */
    call64(value:Value64, tempRegister:Register):this
    {
        this.mov_r_c(tempRegister, value);
        this.call_r(tempRegister);
        return this;
    }

    /**
     * mov tmpreg, 64bits
     * jmp tmpreg
     */
    jmp64(value:Value64, tempRegister:Register):this
    {
        this.mov_r_c(tempRegister, value);
        this.jmp_r(tempRegister);
        return this;
    }

    /**
     * mov [rsp-4], high32(v)
     * mov [rsp-8],  low32(v)
     * jmp [rsp-8]
     */
    jmp64_notemp(value:Value64):this
    {
        const [low32, high32] = split64bits(value);
        this.mov_rp_c(Register.rsp, -8, low32, OperationSize.dword);
        this.mov_rp_c(Register.rsp, -4, high32, OperationSize.dword);
        this.jmp_rp(Register.rsp, -8);
        return this;
    }

    jmp_label(label:string):this
    {
        const size = this.size();
        const addr = this.addrmap[label];
        if (typeof addr !== 'number')
        {
            throw Error('asm does not support the forward jmp currently');
        }
        let offset = addr - size - 2;
        if (INT8_MIN <= offset && offset <= INT8_MAX)
        {
            return this.jmp_c(offset);
        }
        else
        {
            return this.jmp_c(offset - 3);
        }
    }

    jmp_c(offset:number):this {
        if (INT8_MIN <= offset && offset <= INT8_MAX)
        {
            return this.write(0xeb, offset);
        }
        else
        {
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

    jz(offset:number) { return this._jmp_o(JumpOperation.je, offset); }
    jnz(offset:number) { return this._jmp_o(JumpOperation.jne, offset); }
    jo(offset:number) { return this._jmp_o(JumpOperation.jo, offset); }
    jno(offset:number) { return this._jmp_o(JumpOperation.jno, offset); }
    jb(offset:number) { return this._jmp_o(JumpOperation.jb, offset); }
    jae(offset:number) { return this._jmp_o(JumpOperation.jae, offset); }
    je(offset:number) { return this._jmp_o(JumpOperation.je, offset); }
    jne(offset:number) { return this._jmp_o(JumpOperation.jne, offset); }
    jbe(offset:number) { return this._jmp_o(JumpOperation.jbe, offset); }
    ja(offset:number) { return this._jmp_o(JumpOperation.ja, offset); }
    js(offset:number) { return this._jmp_o(JumpOperation.js, offset); }
    jns(offset:number) { return this._jmp_o(JumpOperation.jns, offset); }
    jp(offset:number) { return this._jmp_o(JumpOperation.jp, offset); }
    jnp(offset:number) { return this._jmp_o(JumpOperation.jnp, offset); }
    jl(offset:number) { return this._jmp_o(JumpOperation.jl, offset); }
    jge(offset:number) { return this._jmp_o(JumpOperation.jge, offset); }
    jle(offset:number) { return this._jmp_o(JumpOperation.jle, offset); }
    jg(offset:number) { return this._jmp_o(JumpOperation.jg, offset); }


    /**
     * push register
     */
    push_r(register:Register):this
    {
        if (register >= Register.r8) this.write(0x41);
        this.write(0x50 | (register & 7));
        return this;
    }
        
    /**
     * push const
     */
    push_c(value:number):this
    {
        if (value !== (value|0)) throw Error('needs int32 integer');
        if (INT8_MIN <= value && value <= INT8_MAX)
        {
            this.write(0x6A);
            this.write(value);
        }
        else
        {
            this.write(0x68);
            this.writeInt32(value);
        }
        return this;
    }

    push_rp(r:Register, offset:number):this
    {
        if (r >= Register.r8) this.write(0x41);
        this.write(0xff);
        this._target(0x30 | (r & 7), r, offset, MovOper.Write);
        return this;
    }
        
    pop_r(r:Register):this
    {
        if (r >= Register.r8) this.write(0x41);
        this.write(0x58 | (r&7));
        return this;
    }

    test_r_r(dest:Register, src:Register):this
    {
        this._regex(src, dest, OperationSize.qword);
        this.write(0x85);
        this.write(0xC0 | (src << 3) | dest);
        return this;
    }

    cmp_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Register, Operator.cmp, dest, src, 0, 0, size);
    }
    sub_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Register, Operator.sub, dest, src, 0, 0, size);
    }
    add_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Register, Operator.add, dest, src, 0, 0, size);
    }
    sbb_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Register, Operator.sbb, dest, src, 0, 0, size);
    }
    adc_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Register, Operator.adc, dest, src, 0, 0, size);
    }
    xor_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Register, Operator.xor, dest, src, 0, 0, size);
    }
    or_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Register, Operator.or, dest, src, 0, 0, size);
    }
    and_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Register, Operator.and, dest, src, 0, 0, size);
    }

    cmp_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Const, Operator.cmp, dest, 0, 0, chr, size);
    }
    sub_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Const, Operator.sub, dest, 0, 0, chr, size);
    }
    add_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Const, Operator.add, dest, 0, 0, chr, size);
    }
    sbb_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Const, Operator.sbb, dest, 0, 0, chr, size);
    }
    adc_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Const, Operator.adc, dest, 0, 0, chr, size);
    }
    xor_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Const, Operator.xor, dest, 0, 0, chr, size);
    }
    or_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Const, Operator.or, dest, 0, 0, chr, size);
    }
    and_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Const, Operator.and, dest, 0, 0, chr, size);
    }

    cmp_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.cmp, dest, 0, offset, chr, size);
    }
    sub_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.sub, dest, 0, offset, chr, size);
    }
    add_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.add, dest, 0, offset, chr, size);
    }
    sbb_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.sbb, dest, 0, offset, chr, size);
    }
    adc_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.adc, dest, 0, offset, chr, size);
    }
    xor_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.xor, dest, 0, offset, chr, size);
    }
    or_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.or, dest, 0, offset, chr, size);
    }
    and_rp_c(dest:Register, offset:number, chr:number, size = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.and, dest, 0, offset, chr, size);
    }

    cmp_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Read, Operator.cmp, src, dest, offset, 0, size);
    }
    sub_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Read, Operator.sub, src, dest, offset, 0, size);
    }
    add_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Read, Operator.add, src, dest, offset, 0, size);
    }
    sbb_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Read, Operator.sbb, src, dest, offset, 0, size);
    }
    adc_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Read, Operator.adc, src, dest, offset, 0, size);
    }
    xor_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Read, Operator.xor, src, dest, offset, 0, size);
    }
    or_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Read, Operator.or, src, dest, offset, 0, size);
    }
    and_r_rp(dest:Register, src:Register, offset:number, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Read, Operator.and, src, dest, offset, 0, size);
    }

    cmp_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.cmp, dest, src, offset, 0, size);
    }
    sub_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.sub, dest, src, offset, 0, size);
    }
    add_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.add, dest, src, offset, 0, size);
    }
    sbb_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.sbb, dest, src, offset, 0, size);
    }
    adc_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.adc, dest, src, offset, 0, size);
    }
    xor_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.xor, dest, src, offset, 0, size);
    }
    or_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.or, dest, src, offset, 0, size);
    }
    and_rp_r(dest:Register, offset:number, src:Register, size:OperationSize = OperationSize.qword):this
    {
        return this._oper(MovOper.Write, Operator.and, dest, src, offset, 0, size);
    }

    shr_r_c(dest:Register, chr:number, size = OperationSize.qword):this
    {
        this._regex(dest, 0, size);
        this.write(0xc1);
        this.write(0xe8 | dest);
        this.write(chr%128);
        return this;
    }
    shl_r_c(dest:Register, chr:number, size = OperationSize.qword):this
    {
        this._regex(dest, 0, size);
        this.write(0xc1);
        this.write(0xe0 | dest);
        this.write(chr%128);
        return this;
    }
}

export function asm():X64Assembler
{
    return new X64Assembler;
}

export function debugGate(func:VoidPointer):VoidPointer
{
    return asm().debugBreak().jmp64(func, Register.rax).alloc();
}
