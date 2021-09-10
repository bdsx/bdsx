import { X64OpcodeTransporter } from "./asmtrans";
import { Register } from "./assembler";
import { AnyFunction, emptyFunc, NonNullableParameters } from "./common";
import { NativePointer, StaticPointer, VoidPointer } from "./core";
import { disasm } from "./disassembler";
import { dll } from "./dll";
import { hacktool } from "./hacktool";
import { FunctionFromTypes_js, makefunc, MakeFuncOptions, ParamType } from "./makefunc";
import { Type, UnwrapTypeArrayToArray } from "./nativetype";
import { MemoryUnlocker } from "./unlocker";
import { hex, memdiff, memdiff_contains } from "./util";
import colors = require('colors');
import { dnf } from "./dnf";

type UnwrapFunc<T, TYPES extends Type<any>[]> = T extends AnyFunction ? (...params:UnwrapTypeArrayToArray<TYPES>)=>ReturnType<T> : never;
type ShouldFunction<T> = T extends AnyFunction ? T : never;

export function hook<T extends AnyFunction>(nf:T|null):HookTool<unknown, T>;
export function hook<T extends AnyFunction, TYPES extends Type<any>[]>(nf:T|null, ...types:TYPES):HookTool<unknown, UnwrapFunc<T, TYPES>>;
export function hook<THIS, NAME extends keyof THIS>(nf:{name:string, prototype:THIS}|null, name:NAME, ...types:Type<any>[]):HookTool<THIS, ShouldFunction<THIS[NAME]>>;
export function hook<THIS, NAME extends keyof THIS, TYPES extends Type<any>[]>(nf:{name:string, prototype:THIS}|null, name:NAME, ...types:TYPES):HookTool<THIS, UnwrapFunc<THIS[NAME], TYPES>>;

/**
 * @returns returns 'hook.fail' if it failed.
 */
export function hook(nf:AnyFunction|null, name?:keyof any|Type<any>|null, ...types:Type<any>[]):HookTool<any, AnyFunction> {
    if (nf === null) {
        console.trace(`Failed to hook, null received`);
        return hook.fail;
    }

    let thisType:Type<any>|null;
    if (name != null) {
        if (typeof name !== 'object') {
            thisType = nf as any;
            nf = nf.prototype[name];
            if (!(nf instanceof Function)) throw Error(`${(nf as any).name}.${String(name)} is not a function`);
        } else {
            thisType = null;
            types.unshift(name);
            name = '[Native Function]';
        }
    } else {
        thisType = null;
        name = '[Native Function]';
    }

    if (types.length !== 0) {
        console.trace(`Failed to hook, null received`);
        const overload = dnf.getOverloadByTypes(nf, nf as any, ...types);
        if (overload === null) {
            if (thisType !== null) {
                console.trace(`Failed to hook, overload not found from ${thisType.name}.${String(name)}`);
            } else {
                console.trace(`Failed to hook, overload not found`);
            }
            return hook.fail;
        }
        nf = overload;
    }

    return new HookTool<any, AnyFunction>(nf, String(name));
}

export class HookTool<THIS, T extends AnyFunction> {
    constructor(public readonly nf:AnyFunction, public readonly name:string) {
    }

    getAddress():NativePointer {
        return dnf.getAddressOf(this.nf);
    }

    reform<OPTS extends MakeFuncOptions<any>|null, RETURN extends ParamType, PARAMS extends ParamType[]>(
        returnType:RETURN,
        opts?: OPTS,
        ...params: PARAMS):
        FunctionFromTypes_js<NativePointer, OPTS, PARAMS, RETURN> {
        const addr = this.getAddress();
        return makefunc.js(addr, returnType, opts, ...params);
    }

    /**
     * @param key target symbol name
     * @param to call address
     */
    raw(to:VoidPointer|((original:VoidPointer)=>VoidPointer), options:hook.Options={}):VoidPointer {
        const [rva] = dnf.getOverloadInfo(this.nf);
        const origin = dll.current.add(rva);
        const key = options.name || '[hooked]';

        const REQUIRE_SIZE = 12;
        let original:VoidPointer|null = null;
        if (options.callOriginal) {
            const codes = disasm.process(origin, REQUIRE_SIZE);
            const out = new X64OpcodeTransporter(origin, codes.size);
            const [keepRegister, keepFloatRegister] = dnf.getRegistersForParameters(this.nf);
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

    call(callback:NonNullableParameters<THIS, T>, options?:hook.Options):T {
        const [_, paramTypes, returnType, opts] = dnf.getOverloadInfo(this.nf);

        const original = this.raw(original=>{
            const nopts:MakeFuncOptions<any> = {};
            (nopts as any).__proto__ = opts;
            nopts.onError = original;
            return makefunc.np(callback as any, returnType, nopts, ...paramTypes);
        }, options);

        if (original === null) return null as any;
        return makefunc.js(original, returnType, opts, ...paramTypes) as unknown as T;
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
    patch(subject:string, offset:number, newCode:VoidPointer, tempRegister:Register, call:boolean, originalCode:number[], ignoreArea:number[]):void {
        const size = originalCode.length;
        const ptr = this.getAddress();
        const unlock = new MemoryUnlocker(ptr, size);
        if (this.check(subject, offset, ptr, originalCode, ignoreArea)) {
            hacktool.patch(ptr, newCode, tempRegister, size, call);
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
    check(subject:string, offset:number, ptr:StaticPointer, originalCode:number[], ignoreArea:number[]):boolean {
        const buffer = ptr.getBuffer(originalCode.length);
        const diff = memdiff(buffer, originalCode);
        if (!memdiff_contains(ignoreArea, diff)) {
            console.error(colors.red(`${subject}: ${this.name}+0x${offset.toString(16)}: code does not match`));
            console.error(colors.red(`[${hex(buffer)}] != [${hex(originalCode)}]`));
            console.error(colors.red(`diff: ${JSON.stringify(diff)}`));
            console.error(colors.red(`${subject}: skip`));
            return false;
        } else {
            return true;
        }
    }
}

class FailedHookTool extends HookTool<any, AnyFunction>{
    constructor() {
        super(emptyFunc, '[Native Function]');
    }

    call():AnyFunction {
        return emptyFunc;
    }

    patch():void {
        // empty
    }

    check():boolean {
        return false;
    }
}

export namespace hook {
    export const fail = new FailedHookTool;
    export interface Options {
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
}
