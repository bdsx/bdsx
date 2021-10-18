"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hook = void 0;
const asmtrans_1 = require("./asmtrans");
const assembler_1 = require("./assembler");
const common_1 = require("./common");
const disassembler_1 = require("./disassembler");
const dll_1 = require("./dll");
const dnf_1 = require("./dnf");
const hacktool_1 = require("./hacktool");
const makefunc_1 = require("./makefunc");
const unlocker_1 = require("./unlocker");
const util_1 = require("./util");
const colors = require("colors");
/**
 * @returns returns 'hook.fail' if it failed.
 */
function hook(nf, name, ...types) {
    if (nf === null) {
        console.trace(`Failed to hook, null received`);
        return hook.fail;
    }
    let thisType;
    if (name != null) {
        if (typeof name !== 'object') {
            thisType = nf;
            nf = nf.prototype[name];
            if (!(nf instanceof Function))
                throw Error(`${nf.name}.${String(name)} is not a function`);
        }
        else {
            thisType = null;
            types.unshift(name);
            name = '[Native Function]';
        }
    }
    else {
        thisType = null;
        name = '[Native Function]';
    }
    if (types.length !== 0) {
        console.trace(`Failed to hook, null received`);
        const overload = (0, dnf_1.dnf)(nf).getByTypes(nf, ...types);
        if (overload === null) {
            if (thisType !== null) {
                console.trace(`Failed to hook, overload not found from ${thisType.name}.${String(name)}`);
            }
            else {
                console.trace(`Failed to hook, overload not found`);
            }
            return hook.fail;
        }
        nf = overload;
    }
    return new hook.Tool(nf, String(name), thisType);
}
exports.hook = hook;
(function (hook) {
    class Tool extends dnf_1.dnf.Tool {
        getAddress() {
            return dnf_1.dnf.getAddressOf(this.nf);
        }
        /**
         * @param key target symbol name
         * @param to call address
         */
        raw(to, options = {}) {
            const [rva] = this.getInfo();
            const origin = dll_1.dll.current.add(rva);
            const key = options.name || '[hooked]';
            const REQUIRE_SIZE = 12;
            let original = null;
            if (options.callOriginal) {
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
                original = hooked.add(label.offset);
                const unlock = new unlocker_1.MemoryUnlocker(origin, codes.size);
                hacktool_1.hacktool.jump(origin, hooked, assembler_1.Register.rax, codes.size);
                unlock.done();
            }
            else {
                let unlockSize = REQUIRE_SIZE;
                if (!options.noOriginal) {
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
        call(callback, options) {
            const [_, paramTypes, returnType, opts] = dnf_1.dnf.getOverloadInfo(this.nf);
            const original = this.raw(original => {
                const nopts = {};
                nopts.__proto__ = opts;
                nopts.onError = original;
                return makefunc_1.makefunc.np(callback, returnType, nopts, ...paramTypes);
            }, options);
            if (original === null)
                return null;
            return makefunc_1.makefunc.js(original, returnType, opts, ...paramTypes);
        }
        /**
         * @param subject for printing on error
         * @param offset offset from target
         * @param newCode call address
         * @param tempRegister using register to call
         * @param call true - call, false - jump
         * @param originalCode bytes comparing before hooking
         * @param ignoreArea pair offsets to ignore of originalCode
         */
        patch(subject, offset, newCode, tempRegister, call, originalCode, ignoreArea) {
            const size = originalCode.length;
            const ptr = this.getAddress();
            const unlock = new unlocker_1.MemoryUnlocker(ptr, size);
            if (this.check(subject, offset, ptr, originalCode, ignoreArea)) {
                hacktool_1.hacktool.patch(ptr, newCode, tempRegister, size, call);
            }
            unlock.done();
        }
        /**
         * @param subject name of hooking
         * @param offset offset from target
         * @param ptr target pointer
         * @param originalCode old codes
         * @param ignoreArea pairs of offset, ignores partial bytes.
         */
        check(subject, offset, ptr, originalCode, ignoreArea) {
            const buffer = ptr.getBuffer(originalCode.length);
            const diff = (0, util_1.memdiff)(buffer, originalCode);
            if (!(0, util_1.memdiff_contains)(ignoreArea, diff)) {
                console.error(colors.red(`${subject}: ${this.name}+0x${offset.toString(16)}: code does not match`));
                console.error(colors.red(`[${(0, util_1.hex)(buffer)}] != [${(0, util_1.hex)(originalCode)}]`));
                console.error(colors.red(`diff: ${JSON.stringify(diff)}`));
                console.error(colors.red(`${subject}: skip`));
                return false;
            }
            else {
                return true;
            }
        }
    }
    hook.Tool = Tool;
    class FailedTool extends Tool {
        constructor() {
            super(common_1.emptyFunc, '[Native Function]', null);
        }
        call() {
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