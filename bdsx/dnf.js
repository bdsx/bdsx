"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dnf = void 0;
const assembler_1 = require("./assembler");
const dll_1 = require("./dll");
const makefunc_1 = require("./makefunc");
const util_1 = require("./util");
var Prop;
(function (Prop) {
    Prop[Prop["rva"] = 0] = "rva";
    Prop[Prop["parameterTypes"] = 1] = "parameterTypes";
    Prop[Prop["returnType"] = 2] = "returnType";
    Prop[Prop["opts"] = 3] = "opts";
    Prop[Prop["templates"] = 4] = "templates";
})(Prop || (Prop = {}));
const nativeCall = Symbol('nativeCall');
const PARAM_FLOAT_REGISTERS = [assembler_1.FloatRegister.xmm0, assembler_1.FloatRegister.xmm1, assembler_1.FloatRegister.xmm2, assembler_1.FloatRegister.xmm3];
const PARAM_REGISTERS = [assembler_1.Register.rcx, assembler_1.Register.rdx, assembler_1.Register.r8, assembler_1.Register.r9];
function checkEntryWithValues(func, thisv, args) {
    const info = func.overloadInfo;
    const opts = info[Prop.opts];
    if (opts !== null) {
        const thisType = opts.this;
        if (thisType !== null) {
            if (!thisType.isTypeOf(thisv))
                return false;
        }
    }
    const params = info[Prop.parameterTypes];
    for (let i = 0; i < args.length; i++) {
        if (!params[i].isTypeOf(args[i]))
            return false;
    }
    return true;
}
function checkEntryWithTypes(func, thisv, args) {
    const info = func.overloadInfo;
    const opts = info[Prop.opts];
    if (opts !== null) {
        const thisType = opts.this;
        if (thisType !== null) {
            if (thisType !== thisv)
                return false;
        }
    }
    const params = info[Prop.parameterTypes];
    if (args.length !== params.length)
        return false;
    for (let i = 0; i < args.length; i++) {
        if (params[i] !== args[i])
            return false;
    }
    return true;
}
function checkEntryTemplates(func, thisv, args) {
    const templates = func.overloadInfo[Prop.templates];
    if (templates == null)
        return false;
    if (thisv != null) {
        const opts = func.overloadInfo[Prop.opts];
        if (opts !== null && opts.this !== thisv)
            return false;
    }
    if (args.length > templates.length)
        return false;
    for (let i = 0; i < args.length; i++) {
        if (templates[i] !== args[i])
            return false;
    }
    return true;
}
function makeOverloadNativeCall(func) {
    const info = func.overloadInfo;
    return func[nativeCall] = makefunc_1.makefunc.js(dll_1.dll.current.add(info[Prop.rva]), info[Prop.returnType], info[Prop.opts], ...info[Prop.parameterTypes]);
}
function makeFunctionNativeCall(nf) {
    const overloads = nf.overloads;
    if (overloads == null || overloads.length === 0) {
        throw Error(`it does not have overloads`);
    }
    if (overloads.length === 1) {
        const overload = overloads[0];
        return nf[nativeCall] = overload[nativeCall] || makeOverloadNativeCall(overload);
    }
    else {
        return nf[nativeCall] = function () {
            const ctor = this ? this.constructor : null;
            for (const overload of overloads) {
                if (!checkEntryTemplates(overload, ctor, arguments))
                    continue;
                const func = overload[nativeCall] || makeOverloadNativeCall(overload);
                return func.bind(this);
            }
            for (const overload of overloads) {
                if (!checkEntryWithValues(overload, this, arguments))
                    continue;
                const func = overload[nativeCall] || makeOverloadNativeCall(overload);
                return func.apply(this, arguments);
            }
            throw Error('overload not found');
        };
    }
}
function dnf(nf, methodName) {
    if (methodName != null) {
        return new dnf.Tool(nf.prototype[methodName], String(methodName), nf);
    }
    else {
        return new dnf.Tool(nf, '[Native Function]', null);
    }
}
exports.dnf = dnf;
// deferred native function
(function (dnf) {
    class Tool {
        constructor(nf, name, thisType) {
            this.nf = nf;
            this.name = name;
            this.thisType = thisType;
        }
        getVFTableOffset() {
            if (this.thisType === null)
                throw Error(`this type is not determined`);
            const vftable = this.thisType.__vftable;
            if (vftable == null)
                throw Error(`${this.thisType.name}.__vftable not found`);
            const addr = this.getAddress();
            for (let offset = 0; offset < 0x1000; offset += 8) {
                if (vftable.getPointer(offset).equals(addr))
                    return [offset];
            }
            throw Error(`cannot find a function in the vftable`);
        }
        /**
         * search overloads with types
         */
        get(thisv, paramTypes, templates) {
            const thisType = thisv !== null ? this.thisType : thisv.constructor;
            const overloads = this.nf.overloads;
            if (overloads == null) {
                throw Error(`it does not have overloads`);
            }
            for (const entry of overloads) {
                if (templates != null && !checkEntryTemplates(entry, thisType, templates))
                    continue;
                if (!checkEntryWithTypes(entry, this.thisType, paramTypes))
                    continue;
                return entry;
            }
            return null;
        }
        /**
         * search overloads with templates
         */
        getByTemplates(thisType, ...args) {
            if (thisType == null)
                thisType = this.thisType;
            const overloads = this.nf.overloads;
            if (overloads == null) {
                throw Error(`it does not have overloads`);
            }
            for (const entry of overloads) {
                if (!checkEntryTemplates(entry, thisType, args))
                    continue;
                return entry;
            }
            return null;
        }
        /**
         * search overloads with values
         */
        getByValues(thisv, ...args) {
            const overloads = this.nf.overloads;
            if (overloads == null) {
                throw Error(`it does not have overloads`);
            }
            if (overloads.length === 1) {
                return overloads[0];
            }
            else {
                for (const overload of overloads) {
                    if (!checkEntryWithValues(overload, thisv, args))
                        continue;
                    return overload;
                }
            }
            return null;
        }
        /**
         * search overloads with parameter types
         */
        getByTypes(thisType, ...args) {
            const overloads = this.nf.overloads;
            if (overloads == null) {
                throw Error(`it does not have overloads`);
            }
            if (thisType == null)
                thisType = this.thisType;
            for (const overload of overloads) {
                if (!checkEntryWithTypes(overload, thisType, args))
                    continue;
                return overload;
            }
            return null;
        }
        getAddress() {
            return getAddressOf(this.nf);
        }
        getInfo() {
            return getOverloadInfo(this.nf);
        }
        getRegistersForParameters() {
            const info = this.getInfo();
            const params = info[1];
            const opts = info[3];
            const rs = [];
            const frs = [];
            let index = 0;
            if (opts !== null) {
                if (opts.this != null) {
                    rs.push(PARAM_REGISTERS[index++]);
                }
                if (opts.structureReturn) {
                    rs.push(PARAM_REGISTERS[index++]);
                }
            }
            for (const type of params) {
                if (type[makefunc_1.makefunc.useXmmRegister])
                    frs.push(PARAM_FLOAT_REGISTERS[index++]);
                else
                    rs.push(PARAM_REGISTERS[index++]);
                if (rs.length >= 4)
                    break;
            }
            return [rs, frs];
        }
        overload(func, ...paramTypes) {
            const overloads = this.nf.overloads;
            if (overloads == null) {
                throw Error(`it does not have overloads`);
            }
            func.overloadInfo = [0, paramTypes, null, null];
            func[nativeCall] = func;
            for (let i = 0; i < overloads.length; i++) {
                const overload = overloads[i];
                const info = overload.overloadInfo;
                const paramTypes2 = info[1];
                if ((0, util_1.arrayEquals)(paramTypes2, paramTypes)) {
                    overloads[i] = overload;
                    return;
                }
            }
            overloads.push(func);
        }
        /**
         * set only for JS calls
         */
        set(func) {
            this.nf[nativeCall] = func;
        }
        reform(returnType, opts, ...params) {
            const addr = this.getAddress();
            const out = makefunc_1.makefunc.js(addr, returnType, opts, ...params);
            out.overloadInfo = this.getInfo().slice();
            out.overloadInfo[1] = params;
            out.overloadInfo[2] = returnType;
            out.overloadInfo[3] = opts || null;
            return out;
        }
    }
    dnf.Tool = Tool;
    function makeOverload() {
        function nf() {
            return (nf[nativeCall] || makeOverloadNativeCall(nf)).apply(this, arguments);
        }
        return nf;
    }
    dnf.makeOverload = makeOverload;
    function getAddressOf(nf) {
        return dll_1.dll.current.add(getOverloadInfo(nf)[Prop.rva]);
    }
    dnf.getAddressOf = getAddressOf;
    function getOverloadInfo(nf) {
        const overloads = nf.overloads;
        if (overloads != null) {
            if (overloads.length === 0) {
                throw Error(`it does not have overloads`);
            }
            else if (overloads.length >= 2) {
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
    dnf.getOverloadInfo = getOverloadInfo;
    /**
     * make a deferred native function
     */
    function make() {
        function nf() {
            return (nf[nativeCall] || makeFunctionNativeCall(nf)).apply(this, arguments);
        }
        nf.isNativeFunction = true;
        return nf;
    }
    dnf.make = make;
})(dnf = exports.dnf || (exports.dnf = {}));
//# sourceMappingURL=dnf.js.map