import { SourcePosition } from "./textparser";
import { BufferWriter } from "./writer/bufferstream";
export declare enum Register {
    absolute = -2,
    rip = -1,
    rax = 0,
    rcx = 1,
    rdx = 2,
    rbx = 3,
    rsp = 4,
    rbp = 5,
    rsi = 6,
    rdi = 7,
    r8 = 8,
    r9 = 9,
    r10 = 10,
    r11 = 11,
    r12 = 12,
    r13 = 13,
    r14 = 14,
    r15 = 15
}
export declare enum FloatRegister {
    xmm0 = 0,
    xmm1 = 1,
    xmm2 = 2,
    xmm3 = 3,
    xmm4 = 4,
    xmm5 = 5,
    xmm6 = 6,
    xmm7 = 7,
    xmm8 = 8,
    xmm9 = 9,
    xmm10 = 10,
    xmm11 = 11,
    xmm12 = 12,
    xmm13 = 13,
    xmm14 = 14,
    xmm15 = 15
}
export declare enum OperationSize {
    void = 0,
    byte = 1,
    word = 2,
    dword = 3,
    qword = 4,
    mmword = 5,
    xmmword = 6
}
export declare enum Operator {
    add = 0,
    or = 1,
    adc = 2,
    sbb = 3,
    and = 4,
    sub = 5,
    xor = 6,
    cmp = 7
}
export declare enum JumpOperation {
    jo = 0,
    jno = 1,
    jb = 2,
    jae = 3,
    je = 4,
    jne = 5,
    jbe = 6,
    ja = 7,
    js = 8,
    jns = 9,
    jp = 10,
    jnp = 11,
    jl = 12,
    jge = 13,
    jle = 14,
    jg = 15
}
export interface Value64Castable {
    [asm.splitTwo32Bits](): [number, number];
}
export declare type Value64 = number | string | Value64Castable;
export declare type AsmMultiplyConstant = 1 | 2 | 4 | 8;
declare class SplitedJump {
    info: JumpInfo;
    label: Label;
    args: any[];
    pos: SourcePosition | null;
    constructor(info: JumpInfo, label: Label, args: any[], pos: SourcePosition | null);
}
declare class AsmChunk extends BufferWriter {
    align: number;
    prev: AsmChunk | null;
    next: AsmChunk | null;
    jump: SplitedJump | null;
    readonly ids: AddressIdentifier[];
    readonly unresolved: UnresolvedConstant[];
    constructor(array: Uint8Array, size: number, align: number);
    setInt32(n: number, offset: number): void;
    connect(next: AsmChunk): void;
    removeNext(): boolean;
    resolveAll(): void;
}
declare class Identifier {
    name: string | null;
    constructor(name: string | null);
}
declare class AddressIdentifier extends Identifier {
    chunk: AsmChunk | null;
    offset: number;
    constructor(name: string | null, chunk: AsmChunk | null, offset: number);
    sameAddressWith(other: AddressIdentifier): boolean;
}
declare class Label extends AddressIdentifier {
    UnwindCodes: (UNWIND_CODE | number)[] | null;
    frameRegisterOffset: number;
    frameRegister: Register;
    exceptionHandler: Label | null;
    isProc(): boolean;
    constructor(name: string | null);
    setStackFrame(label: Label, r: Register, offset: number): void;
    allocStack(label: Label, bytes: number): void;
    pushRegister(label: Label, register: Register): void;
    private _getLastUnwindCode;
    getUnwindInfoSize(): number;
    writeUnwindInfoTo(chunk: AsmChunk, functionBegin: number): void;
}
declare class JumpInfo {
    readonly byteSize: number;
    readonly dwordSize: number;
    readonly addrSize: number;
    readonly func: (this: X64Assembler, ...args: any[]) => X64Assembler;
    constructor(byteSize: number, dwordSize: number, addrSize: number, func: (this: X64Assembler, ...args: any[]) => X64Assembler);
}
declare class UnresolvedConstant {
    offset: number;
    readonly bytes: number;
    readonly address: AddressIdentifier;
    readonly pos: SourcePosition | null;
    constructor(offset: number, bytes: number, address: AddressIdentifier, pos: SourcePosition | null);
}
declare class UNWIND_CODE {
    label: Label;
    UnwindOp: number;
    OpInfo: number;
    constructor(label: Label, UnwindOp: number, OpInfo: number);
    writeTo(functionBegin: number, buf: AsmChunk): void;
}
export declare enum FFOperation {
    inc = 0,
    dec = 1,
    call = 2,
    call_far = 3,
    jmp = 4,
    jmp_far = 5,
    push = 6
}
export declare class X64Assembler {
    private memoryChunkSize;
    private memoryChunkAlign;
    private codeAlign;
    private constChunk;
    private chunk;
    private readonly ids;
    private readonly scopeStack;
    private scope;
    private currentProc;
    private readonly headProc;
    private unwinded;
    private normalized;
    private prologueAnchor;
    private pos;
    private _polynominal;
    private _polynominalToAddress;
    constructor(buffer: Uint8Array, size: number, align?: number);
    private _checkPrologue;
    /**
     * push with unwind info
     */
    keep_r(register: Register): this;
    /**
     * push with unwind info
     */
    stack_c(size: number): this;
    setframe_r_c(r: Register, offset: number): this;
    getDefAreaSize(): number;
    getDefAreaAlign(): number;
    setDefArea(size: number, align: number): void;
    connect(cb: (asm: X64Assembler) => this): this;
    put(value: number): this;
    write(...values: number[]): this;
    writeBuffer(buffer: number[] | Uint8Array): this;
    writeUint8(value: number): this;
    writeInt16(value: number): this;
    writeInt32(value: number): this;
    getLabelOffset(name: string): number;
    exists(identifierName: string): boolean;
    labels(skipPrivate?: boolean): Record<string, number>;
    defs(): Record<string, [number, OperationSize?]>;
    buffer(makeRuntimeFunctionTable?: boolean): Uint8Array;
    ret(): this;
    nop(): this;
    debugBreak(): this;
    int3(): this;
    int_c(n: number): this;
    cbw(): this;
    cwde(): this;
    cdqe(): this;
    gs(): this;
    fs(): this;
    ds(): this;
    cs(): this;
    es(): this;
    ss(): this;
    repz(): this;
    repnz(): this;
    private _target;
    private _rex;
    private _const;
    private _mov;
    movabs_r_c(dest: Register, value: Value64, size?: OperationSize): this;
    private _movabs_rax_mem;
    movabs_r_cp(dest: Register, address: Value64, size?: OperationSize): this;
    movabs_cp_r(address: Value64, src: Register, size?: OperationSize): this;
    def(name: string, size: OperationSize, bytes: number, align: number, exportDef?: boolean): this;
    lea_r_cp(dest: Register, offset: number, size?: OperationSize): this;
    lea_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    lea_r_rrp(dest: Register, src1: Register, src2: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    /**
     * move register to register
     */
    mov_r_r(dest: Register, src: Register, size?: OperationSize): this;
    /**
     * move const to register
     */
    mov_r_c(dest: Register, value: Value64, size?: OperationSize): this;
    /**
     * move const to register pointer
     */
    mov_rp_c(dest: Register, multiply: AsmMultiplyConstant, offset: number, value: number, size?: OperationSize): this;
    /**
     * move register to register pointer
     */
    mov_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    /**
     * move register pointer to register
     */
    mov_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    private _imul;
    imul_r_r(dest: Register, src: Register, size?: OperationSize): this;
    imul_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    imul_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    idiv_r(src: Register, size?: OperationSize): this;
    /**
     * jump with register
     */
    jmp_r(register: Register): this;
    private _ffoper;
    private _ffoper_r;
    inc_r(r: Register, size?: OperationSize): this;
    inc_rp(r: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    dec_r(r: Register, size?: OperationSize): this;
    dec_rp(r: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    /**
     * call with register
     */
    call_r(register: Register): this;
    /**
     * jump with register pointer
     */
    jmp_rp(register: Register, multiply: AsmMultiplyConstant, offset: number): this;
    /**
     * call with register pointer
     */
    call_rp(register: Register, multiply: AsmMultiplyConstant, offset: number): this;
    /**
     * jump far pointer
     */
    jmp_fp(register: Register, multiply: AsmMultiplyConstant, offset: number): this;
    /**
     * call far pointer
     */
    call_fp(register: Register, multiply: AsmMultiplyConstant, offset: number): this;
    /**
     * just combine of 'mov' and 'call'.
     * mov tmpreg, value;
     * call tmpreg;
     */
    call64(value: Value64, tempRegister: Register): this;
    saveAndCall(target: Value64Castable, keepRegister: Register[], keepFloatRegister: FloatRegister[]): this;
    /**
     * mov tmpreg, 64bits
     * jmp tmpreg
     */
    jmp64(value: Value64, tempRegister: Register): this;
    /**
     * mov [rsp-4], high32(v)
     * mov [rsp-8],  low32(v)
     * jmp [rsp-8]
     */
    jmp64_notemp(value: Value64): this;
    jmp_c(offset: number): this;
    call_c(offset: number): this;
    private _movaps;
    movaps_f_f(dest: FloatRegister, src: FloatRegister): this;
    movaps_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    movaps_rp_f(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: FloatRegister): this;
    movdqa_rp_f(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: FloatRegister): this;
    movdqa_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    private _jmp_o;
    jz_c(offset: number): this;
    jnz_c(offset: number): this;
    jo_c(offset: number): this;
    jno_c(offset: number): this;
    jb_c(offset: number): this;
    jae_c(offset: number): this;
    je_c(offset: number): this;
    jne_c(offset: number): this;
    jbe_c(offset: number): this;
    ja_c(offset: number): this;
    js_c(offset: number): this;
    jns_c(offset: number): this;
    jp_c(offset: number): this;
    jnp_c(offset: number): this;
    jl_c(offset: number): this;
    jge_c(offset: number): this;
    jle_c(offset: number): this;
    jg_c(offset: number): this;
    private _cmov_o;
    cmovz_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovnz_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovo_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovno_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovb_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovae_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmove_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovne_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovbe_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmova_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovs_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovns_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovp_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovnp_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovl_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovge_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovle_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovg_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmovz_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovnz_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovo_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovno_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovb_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovae_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmove_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovne_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovbe_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmova_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovs_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovns_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovp_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovnp_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovl_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovge_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovle_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmovg_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    private _set_o;
    seto_r(r: Register): this;
    setno_r(r: Register): this;
    setb_r(r: Register): this;
    setae_r(r: Register): this;
    sete_r(r: Register): this;
    setne_r(r: Register): this;
    setbe_r(r: Register): this;
    seta_r(r: Register): this;
    sets_r(r: Register): this;
    setns_r(r: Register): this;
    setp_r(r: Register): this;
    setnp_r(r: Register): this;
    setl_r(r: Register): this;
    setge_r(r: Register): this;
    setle_r(r: Register): this;
    setg_r(r: Register): this;
    seto_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setno_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setb_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setae_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    sete_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setne_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setbe_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    seta_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    sets_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setns_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setp_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setnp_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setl_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setge_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setle_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    setg_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    /**
     * push register
     */
    push_r(register: Register, size?: OperationSize): this;
    /**
     * push const
     */
    push_c(value: number): this;
    push_rp(r: Register, multiply: AsmMultiplyConstant, offset: number): this;
    pop_r(r: Register, size?: OperationSize): this;
    private _test;
    test_r_r(r1: Register, r2: Register, size?: OperationSize): this;
    test_r_rp(r1: Register, r2: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    private _xchg;
    xchg_r_r(r1: Register, r2: Register, size?: OperationSize): this;
    xchg_r_rp(r1: Register, r2: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    private _oper;
    cmp_r_r(dest: Register, src: Register, size?: OperationSize): this;
    sub_r_r(dest: Register, src: Register, size?: OperationSize): this;
    add_r_r(dest: Register, src: Register, size?: OperationSize): this;
    sbb_r_r(dest: Register, src: Register, size?: OperationSize): this;
    adc_r_r(dest: Register, src: Register, size?: OperationSize): this;
    xor_r_r(dest: Register, src: Register, size?: OperationSize): this;
    or_r_r(dest: Register, src: Register, size?: OperationSize): this;
    and_r_r(dest: Register, src: Register, size?: OperationSize): this;
    cmp_r_c(dest: Register, chr: number, size?: OperationSize): this;
    sub_r_c(dest: Register, chr: number, size?: OperationSize): this;
    add_r_c(dest: Register, chr: number, size?: OperationSize): this;
    sbb_r_c(dest: Register, chr: number, size?: OperationSize): this;
    adc_r_c(dest: Register, chr: number, size?: OperationSize): this;
    xor_r_c(dest: Register, chr: number, size?: OperationSize): this;
    or_r_c(dest: Register, chr: number, size?: OperationSize): this;
    and_r_c(dest: Register, chr: number, size?: OperationSize): this;
    cmp_rp_c(dest: Register, multiply: AsmMultiplyConstant, offset: number, chr: number, size?: OperationSize): this;
    sub_rp_c(dest: Register, multiply: AsmMultiplyConstant, offset: number, chr: number, size?: OperationSize): this;
    add_rp_c(dest: Register, multiply: AsmMultiplyConstant, offset: number, chr: number, size?: OperationSize): this;
    sbb_rp_c(dest: Register, multiply: AsmMultiplyConstant, offset: number, chr: number, size?: OperationSize): this;
    adc_rp_c(dest: Register, multiply: AsmMultiplyConstant, offset: number, chr: number, size?: OperationSize): this;
    xor_rp_c(dest: Register, multiply: AsmMultiplyConstant, offset: number, chr: number, size?: OperationSize): this;
    or_rp_c(dest: Register, multiply: AsmMultiplyConstant, offset: number, chr: number, size?: OperationSize): this;
    and_rp_c(dest: Register, multiply: AsmMultiplyConstant, offset: number, chr: number, size?: OperationSize): this;
    cmp_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    sub_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    add_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    sbb_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    adc_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    xor_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    or_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    and_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cmp_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    sub_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    add_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    sbb_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    adc_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    xor_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    or_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    and_rp_r(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: Register, size?: OperationSize): this;
    shr_r_c(dest: Register, chr: number, size?: OperationSize): this;
    shl_r_c(dest: Register, chr: number, size?: OperationSize): this;
    private _movsx;
    movsx_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, destsize: OperationSize, srcsize: OperationSize): this;
    movsxd_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    movsx_r_r(dest: Register, src: Register, destsize: OperationSize, srcsize: OperationSize): this;
    movsxd_r_r(dest: Register, src: Register): this;
    private _movzx;
    movzx_r_r(dest: Register, src: Register, destsize: OperationSize, srcsize: OperationSize): this;
    movzx_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, destsize: OperationSize, srcsize: OperationSize): this;
    private _movsf;
    movups_rp_f(dest: FloatRegister, multiply: AsmMultiplyConstant, offset: number, src: FloatRegister): this;
    movups_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    movups_f_f(dest: FloatRegister, src: FloatRegister): this;
    movsd_rp_f(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: FloatRegister): this;
    movsd_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    movsd_f_f(dest: FloatRegister, src: FloatRegister): this;
    movss_rp_f(dest: Register, multiply: AsmMultiplyConstant, offset: number, src: FloatRegister): this;
    movss_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    movss_f_f(dest: FloatRegister, src: FloatRegister): this;
    cvtsi2sd_f_r(dest: FloatRegister, src: Register, size?: OperationSize): this;
    cvtsi2sd_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvtpi2ps_f_r(dest: FloatRegister, src: Register, size?: OperationSize): this;
    cvtpi2ps_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvtpi2pd_f_r(dest: FloatRegister, src: Register, size?: OperationSize): this;
    cvtpi2pd_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvtsd2si_r_f(dest: Register, src: FloatRegister, size?: OperationSize): this;
    cvtsd2si_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvtpd2pi_r_f(dest: Register, src: FloatRegister, size?: OperationSize): this;
    cvtpd2pi_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvtps2pi_r_f(dest: Register, src: FloatRegister, size?: OperationSize): this;
    cvtps2pi_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvttsd2si_r_f(dest: Register, src: FloatRegister, size?: OperationSize): this;
    cvttsd2si_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvttps2pi_r_f(dest: Register, src: FloatRegister, size?: OperationSize): this;
    cvttps2pi_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvttpd2pi_r_f(dest: Register, src: FloatRegister, size?: OperationSize): this;
    cvttpd2pi_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvtsi2ss_f_r(dest: FloatRegister, src: Register, size?: OperationSize): this;
    cvtsi2ss_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvttss2si_r_f(dest: Register, src: FloatRegister, size?: OperationSize): this;
    cvttss2si_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvtss2si_r_f(dest: Register, src: FloatRegister, size?: OperationSize): this;
    cvtss2si_r_rp(dest: Register, src: Register, multiply: AsmMultiplyConstant, offset: number, size?: OperationSize): this;
    cvtsd2ss_f_f(dest: FloatRegister, src: FloatRegister): this;
    cvtsd2ss_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    cvtss2sd_f_f(dest: FloatRegister, src: FloatRegister): this;
    cvtss2sd_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    cvtps2pd_f_f(dest: FloatRegister, src: FloatRegister): this;
    cvtps2pd_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    cvtpd2ps_f_f(dest: FloatRegister, src: FloatRegister): this;
    cvtpd2ps_f_rp(dest: FloatRegister, src: Register, multiply: AsmMultiplyConstant, offset: number): this;
    makeLabel(labelName: string | null, exportDef?: boolean, isProc?: boolean): Label;
    label(labelName: string, exportDef?: boolean): this;
    remove_label(name: string): this;
    close_label(labelName: string): this;
    private _getJumpTarget;
    jmp_label(labelName: string): this;
    call_label(labelName: string): this;
    private _jmp_o_label;
    private _registerUnresolvedConstant;
    private _resolveLabelSize;
    private _resolveLabelSizeBackward;
    private _resolveLabelSizeForward;
    private _genChunk;
    private _check;
    private _normalize;
    jz_label(label: string): this;
    jnz_label(label: string): this;
    jo_label(label: string): this;
    jno_label(label: string): this;
    jb_label(label: string): this;
    jae_label(label: string): this;
    je_label(label: string): this;
    jne_label(label: string): this;
    jbe_label(label: string): this;
    ja_label(label: string): this;
    js_label(label: string): this;
    jns_label(label: string): this;
    jp_label(label: string): this;
    jnp_label(label: string): this;
    jl_label(label: string): this;
    jge_label(label: string): this;
    jle_label(label: string): this;
    jg_label(label: string): this;
    proc(name: string, exportDef?: boolean): this;
    runtime_error_handler(): this;
    unwind(): this;
    endp(): this;
    const(name: string, value: number, exportDef?: boolean): this;
    compileLine(lineText: string, lineNumber: number): void;
    compile(source: string, defines?: Record<string, number> | null, reportDirectWithFileName?: string | null): this;
    save(): Uint8Array;
    static load(bin: Uint8Array): X64Assembler;
    private static call_c_info;
    private static jmp_c_info;
    private static jmp_o_info;
}
export declare function asm(): X64Assembler;
interface Code extends X64Assembler {
    [key: string]: any;
}
export declare namespace asm {
    const code: Code;
    const splitTwo32Bits: unique symbol;
    interface ParameterBase {
        argi: number;
        parami: number;
    }
    interface ParameterRegister extends ParameterBase {
        type: 'r';
        register: Register;
    }
    interface ParameterRegisterPointer extends ParameterBase {
        type: 'rp';
        register: Register;
        multiply: AsmMultiplyConstant;
        offset: number;
    }
    interface ParameterConstantPointer extends ParameterBase {
        type: 'cp';
        address: Value64;
    }
    interface ParameterRegisterRegisterPointer extends ParameterBase {
        type: 'rrp';
        register: Register;
        register2: Register;
        multiply: AsmMultiplyConstant;
        offset: number;
    }
    interface ParameterFarPointer extends ParameterBase {
        type: 'fp';
        register: Register;
        multiply: AsmMultiplyConstant;
        offset: number;
    }
    interface ParameterFloatRegister extends ParameterBase {
        type: 'f';
        register: FloatRegister;
    }
    interface ParameterConstant extends ParameterBase {
        type: 'c';
        constant: number;
    }
    interface ParameterLabel extends ParameterBase {
        type: 'label';
        label: string;
    }
    type Parameter = ParameterRegister | ParameterRegisterPointer | ParameterConstantPointer | ParameterRegisterRegisterPointer | ParameterFloatRegister | ParameterFarPointer | ParameterConstant | ParameterLabel;
    class Operation {
        readonly code: (this: X64Assembler, ...args: any[]) => X64Assembler;
        readonly args: any[];
        size: number;
        private _splits;
        constructor(code: (this: X64Assembler, ...args: any[]) => X64Assembler, args: any[]);
        isRegisterModified(r: Register): boolean;
        get splits(): string[];
        reverseJump(): string | null;
        parameters(): Parameter[];
        toString(): string;
    }
    class Operations {
        readonly operations: asm.Operation[];
        readonly size: number;
        constructor(operations: asm.Operation[], size: number);
        toString(): string;
        asm(): X64Assembler;
    }
    function compile(source: string, defines?: Record<string, number> | null, reportDirectWithFileName?: string | null): Uint8Array;
    function load(bin: Uint8Array): X64Assembler;
    function loadFromFile(src: string, defines?: Record<string, number> | null, reportDirect?: boolean): Promise<X64Assembler>;
    function getRegisterName(register: Register, size: OperationSize | null | undefined): string;
}
export {};
