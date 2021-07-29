import { X64OpcodeTransporter } from "./asmtrans";
import { Register } from "./assembler";
import { AnyFunction } from "./common";
import { VoidPointer } from "./core";
import { disasm } from "./disassembler";
import { dll } from "./dll";
import { dnf } from "./dnf";
import { hacktool } from "./hacktool";
import { makefunc, MakeFuncOptions } from "./makefunc";
import { MemoryUnlocker } from "./unlocker";

export interface HookOptions {
    /**
     * name for error or crash
     */
    name?:string;
    /**
     * do not generate the original function.
     * it will return null instead of the original function
     */
    noOriginal?:boolean;
}

/**
 * @param key target symbol name
 * @param to call address
 */
export function hookRaw(nf:AnyFunction, to:VoidPointer|((original:VoidPointer)=>VoidPointer), options:HookOptions={}):VoidPointer {
    const [rva] = dnf.getOverloadInfo(nf);
    const origin = dll.current.add(rva);
    const key = options.name || '[hooked]';

    const REQUIRE_SIZE = 12;

    let original:VoidPointer|null = null;
    let unlockSize = REQUIRE_SIZE;
    if (!options.noOriginal) {
        const codes = disasm.process(origin, REQUIRE_SIZE);
        const out = new X64OpcodeTransporter(origin, codes.size);
        out.moveCode(codes, key, REQUIRE_SIZE);
        out.end();
        original = out.alloc(key+' (moved original)');
        unlockSize = codes.size;
    }

    const unlock = new MemoryUnlocker(origin, unlockSize);
    if (to instanceof Function) to = to(original!);
    hacktool.jump(origin, to, Register.rax, unlockSize);
    unlock.done();
    return original!;
}

export function hook<T extends AnyFunction>(nf:T, callback:T, options?:HookOptions):T {
    const [_, paramTypes, returnType, opts] = dnf.getOverloadInfo(nf);

    const original = hookRaw(nf, original=>{
        const nopts:MakeFuncOptions<any> = {};
        (nopts as any).__proto__ = opts;
        nopts.onError = original;
        return makefunc.np(callback as any, returnType, nopts, ...paramTypes);
    }, options);

    if (original === null) return null as any;
    return makefunc.js(original, returnType, opts, ...paramTypes) as any;
}
