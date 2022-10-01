import type { makefunc } from "./makefunc";

const REF = /^[0-9]$/;

function attach(code:string, name:makefunc.Paramable|string):string {
    return code+(typeof name === 'string' ? name : name.symbol);
}

export const mangle = {
    char: 'D',
    unsignedChar: 'E',
    short: 'F',
    unsignedShort: 'G',
    int: 'H',
    unsignedInt: 'I',
    long: 'J',
    unsignedLong: 'K',
    double: 'N',
    float: 'M',
    longlong: '_J',
    unsignedLongLong: '_K',
    bool: '_N',
    unsignedInt128: '_M',
    void: 'X',
    constChar: '$$CBD',
    constCharPointer: 'PEBD',

    update(target:makefunc.Paramable, opts?:mangle.UpdateOptions):void {
        if (opts != null) {
            target.symbol = opts.symbol != null ? opts.symbol :
                opts.structSymbol ? mangle.struct(target.name) : mangle.clazz(target.name);
        } else {
            target.symbol = mangle.clazz(target.name);
        }
    },

    pointer(name:makefunc.Paramable|string):string {
        return attach('PEA', name);
    },
    constPointer(name:makefunc.Paramable|string):string {
        return attach('PEB', name);
    },
    ref(name:makefunc.Paramable|string):string {
        return attach('AEA', name);
    },
    constRef(name:makefunc.Paramable|string):string {
        return attach('AEB', name);
    },
    ns(names:string[]|string):string {
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
    },
    clazz(...name:string[]):string {
        return 'V'+mangle.ns(name);
    },
    struct(...name:string[]):string {
        return 'U'+mangle.ns(name);
    },
    number(n:number):string {
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
    },
    parameters(params:(makefunc.Paramable|string)[]):string {
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
    },
    funcptr(returnType:makefunc.Paramable|string, params:(makefunc.Paramable|string)[]):string {
        if (typeof returnType !== 'string') returnType = returnType.symbol;
        let out = 'P6A';
        out += returnType;
        out += mangle.parameters(params);
        out += 'Z';
        return out;
    },
    func(code:string, name:string[]|string, returnType:makefunc.Paramable|string, params:(makefunc.Paramable|string)[]):string {
        if (typeof returnType !== 'string') returnType = returnType.symbol;
        let out = '?';
        out += mangle.ns(name);
        out += code;
        out += returnType;
        out += mangle.parameters(params);
        out += 'Z';
        return out;
    },
    globalFunc(name:string[]|string, returnType:makefunc.Paramable|string, params:(makefunc.Paramable|string)[]):string {
        return mangle.func('YA', name, returnType, params);
    },
    privateConstFunc(name:string[]|string, returnType:makefunc.Paramable|string, params:(makefunc.Paramable|string)[]):string {
        return mangle.func('AEBA', name, returnType, params);
    },
    template(name:string, params:(makefunc.Paramable|string|number)[]):string {
        let out = '?$';
        out += name;
        out += '@';
        for (const param of params) {
            switch (typeof param) {
            case 'string': out += param; break;
            case 'number': out += mangle.number(param); break;
            default: out += param.symbol; break;
            }
        }
        out += '@';
        return out;
    },
    templateClass(name:string[]|string, ...params:(makefunc.Paramable|string|number)[]):string {
        if (typeof name === 'string') {
            return 'V'+mangle.template(name, params)+'@';
        } else {
            const last = name.pop()!;
            return 'V'+mangle.template(last, params)+mangle.ns(name);
        }
    },
};

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
}
