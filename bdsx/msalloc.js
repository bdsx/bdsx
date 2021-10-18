"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.msAlloc = void 0;
const proc_1 = require("./bds/proc");
const capi_1 = require("./capi");
const core_1 = require("./core");
const nativetype_1 = require("./nativetype");
const _Big_allocation_threshold = 4096;
const _Big_allocation_alignment = 32;
var msAlloc;
(function (msAlloc) {
    msAlloc.allocate = proc_1.procHacker.js('??$_Allocate@$0BA@U_Default_allocate_traits@std@@$0A@@std@@YAPEAX_K@Z', core_1.NativePointer, null, nativetype_1.uint64_as_float_t);
    function deallocate(ptr, bytes) {
        if (bytes >= _Big_allocation_threshold) {
            ptr = ptr.getPointer(-8);
        }
        capi_1.capi.free(ptr);
    }
    msAlloc.deallocate = deallocate;
})(msAlloc = exports.msAlloc || (exports.msAlloc = {}));
//# sourceMappingURL=msalloc.js.map