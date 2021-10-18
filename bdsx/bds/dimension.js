"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dimension = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const core_1 = require("../core");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const block_1 = require("./block");
const proc_1 = require("./proc");
/** @deprecated */
let Dimension = class Dimension extends nativeclass_1.NativeClass {
    /** @deprecated Use getBlockSource() instead */
    get blockSource() {
        return this.getBlockSource();
    }
    getBlockSource() {
        (0, common_1.abstract)();
    }
    getDimensionId() {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], Dimension.prototype, "vftable", void 0);
Dimension = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], Dimension);
exports.Dimension = Dimension;
Dimension.prototype.getBlockSource = proc_1.procHacker.js('Dimension::getBlockSourceDEPRECATEDUSEPLAYERREGIONINSTEAD', block_1.BlockSource, { this: Dimension });
Dimension.prototype.getDimensionId = proc_1.procHacker.js('Dimension::getDimensionId', nativetype_1.int32_t, { this: Dimension, structureReturn: true });
//# sourceMappingURL=dimension.js.map