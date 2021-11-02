"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proc2 = exports.proc = void 0;
const core_1 = require("../core");
const dbghelp_1 = require("../dbghelp");
const colors = require("colors");
let deprecateWarned = false;
function warn() {
    if (!deprecateWarned) {
        debugger;
        deprecateWarned = true;
        console.error(colors.yellow("proc/proc2 is deprecated. use items in 'bdsx/minecraft'."));
    }
}
/** @deprecated use using items in 'bdsx/minecraft'*/
exports.proc = new Proxy({}, {
    get(obj, symbol) {
        warn();
        if (typeof symbol === 'symbol')
            return obj[symbol];
        const values = core_1.pdb.getList(core_1.pdb.coreCachePath, {}, [symbol], false, dbghelp_1.UNDNAME_NAME_ONLY);
        return values[symbol];
    },
});
/** @deprecated use items in 'bdsx/minecraft'*/
exports.proc2 = new Proxy({}, {
    get(obj, symbol) {
        warn();
        if (typeof symbol === 'symbol')
            return obj[symbol];
        const values = core_1.pdb.getList(core_1.pdb.coreCachePath, {}, [symbol]);
        return values[symbol];
    },
});
//# sourceMappingURL=symbols.js.map