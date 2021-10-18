"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumType = exports.NativeVarArgs = exports.MemberPointer = exports.NativeFunctionType = exports.NativeTemplateClass = void 0;
const core_1 = require("./core");
const makefunc_1 = require("./makefunc");
const nativeclass_1 = require("./nativeclass");
const nativetype_1 = require("./nativetype");
const singleton_1 = require("./singleton");
class NativeTemplateClass extends nativeclass_1.NativeClass {
    static make(...items) {
        class SpecializedTemplateClass extends this {
        }
        SpecializedTemplateClass.templates = items;
        Object.defineProperty(SpecializedTemplateClass, 'name', { value: `${this.name}<${items.map(item => item.name || item.toString()).join(',')}>` });
        return SpecializedTemplateClass;
    }
}
exports.NativeTemplateClass = NativeTemplateClass;
NativeTemplateClass.templates = [];
let warned = false;
function warn() {
    if (warned)
        return;
    warned = true;
    console.log(`NativeFunctionType has potential for memory leaks.`);
}
class NativeFunctionType extends nativetype_1.NativeType {
    static make(returnType, opts, ...params) {
        const makefunc_np = Symbol();
        function getNp(func) {
            const ptr = func[makefunc_np];
            if (ptr != null)
                return ptr;
            warn();
            console.log(`a function(${ptr}) is allocated.`);
            return func[makefunc_np] = makefunc_1.makefunc.np(func, returnType, opts, ...params);
        }
        function getJs(ptr) {
            return makefunc_1.makefunc.js(ptr, returnType, opts, ...params);
        }
        return new NativeFunctionType(`${returnType.name} (__cdecl*)(${params.map(param => param.name).join(',')})`, 8, 8, v => v instanceof Function, undefined, (ptr, offset) => getJs(ptr.add(offset, offset >> 31)), (ptr, value, offset) => {
            const nativeproc = getNp(value);
            ptr.setPointer(nativeproc, offset);
            return nativeproc;
        }, (stackptr, offset) => getJs(stackptr.getPointer(offset)), (stackptr, param, offset) => stackptr.setPointer(getNp(param), offset));
    }
}
exports.NativeFunctionType = NativeFunctionType;
class MemberPointer extends core_1.VoidPointer {
    static make(base, type) {
        class MemberPointerImpl extends MemberPointer {
        }
        MemberPointerImpl.prototype.base = base;
        MemberPointerImpl.prototype.type = type;
        return MemberPointerImpl;
    }
}
exports.MemberPointer = MemberPointer;
exports.NativeVarArgs = new nativetype_1.NativeType('...', 0, 0, () => { throw Error('Unexpected usage'); }, () => { throw Error('Unexpected usage'); }, () => { throw Error('Unexpected usage'); }, () => { throw Error('Not implemented'); }, () => { throw Error('Not implemented'); }, () => { throw Error('Unexpected usage'); }, () => { throw Error('Unexpected usage'); }, () => { throw Error('Unexpected usage'); }, () => { throw Error('Unexpected usage'); });
class EnumType extends nativetype_1.NativeType {
    constructor() {
        super(nativetype_1.int32_t.name, nativetype_1.int32_t[nativetype_1.NativeType.size], nativetype_1.int32_t[nativetype_1.NativeType.align], nativetype_1.int32_t.isTypeOf, nativetype_1.int32_t.isTypeOfWeak, nativetype_1.int32_t[nativetype_1.NativeType.getter], nativetype_1.int32_t[nativetype_1.NativeType.setter], nativetype_1.int32_t[makefunc_1.makefunc.getFromParam], nativetype_1.int32_t[makefunc_1.makefunc.setToParam]);
    }
    static make(enumtype) {
        return singleton_1.Singleton.newInstance(EnumType, enumtype, () => new EnumType());
    }
}
exports.EnumType = EnumType;
//# sourceMappingURL=complextype.js.map