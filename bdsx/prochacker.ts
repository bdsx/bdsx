import { asm, FloatRegister, Register, X64Assembler } from "./assembler";
import { NativePointer, pdb, StaticPointer, VoidPointer } from "./core";
import { disasm } from "./disassembler";
import { dll } from "./dll";
import { hacktool } from "./hacktool";
import { FunctionFromTypes_js, FunctionFromTypes_np, makefunc, MakeFuncOptions, ParamType } from "./makefunc";
import { MemoryUnlocker } from "./unlocker";
import { hex, memdiff, memdiff_contains } from "./util";
import colors = require('colors');

const FREE_REGS:Register[] = [
    Register.rax,
    Register.r10,
    Register.r11,
];

class AsmMover extends X64Assembler {

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
        let ripDependedParam:asm.ParameterRegisterPointer|null = null;
        const params = oper.parameters();
        for (const info of params) {
            switch (info.type) {
            case 'r':
                this.freeregs.delete(info.register);
                break;
            case 'rp':
                this.freeregs.delete(info.register);
                if (info.register === Register.rip) {
                    ripDependedParam = info;
                }
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
                if (jmp_r) {
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

/**
 * Procedure hacker
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
        if (!ptr) {
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
    hookingRaw(key:keyof T, to: VoidPointer):VoidPointer {
        const origin = this.map[key];
        if (!origin) throw Error(`Symbol ${String(key)} not found`);

        const REQUIRE_SIZE = 12;
        const codes = disasm.process(origin, REQUIRE_SIZE);
        const out = new AsmMover(origin, codes.size);
        out.moveCode(codes, key, REQUIRE_SIZE);
        out.end();
        const original = out.alloc();

        const unlock = new MemoryUnlocker(origin, codes.size);
        hacktool.jump(origin, to, Register.rax, codes.size);
        unlock.done();

        return original;
    }

    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRawWithCallOriginal(key:keyof T, to: VoidPointer,
        keepRegister:Register[],
        keepFloatRegister:FloatRegister[]):void {
        const origin = this.map[key];
        if (!origin) throw Error(`Symbol ${String(key)} not found`);

        const REQUIRE_SIZE = 12;
        const codes = disasm.process(origin, REQUIRE_SIZE);
        const out = new AsmMover(origin, codes.size);
        for (const reg of keepRegister) {
            out.freeregs.add(reg);
        }
        out.saveAndCall(to, keepRegister, keepFloatRegister);
        out.moveCode(codes, key, REQUIRE_SIZE);
        out.end();
        const unlock = new MemoryUnlocker(origin, codes.size);
        hacktool.jump(origin, out.alloc(), Register.rax, codes.size);
        unlock.done();
    }

    /**
     * @param key target symbol name
     * @param to call address
     */
    hooking<OPTS extends MakeFuncOptions<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
        key:keyof T,
        returnType:RETURN,
        opts?: OPTS,
        ...params: PARAMS):
        (callback: FunctionFromTypes_np<OPTS, PARAMS, RETURN>)=>FunctionFromTypes_js<VoidPointer, OPTS, PARAMS, RETURN> {
        return callback=>{
            const to = makefunc.np(callback, returnType, opts, ...params);
            return makefunc.js(this.hookingRaw(key, to), returnType, opts, ...params);
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
        if (!ptr) {
            console.error(colors.red(`${subject}: skip, symbol "${key}" not found`));
            return;
        }
        ptr = ptr.add(offset);
        if (!ptr) {
            console.error(colors.red(`${subject}: skip`));
            return;
        }
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
        if (!ptr) {
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

    write(key:keyof T, offset:number, asm:X64Assembler, subject?:string, originalCode?:number[], ignoreArea?:number[]):void {
        const buffer = asm.buffer();
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
