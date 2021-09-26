import { bin } from "./bin";
import { fsutil } from "./fsutil";
import { polynominal } from "./polynominal";
import { remapStack } from "./source-map-support";
import { ParsingError, ParsingErrorContainer, SourcePosition, TextLineParser } from "./textparser";
import { checkPowOf2, getLineAt } from "./util";
import { BufferReader, BufferWriter } from "./writer/bufferstream";
import { ScriptWriter } from "./writer/scriptwriter";
import colors = require('colors');

export enum Register
{
    absolute=-2,
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

enum FloatOper {
    None,
    Convert_f2i,
    Convert_i2f,
    ConvertTruncated_f2i,
    ConvertPrecision,
}

enum FloatOperSize {
    xmmword,
    singlePrecision,
    doublePrecision
}

export enum OperationSize
{
    void,
    byte,
    word,
    dword,
    qword,
    mmword,
    xmmword
}

interface TypeSize {
    bytes: number;
    size:OperationSize;
}

const sizemap = new Map<string, TypeSize>([
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
export type AsmMultiplyConstant = 1|2|4|8;

function isZero(value:Value64):boolean {
    switch (typeof value) {
    case 'string':
        return bin.isZero(value);
    case 'object': {
        const v = value[asm.splitTwo32Bits]();
        return v[0] === 0 && v[1] === 0;
    }
    case 'number':
        return value === 0;
    default:
        throw Error(`invalid constant value: ${value}`);
    }
}

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
    public readonly ids:AddressIdentifier[] = [];
    public readonly unresolved:UnresolvedConstant[] = [];

    constructor(array:Uint8Array, size:number, public align:number) {
        super(array, size);
    }

    setInt32(n:number, offset:number):void {
        if (this.size + 4 < offset) throw RangeError('Out of range');

        n |= 0;
        this.array[n] = offset;
        this.array[n+1] = offset>>8;
        this.array[n+2] = offset>>16;
        this.array[n+3] = offset>>24;
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

        for (const label of chunk.ids) {
            label.chunk = this;
            label.offset += this.size;
        }
        this.ids.push(...chunk.ids);
        for (const jump of chunk.unresolved) {
            jump.offset += this.size;
        }
        this.unresolved.push(...chunk.unresolved);
        this.write(chunk.buffer());

        const next = chunk.next;
        this.next = next;
        if (next !== null) next.prev = this;

        chunk.unresolved.length = 0;
        chunk.ids.length = 0;
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
                offset += this.size;
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

class Identifier {
    constructor(
        public name:string|null) {
    }
}

class Constant extends Identifier {
    constructor(name:string, public value:number) {
        super(name);
    }
}

class AddressIdentifier extends Identifier {
    constructor(
        name:string|null,
        public chunk:AsmChunk|null,
        public offset:number) {
        super(name);
    }

    sameAddressWith(other:AddressIdentifier):boolean {
        return this.chunk === other.chunk && this.offset === other.offset;
    }
}

class Label extends AddressIdentifier {
    public UnwindCodes:(UNWIND_CODE|number)[]|null = null;
    public frameRegisterOffset = 0;
    public frameRegister:Register = Register.rax;
    public exceptionHandler:Label|null = null;

    isProc():boolean {
        return this.UnwindCodes !== null;
    }

    constructor(name:string|null) {
        super(name, null, 0);
    }

    setStackFrame(label:Label, r:Register, offset:number):void {
        if (this.frameRegister !== Register.rax) throw Error(`already set`);
        if (this.UnwindCodes === null) throw Error(`${this.name} is not proc`);
        if (offset < 0 || offset > 240) throw TypeError(`offset out of range (offset=${offset}, not in 0~240)`);
        const qcount = offset>>4;
        if ((qcount << 4) !== offset) throw TypeError(`is not 16 bytes aligned (offset=${offset})`);
        this.frameRegisterOffset = qcount;
        if (r <= Register.rax || r > Register.r15) throw TypeError(`register out of range (register=${r}, not in 1~15)`);
        this.frameRegister = r;
        this.UnwindCodes.push(new UNWIND_CODE(label, UWOP_SET_FPREG, 0));
    }

    allocStack(label:Label, bytes:number):void {
        if (this.UnwindCodes === null) throw Error(`${this.name} is not proc`);
        if (bytes <= 0) throw TypeError(`too small (bytes=${bytes})`);
        const qcount = bytes>>3;
        if ((qcount << 3) !== bytes) throw TypeError(`is not 8 bytes aligned (bytes=${bytes})`);
        if (qcount <= 0xf) {
            this.UnwindCodes.push(new UNWIND_CODE(label, UWOP_ALLOC_SMALL, qcount-1));
        } else {
            if (qcount <= 0xffff) {
                this.UnwindCodes.push(qcount);
                this.UnwindCodes.push(new UNWIND_CODE(label, UWOP_ALLOC_LARGE, 0));
            } else {
                this.UnwindCodes.push(bytes >>> 16);
                this.UnwindCodes.push(bytes & 0xffff);
                this.UnwindCodes.push(new UNWIND_CODE(label, UWOP_ALLOC_LARGE, 1));
            }
        }
    }

    pushRegister(label:Label, register:Register):void {
        if (this.UnwindCodes === null) throw Error(`${this.name} is not proc`);
        this.UnwindCodes.push(new UNWIND_CODE(label, UWOP_PUSH_NONVOL, register));
    }

    private _getLastUnwindCode():UNWIND_CODE|null {
        if (this.UnwindCodes === null) throw Error(`${this.name} is not proc`);
        for (let i=this.UnwindCodes.length-1;i>=0;i--) {
            const code = this.UnwindCodes[i];
            if (typeof code === 'number') continue;
            return code;
        }
        return null;
    }

    getUnwindInfoSize():number {
        if (this.UnwindCodes === null) throw Error(`${this.name} is not proc`);
        const unwindCodeSize = (((this.UnwindCodes.length + 1) & ~1) - 1) * 2;
        return unwindCodeSize + 8;
    }

    writeUnwindInfoTo(chunk:AsmChunk, functionBegin:number):void {
        if (this.UnwindCodes === null) throw Error(`${this.name} is not proc`);

        const flags = this.exceptionHandler !== null ? UNW_FLAG_EHANDLER : UNW_FLAG_NHANDLER;
        chunk.writeUint8(UNW_VERSION | (flags << 3)); // Version 3 bits, Flags 5 bits

        const last = this._getLastUnwindCode();
        const SizeOfProlog = last === null ? 0 : last.label.offset - functionBegin;
        chunk.writeUint8(SizeOfProlog); // SizeOfProlog
        chunk.writeUint8(this.UnwindCodes.length); // CountOfUnwindCodes
        if (this.frameRegister === Register.rax) {
            chunk.writeUint8(0);
        } else {
            chunk.writeUint8(this.frameRegister | (this.frameRegisterOffset << 4)); // FrameRegister 4 bits, FrameRegisterOffset 4 bits
        }
        for (let i=this.UnwindCodes.length-1;i>=0;i--) {
            const code = this.UnwindCodes[i];
            if (typeof code === 'number') {
                chunk.writeUint16(code);
            } else {
                code.writeTo(functionBegin, chunk);
            }
        }
        if ((this.UnwindCodes.length & 1) !== 0) {
            chunk.writeInt16(0);
        }
        // Exception Handler or Chained Unwind Info
        if (this.exceptionHandler !== null) {
            chunk.writeInt32(this.exceptionHandler.offset); // ExceptionHandler
        }
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
        public readonly func:(this:X64Assembler, ...args:any[])=>X64Assembler) {
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

const MEMORY_INDICATE_CHUNK = new AsmChunk(new Uint8Array(0), 0, 1);


const UNW_VERSION = 0x01;
const UNW_FLAG_NHANDLER = 0x0;
const UNW_FLAG_EHANDLER = 0x1; // The function has an exception handler that should be called when looking for functions that need to examine exceptions.
const UNW_FLAG_UHANDLER = 0x2; // The function has a termination handler that should be called when unwinding an exception.
const UNW_FLAG_CHAININFO = 0x4;

const UWOP_PUSH_NONVOL = 0;     /* info == register number */
const UWOP_ALLOC_LARGE = 1;     /* no info, alloc size in next 2 slots */
const UWOP_ALLOC_SMALL = 2;     /* info == size of allocation / 8 - 1 */
const UWOP_SET_FPREG = 3;       /* no info, FP = RSP + UNWIND_INFO.FPRegOffset*16 */
const UWOP_SAVE_NONVOL = 4;     /* info == register number, offset in next slot */
const UWOP_SAVE_NONVOL_FAR = 5; /* info == register number, offset in next 2 slots */
const UWOP_SAVE_XMM128 = 8;     /* info == XMM reg number, offset in next slot */
const UWOP_SAVE_XMM128_FAR = 9; /* info == XMM reg number, offset in next 2 slots */
const UWOP_PUSH_MACHFRAME = 10; /* info == 0: no error-code, 1: error-code */

class UNWIND_CODE {
    constructor(public label:Label, public UnwindOp:number, public OpInfo:number) {
        if (this.OpInfo < 0) throw TypeError(`Too small (OpInfo=${OpInfo})`);
        if (this.OpInfo > 0xf) throw TypeError(`Too large (OpInfo=${OpInfo})`);
        if (this.UnwindOp < 0) throw TypeError(`Too small (UnwindOp=${UnwindOp})`);
        if (this.UnwindOp > 0xf) throw TypeError(`Too large (UnwindOp=${UnwindOp})`);
    }

    writeTo(functionBegin:number, buf:AsmChunk):void {
        buf.writeUint8(this.label.offset - functionBegin); // CodeOffset
        buf.writeUint8(this.UnwindOp | (this.OpInfo << 4)); // UnwindOp 4 bits, OpInfo 4 bits
    }
}

export enum FFOperation {
    inc,
    dec,
    call,
    call_far,
    jmp,
    jmp_far,
    push
}

interface RUNTIME_FUNCTION {
    BeginAddress:number;
    EndAddress:number;
    UnwindData:number;
}

export class X64Assembler {

    private memoryChunkSize = 0;
    private memoryChunkAlign = 1;
    private codeAlign = 1;
    private constChunk:AsmChunk|null = null;
    private chunk:AsmChunk;
    private readonly ids = new Map<string, Identifier>();
    private readonly scopeStack:Set<string>[] = [];
    private scope = new Set<string>();
    private currentProc:Label|null = null;
    private readonly headProc:Label;
    private unwinded = false;
    private normalized = false;

    private prologueAnchor:Label|null = null;

    private pos:SourcePosition|null = null;

    private _polynominal(text:string, offset:number, lineNumber:number):polynominal.Operand {
        let res = polynominal.parse(text, lineNumber, offset);
        for (const [name, value] of this.ids) {
            if (!(value instanceof Constant)) continue;
            res = res.defineVariable(name, value.value);
        }
        return res;
    }
    private _polynominalToAddress(text:string, offset:number, lineNumber:number):{r1: Register|null, r2: Register|null, multiply: number, offset: number} {
        const poly = this._polynominal(text, offset, lineNumber).asAdditive();
        let varcount = 0;

        function error(message:string, column:number=0, width:number = text.length):never {
            throw new ParsingError(message, {
                column: offset + column,
                width: width,
                line: lineNumber
            });
        }

        const regs:(Register|null)[] = [];
        let mult = 1;

        for (const term of poly.terms) {
            if (term.variables.length > 1) {
                error(`polynominal is too complex, variables are multiplying`);
            }
            const v = term.variables[0];
            if (!v.degree.equalsConstant(1)) error(`polynominal is too complex, degree is not 1`);
            if (!(v.term instanceof polynominal.Name)) error('polynominal is too complex, complex term');
            switch (term.constant) {
            case 1: case 2: case 4: case 8:
                break;
            default: error('unexpected constant for multiplying. only possible with 1,2,4,8');
            }
            const type = regmap.get(v.term.name.toLowerCase());
            if (type) {
                const [argname, reg, size] = type;
                if (argname.short !== 'r') error(`unexpected identifier: ${v.term.name}`, v.term.column, v.term.length);
                if (size !== OperationSize.qword) error(`unexpected register: ${v.term.name}`);

                varcount ++;
                if (varcount >= 3) error(`polynominal has too many variables`);

                if (term.constant !== 1) {
                    if (mult !== 1) error('too many multiplying.');
                    mult = term.constant;
                    regs.unshift(reg as Register);
                } else {
                    regs.push(reg as Register);
                }

            } else {
                const identifier = this.ids.get(v.term.name);
                if (!identifier) {
                    error(`identifier not found: ${v.term.name}`, v.term.column, v.term.length);
                }
                error(`Invalid identifier: ${v.term.name}`, v.term.column, v.term.length);
            }
        }
        if (regs.length > 3) error('Too many registers');

        while (regs.length < 2) regs.push(null);

        return {
            r1: regs[0],
            r2: regs[1],
            multiply: mult,
            offset: poly.constant
        };
    }

    constructor(buffer:Uint8Array, size:number, align:number = 1) {
        this.chunk = new AsmChunk(buffer, size, align);
        this.currentProc = this.headProc = this.makeLabel('#head', false, true);
        this.scopeStack.push(this.scope);
        this.scope = new Set;
        this.prologueAnchor = this.makeLabel(null);
    }

    private _checkPrologue():Label {
        if (this.currentProc === null) {
            throw Error(`not in proc`);
        }
        if (this.prologueAnchor === null || this.prologueAnchor.chunk !== this.chunk || this.prologueAnchor.offset !== this.chunk.size) {
            throw Error(`not in prologue`);
        }
        return this.currentProc;
    }

    /**
     * push with unwind info
     */
    keep_r(register:Register):this {
        const proc = this._checkPrologue();
        this.push_r(register);
        this.prologueAnchor = this.makeLabel(null);
        proc.pushRegister(this.prologueAnchor, register);
        return this;
    }

    /**
     * push with unwind info
     */
    stack_c(size:number):this {
        const proc = this._checkPrologue();
        this.sub_r_c(Register.rsp, size);
        this.prologueAnchor = this.makeLabel(null);
        proc.allocStack(this.prologueAnchor, size);
        return this;
    }

    setframe_r_c(r:Register, offset:number):this {
        const proc = this._checkPrologue();
        this.lea_r_rp(r, Register.rsp, 1, offset);
        this.prologueAnchor = this.makeLabel(null);
        proc.setStackFrame(this.prologueAnchor, r, offset);
        return this;
    }

    getDefAreaSize():number {
        return this.memoryChunkSize;
    }

    getDefAreaAlign():number {
        return this.memoryChunkAlign;
    }

    setDefArea(size:number, align:number):void {
        checkPowOf2(align);
        this.memoryChunkSize = size;
        this.memoryChunkAlign = align;
        if (align > this.codeAlign) this.codeAlign = align;
    }

    connect(cb:(asm:X64Assembler)=>this):this {
        return cb(this);
    }

    put(value:number):this {
        this.chunk.put(value);
        return this;
    }

    write(...values:number[]):this {
        this.chunk.write(values);
        return this;
    }

    writeBuffer(buffer:number[]|Uint8Array):this {
        this.chunk.write(buffer);
        return this;
    }

    writeUint8(value:number):this {
        this.chunk.writeUint8(value);
        return this;
    }

    writeInt16(value:number):this {
        this.chunk.writeInt16(value);
        return this;
    }

    writeInt32(value:number):this {
        this.chunk.writeInt32(value);
        return this;
    }

    getLabelOffset(name:string):number {
        if (!this.normalized) throw Error(`asm is not built, need to call build()`);
        const label = this.ids.get(name);
        if (!(label instanceof AddressIdentifier)) return -1;
        return label.offset;
    }

    labels(skipPrivate?:boolean):Record<string, number> {
        if (!this.normalized) throw Error(`asm is not built, need to call build()`);
        const labels:Record<string, number> = Object.create(null);
        for (const [name, label] of this.ids) {
            if (skipPrivate && name.startsWith('#')) continue;
            if (label instanceof Label) {
                labels[name] = label.offset;
            }
        }
        return labels;
    }

    defs():Record<string, number> {
        if (!this.normalized) throw Error(`asm is not built, need to call build()`);
        const labels:Record<string, number> = Object.create(null);
        for (const [name, label] of this.ids) {
            if (label instanceof Defination) {
                labels[name] = label.offset;
            }
        }
        return labels;
    }

    buffer(makeRuntimeFunctionTable:boolean = false):Uint8Array {
        this._normalize(makeRuntimeFunctionTable);
        return this.chunk.buffer();
    }

    ret(): this {
        return this.put(0xc3);
    }

    nop(): this {
        return this.put(0x90);
    }

    debugBreak():this {
        return this.int3();
    }

    int3():this {
        return this.put(0xcc);
    }

    int_c(n:number):this {
        if (n === 3) return this.int3();
        return this.write(0xcd, n & 0xff);
    }

    cbw():this {
        return this.write(0x66, 0x98);
    }
    cwde():this {
        return this.write(0x98);
    }
    cdqe():this {
        return this.write(0x48, 0x98);
    }

    gs():this {
        return this.put(0x65);
    }
    fs():this {
        return this.put(0x64);
    }
    ds():this {
        return this;
    }

    cs():this {
        return this.put(0x2e);
    }
    es():this {
        return this.put(0x26);
    }
    ss():this {
        return this.put(0x36);
    }

    repz():this {
        return this.write(0xf3);
    }
    repnz():this {
        return this.write(0xf2);
    }

    private _target(opcode:number, r1:Register|FloatRegister, r2:Register|FloatRegister|Operator|null, r3:Register|null,
        targetRegister:Register|FloatRegister, multiplying:AsmMultiplyConstant, offset:number, oper:MovOper):this {
        if (r2 !== null) {
            opcode |= (r2 & 7) << 3;
        }
        if (oper === MovOper.Register || oper === MovOper.Const) {
            if (offset !== 0) throw Error('Register operation with offset');
            return this.put(opcode | (r1 & 7) | 0xc0);
        }
        if (offset !== (offset|0)) throw Error(`need int32 offset, offset=${offset}`);
        if (r1 === Register.absolute) {
            if (r3 !== null) {
                throw Error('Invalid opcode');
            }
            this.put(opcode | 0x04);
            this.put(0x25);
            this.writeInt32(offset);
            return this;
        } else if (r1 === Register.rip) {
            if (r3 !== null) {
                throw Error('Invalid opcode');
            }
            this.put(opcode | 0x05);
            this.writeInt32(offset);
            return this;
        }
        if (offset === 0 && r1 !== Register.rbp) {
            // empty
        } else if (INT8_MIN <= offset && offset <= INT8_MAX) {
            opcode |= 0x40;
        } else {
            opcode |= 0x80;
        }

        if (r3 !== null) {
            if (r3 === Register.rsp) {
                throw Error(`Invalid operation r3=rsp, r1=${Register[r1]}`);
            }
            this.put(opcode | 0x04);
            let second = (r1 & 7) | (r3 & 7) << 3;
            switch (multiplying) {
            case 1: break;
            case 2: second |= 0x40; break;
            case 4: second |= 0x80; break;
            case 8: second |= 0xc0; break;
            default: throw Error(`Invalid multiplying ${multiplying}`);
            }
            this.put(second);
        } else {
            if (multiplying !== 1) {
                this.put(opcode | 0x04);
                let second = ((r1 & 7) << 3) | 0x05;
                switch (multiplying) {
                case 2: second |= 0x40; break;
                case 4: second |= 0x80; break;
                case 8: second |= 0xc0; break;
                default: throw Error(`Invalid multiplying ${multiplying}`);
                }
                this.put(second);
            } else {
                this.put((r1 & 7) | opcode);
                if (targetRegister === Register.rsp) {
                    this.put(0x24);
                }
            }
        }

        if (opcode & 0x40) this.put(offset);
        else if (opcode & 0x80) {
            this.writeInt32(offset);
        }
        return this;
    }

    private _rex(r1:Register|FloatRegister, r2:Register|FloatRegister|null, r3:Register|FloatRegister|null, size:OperationSize):void {
        if (size === OperationSize.word) this.put(0x66);

        let rex = 0x40;
        if (size === OperationSize.qword) rex |= 0x08;
        if (r1 >= Register.r8) rex |= 0x01;
        if (r2 !== null && r2 >= Register.r8) rex |= 0x04;
        if (r3 !== null && r3 >= Register.r8) rex |= 0x02;
        if (rex !== 0x40) this.put(rex);
    }

    private _const(v:Value64, size:OperationSize):this {
        const [low32, high32] = split64bits(v);
        if (size === OperationSize.byte) {
            this.put(low32 & 0xff);
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
        r1:Register, r2:Register|null, r3:Register|null, multiply:AsmMultiplyConstant,
        offset:number, value:Value64,
        oper:MovOper, size:OperationSize):this {
        this._rex(r1, r2, r3, size);
        let opcode = 0;

        if (size === OperationSize.byte) {
            if (oper === MovOper.WriteConst) {
                this.put(0xc6);
            } else if (oper === MovOper.Const) {
                opcode |= 0xb0;
            }
        } else {
            if (oper === MovOper.WriteConst) {
                this.put(0xc7);
            } else if (oper === MovOper.Const) {
                if (size === OperationSize.qword && is32Bits(value)) {
                    size = OperationSize.dword;
                    this.put(0xc7);
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
            this.put(memorytype);
        }

        if (oper === MovOper.Const) {
            this.put(opcode | (r1 & 7));
        } else {
            this._target(opcode, r1, r2, r3, r1, multiply, offset, oper);
        }

        if (oper === MovOper.WriteConst) {
            this._const(value, size === OperationSize.qword ? OperationSize.dword : size);
        } else if (oper === MovOper.Const) {
            this._const(value, size);
        }
        return this;
    }

    movabs_r_c(
        dest:Register, value:Value64, size:OperationSize = OperationSize.qword):this {
        if (size !== OperationSize.qword) throw Error(`Invalid operation size ${OperationSize[size]}`);
        return this.mov_r_c(dest, value, size);
    }

    private _movabs_rax_mem(address:Value64, writeBit:number, size:OperationSize):this {
        if (size === OperationSize.word) {
            this.write(0x66);
        } else if (size === OperationSize.qword) {
            this.write(0x48);
        }
        const dwordBit = +(size !== OperationSize.byte);
        this.write((writeBit << 1) | dwordBit | 0xa0);
        const [low32, high32] = split64bits(address);
        this.writeInt32(low32);
        this.writeInt32(high32);
        return this;
    }

    movabs_r_cp(
        dest:Register, address:Value64, size:OperationSize = OperationSize.qword):this {
        if (dest !== Register.rax) throw Error(`Invalid operand ${Register[dest]}`);
        return this._movabs_rax_mem(address, 0, size);
    }

    movabs_cp_r(
        address:Value64, src:Register, size:OperationSize = OperationSize.qword):this {
        if (src !== Register.rax) throw Error(`Invalid operand ${Register[src]}`);
        return this._movabs_rax_mem(address, 1, size);
    }

    def(name:string, size:OperationSize, bytes:number, align:number, exportDef:boolean = false):this {
        if (align < 1) align = 1;
        checkPowOf2(align);
        if (align > this.memoryChunkAlign) {
            this.memoryChunkAlign = align;
        }

        const memSize = this.memoryChunkSize;
        const offset = (memSize + align - 1) & ~(align-1);
        this.memoryChunkSize = offset + bytes;
        if (name === '') return this;
        if (this.ids.has(name)) throw Error(`${name} is already defined`);
        this.ids.set(name, new Defination(name, MEMORY_INDICATE_CHUNK, offset, size));
        if (!exportDef) this.scope.add(name);
        return this;
    }

    lea_r_cp(dest:Register, offset:number, size = OperationSize.qword):this {
        return this.mov_r_c(dest, offset, size);
    }

    lea_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size = OperationSize.qword):this {
        if (offset === 0 && src !== Register.rip) {
            if (dest === src) return this;
            return this.mov_r_r(dest, src, size);
        }
        return this._mov(src, dest, null, multiply, offset, 0, MovOper.Lea, size);
    }

    lea_r_rrp(dest:Register, src1:Register, src2:Register, multiply:AsmMultiplyConstant, offset:number, size = OperationSize.qword):this {
        return this._mov(src1, dest, src2, multiply, offset, 0, MovOper.Lea, size);
    }

    /**
     * move register to register
     */
    mov_r_r(dest:Register, src:Register, size = OperationSize.qword):this {
        return this._mov(dest, src, null, 1, 0, 0, MovOper.Register, size);
    }

    /**
     * move const to register
     */
    mov_r_c(dest:Register, value:Value64, size = OperationSize.qword):this {
        if (size === OperationSize.qword || size === OperationSize.dword) {
            const [low, high] = split64bits(value);
            if (low === 0 && high === 0) return this.xor_r_r(dest, dest);
        }
        return this._mov(dest, 0, null, 1, 0, value, MovOper.Const, size);
    }

    /**
     * move const to register pointer
     */
    mov_rp_c(dest:Register, multiply:AsmMultiplyConstant, offset:number, value:number, size = OperationSize.qword):this {
        return this._mov(dest, null, null, multiply, offset, value, MovOper.WriteConst, size);
    }

    /**
     * move register to register pointer
     */
    mov_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size = OperationSize.qword):this {
        return this._mov(dest, src, null, multiply, offset, 0, MovOper.Write, size);
    }

    /**
     * move register pointer to register
     */
    mov_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size = OperationSize.qword):this {
        return this._mov(src, dest, null, multiply, offset, 0, MovOper.Read, size);
    }

    private _imul(r1:Register, r2:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize, oper:MovOper):this {
        if (size !== OperationSize.dword && size !== OperationSize.qword && size !== OperationSize.word) throw Error('unsupported');
        this._rex(r1, r2, null, size);
        this.write(0x0f, 0xaf);
        this._target(0x00, r1, r2, null, r1, multiply, offset, oper);
        return this;
    }

    imul_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._imul(src, dest, 1, 0, size, MovOper.Register);
    }

    imul_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._imul(src, dest, multiply, offset, size, MovOper.Write);
    }

    imul_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._imul(src, dest, multiply, offset, size, MovOper.Read);
    }

    idiv_r(src:Register, size:OperationSize = OperationSize.qword):this {
        this._rex(src, null, null, size);
        return this.write(0xf7, 0xf8 | src);
    }

    /**
     * jump with register
     */
    jmp_r(register:Register):this {
        return this._ffoper_r(FFOperation.jmp, register, OperationSize.dword);
    }

    private _ffoper(ffoper:FFOperation, r:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize, oper:MovOper):this {
        if (r >= Register.r8) this.put(0x41);
        this._rex(r, null, null, size);
        this.put(0xff);
        this._target(ffoper << 3, r, null, null, r, multiply, offset, oper);
        return this;
    }
    private _ffoper_r(ffoper:FFOperation, r:Register, size:OperationSize):this {
        return this._ffoper(ffoper, r, 1, 0, size, MovOper.Register);
    }

    inc_r(r:Register, size:OperationSize = OperationSize.qword):this {
        return this._ffoper_r(FFOperation.inc, r, size);
    }
    inc_rp(r:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._ffoper(FFOperation.inc, r, multiply, offset, size, MovOper.Write);
    }
    dec_r(r:Register, size:OperationSize = OperationSize.qword):this {
        return this._ffoper_r(FFOperation.dec, r, size);
    }
    dec_rp(r:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._ffoper(FFOperation.dec, r, multiply, offset, size, MovOper.Write);
    }

    /**
     * call with register
     */
    call_r(register:Register):this {
        return this._ffoper_r(FFOperation.call, register, OperationSize.dword);
    }

    /**
     * jump with register pointer
     */
    jmp_rp(register:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._ffoper(FFOperation.jmp, register, multiply, offset, OperationSize.dword, MovOper.Read);
    }

    /**
     * call with register pointer
     */
    call_rp(register:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._ffoper(FFOperation.call, register, multiply, offset, OperationSize.dword, MovOper.Read);
    }

    /**
     * jump far pointer
     */
    jmp_fp(register:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._ffoper(FFOperation.jmp_far, register, multiply, offset, OperationSize.dword, MovOper.Read);
    }

    /**
     * call far pointer
     */
    call_fp(register:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._ffoper(FFOperation.call_far, register, multiply, offset, OperationSize.dword, MovOper.Read);
    }

    /**
     * just combine of 'mov' and 'call'.
     * mov tmpreg, value;
     * call tmpreg;
     */
    call64(value:Value64, tempRegister:Register):this {
        if (isZero(value)) throw Error(`Invalid jmp destination: ${value}`);
        this.mov_r_c(tempRegister, value);
        this.call_r(tempRegister);
        return this;
    }

    saveAndCall(
        target:Value64Castable,
        keepRegister:Register[],
        keepFloatRegister:FloatRegister[]):this {

        const fullsize = keepRegister.length * 8 + keepFloatRegister.length * 0x10;
        const stackSize = ((0x20 + fullsize -8 + 0xf) & ~0xf) + 8;
        this.stack_c(stackSize);

        let offset = 0x20;
        for (const r of keepFloatRegister) {
            this.movdqa_rp_f(Register.rsp, 1, offset, r);
            offset += 0x10;
        }
        for (const r of keepRegister) {
            this.mov_rp_r(Register.rsp, 1, offset, r);
            offset += 0x8;
        }
        this.call64(target, Register.rax);

        offset = 0x20;
        for (const r of keepFloatRegister) {
            this.movdqa_f_rp(r, Register.rsp, 1, offset);
            offset += 0x10;
        }
        for (const r of keepRegister) {
            this.mov_r_rp(r, Register.rsp, 1, offset);
            offset += 0x8;
        }
        this.unwind();
        return this;
    }

    /**
     * mov tmpreg, 64bits
     * jmp tmpreg
     */
    jmp64(value:Value64, tempRegister:Register):this {
        if (isZero(value)) throw Error(`Invalid jmp destination: ${value}`);
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
        if (isZero(value)) throw Error(`Invalid jmp destination: ${value}`);
        const [low32, high32] = split64bits(value);
        this.mov_rp_c(Register.rsp, 1, -8, low32, OperationSize.dword);
        this.mov_rp_c(Register.rsp, 1, -4, high32, OperationSize.dword);
        this.jmp_rp(Register.rsp, 1, -8);
        return this;
    }

    jmp_c(offset:number):this {
        if (INT8_MIN <= offset && offset <= INT8_MAX) {
            return this.write(0xeb, offset);
        } else {
            this.put(0xe9);
            this.writeInt32(offset);
            return this;
        }
    }

    call_c(offset:number):this {
        this.put(0xe8);
        this.writeInt32(offset);
        return this;
    }

    private _movaps(r1:FloatRegister|Register, r2:FloatRegister, oper:MovOper, multiply:AsmMultiplyConstant, offset:number):this {
        this._rex(r1, r2, null, OperationSize.dword);
        this.put(0x0f);
        let v = 0x28;
        if (oper === MovOper.Write) v |= 1;
        this.put(v);
        this._target(0, r1, r2, null, r1, multiply, offset, oper);
        return this;
    }

    movaps_f_f(dest:FloatRegister, src:FloatRegister):this {
        return this._movaps(src, dest, MovOper.Register, 1, 0);
    }

    movaps_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._movaps(src, dest, MovOper.Read, multiply, offset);
    }

    movaps_rp_f(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:FloatRegister):this {
        return this._movaps(dest, src, MovOper.Write, multiply, offset);
    }

    movdqa_rp_f(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:FloatRegister):this {
        this.write(0x66, 0x0f, 0x7f);
        this._target(0, dest, src, null, dest, multiply, offset, MovOper.Write);
        return this;
    }

    movdqa_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        this.write(0x66, 0x0f, 0x7f);
        this._target(0, src, dest, null, src, multiply, offset, MovOper.Read);
        return this;
    }

    private _jmp_o(oper:JumpOperation, offset:number):this {
        if (INT8_MIN <= offset && offset <= INT8_MAX) {
            return this.write(0x70 | oper, offset);
        } else {
            this.put(0x0f);
            this.put(0x80 | oper);
            this.writeInt32(offset);
        }
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

    private _cmov_o(jmpoper:JumpOperation, r1:Register, r2:Register, r3:Register|null, multiply:AsmMultiplyConstant, offset:number, oper:MovOper, size:OperationSize):this {
        this._rex(r1, r2, r3, size);
        this.put(0x0f);
        this.put(0x40 | jmpoper);
        this._target(0, r1, r2, r3, r2, multiply, offset, oper);
        return this;
    }

    cmovz_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.je, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovnz_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jne, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovo_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jo, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovno_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jno, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovb_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jb, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovae_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jae, src, dest, null, 1, 0, MovOper.Register, size); }
    cmove_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.je, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovne_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jne, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovbe_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jbe, src, dest, null, 1, 0, MovOper.Register, size); }
    cmova_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.ja, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovs_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.js, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovns_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jns, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovp_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jp, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovnp_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jnp, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovl_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jl, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovge_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jge, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovle_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jle, src, dest, null, 1, 0, MovOper.Register, size); }
    cmovg_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jg, src, dest, null, 1, 0, MovOper.Register, size); }

    cmovz_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.je, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovnz_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jne, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovo_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jo, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovno_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jno, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovb_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jb, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovae_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jae, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmove_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.je, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovne_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jne, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovbe_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jbe, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmova_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.ja, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovs_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.js, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovns_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jns, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovp_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jp, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovnp_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jnp, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovl_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jl, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovge_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jge, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovle_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jle, src, dest, null, multiply, offset, MovOper.Read, size); }
    cmovg_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this { return this._cmov_o(JumpOperation.jg, src, dest, null, multiply, offset, MovOper.Read, size); }

    private _set_o(jmpoper:JumpOperation, r1:Register, r3:Register|null, multiply:AsmMultiplyConstant, offset:number, oper:MovOper):this {
        this.put(0x0f);
        this.put(0x90 | jmpoper);
        this._target(0, r1, null, r3, r1, multiply, offset, oper);
        return this;
    }

    seto_r(r:Register):this {
        return this._set_o(JumpOperation.jo, r, null, 1, 0, MovOper.Register);
    }
    setno_r(r:Register):this {
        return this._set_o(JumpOperation.jno, r, null, 1, 0, MovOper.Register);
    }
    setb_r(r:Register):this {
        return this._set_o(JumpOperation.jb, r, null, 1, 0, MovOper.Register);
    }
    setae_r(r:Register):this {
        return this._set_o(JumpOperation.jae, r, null, 1, 0, MovOper.Register);
    }
    sete_r(r:Register):this {
        return this._set_o(JumpOperation.je, r, null, 1, 0, MovOper.Register);
    }
    setne_r(r:Register):this {
        return this._set_o(JumpOperation.jne, r, null, 1, 0, MovOper.Register);
    }
    setbe_r(r:Register):this {
        return this._set_o(JumpOperation.jbe, r, null, 1, 0, MovOper.Register);
    }
    seta_r(r:Register):this {
        return this._set_o(JumpOperation.ja, r, null, 1, 0, MovOper.Register);
    }
    sets_r(r:Register):this {
        return this._set_o(JumpOperation.js, r, null, 1, 0, MovOper.Register);
    }
    setns_r(r:Register):this {
        return this._set_o(JumpOperation.jns, r, null, 1, 0, MovOper.Register);
    }
    setp_r(r:Register):this {
        return this._set_o(JumpOperation.jp, r, null, 1, 0, MovOper.Register);
    }
    setnp_r(r:Register):this {
        return this._set_o(JumpOperation.jnp, r, null, 1, 0, MovOper.Register);
    }
    setl_r(r:Register):this {
        return this._set_o(JumpOperation.jl, r, null, 1, 0, MovOper.Register);
    }
    setge_r(r:Register):this {
        return this._set_o(JumpOperation.jge, r, null, 1, 0, MovOper.Register);
    }
    setle_r(r:Register):this {
        return this._set_o(JumpOperation.jle, r, null, 1, 0, MovOper.Register);
    }
    setg_r(r:Register):this {
        return this._set_o(JumpOperation.jg, r, null, 1, 0, MovOper.Register);
    }

    seto_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jo, r, null, multiply, offset, MovOper.Read);
    }
    setno_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jno, r, null, multiply, offset, MovOper.Read);
    }
    setb_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jb, r, null, multiply, offset, MovOper.Read);
    }
    setae_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jae, r, null, multiply, offset, MovOper.Read);
    }
    sete_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.je, r, null, multiply, offset, MovOper.Read);
    }
    setne_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jne, r, null, multiply, offset, MovOper.Read);
    }
    setbe_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jbe, r, null, multiply, offset, MovOper.Read);
    }
    seta_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.ja, r, null, multiply, offset, MovOper.Read);
    }
    sets_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.js, r, null, multiply, offset, MovOper.Read);
    }
    setns_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jns, r, null, multiply, offset, MovOper.Read);
    }
    setp_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jp, r, null, multiply, offset, MovOper.Read);
    }
    setnp_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jnp, r, null, multiply, offset, MovOper.Read);
    }
    setl_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jl, r, null, multiply, offset, MovOper.Read);
    }
    setge_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jge, r, null, multiply, offset, MovOper.Read);
    }
    setle_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jle, r, null, multiply, offset, MovOper.Read);
    }
    setg_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._set_o(JumpOperation.jg, r, null, multiply, offset, MovOper.Read);
    }


    /**
     * push register
     */
    push_r(register:Register, size:OperationSize = OperationSize.qword):this {
        if (size === OperationSize.word) {
            this.put(0x66);
        } else {
            if (size !== OperationSize.qword) throw Error(`Operand size mismatch for push: ${OperationSize[size]}`);
        }
        if (register >= Register.r8) this.put(0x41);
        this.put(0x50 | (register & 7));
        return this;
    }
    /**
     * push const
     */
    push_c(value:number):this {
        if (value !== (value|0)) throw Error('need int32 integer');
        if (INT8_MIN <= value && value <= INT8_MAX) {
            this.put(0x6A);
            this.put(value);
        } else {
            this.put(0x68);
            this.writeInt32(value);
        }
        return this;
    }
    push_rp(r:Register, multiply:AsmMultiplyConstant, offset:number):this {
        if (r >= Register.r8) this.put(0x41);
        this.put(0xff);
        this._target(0x30, r, null, null, r, multiply, offset, MovOper.Write);
        return this;
    }
    pop_r(r:Register, size:OperationSize = OperationSize.qword):this {
        if (size === OperationSize.word) {
            this.put(0x66);
        } else {
            if (size !== OperationSize.qword) throw Error(`Operand size mismatch for push: ${OperationSize[size]}`);
        }
        if (r >= Register.r8) this.put(0x41);
        this.put(0x58 | (r&7));
        return this;
    }
    private _test(r1:Register, r2:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize, oper:MovOper):this{
        this._rex(r1, r2, null, size);
        if (size === OperationSize.byte) this.put(0x84);
        else this.put(0x85);
        this._target(0, r1, r2, null, r1, multiply, offset, oper);
        return this;
    }

    test_r_r(r1:Register, r2:Register, size:OperationSize = OperationSize.qword):this {
        return this._test(r1, r2, 1, 0, size, MovOper.Register);
    }

    test_r_rp(r1:Register, r2:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._test(r1, r2, multiply, offset, size, MovOper.Read);
    }

    private _xchg(r1:Register, r2:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize, oper:MovOper):this{
        this._rex(r1, r2, null, size);
        if (size === OperationSize.byte) this.put(0x86);
        else this.put(0x87);
        this._target(0, r1, r2, null, r1, multiply, offset, oper);
        return this;
    }

    xchg_r_r(r1:Register, r2:Register, size:OperationSize = OperationSize.qword):this {
        return this._xchg(r1, r2, 1, 0, size, MovOper.Register);
    }

    xchg_r_rp(r1:Register, r2:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._xchg(r1, r2, multiply, offset, size, MovOper.Read);
    }


    private _oper(movoper:MovOper, oper:Operator, r1:Register, r2:Register|null, multiply:AsmMultiplyConstant, offset:number, chr:number, size:OperationSize):this {
        if (chr !== (chr|0) && (chr>>>0) !== chr) {
            throw Error('need 32bits integer');
        }

        this._rex(r1, r2, null, size);

        let lowflag = size === OperationSize.byte ? 0 : 1;
        if (movoper === MovOper.Read) lowflag |= 0x02;
        if (movoper === MovOper.WriteConst || movoper === MovOper.Const) {
            const is8bits = (INT8_MIN <= chr && chr <= INT8_MAX);
            if (!is8bits && size === OperationSize.byte) throw Error('need 8bits integer');
            if (!is8bits && r1 === Register.rax && movoper === MovOper.Const) {
                this.put(0x04 | lowflag | (oper << 3));
                this.writeInt32(chr);
            } else {
                if (is8bits) {
                    if (lowflag !== 0) lowflag = 3;
                }
                this.put(0x80 | lowflag);
                this._target(0, r1, oper, null, r1, multiply, offset, movoper);
                if (is8bits) this.put(chr);
                else this.writeInt32(chr);
            }
        } else {
            this.put(lowflag | (oper << 3));
            this._target(0, r1, r2, null, r1, multiply, offset, movoper);
        }
        return this;
    }

    cmp_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.cmp, dest, src, 1, 0, 0, size);
    }
    sub_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.sub, dest, src, 1, 0, 0, size);
    }
    add_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.add, dest, src, 1, 0, 0, size);
    }
    sbb_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.sbb, dest, src, 1, 0, 0, size);
    }
    adc_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.adc, dest, src, 1, 0, 0, size);
    }
    xor_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        if (dest === src && size === OperationSize.qword) size = OperationSize.dword;
        return this._oper(MovOper.Register, Operator.xor, dest, src, 1, 0, 0, size);
    }
    or_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.or, dest, src, 1, 0, 0, size);
    }
    and_r_r(dest:Register, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Register, Operator.and, dest, src, 1, 0, 0, size);
    }

    cmp_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.cmp, dest, null, 1, 0, chr, size);
    }
    sub_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.sub, dest, null, 1, 0, chr, size);
    }
    add_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.add, dest, null, 1, 0, chr, size);
    }
    sbb_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.sbb, dest, null, 1, 0, chr, size);
    }
    adc_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.adc, dest, null, 1, 0, chr, size);
    }
    xor_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.xor, dest, null, 1, 0, chr, size);
    }
    or_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.or, dest, null, 1, 0, chr, size);
    }
    and_r_c(dest:Register, chr:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Const, Operator.and, dest, null, 1, 0, chr, size);
    }

    cmp_rp_c(dest:Register, multiply:AsmMultiplyConstant, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.WriteConst, Operator.cmp, dest, 0, multiply, offset, chr, size);
    }
    sub_rp_c(dest:Register, multiply:AsmMultiplyConstant, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.WriteConst, Operator.sub, dest, 0, multiply, offset, chr, size);
    }
    add_rp_c(dest:Register, multiply:AsmMultiplyConstant, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.WriteConst, Operator.add, dest, 0, multiply, offset, chr, size);
    }
    sbb_rp_c(dest:Register, multiply:AsmMultiplyConstant, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.WriteConst, Operator.sbb, dest, 0, multiply, offset, chr, size);
    }
    adc_rp_c(dest:Register, multiply:AsmMultiplyConstant, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.WriteConst, Operator.adc, dest, 0, multiply, offset, chr, size);
    }
    xor_rp_c(dest:Register, multiply:AsmMultiplyConstant, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.WriteConst, Operator.xor, dest, 0, multiply, offset, chr, size);
    }
    or_rp_c(dest:Register, multiply:AsmMultiplyConstant, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.WriteConst, Operator.or, dest, 0, multiply, offset, chr, size);
    }
    and_rp_c(dest:Register, multiply:AsmMultiplyConstant, offset:number, chr:number, size = OperationSize.qword):this {
        return this._oper(MovOper.WriteConst, Operator.and, dest, 0, multiply, offset, chr, size);
    }

    cmp_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.cmp, src, dest, multiply, offset, 0, size);
    }
    sub_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.sub, src, dest, multiply, offset, 0, size);
    }
    add_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.add, src, dest, multiply, offset, 0, size);
    }
    sbb_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.sbb, src, dest, multiply, offset, 0, size);
    }
    adc_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.adc, src, dest, multiply, offset, 0, size);
    }
    xor_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.xor, src, dest, multiply, offset, 0, size);
    }
    or_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.or, src, dest, multiply, offset, 0, size);
    }
    and_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Read, Operator.and, src, dest, multiply, offset, 0, size);
    }

    cmp_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.cmp, dest, src, multiply, offset, 0, size);
    }
    sub_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.sub, dest, src, multiply, offset, 0, size);
    }
    add_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.add, dest, src, multiply, offset, 0, size);
    }
    sbb_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.sbb, dest, src, multiply, offset, 0, size);
    }
    adc_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.adc, dest, src, multiply, offset, 0, size);
    }
    xor_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.xor, dest, src, multiply, offset, 0, size);
    }
    or_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.or, dest, src, multiply, offset, 0, size);
    }
    and_rp_r(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._oper(MovOper.Write, Operator.and, dest, src, multiply, offset, 0, size);
    }

    private _shift_r_c(dest:Register, signed:boolean, right:boolean, chr:number, size = OperationSize.qword):this {
        this._rex(dest, 0, null, size);
        let operbit = 0xe0;
        if (right) {
            operbit |= 0x08;
            if (signed) operbit |= 0x10;
        }

        if (chr === 1) {
            this.put(0xd1);
            this.put(operbit | dest);
        } else {
            this.put(0xc1);
            this.put(operbit | dest);
            this.put(chr%128);
        }
        return this;
    }

    shr_r_c(dest:Register, chr:number, size = OperationSize.qword):this {
        return this._shift_r_c(dest, false, true, chr, size);
    }
    shl_r_c(dest:Register, chr:number, size = OperationSize.qword):this {
        return this._shift_r_c(dest, false, false, chr, size);
    }
    sar_r_c(dest:Register, chr:number, size = OperationSize.qword):this {
        return this._shift_r_c(dest, true, true, chr, size);
    }
    sal_r_c(dest:Register, chr:number, size = OperationSize.qword):this {
        return this._shift_r_c(dest, true, false, chr, size);
    }


    private _movsx(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, destsize:OperationSize, srcsize:OperationSize, oper:MovOper):this {
        if (destsize == null || srcsize == null) throw Error(`Need operand size`);
        if (srcsize > OperationSize.dword) throw Error(`Unexpected source operand size, ${OperationSize[destsize] || destsize}`);
        if (destsize <= srcsize) throw Error(`Unexpected operand size, ${OperationSize[srcsize] || srcsize} to ${OperationSize[destsize] || destsize}`);
        this._rex(src, dest, null, destsize);
        switch (srcsize) {
        case OperationSize.byte:
            this.put(0x0f);
            this.put(0xbe);
            break;
        case OperationSize.word:
            this.put(0x0f);
            this.put(0xbf);
            break;
        case OperationSize.dword:
            this.put(0x63);
            break;
        default:
            throw Error(`Invalid destination operand size, ${OperationSize[srcsize] || srcsize}`);
        }
        return this._target(0, src, dest, null, src, multiply, offset, oper);
    }

    movsx_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, destsize:OperationSize, srcsize:OperationSize):this {
        return this._movsx(dest, src, multiply, offset, destsize, srcsize, MovOper.Read);
    }
    movsxd_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this.movsx_r_rp(dest, src, multiply, offset, OperationSize.qword, OperationSize.dword);
    }

    movsx_r_r(dest:Register, src:Register, destsize:OperationSize, srcsize:OperationSize):this {
        return this._movsx(dest, src, 1, 0, destsize, srcsize, MovOper.Register);
    }
    movsxd_r_r(dest:Register, src:Register):this {
        return this.movsx_r_r(dest, src, OperationSize.qword, OperationSize.dword);
    }

    private _movzx(r1:Register, r2:Register, r3:Register|null, multiply:AsmMultiplyConstant, offset:number, destsize:OperationSize, srcsize:OperationSize, oper:MovOper):this {
        if (destsize == null || srcsize == null) throw Error(`Need operand size`);
        if (srcsize >= OperationSize.dword) throw Error(`Unexpected source operand size, ${OperationSize[destsize]}`);
        if (destsize <= srcsize) throw Error(`Unexpected operand size, ${OperationSize[srcsize]} to ${OperationSize[destsize]}`);
        this._rex(r1, r2, null, destsize);
        this.put(0x0f);
        let opcode = 0xb6;
        if (srcsize === OperationSize.word) opcode |= 1;
        this.put(opcode);
        return this._target(0, r1, r2, r3, r1, multiply, offset, oper);
    }
    movzx_r_r(dest:Register, src:Register, destsize:OperationSize, srcsize:OperationSize):this {
        return this._movzx(src, dest, null, 1, 0, destsize, srcsize, MovOper.Register);
    }
    movzx_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, destsize:OperationSize, srcsize:OperationSize):this {
        return this._movzx(src, dest, null, multiply, offset, destsize, srcsize, MovOper.Read);
    }

    private _movsf(r1:Register|FloatRegister, r2:Register|FloatRegister, r3:Register|null, multiply:AsmMultiplyConstant, offset:number, fsize:FloatOperSize, oper:MovOper, foper:FloatOper, size:OperationSize):this {
        switch (fsize) {
        case FloatOperSize.doublePrecision: this.put(0xf2); break;
        case FloatOperSize.singlePrecision: this.put(0xf3); break;
        case FloatOperSize.xmmword: break;
        }
        this._rex(r1, r2, null, size);
        this.put(0x0f);
        switch (foper) {
        case FloatOper.ConvertPrecision: this.put(0x5a); break;
        case FloatOper.ConvertTruncated_f2i: this.put(0x2c); break;
        case FloatOper.Convert_f2i: this.put(0x2d); break;
        case FloatOper.Convert_i2f: this.put(0x2a); break;
        default:
            if (oper === MovOper.Write) this.put(0x11);
            else this.put(0x10);
            break;
        }
        return this._target(0, r1, r2, r3, r1, multiply, offset, oper);
    }

    movups_rp_f(dest:FloatRegister, multiply:AsmMultiplyConstant, offset:number, src:FloatRegister):this {
        return this._movsf(dest, src, null, multiply, offset, FloatOperSize.xmmword, MovOper.Write, FloatOper.None, OperationSize.dword);
    }
    movups_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.xmmword, MovOper.Read, FloatOper.None, OperationSize.dword);
    }
    movups_f_f(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.xmmword, MovOper.Register, FloatOper.None, OperationSize.dword);
    }

    movsd_rp_f(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:FloatRegister):this {
        return this._movsf(dest, src, null, multiply, offset, FloatOperSize.doublePrecision, MovOper.Write, FloatOper.None, OperationSize.dword);
    }
    movsd_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.doublePrecision, MovOper.Read, FloatOper.None, OperationSize.dword);
    }
    movsd_f_f(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.doublePrecision, MovOper.Register, FloatOper.None, OperationSize.dword);
    }

    movss_rp_f(dest:Register, multiply:AsmMultiplyConstant, offset:number, src:FloatRegister):this {
        return this._movsf(dest, src, null, multiply, offset, FloatOperSize.singlePrecision, MovOper.Write, FloatOper.None, OperationSize.dword);
    }
    movss_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.singlePrecision, MovOper.Read, FloatOper.None, OperationSize.dword);
    }
    movss_f_f(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.singlePrecision, MovOper.Register, FloatOper.None, OperationSize.dword);
    }

    cvtsi2sd_f_r(dest:FloatRegister, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.doublePrecision, MovOper.Register, FloatOper.Convert_i2f, size);
    }
    cvtsi2sd_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.doublePrecision, MovOper.Read, FloatOper.Convert_i2f, size);
    }
    cvtpi2ps_f_r(dest:FloatRegister, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.xmmword, MovOper.Register, FloatOper.Convert_i2f, size);
    }
    cvtpi2ps_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.xmmword, MovOper.Read, FloatOper.Convert_i2f, size);
    }
    cvtpi2pd_f_r(dest:FloatRegister, src:Register, size:OperationSize = OperationSize.qword):this {
        this.write(0x66);
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.xmmword, MovOper.Register, FloatOper.Convert_i2f, size);
    }
    cvtpi2pd_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        this.write(0x66);
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.xmmword, MovOper.Read, FloatOper.Convert_i2f, size);
    }
    cvtsd2si_r_f(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.doublePrecision, MovOper.Register, FloatOper.Convert_f2i, size);
    }
    cvtsd2si_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.doublePrecision, MovOper.Read, FloatOper.Convert_f2i, size);
    }
    cvtpd2pi_r_f(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        this.write(0x66);
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.xmmword, MovOper.Register, FloatOper.Convert_f2i, size);
    }
    cvtpd2pi_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        this.write(0x66);
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.xmmword, MovOper.Read, FloatOper.Convert_f2i, size);
    }
    cvtps2pi_r_f(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.xmmword, MovOper.Register, FloatOper.Convert_f2i, size);
    }
    cvtps2pi_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.xmmword, MovOper.Read, FloatOper.Convert_f2i, size);
    }
    cvttsd2si_r_f(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.doublePrecision, MovOper.Register, FloatOper.ConvertTruncated_f2i, size);
    }
    cvttsd2si_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.doublePrecision, MovOper.Read, FloatOper.ConvertTruncated_f2i, size);
    }
    cvttps2pi_r_f(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.xmmword, MovOper.Register, FloatOper.ConvertTruncated_f2i, size);
    }
    cvttps2pi_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.xmmword, MovOper.Read, FloatOper.ConvertTruncated_f2i, size);
    }
    cvttpd2pi_r_f(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        this.write(0x66);
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.xmmword, MovOper.Register, FloatOper.ConvertTruncated_f2i, size);
    }
    cvttpd2pi_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        this.write(0x66);
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.xmmword, MovOper.Read, FloatOper.ConvertTruncated_f2i, size);
    }

    cvtsi2ss_f_r(dest:FloatRegister, src:Register, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.singlePrecision, MovOper.Register, FloatOper.Convert_i2f, size);
    }
    cvtsi2ss_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.singlePrecision, MovOper.Read, FloatOper.Convert_i2f, size);
    }
    cvttss2si_r_f(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.singlePrecision, MovOper.Register, FloatOper.ConvertTruncated_f2i, size);
    }
    cvttss2si_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.singlePrecision, MovOper.Read, FloatOper.ConvertTruncated_f2i, size);
    }
    cvtss2si_r_f(dest:Register, src:FloatRegister, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.singlePrecision, MovOper.Register, FloatOper.Convert_f2i, size);
    }
    cvtss2si_r_rp(dest:Register, src:Register, multiply:AsmMultiplyConstant, offset:number, size:OperationSize = OperationSize.qword):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.singlePrecision, MovOper.Read, FloatOper.Convert_f2i, size);
    }

    cvtsd2ss_f_f(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.doublePrecision, MovOper.Register, FloatOper.ConvertPrecision, OperationSize.dword);
    }
    cvtsd2ss_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.doublePrecision, MovOper.Read, FloatOper.ConvertPrecision, OperationSize.dword);
    }
    cvtss2sd_f_f(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.singlePrecision, MovOper.Register, FloatOper.ConvertPrecision, OperationSize.dword);
    }
    cvtss2sd_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.singlePrecision, MovOper.Read, FloatOper.ConvertPrecision, OperationSize.dword);
    }
    cvtps2pd_f_f(dest:FloatRegister, src:FloatRegister):this {
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.xmmword, MovOper.Register, FloatOper.ConvertPrecision, OperationSize.dword);
    }
    cvtps2pd_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.xmmword, MovOper.Read, FloatOper.ConvertPrecision, OperationSize.dword);
    }
    cvtpd2ps_f_f(dest:FloatRegister, src:FloatRegister):this {
        this.write(0x66);
        return this._movsf(src, dest, null, 1, 0, FloatOperSize.xmmword, MovOper.Register, FloatOper.ConvertPrecision, OperationSize.dword);
    }
    cvtpd2ps_f_rp(dest:FloatRegister, src:Register, multiply:AsmMultiplyConstant, offset:number):this {
        this.write(0x66);
        return this._movsf(src, dest, null, multiply, offset, FloatOperSize.xmmword, MovOper.Read, FloatOper.ConvertPrecision, OperationSize.dword);
    }

    makeLabel(labelName:string|null, exportDef:boolean = false, isProc:boolean = false):Label{
        let label:Label;
        if (labelName !== null) {
            const exists = this.ids.get(labelName);
            if (exists != null) {
                if (exists instanceof Defination) {
                    throw Error(`${labelName} is already defined`);
                }
                if (!(exists instanceof Label)) throw Error(`${labelName} is not label`);
                if (exists.chunk !== null) {
                    throw Error(`${labelName} is already defined`);
                }
                label = exists;
            } else {
                label = new Label(labelName);
                this.ids.set(labelName, label);
            }
        } else {
            label = new Label(labelName);
        }
        if (isProc) label.UnwindCodes = [];

        label.chunk = this.chunk;
        label.offset = this.chunk.size;
        this.chunk.ids.push(label);

        if (labelName !== null) {
            if (!exportDef) this.scope.add(labelName);

            let now = this.chunk;
            let prev = now.prev!;

            while (prev !== null && prev.jump!.label === label) {
                this._resolveLabelSizeForward(prev, prev.jump!);
                now = prev;
                prev = now.prev!;
            }
        }
        return label;
    }

    label(labelName:string, exportDef:boolean = false):this {
        this.makeLabel(labelName, exportDef);
        return this;
    }

    remove_label(name:string):this {
        const label = this.ids.get(name);
        if (!label) return this;
        if (!(label instanceof Label)) throw Error(`${name} is not label`);
        this.ids.delete(name);
        label.name = '';
        return this;
    }

    close_label(labelName:string):this {
        const label = this.ids.get(labelName);
        if (!(label instanceof Label)) throw Error(`${labelName} is not label`);
        if (label.chunk !== null) throw Error(`${label} is already defined`);
        label.chunk = this.chunk;
        label.offset = this.chunk.size;
        let now = this.chunk;
        let prev = now.prev!;
        while (prev !== null && prev.jump!.label === label) {
            this._resolveLabelSizeForward(prev, prev.jump!);
            now = prev;
            prev = now.prev!;
        }
        this.ids.delete(labelName);
        return this;
    }

    private _getJumpTarget(labelName:string|null):Label|Defination {
        if (labelName !== null) {
            const id = this.ids.get(labelName);
            if (id) {
                if (id instanceof Defination) {
                    if (id.size !== OperationSize.qword) throw Error(`${labelName} size unmatched`);
                    return id;
                }
                if (!(id instanceof Label)) throw Error(`${labelName} is not label`);
                return id;
            }
        }
        const label = new Label(labelName);
        if (labelName !== null) {
            this.ids.set(labelName, label);
        }
        return label;
    }

    jmp_label(labelName:string):this {
        const label = this._getJumpTarget(labelName);
        if (label instanceof Defination) {
            this.jmp_rp(Register.rip, 1, 0);
            this._registerUnresolvedConstant(label, 4);
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
            this.call_rp(Register.rip, 1, 0);
            this._registerUnresolvedConstant(label, 4);
            return this;
        }
        if (label.chunk === null) {
            this.call_c(0);
            this._registerUnresolvedConstant(label, 4);
            return this;
        }
        this._resolveLabelSizeBackward(this.chunk, new SplitedJump(X64Assembler.call_c_info, label, [], this.pos), true);
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

    private _registerUnresolvedConstant(id:AddressIdentifier, bytes:number):void {
        this.chunk.unresolved.push(new UnresolvedConstant(this.chunk.size-bytes, bytes, id, this.pos));
        this.pos = null;
    }

    private _resolveLabelSize(chunk:AsmChunk, jump:SplitedJump, dwordSize:boolean):void {
        const orichunk = this.chunk;
        this.chunk = chunk;
        if (dwordSize) {
            jump.info.func.call(this, ...jump.args, INT32_MAX);
            chunk.unresolved.push(new UnresolvedConstant(chunk.size-4, 4, jump.label, jump.pos));
        } else {
            jump.info.func.call(this, ...jump.args, 0);
            chunk.unresolved.push(new UnresolvedConstant(chunk.size-1, 1, jump.label, jump.pos));
        }
        chunk.removeNext();
        if (chunk.next === null) this.chunk = chunk;
        else this.chunk = orichunk;
    }

    private _resolveLabelSizeBackward(jumpChunk:AsmChunk, jump:SplitedJump, dwordSize:boolean|null = null):void {
        if (jump.label.chunk === jumpChunk) {
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

        if (dwordSize === null) {
            let chunk = jumpChunk.next!;
            if (chunk === jump.label.chunk) {
                const orichunk = this.chunk;
                this.chunk = jumpChunk;
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
                this._resolveLabelSize(chunk, chunk.jump!, true);
            }
        }
        chunk = this.chunk;
        chunk.jump = new SplitedJump(info, label, args, this.pos);
        this.pos = null;
        const nbuf = new AsmChunk(new Uint8Array(64), 0, 1);
        chunk.next = nbuf;
        nbuf.prev = chunk;
        this.chunk = nbuf;
        return this;
    }

    private _check(final:boolean):void {
        const chunks = new WeakSet<AsmChunk>();
        const ids = new WeakSet<AddressIdentifier>();
        chunks.add(MEMORY_INDICATE_CHUNK);
        if (this.constChunk !== null) {
            chunks.add(this.constChunk);
        }
        const errors = new Map<string, string[]>();
        function putError(name:string, message:string):void {
            const arr = errors.get(name);
            if (arr) arr.push(message);
            else errors.set(name, [message]);
        }

        let chunk:AsmChunk|null = this.chunk;
        if (chunk.next !== null) {
            putError('[main chunk]', 'main chunk has the next chunk');
        }
        while (chunk !== null) {
            chunks.add(chunk);
            for (const id of chunk.ids) {
                if (id.chunk !== chunk) {
                    putError(id.name || '[anonymous label]', 'Chunk does not match');
                }
                ids.add(id);
            }
            chunk = chunk.prev;
        }
        chunk = this.chunk;
        for (const id of this.ids.values()) {
            if (id instanceof AddressIdentifier) {
                if (id.chunk === null) {
                    if (!final) continue;
                    putError(id.name || '[anonymous label]', 'Label is not defined');
                    continue;
                }
                if (!ids.has(id)) {
                    if (id.chunk === MEMORY_INDICATE_CHUNK) continue;
                    putError(id.name || '[anonymous label]', 'Unknown identifier');
                }
                if (!chunks.has(id.chunk)) {
                    const jumpTarget = id.chunk.jump;
                    putError(id.name || '[anonymous label]', `Unknown chunk, ${(jumpTarget === null ? '[??]' : jumpTarget.label.name)}`);
                }
            }
        }
        if (errors.size !== 0) {
            for (const [name, messages] of errors) {
                for (const message of messages) {
                    console.error(colors.red(`${name}: ${message}`));
                }
            }
            process.exit(-1);
        }
    }

    private _normalize(makeRuntimeFunctionTable:boolean):this {
        if (this.normalized) return this;
        this.normalized = true;
        if (makeRuntimeFunctionTable && this.currentProc === this.headProc) {
            this.endp();
        } else {
            if (this.currentProc !== null) {
                const unwinds = this.currentProc.UnwindCodes;
                if (unwinds !== null && unwinds.length !== 0) {
                    throw Error(`This asm has unwind codes. stack_c or keep_r needs a runtime function table`);
                }
            }
        }

        // resolving labels
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

        const chunk = this.chunk;
        if (chunk.next !== null || chunk.prev !== null) {
            throw Error(`All chunks didn't merge. internal problem`);
        }

        // attach const chunk
        if (this.constChunk !== null) {
            chunk.connect(this.constChunk);
            this.constChunk = null;
            chunk.removeNext();
        }

        if (makeRuntimeFunctionTable) {
            // align 4 bytes
            const last = chunk.size;
            const alignto = (this.chunk.size + 4 - 1) & ~3;
            this.chunk.putRepeat(0xcc, alignto - this.chunk.size);

            // write runtime table
            let lastFunction:RUNTIME_FUNCTION|null = null;
            const functions:RUNTIME_FUNCTION[] = [];

            const procs:Label[] = [];
            for (const proc of this.ids.values()) {
                if (!(proc instanceof Label)) continue;
                procs.push(proc);
            }
            procs.sort((a,b)=>a.offset-b.offset);

            let lastProc:Label|undefined;

            for (const proc of procs) {
                if (proc.UnwindCodes === null) continue;
                if (lastFunction !== null) {
                    if (proc.offset === lastFunction.BeginAddress) continue;

                    lastFunction.EndAddress = proc.offset;
                    lastFunction.UnwindData = chunk.size;
                    functions.push(lastFunction);
                    lastProc!.writeUnwindInfoTo(chunk, lastFunction.BeginAddress);
                }
                lastProc = proc;
                lastFunction = {
                    BeginAddress: proc.offset,
                    EndAddress: 0,
                    UnwindData: 0,
                };
            }
            if (lastFunction !== null) {
                lastFunction.EndAddress = last;
                lastFunction.UnwindData = chunk.size;
                functions.push(lastFunction);
                lastProc!.writeUnwindInfoTo(chunk, lastFunction.BeginAddress);
            }

            if (functions.length !== 0) {
                this.label('#runtime_function_table', true);
                for (const func of functions) {
                    chunk.writeInt32(func.BeginAddress);
                    chunk.writeInt32(func.EndAddress);
                    chunk.writeInt32(func.UnwindData);
                }
            }
        }

        if (this.memoryChunkSize !== 0) {
            // align memory area
            const memalign = this.memoryChunkAlign;
            const bufsize = (this.chunk.size + memalign - 1) & ~(memalign-1);
            this.chunk.putRepeat(0xcc, bufsize - this.chunk.size);

            // resolve def addresses
            try {
                chunk.resolveAll();
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

    proc(name:string, exportDef:boolean = false):this {
        this.currentProc = this.makeLabel(name, exportDef, true);
        this.scopeStack.push(this.scope);
        this.scope = new Set;
        this.prologueAnchor = this.makeLabel(null);
        return this;
    }

    runtime_error_handler():this {
        if (this.currentProc === null) {
            throw Error(`not in proc`);
        }
        if (!this.unwinded) {
            this.label('_eof');
            this.unwind();
            this.ret();
        }
        this.currentProc.exceptionHandler = this.makeLabel(null);
        return this;
    }

    unwind():this {
        if (this.currentProc === null) throw Error(`not in proc`);
        const codes = this.currentProc.UnwindCodes;
        if (codes === null) throw Error(`currentProc is not proc`);
        for (let i=codes.length-1;i>=0;i--) {
            const code = codes[i];
            if (typeof code === 'number') continue;
            switch (code.UnwindOp) {
            case UWOP_PUSH_NONVOL:
                this.pop_r(code.OpInfo);
                break;
            case UWOP_ALLOC_SMALL:
                this.add_r_c(Register.rsp, code.OpInfo*8+8);
                break;
            case UWOP_ALLOC_LARGE:
                if (code.OpInfo === 0) {
                    const n = codes[--i];
                    if (typeof n !== 'number') throw Error(`number expected after UWOP_ALLOC_LARGE`);
                    this.add_r_c(Register.rsp, n * 8);
                } else if (code.OpInfo === 1) {
                    const n = codes[--i];
                    if (typeof n !== 'number') throw Error(`number expected after UWOP_ALLOC_LARGE`);
                    const n2 = codes[--i];
                    if (typeof n2 !== 'number') throw Error(`number expected after UWOP_ALLOC_LARGE`);
                    this.add_r_c(Register.rsp, (n2 << 16) | n);
                } else {
                    throw Error(`Unexpected OpInfo of UWOP_ALLOC_LARGE (${code.OpInfo})`);
                }
                break;
            case UWOP_SET_FPREG:
                if (this.currentProc.frameRegister === null) throw Error(`Frame register is not set`);
                this.lea_r_rp(Register.rsp, this.currentProc.frameRegister, 1, - this.currentProc.frameRegisterOffset * 16);
                break;
            default:
                throw Error(`Unexpected unwindop (${code.UnwindOp})`);
            }
        }
        this.unwinded = true;
        return this;
    }

    endp():this {
        if (this.scopeStack.length === 0) {
            throw Error(`end of scope`);
        }
        if (this.currentProc === null) {
            throw Error(`not in proc`);
        }

        if (!this.unwinded) {
            this.label('_eof');
            this.unwind();
            this.ret();
        }

        const scope = this.scope;
        this.scope = this.scopeStack.pop()!;
        for (const name of scope) {
            this.ids.delete(name);
        }
        this.prologueAnchor = null;
        this.currentProc = null;
        this.unwinded = false;
        return this;
    }

    const(name:string, value:number, exportDef:boolean = false):this {
        if (this.ids.has(name)) throw Error(`${name} is already defined`);
        this.ids.set(name, new Constant(name, value));
        if (!exportDef) this.scope.add(name);
        return this;
    }

    compileLine(lineText:string, lineNumber:number):void {
        const commentIdx = lineText.search(COMMENT_REGEXP);
        const parser = new TextLineParser(commentIdx === -1 ? lineText : lineText.substr(0, commentIdx), lineNumber);

        let paramIdx = -1;
        const sizes:(OperationSize|null)[] = [null, null];
        let extendingCommand = false;
        function setSize(nsize:OperationSize|undefined):void {
            if (nsize == null) return;

            let idx = 0;
            if (extendingCommand) {
                idx = paramIdx;
                if (idx >= 2) {
                    throw parser.error(`Too many operand`);
                }
            }

            const osize = sizes[idx];
            if (osize === null) {
                sizes[idx] = nsize;
                return;
            }
            if (osize !== nsize) {
                throw parser.error(`Operation size unmatched (${OperationSize[osize]} != ${OperationSize[nsize]})`);
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
                if (braceEnd === -1) throw parser.error(`brace end not found: '${type}'`);

                const braceInner = type.substring(brace, braceEnd).trim();
                const trails = type.substr(braceEnd+1).trim();
                if (trails !== '') throw parser.error(`Unexpected characters '${trails}'`);
                const res = polynominal.parseToNumber(braceInner);
                if (res === null) throw parser.error(`Unexpected array length '${braceInner}'`);
                arraySize = res!;
            }

            const size = sizemap.get(type_base);
            if (size == null) throw parser.error(`Unexpected type name '${type}'`);

            return {bytes: size.bytes * Math.max(arraySize, 1), size:size.size, align:size.bytes, arraySize};
        }

        const readConstString = (addressCommand:boolean, encoding:BufferEncoding):void=>{
            const quotedString = parser.readQuotedStringTo('"');
            if (quotedString === null) throw parser.error('Invalid quoted string');
            if (this.constChunk === null) this.constChunk = new AsmChunk(new Uint8Array(64), 0, 1);
            const id = new Defination('[const]', this.constChunk, this.constChunk.size, OperationSize.void);
            this.constChunk.write(Buffer.from(quotedString+'\0', encoding));
            this.constChunk.ids.push(id);
            command += '_rp';
            callinfo.push('(register pointer)');
            if (addressCommand) setSize(OperationSize.qword);
            else setSize(id.size);
            args.push(Register.rip);
            args.push(0);
            unresolvedConstant = id;
            unresolvedPos = parser.getPosition();
            parser.skipSpaces();
        };

        const defining = (command:string, exportDef:boolean):boolean=>{
            switch (command) {
            case 'const': {
                const [name, type] = parser.readToSpace().split(':');
                let size:TypeSize|null|undefined = null;
                if (type != null) {
                    size = sizemap.get(type);
                    if (size == null) throw parser.error(`Unexpected type syntax '${type}'`);
                }
                const text = parser.readAll();
                const value = this._polynominal(text, parser.lineNumber, parser.matchedIndex);
                if (!(value instanceof polynominal.Constant)) {
                    throw parser.error(`polynominal is not constant '${text}'`);
                }
                let valueNum = value.value;
                if (size !== null) {
                    switch (size.size) {
                    case OperationSize.byte:
                        valueNum = valueNum<<24>>24;
                        break;
                    case OperationSize.word:
                        valueNum = valueNum<<16>>16;
                        break;
                    case OperationSize.dword:
                        valueNum = valueNum|0;
                        break;
                    }
                }
                try {
                    this.const(name, valueNum, exportDef);
                } catch (err) {
                    throw parser.error(err.message);
                }
                return true;
            }
            case 'def': {
                const name = parser.readTo(':');
                const type = parser.readAll();
                const res = parseType(type);
                try {
                    this.def(name, res.size, res.bytes, res.align, exportDef);
                } catch (err) {
                    throw parser.error(err.message);
                }
                return true;
            }
            case 'proc':
                try {
                    const name = parser.readAll().trim();
                    this.proc(name, exportDef);
                } catch (err) {
                    throw parser.error(err.message);
                }
                return true;
            default: return false;
            }
        };

        const command_base = parser.readToSpace();
        if (command_base === '') return;
        let command = command_base;
        const callinfo:string[] = [command_base];

        const totalIndex = parser.matchedIndex;

        let unresolvedConstant:AddressIdentifier|null = null;
        let unresolvedPos:SourcePosition|null = null;

        const args:any[] = [];
        if (!parser.eof()){
            let addressCommand = false;
            let jumpOrCall = false;
            switch (command) {
            case 'export':
                if (!defining(parser.readToSpace(), true)) {
                    throw parser.error(`non export-able syntax`);
                }
                return;
            case 'buildtrace': {
                const value = this._polynominal(parser.readAll(), parser.lineNumber, parser.matchedIndex);
                console.log(`buildtrace> ${value}`);
                return;
            }
            case 'movsx':
            case 'movzx':
                extendingCommand = true;
                break;
            case 'lea':
                addressCommand = true;
                break;
            default:
                if (command.startsWith('j') || command === 'call') {
                    jumpOrCall = true;
                }
                if (defining(command, false)) return;
                break;
            }

            while (!parser.eof()) {
                paramIdx++;

                parser.skipSpaces();

                if (parser.nextIf('"')) {
                    readConstString(addressCommand, 'utf8');
                    continue;
                } else if (parser.nextIf('u"')) {
                    readConstString(addressCommand, 'utf16le');
                    continue;
                }

                const param = parser.readTo(',');

                const constval = polynominal.parseToNumber(param);
                if (constval !== null) { // number
                    if (isNaN(constval)) {
                        throw parser.error(`Unexpected number syntax ${callinfo.join(' ')}'`);
                    }
                    command += '_c';
                    callinfo.push('(constant)');
                    args.push(constval);
                } else if (param.endsWith(']')) { // memory access
                    let end = param.indexOf('[');
                    if (end === null) throw parser.error(`Unexpected bracket syntax ${param}'`);
                    const iparser = new TextLineParser(param.substr(0, end), lineNumber, parser.matchedIndex);

                    end++;
                    const bracketInnerStart = parser.matchedIndex + end + 1;

                    const words = [...iparser.splitWithSpaces()];
                    if (words.length !== 0) {
                        if (words[1] === 'ptr') {
                            const sizename = words[0];
                            const size = sizemap.get(sizename);
                            if (size == null || size.size === OperationSize.void) {
                                throw parser.error(`Unexpected size name: ${sizename}`);
                            }
                            if (addressCommand) setSize(OperationSize.qword);
                            else setSize(size!.size!);
                            words.splice(0, 2);
                        }
                        if (words.length !== 0) {
                            const segment = words.join('');
                            if (!segment.endsWith(':')) {
                                throw parser.error(`Invalid address syntax: ${segment}`);
                            }
                            switch (segment) {
                            case 'gs:': this.gs(); break;
                            case 'fs:': this.fs(); break;
                            case 'ss:': this.ss(); break;
                            case 'cs:': this.cs(); break;
                            case 'es:': this.es(); break;
                            case 'ds:': break;
                            default:
                                throw parser.error(`Unexpected segment: ${segment}`);
                            }
                        }
                    }

                    const inner = param.substring(end, param.length-1);
                    const {r1, r2, multiply, offset} = this._polynominalToAddress(inner, bracketInnerStart, lineNumber);
                    if (r1 === null) {
                        args.push(Register.absolute);
                        callinfo.push('(constant pointer)');
                        command += '_rp';
                    } else {
                        args.push(r1);
                        if (r2 === null) {
                            callinfo.push('(register pointer)');
                            command += '_rp';
                        } else {
                            callinfo.push('(2 register pointer)');
                            command += '_rrp';
                            args.push(r2);
                        }
                    }
                    args.push(multiply);
                    args.push(offset);
                } else {
                    const type = regmap.get(param.toLowerCase());
                    if (type) {
                        const [name, reg, size]  = type;
                        if (size !== null) setSize(size);
                        command += `_${name.short}`;
                        args.push(reg);
                        callinfo.push(`(${name.name})`);
                    } else {
                        const id = this.ids.get(param);
                        if (id instanceof Constant) {
                            command += '_c';
                            callinfo.push('(constant)');
                            args.push(id.value);
                        } else if (id instanceof Defination) {
                            command += '_rp';
                            callinfo.push('(register pointer)');
                            if (id.size === OperationSize.void) throw parser.error(`Invalid operand type`);
                            args.push(Register.rip);
                            args.push(1);
                            args.push(0);
                            unresolvedConstant = id;
                        } else if (jumpOrCall) {
                            command += '_label';
                            args.push(param);
                            callinfo.push('(label)');
                        } else {
                            command += '_rp';
                            callinfo.push('(register pointer)');
                            args.push(Register.rip);
                            args.push(1);
                            args.push(0);
                            if (id instanceof Label) {
                                unresolvedConstant = id;
                            } else if (id != null) {
                                throw parser.error(`Unexpected identifier '${id.name}'`);
                            } else {
                                const label = new Label(param);
                                unresolvedConstant = label;
                                this.ids.set(param, label);
                            }
                        }
                        unresolvedPos = parser.getPosition();
                    }
                }
            }
        }

        parser.matchedIndex = totalIndex;
        parser.matchedWidth = parser.matchedIndex + parser.matchedWidth - totalIndex;

        if (command.endsWith(':')) {
            try {
                this.label(command.substr(0, command.length-1).trim());
            } catch (err) {
                console.log(remapStack(err.stack));
                throw parser.error(err.message);
            }
            return;
        }

        command = command.toLowerCase();
        if (sizes[0] !== null) {
            args.push(sizes[0]);
            if (sizes[1] !== null) {
                args.push(sizes[1]);
            }
        }

        const fn = (this as any)[command];
        if (typeof fn !== 'function') {
            throw parser.error(`Unexpected command '${callinfo.join(' ')}'`);
        }
        try {
            this.pos = unresolvedPos;
            fn.apply(this, args);
            if (unresolvedConstant !== null) {
                this.chunk.unresolved.push(new UnresolvedConstant(this.chunk.size-4, 4, unresolvedConstant, unresolvedPos));
            }
        } catch (err) {
            console.log(remapStack(err.stack));
            throw parser.error(err.message);
        }
    }

    compile(source:string, defines?:Record<string, number>|null, reportDirectWithFileName?:string|null):this{
        let p = 0;
        let lineNumber = 1;
        if (defines != null) {
            (defines as any).__proto__ = null;
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

        try {
            this._normalize(true);
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
        return this;
    }

    save():Uint8Array {
        function writeArray<T>(array:T[], writer:(value:T)=>void):void {
            for (const item of array) {
                writer(item);
            }
            out.put(0);
        }
        function writeAddress(id:AddressIdentifier):void {
            out.writeNullTerminatedString(id.name!);
            out.writeVarUint(id.offset - address);
            address = id.offset;
        }

        const out = new BufferWriter(new Uint8Array(64), 0);
        const labels:Label[] = [];
        const defs:Defination[] = [];
        for (const id of this.ids.values()) {
            if (this.scope.has(id.name!)) continue;
            if (id instanceof Label) {
                labels.push(id);
            } else if (id instanceof Defination) {
                defs.push(id);
            }
        }

        out.writeVarUint(Math.log2(this.memoryChunkAlign));
        let address = 0;
        writeArray(labels, writeAddress);
        address = 0;
        writeArray(defs, writeAddress);
        out.writeVarUint(this.memoryChunkSize - address);
        out.write(this.buffer());
        return out.buffer();
    }

    toScript(bdsxLibPath:string, exportName?:string):{js:string, dts:string} {
        const buffer = this.buffer();
        const rftable = this.ids.get('#runtime_function_table');

        const dts = new ScriptWriter;
        const js = new ScriptWriter;

        let imports = 'cgate';
        if (rftable instanceof Label) {
            imports += ', runtimeError';
        }
        js.writeln(`const { ${imports} } = require('${bdsxLibPath}/core');`);
        js.writeln(`const { asm } = require('${bdsxLibPath}/assembler');`);
        js.writeln(`require('${bdsxLibPath}/codealloc');`);
        dts.writeln(`import { VoidPointer, NativePointer } from '${bdsxLibPath}/core';`);
        const n = buffer.length & ~1;
        js.writeln(`const buffer = cgate.allocExecutableMemory(${buffer.length+this.memoryChunkSize}, ${this.memoryChunkAlign});`);

        js.script += "buffer.setBin('";
        for (let i=0;i<n;) {
            const low = buffer[i++];
            const high = buffer[i++];

            const hex = ((high << 8) | low).toString(16);
            const count = 4-hex.length;
            js.script += '\\u';
            if (count !== 0) js.script += '0'.repeat(count);
            js.script += hex;
        }
        if (buffer.length !== n) {
            const low = buffer[n];
            const hex = ((0xcc << 8) | low).toString(16);
            const count = 4-hex.length;
            js.script += '\\u';
            if (count !== 0) js.script += '0'.repeat(count);
            js.script += hex;
        }
        js.writeln("');");
        // script.writeln();
        if (exportName != null) {
            dts.writeln(`export namespace ${exportName} {`);
            js.writeln(`exports.${exportName} = {`);
            dts.tab(4);
        } else {
            js.writeln('module.exports = {');
        }
        js.tab(4);

        for (const id of this.ids.values()) {
            if (this.scope.has(id.name!)) continue;
            let name = id.name;
            if (name === null || name.startsWith('#')) continue;
            let addrof:string;
            if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(name)) {
                name = JSON.stringify(name);
                addrof = JSON.stringify('addressof_'+name);
            } else {
                addrof = 'addressof_'+name;
            }

            if (id instanceof Label) {
                js.writeln(`get ${name}(){`);
                js.writeln(`    return buffer.add(${id.offset});`);
                js.writeln(`},`);
                dts.writeln(`export const ${name}:NativePointer;`);
            } else if (id instanceof Defination) {
                const off = buffer.length + id.offset;
                if (id.size != null) {
                    switch (id.size) {
                    case OperationSize.byte:
                        js.writeln(`get ${name}(){`);
                        js.writeln(`    return buffer.getUint8(${off});`);
                        js.writeln(`},`);
                        js.writeln(`set ${name}(n):number{`);
                        js.writeln(`    buffer.setUint8(n, ${off});`);
                        js.writeln(`},`);
                        dts.writeln(`export let ${name}:number;`);
                        break;
                    case OperationSize.word:
                        js.writeln(`get ${name}(){`);
                        js.writeln(`    return buffer.getUint16(${off});`);
                        js.writeln(`},`);
                        js.writeln(`set ${name}(n){`);
                        js.writeln(`    buffer.setUint16(n, ${off});`);
                        js.writeln(`},`);
                        dts.writeln(`export let ${name}:number;`);
                        break;
                    case OperationSize.dword:
                        js.writeln(`get ${name}(){`);
                        js.writeln(`    return buffer.getInt32(${off});`);
                        js.writeln(`},`);
                        js.writeln(`set ${name}(n){`);
                        js.writeln(`    buffer.setInt32(n, ${off});`);
                        js.writeln(`},`);
                        dts.writeln(`export let ${name}:number;`);
                        break;
                    case OperationSize.qword:
                        js.writeln(`get ${name}(){`);
                        js.writeln(`    return buffer.getPointer(${off});`);
                        js.writeln(`},`);
                        js.writeln(`set ${name}(n){`);
                        js.writeln(`    buffer.setPointer(n, ${off});`);
                        js.writeln(`},`);
                        dts.writeln(`export let ${name}:VoidPointer;`);
                        break;
                    }
                }
                js.writeln(`get ${addrof}(){`);
                js.writeln(`    return buffer.add(${off});`);
                js.writeln(`},`);
                dts.writeln(`export const ${addrof}:NativePointer;`);
            }
        }
        js.tab(-4);
        js.writeln('};');
        if (exportName != null) {
            dts.tab(-4);
            dts.writeln(`}`);
        }

        if (rftable instanceof Label) {
            const SIZE_OF_RF = 4 * 3;
            const size = (buffer.length - rftable.offset) / SIZE_OF_RF | 0;
            js.writeln(`runtimeError.addFunctionTable(buffer.add(${rftable.offset}), ${size}, buffer);`);

            const labels = this.labels(true);
            js.writeln(`asm.setFunctionNames(buffer, ${JSON.stringify(labels)});`);
        }

        return {js: js.script, dts:dts.script};
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
            address += size;
            return [name, address];
        }

        const memoryAlignBit = reader.readVarUint();
        let address = 0;
        const labels = readArray(readAddress);
        address = 0;
        const defs = readArray(readAddress);
        const memorySize = reader.readVarUint() + address;

        const buf = reader.remaining();
        const out = new X64Assembler(buf, buf.length);
        out.memoryChunkAlign = 1 << memoryAlignBit;
        out.memoryChunkSize = memorySize;

        for (const [name, offset] of labels) {
            if (out.ids.has(name)) throw Error(`${name} is already defined`);
            const label = new Label(name);
            label.chunk = out.chunk;
            label.offset = offset;
            out.ids.set(name, label);
            out.chunk.ids.push(label);
        }
        for (const [name, offset] of defs) {
            if (out.ids.has(name)) throw Error(`${name} is already defined`);
            const def = new Defination(name, MEMORY_INDICATE_CHUNK, offset, undefined);
            out.ids.set(name, def);
        }
        return out;
    }

    private static call_c_info = new JumpInfo(5, 5, 6, X64Assembler.prototype.call_c);
    private static jmp_c_info = new JumpInfo(2, 5, 6, X64Assembler.prototype.jmp_c);
    private static jmp_o_info = new JumpInfo(2, 6, -1, X64Assembler.prototype._jmp_o);
}

export function asm():X64Assembler {
    return new X64Assembler(new Uint8Array(64), 0);
}

function value64ToString16(v:Value64Castable):string {
    const [low, high] = v[asm.splitTwo32Bits]();
    if (high === 0) {
        return '0x'+low.toString(16);
    }
    const lowstr = low.toString(16);
    return '0x' + high.toString(16) + '0'.repeat(16-lowstr.length) + lowstr;
}

function uhex(v:Value64):string {
    if (typeof v === 'string') return `0x${bin.toString(v, 16)}`;
    if (typeof v === 'number') {
        if (v < 0) v = v>>>0;
        return `0x${v.toString(16)}`;
    }
    return value64ToString16(v);
}
function shex(v:Value64):string {
    if (typeof v === 'string') return `0x${bin.toString(v, 16)}`;
    if (typeof v === 'number') {
        if (v < 0) return `-0x${(-v).toString(16)}`;
        else return `0x${v.toString(16)}`;
    }
    return value64ToString16(v);
}
function shex_o(v:Value64):string {
    if (typeof v === 'string') return `+0x${bin.toString(v, 16)}`;
    if (typeof v === 'number') {
        if (v < 0) return `-0x${(-v).toString(16)}`;
        else return `+0x${v.toString(16)}`;
    }
    return '+'+value64ToString16(v);
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
    public static readonly FloatRegister=new ArgName('xmm register', 'f');
    public static readonly Const=new ArgName('const', 'c');
}
const regmap = new Map<string, [ArgName, Register|FloatRegister, OperationSize|null]>([
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

    ['xmm0', [ArgName.FloatRegister, FloatRegister.xmm0, null]],
    ['xmm1', [ArgName.FloatRegister, FloatRegister.xmm1, null]],
    ['xmm2', [ArgName.FloatRegister, FloatRegister.xmm2, null]],
    ['xmm3', [ArgName.FloatRegister, FloatRegister.xmm3, null]],
    ['xmm4', [ArgName.FloatRegister, FloatRegister.xmm4, null]],
    ['xmm5', [ArgName.FloatRegister, FloatRegister.xmm5, null]],
    ['xmm6', [ArgName.FloatRegister, FloatRegister.xmm6, null]],
    ['xmm7', [ArgName.FloatRegister, FloatRegister.xmm7, null]],
    ['xmm8', [ArgName.FloatRegister, FloatRegister.xmm8, null]],
    ['xmm9', [ArgName.FloatRegister, FloatRegister.xmm9, null]],
    ['xmm10', [ArgName.FloatRegister, FloatRegister.xmm10, null]],
    ['xmm11', [ArgName.FloatRegister, FloatRegister.xmm11, null]],
    ['xmm12', [ArgName.FloatRegister, FloatRegister.xmm12, null]],
    ['xmm13', [ArgName.FloatRegister, FloatRegister.xmm13, null]],
    ['xmm14', [ArgName.FloatRegister, FloatRegister.xmm14, null]],
    ['xmm15', [ArgName.FloatRegister, FloatRegister.xmm15, null]],
]);

const regnamemap:string[] = [];
for (const [name, [type, reg, size]] of regmap) {
    if (size === null) continue;
    regnamemap[reg | (size << 4)] = name;
}

const defaultOperationSize = new WeakMap<(...args:any[])=>any, OperationSize>();

export namespace asm
{
    export const code:Code = X64Assembler.prototype;
    defaultOperationSize.set(code.call_rp, OperationSize.qword);
    defaultOperationSize.set(code.jmp_rp, OperationSize.qword);
    defaultOperationSize.set(code.movss_f_f, OperationSize.dword);
    defaultOperationSize.set(code.movss_f_rp, OperationSize.dword);
    defaultOperationSize.set(code.movss_rp_f, OperationSize.dword);
    defaultOperationSize.set(code.movsd_f_f, OperationSize.qword);
    defaultOperationSize.set(code.movsd_f_rp, OperationSize.qword);
    defaultOperationSize.set(code.movsd_rp_f, OperationSize.qword);
    defaultOperationSize.set(code.cvtsi2sd_f_r, OperationSize.qword);
    defaultOperationSize.set(code.cvtsi2sd_f_rp, OperationSize.qword);
    defaultOperationSize.set(code.cvtsd2si_r_f, OperationSize.qword);
    defaultOperationSize.set(code.cvtsd2si_r_rp, OperationSize.qword);
    defaultOperationSize.set(code.cvttsd2si_r_f, OperationSize.qword);
    defaultOperationSize.set(code.cvttsd2si_r_rp, OperationSize.qword);
    defaultOperationSize.set(code.cvtsi2ss_f_r, OperationSize.dword);
    defaultOperationSize.set(code.cvtsi2ss_f_rp, OperationSize.dword);
    defaultOperationSize.set(code.cvtss2si_r_f, OperationSize.dword);
    defaultOperationSize.set(code.cvtss2si_r_rp, OperationSize.dword);
    defaultOperationSize.set(code.cvttss2si_r_f, OperationSize.dword);
    defaultOperationSize.set(code.cvttss2si_r_rp, OperationSize.dword);
    defaultOperationSize.set(code.movups_f_f, OperationSize.xmmword);
    defaultOperationSize.set(code.movups_f_rp, OperationSize.xmmword);
    defaultOperationSize.set(code.movups_rp_f, OperationSize.xmmword);
    for (let i=0;i<16;i++) {
        const jumpoper = JumpOperation[i].substr(1);
        defaultOperationSize.set(code[`set${jumpoper}_r`], OperationSize.byte);
        defaultOperationSize.set(code[`set${jumpoper}_rp`], OperationSize.byte);
    }
    export const splitTwo32Bits = Symbol('splitTwo32Bits');
    export interface ParameterBase {
        argi:number;
        parami:number;
    }
    export interface ParameterRegister extends ParameterBase {
        type:'r';
        register:Register;
    }
    export interface ParameterRegisterPointer extends ParameterBase {
        type:'rp';
        register:Register;
        multiply:AsmMultiplyConstant;
        offset:number;
    }
    export interface ParameterConstantPointer extends ParameterBase {
        type:'cp';
        address:Value64;
    }
    export interface ParameterRegisterRegisterPointer extends ParameterBase {
        type:'rrp';
        register:Register;
        register2:Register;
        multiply:AsmMultiplyConstant;
        offset:number;
    }
    export interface ParameterFarPointer extends ParameterBase {
        type:'fp';
        register:Register;
        multiply:AsmMultiplyConstant;
        offset:number;
    }
    export interface ParameterFloatRegister extends ParameterBase {
        type:'f';
        register:FloatRegister;
    }
    export interface ParameterConstant extends ParameterBase {
        type:'c';
        constant:number;
    }
    export interface ParameterLabel extends ParameterBase {
        type:'label';
        label:string;
    }
    export type Parameter = ParameterRegister | ParameterRegisterPointer | ParameterConstantPointer | ParameterRegisterRegisterPointer | ParameterFloatRegister | ParameterFarPointer | ParameterConstant | ParameterLabel;

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

        parameters():Parameter[] {
            const out:Parameter[] = [];
            const splits = this.splits;
            let argi = 0;
            for (let i=1;i<splits.length;i++) {
                const argi_ori = argi;
                const type = splits[i];
                if (type === 'r') {
                    const r = this.args[argi++];
                    if (typeof r !== 'number' || r < -1 || r >= 16) {
                        throw Error(`${this.code.name}: Invalid parameter ${r} at ${i}`);
                    }
                    out.push({
                        type, argi: argi_ori, parami:i, register: r
                    });
                } else if (type === 'cp') {
                    const r = this.args[argi++];
                    if (typeof r !== 'number' || r < -1 || r >= 16) {
                        throw Error(`${this.code.name}: Invalid parameter ${r} at ${i}`);
                    }
                    const address = this.args[argi++];
                    out.push({ type, argi: argi_ori, parami: i, address });
                } else if (type === 'rp' || type === 'fp') {
                    const r = this.args[argi++];
                    if (typeof r !== 'number' || r < -1 || r >= 16) {
                        throw Error(`${this.code.name}: Invalid parameter ${r} at ${i}`);
                    }
                    const multiply = this.args[argi++];
                    const offset = this.args[argi++];
                    out.push({
                        type, argi: argi_ori, parami:i, register: r,
                        multiply, offset
                    });
                } else if (type === 'c') {
                    const constant = this.args[argi++];
                    out.push({
                        type, argi: argi_ori, parami:i, constant
                    });
                } else if (type === 'f') {
                    const freg = this.args[argi++];
                    out.push({
                        type, argi: argi_ori, parami:i, register:freg
                    });
                } else if (type === 'label') {
                    const label = this.args[argi++];
                    out.push({
                        type, argi: argi_ori, parami:i, label
                    });
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
            for (const item of splited) {
                switch (item) {
                case 'r':
                case 'f':
                case 'c':
                case 'cp':
                    i ++;
                    break;
                case 'rp':
                case 'fp':
                    i += 3;
                    break;
                case 'rrp':
                    i += 4;
                    break;
                }
            }

            let sizei = i;
            const size:OperationSize|null|undefined = defaultOperationSize.get(code) ?? args[sizei];
            i = 0;

            const argstr:string[] = [];
            for (const item of splited) {

                const nsize:OperationSize|null|undefined = args[sizei++] ?? size;
                const v = args[i++];
                switch (item) {
                case 'r':
                    argstr.push(getRegisterName(v, nsize));
                    break;
                case 'f':
                    argstr.push(FloatRegister[v]);
                    break;
                case 'c':
                    argstr.push(shex(v));
                    break;
                case 'cp':
                    argstr.push(uhex(v));
                    break;
                case 'rp':
                case 'fp': {
                    const multiply = args[i++];
                    const offset = args[i++];
                    let str = `[${Register[v]}${multiply !== 1 ? `*${multiply}` : ''}${offset !== 0 ? shex_o(offset) : ''}]`;
                    if (item === 'fp') {
                        str = `fword ptr ${str}`;
                    } else if (nsize != null) {
                        str = `${OperationSize[nsize]} ptr ${str}`;
                    }
                    argstr.push(str);
                    break;
                }
                case 'rrp': {
                    const r2 = args[i++];
                    const multiply = args[i++];
                    const offset = args[i++];
                    let str = `[${Register[v]}+${Register[r2]}${multiply !== 1 ? `*${multiply}` : ''}${offset !== 0 ? shex_o(offset) : ''}]`;
                    if (nsize != null) {
                        str = `${OperationSize[nsize]} ptr ${str}`;
                    }
                    argstr.push(str);
                    break;
                }
                }
            }
            if (argstr.length === 0) return cmd;
            return `${cmd} ${argstr.join(', ')}`;
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
        const code = asm();
        code.compile(source, defines, reportDirectWithFileName);
        return code.save();
    }

    export function load(bin:Uint8Array):X64Assembler {
        return X64Assembler.load(bin);
    }

    export async function loadFromFile(src:string, defines?:Record<string, number>|null, reportDirect:boolean = false):Promise<X64Assembler>{
        const basename = src.substr(0, src.lastIndexOf('.')+1);
        const binpath = `${basename}bin`;

        let buffer:Uint8Array;
        if (await fsutil.checkModified(src, binpath)){
            buffer = asm.compile(await fsutil.readFile(src), defines, reportDirect ? src : null);
            await fsutil.writeFile(binpath, buffer);
            console.log(`Please reload it`);
            process.exit(0);
        } else {
            buffer = await fsutil.readFile(binpath, null);
        }
        return asm.load(buffer);
    }

    export function getRegisterName(register:Register, size:OperationSize|null|undefined):string {
        if (size == null) size = OperationSize.qword;
        return regnamemap[register | (size << 4)] || `invalid_R${register}_S${size}`;
    }
}

