import { asm, X64Assembler } from "./assembler";
import { Encoding } from "./common";
import { AllocatedPointer, cgate, chakraUtil, NativePointer, runtimeError, StaticPointer, VoidPointer } from "./core";

declare module "./assembler" {
    interface X64Assembler {
        alloc(name?:string|null):StaticPointer;
        allocs():Record<string, StaticPointer>;
    }
    namespace asm {
        function const_str(str:string, encoding?:BufferEncoding):Buffer;
        function const_str(str:string, encoding:Encoding):NativePointer;
        function getFunctionNameFromEntryAddress(address:VoidPointer):string|null;
        function getFunctionName(address:VoidPointer):string|null;
        function setFunctionNames(base:VoidPointer, labels:Record<string, number>):void;
    }
}
const nativeFunctionNames = new Map<string, string>();

asm.const_str = function(str:string, encoding:BufferEncoding|Encoding='utf-8'):any {
    let ptr:StaticPointer|Buffer;
    if (typeof encoding === 'number') {
        ptr = AllocatedPointer.fromString(str, encoding);
    } else {
        ptr = Buffer.from(str+'\0', encoding);
    }
    chakraUtil.JsAddRef(ptr);
    return ptr;
};
asm.getFunctionNameFromEntryAddress = function(address:VoidPointer):string|null {
    return nativeFunctionNames.get(address.getAddressBin()) || null;
};
asm.getFunctionName = function(address:VoidPointer):string|null {
    const info = runtimeError.lookUpFunctionEntry(address);
    if (info === null) return null;
    const rva = info[1];
    if (rva == null) return null;
    return nativeFunctionNames.get(info[0].add(rva).getAddressBin()) || null;
};
asm.setFunctionNames = function(base:VoidPointer, labels:Record<string, number>):void {
    for (const [name, address] of Object.entries(labels)) {
        nativeFunctionNames.set(base.add(address).getAddressBin(), name);
    }
};

const SIZE_OF_RF = 4 * 3;

let reportGenerating = false;
function report(size:number):void {
    if (reportGenerating) return;
    reportGenerating = true;
    setTimeout(()=>{
        reportGenerating = false;
        console.log(`[BDSX] Generated Machine Code: ${size} bytes`);
    }, 10).unref();
}

function hasZeroLabel(labels:Record<string, number>):boolean {
    for (const address of Object.values(labels)) {
        if (address === 0) {
            return true;
        }
    }
    return false;
}

X64Assembler.prototype.alloc = function(name?:string|null):StaticPointer {
    const buffer = this.buffer(true);
    const memsize = this.getDefAreaSize();
    const memalign = this.getDefAreaAlign();
    const totalsize = buffer.length+memsize;
    const mem = cgate.allocExecutableMemory(totalsize, memalign);
    mem.setBuffer(buffer);
    const table = this.getLabelOffset('#runtime_function_table');
    if (table !== -1) {
        const size = buffer.length - table;
        runtimeError.addFunctionTable(mem.add(table), size / SIZE_OF_RF | 0, mem);
    }
    const labels = this.labels(true);
    if (!hasZeroLabel(labels)) {
        if (name == null) {
            name = '#anonymous';
        }
        labels[name] = 0;
    }
    asm.setFunctionNames(mem, labels);
    report(totalsize);
    return mem;
};

X64Assembler.prototype.allocs = function():Record<string, StaticPointer> {
    const buffer = this.buffer(true);
    const memsize = this.getDefAreaSize();
    const memalign = this.getDefAreaAlign();
    const buffersize = buffer.length;
    const totalsize = buffersize+memsize;
    const mem = cgate.allocExecutableMemory(totalsize, memalign);
    mem.setBuffer(buffer);
    report(totalsize);

    const out:Record<string, StaticPointer> = {};
    const labels = this.labels();
    for (const [name, offset] of Object.entries(labels)) {
        out[name] = mem.add(offset);
    }
    const defs = this.defs();
    for (const [name, offset] of Object.entries(defs)) {
        out[name] = mem.add(offset + buffersize);
    }

    const table = labels['#runtime_function_table'];
    if (table != null) {
        const size = buffer.length - table;
        runtimeError.addFunctionTable(mem.add(table), size / SIZE_OF_RF | 0, mem);
        asm.setFunctionNames(mem, labels);
    }
    return out;
};
