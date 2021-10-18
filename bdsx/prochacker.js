"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcHacker = void 0;
const asmtrans_1 = require("./asmtrans");
const assembler_1 = require("./assembler");
const core_1 = require("./core");
const disassembler_1 = require("./disassembler");
const dll_1 = require("./dll");
const hacktool_1 = require("./hacktool");
const makefunc_1 = require("./makefunc");
const unlocker_1 = require("./unlocker");
const util_1 = require("./util");
const colors = require("colors");
class SavedCode {
    constructor(buffer, ptr) {
        this.buffer = buffer;
        this.ptr = ptr;
    }
    restore() {
        const unlock = new unlocker_1.MemoryUnlocker(this.ptr, this.buffer.length);
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
class ProcHacker {
    constructor(map) {
        this.map = map;
    }
    append(nmap) {
        const map = this.map;
        for (const key in nmap) {
            map[key] = nmap[key];
        }
        return this;
    }
    /**
     * @param subject name of hooking
     * @param key target symbol
     * @param offset offset from target
     * @param ptr target pointer
     * @param originalCode old codes
     * @param ignoreArea pairs of offset, ignores partial bytes.
     */
    check(subject, key, offset, ptr, originalCode, ignoreArea) {
        const buffer = ptr.getBuffer(originalCode.length);
        const diff = (0, util_1.memdiff)(buffer, originalCode);
        if (!(0, util_1.memdiff_contains)(ignoreArea, diff)) {
            console.error(colors.red(`${subject}: ${key}+0x${offset.toString(16)}: code does not match`));
            console.error(colors.red(`[${(0, util_1.hex)(buffer)}] != [${(0, util_1.hex)(originalCode)}]`));
            console.error(colors.red(`diff: ${JSON.stringify(diff)}`));
            console.error(colors.red(`${subject}: skip`));
            return false;
        }
        else {
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
    nopping(subject, key, offset, originalCode, ignoreArea) {
        let ptr = this.map[key];
        if (ptr == null) {
            console.error(colors.red(`${subject}: skip, symbol "${key}" not found`));
            return;
        }
        ptr = ptr.add(offset);
        const size = originalCode.length;
        const unlock = new unlocker_1.MemoryUnlocker(ptr, size);
        if (this.check(subject, key, offset, ptr, originalCode, ignoreArea)) {
            dll_1.dll.vcruntime140.memset(ptr, 0x90, size);
        }
        unlock.done();
    }
    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRaw(key, to, opts) {
        const origin = this.map[key];
        if (origin == null)
            throw Error(`Symbol ${String(key)} not found`);
        const REQUIRE_SIZE = 12;
        const codes = disassembler_1.disasm.process(origin, REQUIRE_SIZE, opts);
        if (codes.size === 0)
            throw Error(`Failed to disassemble`);
        const out = new asmtrans_1.X64OpcodeTransporter(origin, codes.size);
        out.moveCode(codes, key, REQUIRE_SIZE);
        out.end();
        const original = out.alloc(key + ' (moved original)');
        const unlock = new unlocker_1.MemoryUnlocker(origin, codes.size);
        try {
            if (to instanceof Function)
                to = to(original);
            hacktool_1.hacktool.jump(origin, to, assembler_1.Register.rax, codes.size);
        }
        finally {
            unlock.done();
        }
        return original;
    }
    /**
     * @param key target symbol name
     */
    hookingRawWithOriginal(key, opts) {
        return callback => this.hookingRaw(key, original => {
            const data = (0, assembler_1.asm)();
            callback(data, original);
            return data.alloc('hook of ' + key);
        }, opts);
    }
    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRawWithoutOriginal(key, to) {
        const origin = this.map[key];
        if (origin == null)
            throw Error(`Symbol ${String(key)} not found`);
        const REQUIRE_SIZE = 12;
        const unlock = new unlocker_1.MemoryUnlocker(origin, REQUIRE_SIZE);
        hacktool_1.hacktool.jump(origin, to, assembler_1.Register.rax, REQUIRE_SIZE);
        unlock.done();
    }
    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingRawWithCallOriginal(key, to, keepRegister, keepFloatRegister, opts = {}) {
        const origin = this.map[key];
        if (origin == null)
            throw Error(`Symbol ${String(key)} not found`);
        const REQUIRE_SIZE = 12;
        const codes = disassembler_1.disasm.process(origin, REQUIRE_SIZE, opts);
        const out = new asmtrans_1.X64OpcodeTransporter(origin, codes.size);
        for (const reg of keepRegister) {
            out.freeregs.add(reg);
        }
        out.saveAndCall(to, keepRegister, keepFloatRegister);
        out.moveCode(codes, key, REQUIRE_SIZE);
        out.end();
        const unlock = new unlocker_1.MemoryUnlocker(origin, codes.size);
        hacktool_1.hacktool.jump(origin, out.alloc('hook of ' + key), assembler_1.Register.rax, codes.size);
        unlock.done();
    }
    /**
     * @param key target symbol name
     * @param to call address
     */
    hooking(key, returnType, opts, ...params) {
        return callback => {
            const original = this.hookingRaw(key, original => {
                const nopts = {};
                nopts.__proto__ = opts;
                nopts.onError = original;
                return makefunc_1.makefunc.np(callback, returnType, nopts, ...params);
            }, opts);
            return makefunc_1.makefunc.js(original, returnType, opts, ...params);
        };
    }
    /**
     * @param key target symbol name
     * @param to call address
     */
    hookingWithoutOriginal(key, returnType, opts, ...params) {
        return callback => {
            const to = makefunc_1.makefunc.np(callback, returnType, opts, ...params);
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
    patching(subject, key, offset, newCode, tempRegister, call, originalCode, ignoreArea) {
        let ptr = this.map[key];
        if (ptr == null) {
            console.error(colors.red(`${subject}: skip, symbol "${key}" not found`));
            return;
        }
        ptr = ptr.add(offset);
        const size = originalCode.length;
        const unlock = new unlocker_1.MemoryUnlocker(ptr, size);
        if (this.check(subject, key, offset, ptr, originalCode, ignoreArea)) {
            hacktool_1.hacktool.patch(ptr, newCode, tempRegister, size, call);
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
    jumping(subject, key, offset, jumpTo, tempRegister, originalCode, ignoreArea) {
        let ptr = this.map[key];
        if (ptr == null) {
            console.error(colors.red(`${subject}: skip, symbol "${key}" not found`));
            return;
        }
        ptr = ptr.add(offset);
        const size = originalCode.length;
        const unlock = new unlocker_1.MemoryUnlocker(ptr, size);
        if (this.check(subject, key, offset, ptr, originalCode, ignoreArea)) {
            hacktool_1.hacktool.jump(ptr, jumpTo, tempRegister, size);
        }
        unlock.done();
    }
    write(key, offset, asm, subject, originalCode, ignoreArea) {
        const buffer = asm instanceof Uint8Array ? asm : asm.buffer();
        const ptr = this.map[key].add(offset);
        const unlock = new unlocker_1.MemoryUnlocker(ptr, buffer.length);
        if (originalCode) {
            if (subject == null)
                subject = key + '';
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
        }
        else {
            ptr.writeBuffer(buffer);
        }
        unlock.done();
    }
    saveAndWrite(key, offset, asm) {
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
    js(key, returnType, opts, ...params) {
        return makefunc_1.makefunc.js(this.map[key], returnType, opts, ...params);
    }
    /**
     * get symbols from cache.
     * if symbols don't exist in cache. it reads pdb.
     * @param undecorate if it's set with UNDNAME_*, it uses undecorated(demangled) symbols
     */
    static load(cacheFilePath, names, undecorate) {
        return new ProcHacker(core_1.pdb.getList(cacheFilePath, {}, names, false, undecorate));
    }
}
exports.ProcHacker = ProcHacker;
//# sourceMappingURL=prochacker.js.map