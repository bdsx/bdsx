"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hook = void 0;
const asmtrans_1 = require("./asmtrans");
const assembler_1 = require("./assembler");
const common_1 = require("./common");
const core_1 = require("./core");
const disassembler_1 = require("./disassembler");
const dll_1 = require("./dll");
const dnf_1 = require("./dnf");
const hacktool_1 = require("./hacktool");
const makefunc_1 = require("./makefunc");
const nativetype_1 = require("./nativetype");
const unlocker_1 = require("./unlocker");
const util_1 = require("./util");
const colors = require("colors");
const emptyOpts = {};
Object.freeze(emptyOpts);
/**
 * @returns returns 'hook.fail' if it failed.
 */
function hook(nf, name) {
    if (nf === null) {
        console.trace(`Failed to hook, null received`);
        return hook.fail;
    }
    let thisType;
    if (name != null) {
        if (nf instanceof core_1.VoidPointer) {
            console.trace(`Failed to hook, invalid parameter`, nf);
            return hook.fail;
        }
        thisType = nf;
        nf = nf.prototype[name];
        if (!(nf instanceof Function))
            throw Error(`${nf.name}.${String(name)} is not a function`);
    }
    else {
        name = '[Native Function]';
        if (nf instanceof core_1.VoidPointer) {
            return new hook.PtrTool(name, nf.add());
        }
        thisType = null;
        if (!(nf instanceof Function))
            throw Error(`this is not a function`);
    }
    return new hook.Tool(nf, String(name), thisType, emptyOpts);
}
exports.hook = hook;
function nameWithOffset(name, offset) {
    if (offset == null)
        return name;
    return `${name}+0x${offset.toString(16)}`;
}
(function (hook) {
    class PtrTool {
        constructor(name, ptr) {
            this.name = name;
            this.ptr = ptr;
        }
        /**
         * @param offset offset from target
         * @returns
         */
        offset(offset) {
            this._offset = offset;
            return this;
        }
        /**
         * @param subject for printing on error
         * @returns
         */
        subject(subject) {
            this._subject = subject;
            return this;
        }
        getAddress() {
            return this.ptr;
        }
        /**
         * @param offset offset from target
         * @param ptr target pointer
         * @param originalCode old codes
         * @param ignoreArea pairs of offset, ignores partial bytes.
         */
        _check(ptr, originalCode, ignoreArea) {
            const buffer = ptr.getBuffer(originalCode.length);
            const diff = (0, util_1.memdiff)(buffer, originalCode);
            if (ignoreArea == null) {
                if (diff.length !== 0) {
                    return true;
                }
            }
            else {
                if ((0, util_1.memdiff_contains)(ignoreArea, diff)) {
                    return true;
                }
            }
            const subject = this._subject || this.name;
            console.error(colors.red(`${subject}: ${nameWithOffset(subject, this._offset)}: code does not match`));
            console.error(colors.red(`[${(0, util_1.hex)(buffer)}] != [${(0, util_1.hex)(originalCode)}]`));
            console.error(colors.red(`diff: ${JSON.stringify(diff)}`));
            console.error(colors.red(`${subject}: skip`));
            return false;
        }
        /**
         * @param newCode call address
         * @param tempRegister using register to call
         * @param call true - call, false - jump
         * @param originalCode bytes comparing before hooking
         * @param ignoreArea pair offsets to ignore of originalCode
         */
        patch(newCode, tempRegister, call, originalCode, ignoreArea) {
            const size = originalCode.length;
            const ptr = this.getAddress();
            const unlock = new unlocker_1.MemoryUnlocker(ptr, size);
            if (this._check(ptr, originalCode, ignoreArea)) {
                hacktool_1.hacktool.patch(ptr, newCode, tempRegister, size, call);
            }
            unlock.done();
        }
        /**
         * @param ptr target pointer
         * @param originalCode bytes comparing
         * @param ignoreArea pairs of offset, ignores partial bytes.
         */
        check(originalCode, ignoreArea) {
            return this._check(this.getAddress(), originalCode, ignoreArea);
        }
        /**
         * @param offset offset from target
         * @param originalCode bytes comparing before hooking
         * @param ignoreArea pair offsets to ignore of originalCode
         */
        writeNop(originalCode, ignoreArea) {
            const ptr = this.getAddress();
            if (this._offset != null)
                ptr.move(this._offset);
            const size = originalCode.length;
            const unlock = new unlocker_1.MemoryUnlocker(ptr, size);
            if (this._check(ptr, originalCode, ignoreArea)) {
                dll_1.dll.vcruntime140.memset(ptr, 0x90, size);
            }
            unlock.done();
        }
        write(asm, offset, originalCode, ignoreArea) {
            const ptr = this.getAddress();
            if (this._offset != null)
                ptr.move(this._offset);
            const buffer = asm instanceof Uint8Array ? asm : asm.buffer();
            const unlock = new unlocker_1.MemoryUnlocker(ptr, buffer.length);
            if (originalCode != null) {
                if (originalCode.length < buffer.length) {
                    console.error(colors.red(`${this._subject || this.name}: ${nameWithOffset(this.name, offset)}: writing space is too small`));
                    unlock.done();
                    return;
                }
                if (!this._check(ptr, originalCode, ignoreArea)) {
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
    }
    hook.PtrTool = PtrTool;
    class Tool extends dnf_1.dnf.Tool {
        constructor(nf, name, thisType, opts) {
            super(nf, name, thisType);
            this.opts = opts;
        }
        options(opts) {
            this.opts = opts;
            return this;
        }
        types(...types) {
            const overload = (0, dnf_1.dnf)(this.nf).getByTypes(this.thisType, ...types);
            if (overload === null) {
                if (this.thisType !== null) {
                    console.trace(`Failed to hook, overload not found from ${this.thisType.name}.${String(this.name)}`);
                }
                else {
                    console.trace(`Failed to hook, overload not found`);
                }
                return hook.fail;
            }
            this.nf = overload;
            return this;
        }
        /**
         * @param key target symbol name
         * @param to call address
         */
        raw(to) {
            const [rva] = this.getInfo();
            const origin = dll_1.dll.current.add(rva);
            const key = this.options.name || '[hooked]';
            const REQUIRE_SIZE = 12;
            let original = null;
            if (this.opts.callOriginal) {
                const codes = disassembler_1.disasm.process(origin, REQUIRE_SIZE);
                const out = new asmtrans_1.X64OpcodeTransporter(origin, codes.size);
                const [keepRegister, keepFloatRegister] = this.getRegistersForParameters();
                if (keepRegister != null) {
                    for (const reg of keepRegister) {
                        out.freeregs.add(reg);
                    }
                }
                if (to instanceof Function)
                    to = to(null);
                out.saveAndCall(to, keepRegister, keepFloatRegister);
                const label = out.makeLabel(null);
                out.moveCode(codes, key, REQUIRE_SIZE);
                out.end();
                const hooked = out.alloc('hook of ' + key);
                if (!this.opts.noOriginal) {
                    original = hooked.add(label.offset);
                }
                const unlock = new unlocker_1.MemoryUnlocker(origin, codes.size);
                hacktool_1.hacktool.jump(origin, hooked, assembler_1.Register.rax, codes.size);
                unlock.done();
            }
            else {
                let unlockSize = REQUIRE_SIZE;
                if (!this.opts.noOriginal) {
                    const codes = disassembler_1.disasm.process(origin, REQUIRE_SIZE);
                    const out = new asmtrans_1.X64OpcodeTransporter(origin, codes.size);
                    out.moveCode(codes, key, REQUIRE_SIZE);
                    out.end();
                    original = out.alloc(key + ' (moved original)');
                    unlockSize = codes.size;
                }
                const unlock = new unlocker_1.MemoryUnlocker(origin, unlockSize);
                if (to instanceof Function)
                    to = to(original);
                hacktool_1.hacktool.jump(origin, to, assembler_1.Register.rax, unlockSize);
                unlock.done();
            }
            return original;
        }
        call(callback) {
            const [_, paramTypes, returnType, opts] = dnf_1.dnf.getOverloadInfo(this.nf);
            const original = this.raw(original => {
                const nopts = {};
                nopts.__proto__ = opts;
                nopts.onError = original;
                return makefunc_1.makefunc.np(callback, this.opts.callOriginal ? nativetype_1.void_t : returnType, nopts, ...paramTypes);
            });
            if (original === null)
                return null;
            return makefunc_1.makefunc.js(original, returnType, opts, ...paramTypes);
        }
    }
    hook.Tool = Tool;
    (0, util_1.inheritMultiple)(Tool, PtrTool);
    class FailedTool extends Tool {
        constructor() {
            super(common_1.emptyFunc, '[Native Function]', null, undefined);
        }
        raw() {
            return null;
        }
        call(callback) {
            return common_1.emptyFunc;
        }
        patch() {
            // empty
        }
        check() {
            return false;
        }
    }
    hook.fail = new FailedTool;
})(hook = exports.hook || (exports.hook = {}));
//# sourceMappingURL=hook.js.map