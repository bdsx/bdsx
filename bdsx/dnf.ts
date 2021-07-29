import { AnyFunction } from "./common";
import { dll } from "./dll";
import { makefunc, MakeFuncOptions } from "./makefunc";
import { Type } from "./nativetype";


enum Prop {
    rva,
    parameterTypes,
    returnType,
    opts,
    templates
}

declare global {
    interface Function {
        overloads?:AnyFunction[];
        overloadInfo?:dnf.OverloadInfo;
        [nativeCall]?:AnyFunction;
    }
}

const nativeCall = Symbol('nativeCall');

function checkEntryWithValues(func:AnyFunction, thisv:unknown, args:ArrayLike<unknown>):boolean {
    const info = func.overloadInfo!;
    const opts = info[Prop.opts];
    if (opts !== null) {
        const thisType = opts.this;
        if (thisType !== null) {
            if (!thisType.isTypeOf(thisv)) return false;
        }
    }
    const params = info[Prop.parameterTypes];
    for (let i=0;i<args.length;i++) {
        if (!params[i].isTypeOf(args[i])) return false;
    }
    return true;
}

function checkEntryWithTypes(func:AnyFunction, thisv:Type<any>|null, args:Type<any>[]):boolean {
    const info = func.overloadInfo!;
    const opts = info[Prop.opts];
    if (opts !== null) {
        const thisType = opts.this;
        if (thisType !== null) {
            if (thisType !== thisv) return false;
        }
    }
    const params = info[Prop.parameterTypes];
    if (args.length !== params.length) return false;
    for (let i=0;i<args.length;i++) {
        if (params[i] !== args[i]) return false;
    }
    return true;
}

function checkEntryTemplates(func:AnyFunction, args:ArrayLike<unknown>):boolean {
    const templates = func.overloadInfo![Prop.templates];
    if (templates == null) return false;
    if (args.length > templates.length) return false;
    for (let i=0;i<args.length;i++) {
        if (templates[i] !== args[i]) return false;
    }
    return true;
}

function makeOverloadNativeCall(func:AnyFunction):AnyFunction {
    const info = func.overloadInfo!;
    return func[nativeCall] = makefunc.js(dll.current.add(info[Prop.rva]), info[Prop.returnType], info[Prop.opts], ...info[Prop.parameterTypes]);
}

// deferred native function
export namespace dnf {
    // rva, parameterTypes, returnType, opts, templates
    export type OverloadInfo = [number, makefunc.Paramable[], makefunc.Paramable, MakeFuncOptions<any>|null, unknown[]?];

    export function makeOverload():AnyFunction {
        function nf(this:unknown):any {
            return (nf[nativeCall] || makeOverloadNativeCall(nf)).apply(this, arguments);
        }
        return nf;
    }

    /**
     * search overloads with types
     */
    export function get(nf:AnyFunction, thisType:Type<any>, paramTypes:Type<any>[], templates?:unknown[]):AnyFunction|null{
        const overloads = nf.overloads;
        if (overloads == null) {
            throw Error(`it does not have overloads`);
        }
        if (overloads.length === 1) {
            return overloads[0];
        } else {
            for (const entry of overloads) {
                if (templates != null && !checkEntryTemplates(entry, templates)) continue;
                if (!checkEntryWithTypes(entry, thisType, paramTypes)) continue;
                return entry;
            }
        }
        return null;
    }
    /**
     * search overloads with templates
     */
    export function getByTemplates(nf:AnyFunction, ...args:unknown[]):AnyFunction|null{
        const overloads = nf.overloads;
        if (overloads == null) {
            throw Error(`it does not have overloads`);
        }
        if (overloads.length === 1) {
            return overloads[0];
        } else {
            for (const entry of overloads) {
                if (!checkEntryTemplates(entry, args)) continue;
                return entry;
            }
        }
        return null;
    }
    /**
     * search overloads with values
     */
    export function getByValues(nf:AnyFunction, thisv:unknown, ...args:unknown[]):AnyFunction|null{
        const overloads = nf.overloads;
        if (overloads == null) {
            throw Error(`it does not have overloads`);
        }
        if (overloads.length === 1) {
            return overloads[0];
        } else {
            for (const overload of overloads) {
                if (!checkEntryWithValues(overload, thisv, args)) continue;
                return overload;
            }
        }
        return null;
    }
    /**
     * search overloads with parameter types
     */
    export function getByTypes(nf:AnyFunction, thisv:Type<any>, ...args:Type<any>[]):AnyFunction|null{
        const overloads = nf.overloads;
        if (overloads == null) {
            throw Error(`it does not have overloads`);
        }
        if (overloads.length === 1) {
            return overloads[0];
        } else {
            for (const overload of overloads) {
                if (!checkEntryWithTypes(overload, thisv, args)) continue;
                return overload;
            }
        }
        return null;
    }

    export function getOverloadInfo(nf:AnyFunction):OverloadInfo {
        const overloads = nf.overloads;
        if (overloads != null) {
            if (overloads.length === 0) {
                throw Error(`it does not have overloads`);
            } else if (overloads.length >= 2) {
                throw Error(`it has multiple overloads`);
            }
            nf = overloads[0];
        }
        const info = nf.overloadInfo;
        if (info == null) {
            throw Error(`it does not have a overload info`);
        }
        return info;
    }

    /**
     * make a deferred native function
     */
    export function make():AnyFunction {
        function nf(this:unknown, ...args:unknown[]):any {
            let call = nf[nativeCall];
            if (call == null) {
                const overloads = nf.overloads;
                if (overloads == null || overloads.length === 0) {
                    throw Error(`it does not have overloads`);
                }
                if (overloads.length === 1) {
                    const overload = overloads[0];
                    call = overload[nativeCall] || makeOverloadNativeCall(overload);
                } else {
                    nf[nativeCall] = call = function(this:unknown):any {
                        for (const overload of overloads) {
                            if (!checkEntryTemplates(overload, arguments)) continue;
                            const func = overload[nativeCall] || makeOverloadNativeCall(overload);
                            return func.bind(this);
                        }
                        for (const overload of overloads) {
                            if (!checkEntryWithValues(overload, this, arguments)) continue;
                            const func = overload[nativeCall] || makeOverloadNativeCall(overload);
                            return func.apply(this, arguments);
                        }
                        throw Error('overload not found');
                    };
                }
            }
            return call.apply(this, args);
        }
        return nf;
    }
}
