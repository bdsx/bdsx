import { X64OpcodeTransporter } from "./asmtrans";
import { asm, FloatRegister, Register, X64Assembler } from "./assembler";
import { NativePointer, pdb, StaticPointer, VoidPointer } from "./core";
import { disasm } from "./disassembler";
import { dll } from "./dll";
import { hacktool } from "./hacktool";
import { FunctionFromTypes_js, FunctionFromTypes_np, makefunc, MakeFuncOptions, ParamType } from "./makefunc";
import { MemoryUnlocker } from "./unlocker";
import { hex, memdiff, memdiff_contains } from "./util";
import colors = require('colors');

class SavedCode {
    constructor(private buffer:Uint8Array, private readonly ptr:StaticPointer) {
    }

    restore():void {
        const unlock = new MemoryUnlocker(this.ptr, this.buffer.length);
        const oribuf = this.ptr.getBuffer(this.buffer.length);
        this.ptr.setBuffer(this.buffer);
        this.buffer = oribuf;
        unlock.done();
    }
}

/**
 * Procedure hacker
 * @deprecated use hook()
 */
export class ProcHacker<T extends Record<string, NativePointer>> {
    constructor(public readonly map:T) {
    }

    append<NT extends Record<string, NativePointer>>(nmap:NT):ProcHacker<T&NT> {
        const map = this.map as any;
        for (const key in nmap) {
            map[key] = nmap[key];
        }
        return this as any;
    }

    /**
     * @param subject name of hooking
     * @param key target symbol
     * @param offset offset from target
     * @param ptr target pointer
     * @param originalCode old codes
     * @param ignoreArea pairs of offset, ignores partial bytes.
     */
    check(subject:string, key:keyof T, offset:number, ptr:StaticPointer, originalCode:number[], ignoreArea:number[]):boolean {
        const buffer = ptr.getBuffer(originalCode.length);
        const diff = memdiff(buffer, originalCode);
        if (!memdiff_contains(ignoreArea, diff)) {
            console.error(colors.red(`${subject}: ${key}+0x${offset.toString(16)}: code does not match`));
            console.error(colors.red(`[${hex(buffer)}] != [${hex(originalCode)}]`));
            console.error(colors.red(`diff: ${JSON.stringify(diff)}`));
            console.error(colors.red(`${subject}: skip`));
            return false;
        } else {
            return true;
        }
    }

    /**
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    nopping(subject:string, key:keyof T, offset:number, originalCode:number[], ignoreArea:number[]):void {
        let ptr:StaticPointer = this.map[key];
        if (ptr == null) {
            console.error(colors.red(`${subject}: skip, symbol "${key}" not found`));
            return;
        }
        ptr = ptr.add(offset);
        const size = originalCode.length;
        const unlock = new MemoryUnlocker(ptr, size);
        if (this.check(subject, key, offset, ptr, originalCode, ignoreArea)) {
            dll.vcruntime140.memset(ptr, 0x90, size);
        }
        unlock.done();
    }

    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRaw(key:keyof T, to: VoidPointer|((original:VoidPointer)=>VoidPointer), opts?:disasm.Options|null):VoidPointer {
        const origin = this.map[key];
        if (origin == null) throw Error(`Symbol ${String(key)} not found`);

        const REQUIRE_SIZE = 12;
        const codes = disasm.process(origin, REQUIRE_SIZE, opts);
        if (codes.size === 0) throw Error(`Failed to disassemble`);
        const out = new X64OpcodeTransporter(origin, codes.size);
        out.moveCode(codes, key, REQUIRE_SIZE);
        out.end();
        const original = out.alloc(key+' (moved original)');

        const unlock = new MemoryUnlocker(origin, codes.size);
        try {
            if (to instanceof Function) to = to(original);
            hacktool.jump(origin, to, Register.rax, codes.size);
        } finally {
            unlock.done();
        }
        return original;
    }

    /**
     * @param key target symbol name
     */
    hookingRawWithOriginal(key:keyof T, opts?:disasm.Options|null): (callback: (asm: X64Assembler, original: VoidPointer) => void) => VoidPointer {
        return callback => this.hookingRaw(key, original=>{
            const data = asm();
            callback(data, original);
            return data.alloc('hook of '+key);
        }, opts);
    }

    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRawWithoutOriginal(key:keyof T, to: VoidPointer):void {
        const origin = this.map[key];
        if (origin == null) throw Error(`Symbol ${String(key)} not found`);

        const REQUIRE_SIZE = 12;
        const unlock = new MemoryUnlocker(origin, REQUIRE_SIZE);
        hacktool.jump(origin, to, Register.rax, REQUIRE_SIZE);
        unlock.done();
    }

    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRawWithCallOriginal(key:keyof T, to: VoidPointer,
        keepRegister:Register[],
        keepFloatRegister:FloatRegister[],
        opts:disasm.Options={}):void {
        const origin = this.map[key];
        if (origin == null) throw Error(`Symbol ${String(key)} not found`);

        const REQUIRE_SIZE = 12;
        const codes = disasm.process(origin, REQUIRE_SIZE, opts);
        const out = new X64OpcodeTransporter(origin, codes.size);
        for (const reg of keepRegister) {
            out.freeregs.add(reg);
        }
        out.saveAndCall(to, keepRegister, keepFloatRegister);
        out.moveCode(codes, key, REQUIRE_SIZE);
        out.end();
        const unlock = new MemoryUnlocker(origin, codes.size);
        hacktool.jump(origin, out.alloc('hook of '+key), Register.rax, codes.size);
        unlock.done();
    }

