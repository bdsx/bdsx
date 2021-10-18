"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValue = void 0;
const common_1 = require("./common");
const makefunc_1 = require("./makefunc");
const ready_1 = require("./minecraft_impl/ready");
const nativetype_1 = require("./nativetype");
exports.JsonValue = new nativetype_1.NativeType('Json::Value', 16, 8, () => true, undefined, common_1.abstract, common_1.abstract);
ready_1.minecraftTsReady.promise.then(() => {
    const { Json } = require('./minecraft');
    exports.JsonValue[nativetype_1.NativeType.getter] = (ptr, offset) => {
        const jsoninst = ptr.getPointerAs(Json.Value, offset);
        return jsoninst.getValue();
    };
    exports.JsonValue[nativetype_1.NativeType.setter] = (ptr, value, offset) => {
        const v = Json.Value.constructWith(value);
        makefunc_1.makefunc.temporalDtors.push(() => { v.destruct(); });
        ptr.setPointer(v, offset);
    };
});
//# sourceMappingURL=jsonvalue.js.map