import { abstract } from "bdsx/common";
import { VoidPointer } from "bdsx/core";
import { CxxVector } from "bdsx/cxxvector";
import { makefunc, RawTypeId } from "bdsx/makefunc";
import { mce } from "bdsx/mce";
import { NativeClass } from "bdsx/nativeclass";
import { CxxString, NativeType, uint8_t } from "bdsx/nativetype";
import { proc, proc2 } from "./proc";

export class Certificate extends NativeClass {
    getXuid():string {
        abstract();
    }
    getId():string {
        abstract();
    }
    getIdentity():mce.UUID {
        abstract();
    }
    getTitleId():number {
        abstract();
    }
    getIdentityString():string {
        return mce.UUID.toString(this.getIdentity());
    }
}

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

export class JsonValue extends NativeClass {
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
    
    toString():string {
        return this.value()+'';
    }
}
JsonValue.abstract({
    type: [uint8_t, 8],
}, 0x10);
const jsonValueGetByInt = makefunc.js(proc2['??AValue@Json@@QEAAAEAV01@H@Z'], JsonValue, null, JsonValue, RawTypeId.Int32);
const jsonValueGetByString = makefunc.js(proc2['??AValue@Json@@QEAAAEAV01@PEBD@Z'], JsonValue, null, JsonValue, RawTypeId.StringUtf8);
const jsonValueGetMemberNames = makefunc.js(proc['Json::Value::getMemberNames'], CxxVector.make(CxxString), {this: JsonValue, structureReturn: true});
JsonValue.prototype.isMember = makefunc.js(proc['Json::Value::isMember'], RawTypeId.Boolean, {this: JsonValue}, RawTypeId.StringUtf8);
JsonValue.prototype.size = makefunc.js(proc['Json::Value::size'], RawTypeId.Int32, {this:JsonValue});
JsonValue.prototype[NativeType.dtor] = makefunc.js(proc['Json::Value::~Value'], RawTypeId.Void, {this:JsonValue});

export class ConnectionRequest extends NativeClass {
    u1:VoidPointer;
    cert:Certificate;

    getJson():JsonValue|null {
        if (this.cert === null) return null;
        const ptr = this.getNullablePointer(0x10);
        if (ptr === null) return null;
        return ptr.addAs(JsonValue, 0x50);
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