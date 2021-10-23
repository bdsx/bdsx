"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualFunctionTable = void 0;
const core_1 = require("./core");
const dnf_1 = require("./dnf");
class VirtualFunctionTable extends core_1.StaticPointer {
    getOffsetOf(func) {
        const addr = dnf_1.dnf.getAddressOf(func);
        for (let offset = 0; offset < 0x1000; offset += 8) {
            if (this.getPointer(0).equals(addr))
                return [offset];
        }
        throw Error(`cannot find a function in the vftable`);
    }
}
exports.VirtualFunctionTable = VirtualFunctionTable;
//# sourceMappingURL=vftable.js.map