"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const complextype_1 = require("../complextype");
const dnf_1 = require("../dnf");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.Json.Value.define({}, 0x10, 0x8);
minecraft_1.Json.Value.constructWith = function (value) {
    const json = new minecraft_1.Json.Value(true);
    json.constructWith(value);
    return json;
};
minecraft_1.Json.Value.prototype[nativetype_1.NativeType.ctor] = function () {
    const ptr = this;
    ptr.setUint8(minecraft_1.Json.ValueType.Null, 8);
};
(0, dnf_1.dnf)(minecraft_1.Json.Value, 'constructWith').overwrite(function (value) {
    const ptr = this;
    switch (typeof value) {
        case 'boolean':
            ptr.setUint8(minecraft_1.Json.ValueType.Boolean, 8);
            ptr.setBoolean(value);
            break;
        case 'number':
            if ((value | 0) === value) {
                ptr.setUint8(minecraft_1.Json.ValueType.Int32, 8);
                ptr.setInt32(value);
            }
            else {
                ptr.setUint8(minecraft_1.Json.ValueType.Float64, 8);
                ptr.setFloat64(value);
            }
            break;
        case 'object':
            if (value === null) {
                ptr.setUint8(minecraft_1.Json.ValueType.Null, 8);
            }
            else {
                jsonValueCtorWithType.call(this, minecraft_1.Json.ValueType.Object);
                for (const key in value) {
                    if (!Object.prototype.hasOwnProperty.call(value, key))
                        continue;
                    const child = jsonValueResolveReference(this, key, false);
                    child.setValue(value[key]);
                }
            }
            break;
        case 'string':
            jsonValueCtorWithString.call(this, value);
            break;
        default:
            throw TypeError(`unexpected json type: ${typeof value}`);
    }
});
minecraft_1.Json.Value.prototype.get = function (key) {
    if (typeof key === 'number') {
        if ((key | 0) === key) {
            return jsonValueGetByInt.call(this, key);
        }
        key = key + '';
    }
    return jsonValueGetByString.call(this, key);
};
minecraft_1.Json.Value.prototype.getValue = function () {
    const ptr = this;
    const type = this.type();
    switch (type) {
        case minecraft_1.Json.ValueType.Null:
            return null;
        case minecraft_1.Json.ValueType.Int32:
            return ptr.getInt32();
        case minecraft_1.Json.ValueType.Int64:
            return ptr.getInt64AsFloat();
        case minecraft_1.Json.ValueType.Float64:
            return ptr.getFloat64();
        case minecraft_1.Json.ValueType.String: {
            const ptrv = ptr.getNullablePointer();
            return ptrv === null ? '' : ptrv.getString();
        }
        case minecraft_1.Json.ValueType.Boolean:
            return ptr.getBoolean();
        case minecraft_1.Json.ValueType.Array: {
            const out = [];
            const n = this.size();
            for (let i = 0; i < n; i++) {
                out[i] = this.get(i).getValue();
            }
            return out;
        }
        case minecraft_1.Json.ValueType.Object: {
            const out = {};
            for (const key of this.getMemberNames()) {
                out[key] = this.get(key).getValue();
            }
            return out;
        }
        default:
            throw Error(`unexpected type: ${type}`);
    }
};
minecraft_1.Json.Value.prototype.setValue = function (value) {
    this.destruct();
    this.constructWith(value);
};
minecraft_1.Json.Value.prototype.toString = function () {
    return this.getValue() + '';
};
minecraft_1.Json.Value.prototype.toJSON = function () {
    return this.getValue();
};
const jsonValueCtorWithType = (0, dnf_1.dnf)(minecraft_1.Json.Value, 'constructWith').getByTypes(null, complextype_1.EnumType.make(minecraft_1.Json.ValueType));
const jsonValueCtorWithString = (0, dnf_1.dnf)(minecraft_1.Json.Value, 'constructWith').getByTypes(null, nativetype_1.CxxString);
const jsonValueGetByInt = (0, dnf_1.dnf)(minecraft_1.Json.Value, 'operator_index').getByTypes(null, nativetype_1.int32_t);
const jsonValueGetByString = (0, dnf_1.dnf)(minecraft_1.Json.Value, 'operator_index').getByTypes(null, nativetype_1.StringUtf8);
const jsonValueResolveReference = (0, dnf_1.dnf)(minecraft_1.Json.Value, 'resolveReference').reform(minecraft_1.Json.Value, null, minecraft_1.Json.Value, nativetype_1.CxxString, nativetype_1.bool_t);
//# sourceMappingURL=json.js.map