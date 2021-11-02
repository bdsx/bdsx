"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.type_id = exports.HasTypeId = exports.typeid_t = void 0;
const typeid_1 = require("../typeid");
const minecraft = require("../minecraft");
/** @deprecated */
exports.typeid_t = minecraft.typeid_t;
/** @deprecated */
exports.HasTypeId = typeid_1.TypeIdCounter;
/** @deprecated */
function type_id(base, type) {
    return base.makeId(type);
}
exports.type_id = type_id;
/** @deprecated */
(function (type_id) {
    /** @deprecated it does nothing */
    function pdbimport(base, types) {
        // does nothing
    }
    type_id.pdbimport = pdbimport;
})(type_id = exports.type_id || (exports.type_id = {}));
//# sourceMappingURL=typeid.js.map