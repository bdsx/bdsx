import { asm, FloatRegister, Register, X64Assembler } from "./assembler";
import { FunctionFromTypes_js, FunctionFromTypes_np, makefunc, MakeFuncOptions, NativePointer, ParamType, pdb, ReturnType, StaticPointer, VoidPointer } from "./core";
import { disasm } from "./disassembler";
import { dll } from "./dll";
import { hacktool } from "./hacktool";
import { MemoryUnlocker } from "./unlocker";
import { hex, memdiff, memdiff_contains } from "./util";
import colors = require('colors');


const FREE_REGS:Register[] = [
    Register.rax,
    Register.r10,
    Register.r11,
];

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
            console.error(colors.red(`${subject}: ${key}+0x${offset.toString(16)}: code unmatch`));
            console.error(colors.red(`[${hex(buffer)}] != [${hex(originalCode)}]`));
            console.error(colors.red(`diff: ${JSON.stringify(diff)}`));
            console.error(colors.red(`${subject}: skip `));
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
        const ptr = this.map[key].add(offset);
        if (!ptr) {
            console.error(colors.red(`${subject}: skip, ${key} symbol not found`));
            return;
        }
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
        if (!origin) throw Error(`${key} symbol not found`);

        const REQUIRE_SIZE = 12;
        const codes = disasm.process(origin, REQUIRE_SIZE);
        const using = new Set<Register>();
        const getUnusing = ():number|null=>{
            for (const r of FREE_REGS) {
                if (!using.has(r)) return r;
            }
            return null;
        };
        let pos = 0;
        let labelCounter = 0;
        const out = asm();
        for (const oper of codes.operations) {
            const splits = oper.splits;
            const basename = splits[0];
            if (basename === 'ret' || basename === 'jmp' || basename === 'call') {
                throw Error(`Too small area to patch, require=${REQUIRE_SIZE}, actual=${pos}`);
            }
            pos += oper.size;

            for (const reg of oper.registers()) {
                using.add(reg);
            }

            if ((basename.startsWith('j') || basename === 'call') && splits.length === 2 && splits[1] === 'c') {
                // jump
                const offset = pos + oper.args[0];
                if (offset < 0 || offset > codes.size) {
                    const tmpreg = getUnusing();
                    if (tmpreg === null) throw Error(`Not enough free registers`);
                    const jmp_r = (asm.code as any)[basename+'_r'];
                    if (jmp_r) {
                        out.mov_r_c(tmpreg, origin.add(offset));
                        jmp_r.call(out, tmpreg);
                    } else {
                        const reversed = oper.reverseJump();
                        const label = `label_`+labelCounter++;
                        (out as any)[reversed+'_label'](label);
                        out.jmp64(origin.add(offset), tmpreg);
                        out.label(label);
                    }
                    continue;
                }
            }
            oper.code.apply(out, oper.args);
        }
        const tmpreg = getUnusing();
        const originend = origin.add(codes.size);
        if (tmpreg != null) out.jmp64(originend, tmpreg);
        else out.jmp64_notemp(originend);
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
        const ptr = this.map[key];
        if (!ptr) throw Error(`${key} symbol not found`);

        const code = disasm.process(ptr, 12);
        for (const oper of code.operations) {
            const basename = oper.splits[0];
            if (basename.startsWith('j') || basename === 'call') throw Error(`It cannot handle jump/call codes`);
        }
        const unlock = new MemoryUnlocker(ptr, code.size);
        hacktool.hookWithCallOriginal(ptr, to, code.size, keepRegister, keepFloatRegister);
        unlock.done();
    }

    /**
     * @param key target symbol name
     * @param to call address
     */
    hooking<OPTS extends MakeFuncOptions<any>|null, RETURN extends ReturnType, PARAMS extends ParamType[]>(
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
            console.error(colors.red(`${subject}: skip, ${key} symbol not found`));
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
            console.error(colors.red(`${subject}: skip, ${key} symbol not found`));
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

    write(key:keyof T, offset:number, asm:X64Assembler):void {
        const buffer = asm.buffer();
        const ptr = this.map[key].add(offset);
        const unlock = new MemoryUnlocker(ptr, buffer.length);
        ptr.writeBuffer(buffer);
        unlock.done();
    }

    /**
     * make the native function as a JS function.
     * 
     * wrapper codes are not deleted permanently.
     * do not use it dynamically.
     * 
     * @param returnType RawTypeId or *Pointer
     * @param params RawTypeId or *Pointer
     */
    js<OPTS extends MakeFuncOptions<any>|null, RETURN extends ReturnType, PARAMS extends ParamType[]>(
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
     */
    static load<KEY extends string, KEYS extends readonly [...KEY[]]>(cacheFilePath:string, names:KEYS):ProcHacker<{[key in KEYS[number]]: NativePointer}> {
        return new ProcHacker(pdb.getList(cacheFilePath, {}, names));
    }
}
