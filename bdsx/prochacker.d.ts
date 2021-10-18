import { FloatRegister, Register, X64Assembler } from "./assembler";
import { NativePointer, StaticPointer, VoidPointer } from "./core";
import { disasm } from "./disassembler";
import { FunctionFromTypes_js, FunctionFromTypes_np, MakeFuncOptions, ParamType } from "./makefunc";
declare class SavedCode {
    private buffer;
    private readonly ptr;
    constructor(buffer: Uint8Array, ptr: StaticPointer);
    restore(): void;
}
/**
 * Procedure hacker
 * @deprecated use hook()
 */
export declare class ProcHacker<T extends Record<string, NativePointer>> {
    readonly map: T;
    constructor(map: T);
    append<NT extends Record<string, NativePointer>>(nmap: NT): ProcHacker<T & NT>;
    /**
     * @param subject name of hooking
     * @param key target symbol
     * @param offset offset from target
     * @param ptr target pointer
     * @param originalCode old codes
     * @param ignoreArea pairs of offset, ignores partial bytes.
     */
    check(subject: string, key: keyof T, offset: number, ptr: StaticPointer, originalCode: number[], ignoreArea: number[]): boolean;
    /**
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    nopping(subject: string, key: keyof T, offset: number, originalCode: number[], ignoreArea: number[]): void;
    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRaw(key: keyof T, to: VoidPointer | ((original: VoidPointer) => VoidPointer), opts?: disasm.Options | null): VoidPointer;
    /**
     * @param key target symbol name
     */
    hookingRawWithOriginal(key: keyof T, opts?: disasm.Options | null): (callback: (asm: X64Assembler, original: VoidPointer) => void) => VoidPointer;
    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRawWithoutOriginal(key: keyof T, to: VoidPointer): void;
    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRawWithCallOriginal(key: keyof T, to: VoidPointer, keepRegister: Register[], keepFloatRegister: FloatRegister[], opts?: disasm.Options): void;
    /**
     * @param key target symbol name
     * @param to call address
     */
    hooking<OPTS extends (MakeFuncOptions<any> & disasm.Options) | null, RETURN extends ParamType, PARAMS extends ParamType[]>(key: keyof T, returnType: RETURN, opts?: OPTS, ...params: PARAMS): (callback: FunctionFromTypes_np<OPTS, PARAMS, RETURN>) => FunctionFromTypes_js<VoidPointer, OPTS, PARAMS, RETURN>;
    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingWithoutOriginal<OPTS extends MakeFuncOptions<any> | null, RETURN extends ParamType, PARAMS extends ParamType[]>(key: keyof T, returnType: RETURN, opts?: OPTS, ...params: PARAMS): (callback: FunctionFromTypes_np<OPTS, PARAMS, RETURN>) => void;
    /**
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param newCode call address
     * @param tempRegister using register to call
     * @param call true - call, false - jump
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    patching(subject: string, key: keyof T, offset: number, newCode: VoidPointer, tempRegister: Register, call: boolean, originalCode: number[], ignoreArea: number[]): void;
    /**
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param jumpTo jump address
     * @param tempRegister using register to jump
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    jumping(subject: string, key: keyof T, offset: number, jumpTo: VoidPointer, tempRegister: Register, originalCode: number[], ignoreArea: number[]): void;
    write(key: keyof T, offset: number, asm: X64Assembler | Uint8Array, subject?: string, originalCode?: number[], ignoreArea?: number[]): void;
    saveAndWrite(key: keyof T, offset: number, asm: X64Assembler | Uint8Array): SavedCode;
    /**
     * make the native function as a JS function.
     *
     * wrapper codes are not deleted permanently.
     * do not use it dynamically.
     *
     * @param returnType *_t or *Pointer
     * @param params *_t or *Pointer
     */
    js<OPTS extends MakeFuncOptions<any> | null, RETURN extends ParamType, PARAMS extends ParamType[]>(key: keyof T, returnType: RETURN, opts?: OPTS, ...params: PARAMS): FunctionFromTypes_js<NativePointer, OPTS, PARAMS, RETURN>;
    /**
     * get symbols from cache.
     * if symbols don't exist in cache. it reads pdb.
     * @param undecorate if it's set with UNDNAME_*, it uses undecorated(demangled) symbols
     */
    static load<KEY extends string, KEYS extends readonly [...KEY[]]>(cacheFilePath: string, names: KEYS, undecorate?: number): ProcHacker<{
        [key in KEYS[number]]: NativePointer;
    }>;
}
export {};
