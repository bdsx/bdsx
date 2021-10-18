"use strict";
var JsonValue_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionRequest = exports.Certificate = exports.JsonValue = exports.JsonValueType = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const cxxvector_1 = require("../cxxvector");
const makefunc_1 = require("../makefunc");
const mce_1 = require("../mce");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const proc_1 = require("./proc");
const minecraft = require("../minecraft");
/** @deprecated */
exports.JsonValueType = minecraft.Json.ValueType;
/** @deprecated */
let JsonValue = JsonValue_1 = class JsonValue extends nativeclass_1.NativeClass {
    [nativetype_1.NativeType.ctor]() {
        this.type = exports.JsonValueType.Null;
    }
    [nativetype_1.NativeType.dtor]() {
        (0, common_1.abstract)();
    }
    static constructWith(value) {
        const json = new JsonValue_1(true);
        json.constructWith(value);
        return json;
    }
    constructWith(value) {
        switch (typeof value) {
            case 'boolean':
                this.type = exports.JsonValueType.Boolean;
                this.setBoolean(value);
                break;
            case 'number':
                if ((value | 0) === value) {
                    this.type = exports.JsonValueType.Int32;
                    this.setInt32(value);
                }
                else {
                    this.type = exports.JsonValueType.Float64;
                    this.setFloat64(value);
                }
                break;
            case 'object':
                if (value === null) {
                    this.type = exports.JsonValueType.Null;
                }
                else {
                    jsonValueCtorWithType(this, exports.JsonValueType.Object);
                    for (const key in value) {
                        if (!Object.prototype.hasOwnProperty.call(value, key))
                            continue;
                        const child = jsonValueResolveReference(this, key, false);
                        child.setValue(value[key]);
                    }
                }
                break;
            case 'string':
                jsonValueCtorWithString(this, value);
                break;
            default:
                throw TypeError(`unexpected json type: ${typeof value}`);
        }
    }
    size() {
        (0, common_1.abstract)();
    }
    isMember(name) {
        (0, common_1.abstract)();
    }
    get(key) {
        if (typeof key === 'number') {
            if ((key | 0) === key) {
                return jsonValueGetByInt(this, key);
            }
            key = key + '';
        }
        return jsonValueGetByString(this, key);
    }
    getMemberNames() {
        const members = jsonValueGetMemberNames.call(this);
        const array = members.toArray();
        members.destruct();
        return array;
    }
    setValue(value) {
        this.destruct();
        this.constructWith(value);
    }
    value() {
        const type = this.type;
        switch (type) {
            case exports.JsonValueType.Null:
                return null;
            case exports.JsonValueType.Int32:
                return this.getInt32();
            case exports.JsonValueType.Int64:
                return this.getInt64AsFloat();
            case exports.JsonValueType.Float64:
                return this.getFloat64();
            case exports.JsonValueType.String: {
                const ptr = this.getNullablePointer();
                return ptr === null ? '' : ptr.getString();
            }
            case exports.JsonValueType.Boolean:
                return this.getBoolean();
            case exports.JsonValueType.Array: {
                const out = [];
                const n = this.size();
                for (let i = 0; i < n; i++) {
                    out[i] = this.get(i).value();
                }
                return out;
            }
            case exports.JsonValueType.Object: {
                const out = {};
                for (const key of this.getMemberNames()) {
                    out[key] = this.get(key).value();
                }
                return out;
            }
            default:
                throw Error(`unexpected type: ${type}`);
        }
    }
    toString() {
        return this.value() + '';
    }
};
JsonValue.symbol = 'Json::Value';
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t, 8)
], JsonValue.prototype, "type", void 0);
JsonValue = JsonValue_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x10)
], JsonValue);
exports.JsonValue = JsonValue;
const jsonValueCtorWithType = makefunc_1.makefunc.js(proc_1.proc2['??0Value@Json@@QEAA@W4ValueType@1@@Z'], JsonValue, null, JsonValue, nativetype_1.int32_t);
const jsonValueCtorWithString = makefunc_1.makefunc.js(proc_1.proc2['??0Value@Json@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z'], JsonValue, null, JsonValue, nativetype_1.CxxString);
const jsonValueGetByInt = makefunc_1.makefunc.js(proc_1.proc2['??AValue@Json@@QEAAAEAV01@H@Z'], JsonValue, null, JsonValue, nativetype_1.int32_t);
const jsonValueGetByString = makefunc_1.makefunc.js(proc_1.proc2['??AValue@Json@@QEAAAEAV01@PEBD@Z'], JsonValue, null, JsonValue, makefunc_1.makefunc.Utf8);
const jsonValueGetMemberNames = makefunc_1.makefunc.js(proc_1.proc['Json::Value::getMemberNames'], cxxvector_1.CxxVector.make(nativetype_1.CxxString), { this: JsonValue, structureReturn: true });
const jsonValueResolveReference = makefunc_1.makefunc.js(proc_1.proc['Json::Value::resolveReference'], JsonValue, null, JsonValue, makefunc_1.makefunc.Utf8, nativetype_1.bool_t);
JsonValue.prototype.isMember = makefunc_1.makefunc.js(proc_1.proc['Json::Value::isMember'], nativetype_1.bool_t, { this: JsonValue }, makefunc_1.makefunc.Utf8);
JsonValue.prototype.size = makefunc_1.makefunc.js(proc_1.proc['Json::Value::size'], nativetype_1.int32_t, { this: JsonValue });
JsonValue.prototype[nativetype_1.NativeType.dtor] = makefunc_1.makefunc.js(proc_1.proc['Json::Value::~Value'], nativetype_1.void_t, { this: JsonValue });
let Certificate = class Certificate extends nativeclass_1.NativeClass {
    getXuid() {
        (0, common_1.abstract)();
    }
    /**
     * @alias getIdentityName
     */
    getId() {
        return this.getIdentityName();
    }
    getIdentityName() {
        (0, common_1.abstract)();
    }
    getIdentity() {
        (0, common_1.abstract)();
    }
    getIdentityString() {
        return mce_1.mce.UUID.toString(this.getIdentity());
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(JsonValue, 0x50)
], Certificate.prototype, "json", void 0);
Certificate = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], Certificate);
exports.Certificate = Certificate;
class ConnectionRequest extends nativeclass_1.NativeClass {
    getJson() {
        const ptr = this.something;
        if (ptr === null)
            return null;
        return ptr.json;
    }
    getJsonValue() {
        var _a;
        return (_a = this.getJson()) === null || _a === void 0 ? void 0 : _a.value();
    }
    getDeviceId() {
        const json = this.getJson();
        if (json === null)
            throw Error('Json object not found in ConnectionRequest');
        return json.get('DeviceId').toString();
    }
    getDeviceOS() {
        const json = this.getJson();
        if (json === null)
            throw Error('Json object not found in ConnectionRequest');
        return +json.get('DeviceOS');
    }
}
exports.ConnectionRequest = ConnectionRequest;
//# sourceMappingURL=connreq.js.map