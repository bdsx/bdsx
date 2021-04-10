import { abstract } from "bdsx/common";
import { CxxVector } from "bdsx/cxxvector";
import { makefunc } from "bdsx/makefunc";
import { mce } from "bdsx/mce";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { bool_t, CxxString, int32_t, NativeType, uint8_t, void_t } from "bdsx/nativetype";
import { proc, proc2 } from "./proc";

export enum JsonValueType
{
    Null = 0,
    Int32 = 1,
    Int64 = 2,
    Float64 = 3,
    String = 4,
    Boolean = 5,
    Array = 6,
    Object = 7,
}

@nativeClass(0x10)
export class JsonValue extends NativeClass {
    @nativeField(uint8_t, 8)
    type:JsonValueType;

    [NativeType.ctor]():void {
        this.type = JsonValueType.Null;
    }
    [NativeType.dtor]():void {
        abstract();
    }

    size():number {
        abstract();
    }

    isMember(name:string):void {
        abstract();
    }

    get(key:string|number):JsonValue {
        if (typeof key === 'number') {
            if ((key|0) === key) {
                return jsonValueGetByInt(this, key);
            }
            key = key+'';
        }
        return jsonValueGetByString(this, key);
    }

    getMemberNames():string[] {
        const members:CxxVector<CxxString> = jsonValueGetMemberNames.call(this);
        const array = members.toArray();
        members.dispose();
        return array;
    }

    value():any {
        const type = this.type;
        switch (type) {
        case JsonValueType.Null:
            return null;
        case JsonValueType.Int32:
            return this.getInt32();
        case JsonValueType.Int64:
            return this.getInt64AsFloat();
        case JsonValueType.Float64:
            return this.getFloat64();
        case JsonValueType.String: {
            const ptr = this.getNullablePointer();
            return ptr === null ? '' : ptr.getString();
        }
        case JsonValueType.Boolean:
            return this.getBoolean();
        case JsonValueType.Array: {
            const out:any[] = [];
            const n = this.size();
            for (let i=0;i<n;i++) {
                out[i] = this.get(i).value();
            }
            return out;
        }
        case JsonValueType.Object: {
            const out:Record<string, any> = {};
            for (const key of this.getMemberNames()) {
                out[key] = this.get(key).value();
            }
            return out;
        }
        default:
            throw Error(`unexpected type: ${type}`);
        }
    }

    valueOf():number {
        return +this.value();
    }

    toString():string {
        return this.value()+'';
    }
}
const jsonValueGetByInt = makefunc.js(proc2['??AValue@Json@@QEAAAEAV01@H@Z'], JsonValue, null, JsonValue, int32_t);
const jsonValueGetByString = makefunc.js(proc2['??AValue@Json@@QEAAAEAV01@PEBD@Z'], JsonValue, null, JsonValue, makefunc.Utf8);
const jsonValueGetMemberNames = makefunc.js(proc['Json::Value::getMemberNames'], CxxVector.make(CxxString), {this: JsonValue, structureReturn: true});
JsonValue.prototype.isMember = makefunc.js(proc['Json::Value::isMember'], bool_t, {this: JsonValue}, makefunc.Utf8);
JsonValue.prototype.size = makefunc.js(proc['Json::Value::size'], int32_t, {this:JsonValue});
JsonValue.prototype[NativeType.dtor] = makefunc.js(proc['Json::Value::~Value'], void_t, {this:JsonValue});


@nativeClass(null)
export class Certificate extends NativeClass {
    @nativeField(JsonValue, 0x50)
    json:JsonValue;

    getXuid():string {
        abstract();
    }
    /**
     * alias of getIdentityName
     */
    getId():string {
        return this.getIdentityName();
    }
    getIdentityName():string {
        abstract();
    }
    getIdentity():mce.UUID {
        abstract();
    }
    getIdentityString():string {
        return mce.UUID.toString(this.getIdentity());
    }
}

export class ConnectionRequest extends NativeClass {
    cert:Certificate;
    something:Certificate;

    getJson():JsonValue|null {
        const ptr = this.something;
        if (ptr === null) return null;
        return ptr.json;
    }
    getJsonValue():any {
        return this.getJson()?.value();
    }

    getDeviceId():string {
        const json = this.getJson();
        if (json === null) throw Error('Json object not found in ConnectionRequest');
        return json.get('DeviceId').toString();
    }

    getDeviceOS():number {
        const json = this.getJson();
        if (json === null) throw Error('Json object not found in ConnectionRequest');
        return +json.get('DeviceOS');
    }
}

/**
 * @deprecated typo!
 */
export const ConnectionReqeust = ConnectionRequest;
/**
 * @deprecated typo!
 */
export type ConnectionReqeust = ConnectionRequest;
