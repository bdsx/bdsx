"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.type_id = exports.HasTypeId = exports.typeid_t = void 0;
const core_1 = require("../core");
const dbghelp_1 = require("../dbghelp");
const makefunc_1 = require("../makefunc");
const nativeclass_1 = require("../nativeclass");
const templatename_1 = require("../templatename");
const minecraft = require("../minecraft");
/** @deprecated */
exports.typeid_t = minecraft.typeid_t;
/**
 * dummy class for typeid
 */
class HasTypeId extends nativeclass_1.NativeClass {
}
exports.HasTypeId = HasTypeId;
_a = typeidmap;
HasTypeId[_a] = new WeakMap();
/** @deprecated */
function type_id(base, type) {
    const map = base[typeidmap];
    const typeid = map.get(type);
    if (typeid instanceof exports.typeid_t) {
        return typeid;
    }
    const counter = base[counterWrapper];
    if (counter.value === 0)
        throw Error('Cannot make type_id before launch');
    if (typeid != null) {
        const newid = makefunc_1.makefunc.js(typeid, exports.typeid_t, { structureReturn: true })();
        map.set(type, newid);
        return newid;
    }
    else {
        const newid = new exports.typeid_t(true);
        newid.id = counter.value++;
        map.set(type, newid);
        return newid;
    }
}
exports.type_id = type_id;
/** @deprecated */
(function (type_id) {
    /** @deprecated */
    function pdbimport(base, types) {
        const baseSymbol = base.symbol || base.name;
        const symbols = types.map(v => (0, templatename_1.templateName)('type_id', baseSymbol, v.symbol || v.name));
        const counter = (0, templatename_1.templateName)('typeid_t', baseSymbol) + '::count';
        symbols.push(counter);
        const addrs = core_1.pdb.getList(core_1.pdb.coreCachePath, {}, symbols, false, dbghelp_1.UNDNAME_NAME_ONLY);
        symbols.pop();
        base[counterWrapper] = addrs[counter].as(IdCounter);
        const map = base[typeidmap];
        for (let i = 0; i < symbols.length; i++) {
            const addr = addrs[symbols[i]];
            if (addr == null)
                continue;
            map.set(types[i], addr);
        }
    }
    type_id.pdbimport = pdbimport;
})(type_id = exports.type_id || (exports.type_id = {}));
//# sourceMappingURL=typeid.js.map