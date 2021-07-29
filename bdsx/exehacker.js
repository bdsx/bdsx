//@ts-check
/**
 * @deprecated
 */
"use strict";

const { Register } = require("./assembler");
const { procHacker } = require("./bds/proc");

function nopping(subject, key, offset, originalCode, ignoreArea) {
    procHacker.nopping(subject, key, offset, originalCode, ignoreArea);
}
function hooking(dummy, key, to, ignore, ignore2) {
    procHacker.hookingRawWithCallOriginal(key, to, [Register.rcx, Register.rdx, Register.r8, Register.r9], []);
}
function patching(subject, key, offset, newCode, tempRegister, call, originalCode, ignoreArea) {
    procHacker.patching(subject, key, offset, newCode, tempRegister, call, originalCode, ignoreArea);
}
function jumping(subject, key, offset, jumpTo, tempRegister, originalCode, ignoreArea) {
    procHacker.jumping(subject, key, offset, jumpTo, tempRegister, originalCode, ignoreArea);
}
function write(key, offset, asm) {
    procHacker.write(key, offset, asm);
}

exports.exehacker = {
    nopping,
    hooking,
    patching,
    jumping,
    write
};
