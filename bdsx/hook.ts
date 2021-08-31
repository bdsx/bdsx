import { X64OpcodeTransporter } from "./asmtrans";
import { Register } from "./assembler";
import { AnyFunction, NonNullableParameters } from "./common";
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
    /**
     * call the original function at the end of the hooked function.
     * it can receive only 4 parameters.
     * noOriginal will be ignored.
     */
    callOriginal?:boolean
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
    if (options.callOriginal) {
        const codes = disasm.process(origin, REQUIRE_SIZE);
        const out = new X64OpcodeTransporter(origin, codes.size);
        const [keepRegister, keepFloatRegister] = dnf.getRegistersForParameters(nf);
        if (keepRegister != null) {
            for (const reg of keepRegister) {
                out.freeregs.add(reg);
            }
        }
        if (to instanceof Function) to = to(null as any);
        out.saveAndCall(to, keepRegister, keepFloatRegister);
        const label = out.makeLabel(null);
        out.moveCode(codes, key, REQUIRE_SIZE);
        out.end();
        const hooked = out.alloc('hook of '+key);
        original = hooked.add(label.offset);

        const unlock = new MemoryUnlocker(origin, codes.size);
        hacktool.jump(origin, hooked, Register.rax, codes.size);
        unlock.done();
    } else {
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
    }
    return original!;
}

function hookFunction(nf:AnyFunction, callback:AnyFunction, options?:HookOptions):AnyFunction {
    const [_, paramTypes, returnType, opts] = dnf.getOverloadInfo(nf as any);

    const original = hookRaw(nf as any, original=>{
        const nopts:MakeFuncOptions<any> = {};
        (nopts as any).__proto__ = opts;
        nopts.onError = original;
        return makefunc.np(callback as any, returnType, nopts, ...paramTypes);
    }, options);

    if (original === null) return null as any;
    return makefunc.js(original, returnType, opts, ...paramTypes);
}

export function hook<T extends AnyFunction>(nf:T):(callback:NonNullableParameters<null, T>, options?:HookOptions)=>T;
export function hook<THIS, NAME extends keyof THIS>(nf:{name:string, prototype:THIS}, name:NAME):(callback:NonNullableParameters<THIS, THIS[NAME]>, options?:HookOptions)=>THIS[NAME];
export function hook(nf:AnyFunction, name?:string):(callback:AnyFunction, options?:HookOptions)=>AnyFunction {
    if (name != null) {
        nf = nf.prototype[name];
        if (!(nf instanceof Function)) throw Error(`${(nf as any).name}.${name} is not a function`);
    }

    const func = nf;
    return function(callback, options){
        return hookFunction(func, callback, options);
    };
}
