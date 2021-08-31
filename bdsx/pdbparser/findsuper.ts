import { asm } from "../assembler";
import { disasm } from "../disassembler";
import { dll } from "../dll";
import { PdbId } from "./symbolparser";

function getCall(item:PdbId<PdbId.Function>):PdbId<PdbId.Function>|null {
    const ptr = dll.current.add(item.address);

    for (;;) {
        const oper = disasm.walk(ptr);
        if (oper === null) return null;
        if (oper.code === asm.code.ret) return null;
        if (oper.code !== asm.code.call_c) continue;
        const addr = ptr.add(oper.args[0]).subptr(dll.current);
        const superfunc = PdbId.addressMap.get(addr);
        if (superfunc == null) {
            console.log(`[RVA]+0x${addr.toString(16)}: function not found`);
            continue;
        }
        return superfunc;
    }
}

export function resolveSuper():void {
    console.log(`[symbolwriter.ts] Resolve extended classes...`);
    for (const item of PdbId.global.loopAll()) {
        if (item.is(PdbId.Function) && item.data.isConstructor && item.address !== 0) {
            const supercall = getCall(item);
            if (supercall !== null) {
                console.log(supercall.name);
                const supercls = supercall.parent!;
                if (supercls.is(PdbId.Class)) {
                    item.parent!.determine(PdbId.Class).super = supercls;
                }
            }
        }
    }
}
