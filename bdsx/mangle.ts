import type { makefunc } from "./makefunc";

const REF = /^[0-9]$/;

function attach(code:string, name:makefunc.Paramable|string):string {
    return code+(typeof name === 'string' ? name : name.symbol);
}

export namespace mangle {
    export interface UpdateOptions {
        /**
         * the symbol is defined as a struct
         */
        structSymbol?:boolean;

        /**
         * set symbol name manually
         */
        symbol?:string;
    }

    export function update(target:makefunc.Paramable, opts?:UpdateOptions):void {
        if (opts != null) {
            target.symbol = opts.symbol != null ? opts.symbol :
                opts.structSymbol ? struct(target.name) : clazz(target.name);
        } else {
            target.symbol = clazz(target.name);
        }
    }

    export function pointer(name:makefunc.Paramable|string):string {
        return attach('PEA', name);
    }
    export function constPointer(name:makefunc.Paramable|string):string {
        return attach('PEB', name);
    }
    export function ref(name:makefunc.Paramable|string):string {
        return attach('AEA', name);
    }
    export function constRef(name:makefunc.Paramable|string):string {
        return attach('AEB', name);
    }
    export function ns(names:string[]|string):string {
        if (typeof names === 'string') return names + '@@';
        let out = '';
        let nameidx = names.length;
        while (nameidx !== 0) {
            const name = names[--nameidx];
            if (REF.test(name)) {
                out += name;
            } else if (name.endsWith('@')) {
                out += name;
            } else {
                out += name;
                out += '@';
            }
        }
        out += '@';
        return out;
    }
    export function clazz(...name:string[]):string {
        return 'V'+ns(name);
    }
    export function struct(...name:string[]):string {
        return 'U'+ns(name);
    }
    export function number(n:number):string {
        if (n !== 0 && n <= 10 && n >= -10) {
            if (n > 0) {
                return `$0`+n;
            } else {
                return `$0?`+n;
            }
        } else {
            const out = [0x24, 0x30];
            if (n < 0) {
                out.push(0x3f);
                n = -n;
            }
            do {
                out.push((n & 0xf) + 0x41);
                n >>>= 4;
            } while (n !== 0);
            out.push(0x40);
            return String.fromCharCode(...out);
        }
    }
    export function parameters(params:(makefunc.Paramable|string)[]):string {
        if (params.length === 0) {
            return 'X';
        } else {
            let out = '';
            for (const param of params) {
                out += typeof param === 'string' ? param : param.symbol;
            }
            out += '@';
            return out;
        }
    }
    export function funcptr(returnType:makefunc.Paramable|string, params:(makefunc.Paramable|string)[]):string {
        if (typeof returnType !== 'string') returnType = returnType.symbol;
        let out = 'P6A';
        out += returnType;
        out += parameters(params);
        out += 'Z';
        return out;
    }
    export function func(code:string, name:string[]|string, returnType:makefunc.Paramable|string, params:(makefunc.Paramable|string)[]):string {
        if (typeof returnType !== 'string') returnType = returnType.symbol;
        let out = '?';
        out += ns(name);
        out += code;
        out += returnType;
        out += parameters(params);
        out += 'Z';
        return out;
    }
    export function globalFunc(name:string[]|string, returnType:makefunc.Paramable|string, params:(makefunc.Paramable|string)[]):string {
        return func('YA', name, returnType, params);
    }
    export function privateConstFunc(name:string[]|string, returnType:makefunc.Paramable|string, params:(makefunc.Paramable|string)[]):string {
        return func('AEBA', name, returnType, params);
    }
    export function template(name:string, params:(makefunc.Paramable|string)[]):string {
        let out = '?$';
        out += name;
        out += '@';
        for (const param of params) {
            out += typeof param === 'string' ? param : param.symbol;
        }
        out += '@';
        return out;
    }
    export function templateClass(name:string[]|string, ...params:(makefunc.Paramable|string)[]):string {
        if (typeof name === 'string') {
            return 'V'+template(name, params)+'@';
        } else {
            const last = name.pop()!;
            return 'V'+template(last, params)+ns(name);
        }
    }
}