    /**
     * @param key target symbol name
     * @param to call address
     */
    hooking<OPTS extends (MakeFuncOptions<any>&disasm.Options)|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
        key:keyof T,
        returnType:RETURN,
        opts?: OPTS,
        ...params: PARAMS):
        (callback: FunctionFromTypes_np<OPTS, PARAMS, RETURN>)=>FunctionFromTypes_js<VoidPointer, OPTS, PARAMS, RETURN> {
        return callback=>{
            const original = this.hookingRaw(key, original=>{
                const nopts:MakeFuncOptions<any> = {};
                (nopts as any).__proto__ = opts;
                nopts.onError = original;
                return makefunc.np(callback, returnType, nopts as any, ...params);
            }, opts);
            return makefunc.js(original, returnType, opts, ...params);
        };
    }

    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingWithoutOriginal<OPTS extends MakeFuncOptions<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
        key:keyof T,
        returnType:RETURN,
        opts?: OPTS,
        ...params: PARAMS):
        (callback: FunctionFromTypes_np<OPTS, PARAMS, RETURN>)=>void {
        return callback=>{
            const to = makefunc.np(callback, returnType, opts, ...params);
            this.hookingRawWithoutOriginal(key, to);
        };
    }

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
    patching(subject:string, key:keyof T, offset:number, newCode:VoidPointer, tempRegister:Register, call:boolean, originalCode:number[], ignoreArea:number[]):void {
        let ptr:NativePointer = this.map[key];
        if (ptr == null) {
            console.error(colors.red(`${subject}: skip, symbol "${key}" not found`));
            return;
        }
        ptr = ptr.add(offset);
        const size = originalCode.length;
        const unlock = new MemoryUnlocker(ptr, size);
        if (this.check(subject, key, offset, ptr, originalCode, ignoreArea)) {
            hacktool.patch(ptr, newCode, tempRegister, size, call);
        }
        unlock.done();
    }

    /**
     * @param subject for printing on error
     * @param key target symbol name
     * @param offset offset from target
     * @param jumpTo jump address
     * @param tempRegister using register to jump
     * @param originalCode bytes comparing before hooking
     * @param ignoreArea pair offsets to ignore of originalCode
     */
    jumping(subject:string, key:keyof T, offset:number, jumpTo:VoidPointer, tempRegister:Register, originalCode:number[], ignoreArea:number[]):void {
        let ptr:NativePointer = this.map[key];
        if (ptr == null) {
            console.error(colors.red(`${subject}: skip, symbol "${key}" not found`));
            return;
        }
        ptr = ptr.add(offset);
        const size = originalCode.length;
        const unlock = new MemoryUnlocker(ptr, size);
        if (this.check(subject, key, offset, ptr, originalCode, ignoreArea)) {
            hacktool.jump(ptr, jumpTo, tempRegister, size);
        }
        unlock.done();
    }

    write(key:keyof T, offset:number, asm:X64Assembler|Uint8Array, subject?:string, originalCode?:number[], ignoreArea?:number[]):void {
        const buffer = asm instanceof Uint8Array ? asm : asm.buffer();
        const ptr = this.map[key].add(offset);
        const unlock = new MemoryUnlocker(ptr, buffer.length);
        if (originalCode) {
            if (subject == null) subject = key+'';
            if (originalCode.length < buffer.length) {
                console.error(colors.red(`${subject}: ${key}+0x${offset.toString(16)}: writing space is too small`));
                unlock.done();
                return;
            }
            if (!this.check(subject, key, offset, ptr, originalCode, ignoreArea || [])) {
                unlock.done();
                return;
            }
            ptr.writeBuffer(buffer);
            ptr.fill(0x90, originalCode.length - buffer.length); // nop fill
        } else {
            ptr.writeBuffer(buffer);
        }
        unlock.done();
    }

    saveAndWrite(key:keyof T, offset:number, asm:X64Assembler|Uint8Array):SavedCode {
        const buffer = asm instanceof Uint8Array ? asm : asm.buffer();
        const ptr = this.map[key].add(offset);
        const code = new SavedCode(buffer, ptr);
        code.restore();
        return code;
    }

    /**
     * make the native function as a JS function.
     *
     * wrapper codes are not deleted permanently.
     * do not use it dynamically.
     *
     * @param returnType *_t or *Pointer
     * @param params *_t or *Pointer
     */
    js<OPTS extends MakeFuncOptions<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
        key: keyof T,
        returnType:RETURN,
        opts?: OPTS,
        ...params: PARAMS):
        FunctionFromTypes_js<NativePointer, OPTS, PARAMS, RETURN> {
        return makefunc.js(this.map[key], returnType, opts, ...params);
    }

    /**
     * get symbols from cache.
     * if symbols don't exist in cache. it reads pdb.
     * @param undecorate if it's set with UNDNAME_*, it uses undecorated(demangled) symbols
     */
    static load<KEY extends string, KEYS extends readonly [...KEY[]]>(cacheFilePath:string, names:KEYS, undecorate?:number):ProcHacker<{[key in KEYS[number]]: NativePointer}> {
        return new ProcHacker(pdb.getList(cacheFilePath, {}, names, false, undecorate));
    }
}
