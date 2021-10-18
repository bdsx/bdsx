"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hacktool = void 0;
const assembler_1 = require("./assembler");
const dll_1 = require("./dll");
var hacktool;
(function (hacktool) {
    /**
     * @param keepRegister
     * @param keepFloatRegister
     * @param tempRegister
     */
    function hookWithCallOriginal(from, to, originalCodeSize, keepRegister, keepFloatRegister, tempRegister) {
        const newcode = (0, assembler_1.asm)();
        newcode.saveAndCall(to, keepRegister, keepFloatRegister);
        newcode.write(...from.getBuffer(originalCodeSize));
        if (tempRegister != null)
            newcode.jmp64(from, tempRegister);
        else
            newcode.jmp64_notemp(from.add(originalCodeSize));
        const jumper = (0, assembler_1.asm)().jmp64(newcode.alloc(), assembler_1.Register.rax).buffer();
        if (jumper.length > originalCodeSize)
            throw Error(`Too small area to hook, needs=${jumper.length}, originalCodeSize=${originalCodeSize}`);
        from.setBuffer(jumper);
        dll_1.dll.vcruntime140.memset(from.add(jumper.length), 0xcc, originalCodeSize - jumper.length); // fill int3 at remained
    }
    hacktool.hookWithCallOriginal = hookWithCallOriginal;
    function patch(from, to, tmpRegister, originalCodeSize, call) {
        let jumper;
        if (call) {
            jumper = (0, assembler_1.asm)()
                .call64(to, tmpRegister)
                .buffer();
        }
        else {
            jumper = (0, assembler_1.asm)()
                .jmp64(to, tmpRegister)
                .buffer();
        }
        if (jumper.length > originalCodeSize)
            throw Error(`Too small area to patch, require=${jumper.length}, actual=${originalCodeSize}`);
        from.setBuffer(jumper);
        dll_1.dll.vcruntime140.memset(from.add(jumper.length), 0x90, originalCodeSize - jumper.length); // fill nop at remained
    }
    hacktool.patch = patch;
    function jump(from, to, tmpRegister, originalCodeSize) {
        const jumper = (0, assembler_1.asm)().jmp64(to, tmpRegister).buffer();
        if (jumper.length > originalCodeSize)
            throw Error(`Too small area to patch, require=${jumper.length}, actual=${originalCodeSize}`);
        from.setBuffer(jumper);
        dll_1.dll.vcruntime140.memset(from.add(jumper.length), 0x90, originalCodeSize - jumper.length); // fill nop at remained
    }
    hacktool.jump = jump;
})(hacktool = exports.hacktool || (exports.hacktool = {}));
//# sourceMappingURL=hacktool.js.map