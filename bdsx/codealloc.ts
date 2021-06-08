import { asm, X64Assembler } from "./assembler";
import { cgate, chakraUtil, runtimeError, StaticPointer } from "./core";

declare module "./assembler"
{
    interface X64Assembler
    {
        alloc():StaticPointer;
        allocs():Record<string, StaticPointer>;
    }
    namespace asm
    {
        function const_str(str:string, encoding?:BufferEncoding):Buffer;
    }
}
asm.const_str = function(str:string, encoding:BufferEncoding='utf-8'):Buffer {
    const buf = Buffer.from(str+'\0', encoding);
    chakraUtil.JsAddRef(buf);
    return buf;
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

X64Assembler.prototype.alloc = function():StaticPointer {
    const buffer = this.buffer();
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
    report(totalsize);
    return mem;
};

X64Assembler.prototype.allocs = function():Record<string, StaticPointer> {
    const buffer = this.buffer();
    const memsize = this.getDefAreaSize();
    const memalign = this.getDefAreaAlign();
    const buffersize = buffer.length;
    const totalsize = buffersize+memsize;
    const mem = cgate.allocExecutableMemory(totalsize, memalign);
    mem.setBuffer(buffer);
    report(totalsize);

    const out:Record<string, StaticPointer> = {};
    const labels = this.labels();
    for (const name in labels) {
        out[name] = mem.add(labels[name]);
    }
    const defs = this.defs();
    for (const name in defs) {
        out[name] = mem.add(defs[name] + buffersize);
    }

    const table = labels['#runtime_function_table'];
    if (table != null) {
        const size = buffer.length - table;
        runtimeError.addFunctionTable(mem.add(table), size / SIZE_OF_RF | 0, mem);
    }
    return out;
};
