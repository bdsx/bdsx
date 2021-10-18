"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assembler_1 = require("./assembler");
const core_1 = require("./core");
const nativeFunctionNames = new Map();
assembler_1.asm.const_str = function (str, encoding = 'utf-8') {
    const buf = Buffer.from(str + '\0', encoding);
    core_1.chakraUtil.JsAddRef(buf);
    return buf;
};
assembler_1.asm.getFunctionName = function (address) {
    const looked = core_1.runtimeError.lookUpFunctionEntry(address);
    if (looked === null)
        return null;
    const rva = looked[1];
    if (rva == null)
        return null;
    return nativeFunctionNames.get((looked[0].add(rva)).getAddressBin()) || null;
};
assembler_1.asm.setFunctionNames = function (base, labels) {
    labels.__proto__ = null;
    for (const name in labels) {
        const address = labels[name];
        nativeFunctionNames.set(base.add(address).getAddressBin(), name);
    }
};
const SIZE_OF_RF = 4 * 3;
let reportGenerating = false;
function report(size) {
    if (reportGenerating)
        return;
    reportGenerating = true;
    setTimeout(() => {
        reportGenerating = false;
        console.log(`[BDSX] Generated Machine Code: ${size} bytes`);
    }, 10).unref();
}
assembler_1.X64Assembler.prototype.alloc = function (name) {
    const buffer = this.buffer(true);
    const memsize = this.getDefAreaSize();
    const memalign = this.getDefAreaAlign();
    const totalsize = buffer.length + memsize;
    const mem = core_1.cgate.allocExecutableMemory(totalsize, memalign);
    mem.setBuffer(buffer);
    const table = this.getLabelOffset('#runtime_function_table');
    if (table !== -1) {
        const size = buffer.length - table;
        core_1.runtimeError.addFunctionTable(mem.add(table), size / SIZE_OF_RF | 0, mem);
    }
    const labels = this.labels(true);
    if (name == null)
        name = '#anonymous';
    labels[name] = 0;
    assembler_1.asm.setFunctionNames(mem, labels);
    report(totalsize);
    return mem;
};
assembler_1.X64Assembler.prototype.allocs = function () {
    const buffer = this.buffer(true);
    const memsize = this.getDefAreaSize();
    const memalign = this.getDefAreaAlign();
    const buffersize = buffer.length;
    const totalsize = buffersize + memsize;
    const mem = core_1.cgate.allocExecutableMemory(totalsize, memalign);
    mem.setBuffer(buffer);
    report(totalsize);
    const out = {};
    const labels = this.labels();
    for (const name in labels) {
        const address = labels[name];
        out[name] = mem.add(address);
    }
    const defs = this.defs();
    for (const name in defs) {
        out[name] = mem.add(defs[name] + buffersize);
    }
    const table = labels['#runtime_function_table'];
    if (table != null) {
        const size = buffer.length - table;
        core_1.runtimeError.addFunctionTable(mem.add(table), size / SIZE_OF_RF | 0, mem);
        assembler_1.asm.setFunctionNames(mem, labels);
    }
    return out;
};
//# sourceMappingURL=codealloc.js.map