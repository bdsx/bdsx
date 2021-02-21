import { asm, X64Assembler } from "./assembler";
import { cgate, chakraUtil, StaticPointer } from "./core";

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

X64Assembler.prototype.alloc = function():StaticPointer {
    const buffer = this.buffer();
    const memsize = this.getDefAreaSize();
    const memalign = this.getDefAreaAlign();
    const mem = cgate.allocExecutableMemory(buffer.length+memsize, memalign);
    mem.setBuffer(buffer);
    return mem;
};

X64Assembler.prototype.allocs = function():Record<string, StaticPointer> {
    const buffer = this.buffer();
    const memsize = this.getDefAreaSize();
    const memalign = this.getDefAreaAlign();
    const buffersize = buffer.length;
    const mem = cgate.allocExecutableMemory(buffersize+memsize, memalign);
    mem.setBuffer(buffer);

    const out:Record<string, StaticPointer> = {};
    const labels = this.labels();
    for (const name in labels) {
        out[name] = mem.add(labels[name]);
    }
    const defs = this.defs();
    for (const name in defs) {
        out[name] = mem.add(defs[name] + buffersize);
    }
    return out;
};
