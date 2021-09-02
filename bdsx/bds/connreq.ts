import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { makefunc } from "../makefunc";
import { mce } from "../mce";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, int32_t, NativeType, uint8_t, void_t } from "../nativetype";
import { proc, proc2 } from "./proc";
import minecraft = require('../minecraft');

/** @deprecated */
export const JsonValueType = minecraft.Json.ValueType;
/** @deprecated */
export type JsonValueType = minecraft.Json.ValueType;

@nativeClass(0x10)
export class JsonValue extends NativeClass {
    static readonly symbol = 'Json::Value';

    @nativeField(uint8_t, 8)
    type:JsonValueType;

    [NativeType.ctor]():void {
        this.type = JsonValueType.Null;
    }
    [NativeType.dtor]():void {
        abstract();
    }

    static constructWith(value:unknown):JsonValue {
        const json = new JsonValue(true);
        json.constructWith(value);
        return json;
    }

    constructWith(value:unknown):void {
        switch (typeof value) {
        case 'boolean':
            this.type = JsonValueType.Boolean;
            this.setBoolean(value);
            break;
        case 'number':
            if ((value|0) === value) {
                this.type = JsonValueType.Int32;
                this.setInt32(value);
            } else {
                this.type = JsonValueType.Float64;
                this.setFloat64(value);
            }
            break;
        case 'object':
            if (value === null) {
                this.type = JsonValueType.Null;
            } else {
                jsonValueCtorWithType(this, JsonValueType.Object);
                for (const key in value) {
                    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
                    const child = jsonValueResolveReference(this, key, false);
                    child.setValue((value as any)[key]);
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
        members.destruct();
        return array;
    }

    setValue(value:unknown):void {
        this.destruct();
        this.constructWith(value);
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
const jsonValueCtorWithType = makefunc.js(proc2['??0Value@Json@@QEAA@W4ValueType@1@@Z'], JsonValue, null, JsonValue, int32_t);
const jsonValueCtorWithString = makefunc.js(proc2['??0Value@Json@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z'], JsonValue, null, JsonValue, CxxString);
const jsonValueGetByInt = makefunc.js(proc2['??AValue@Json@@QEAAAEAV01@H@Z'], JsonValue, null, JsonValue, int32_t);
const jsonValueGetByString = makefunc.js(proc2['??AValue@Json@@QEAAAEAV01@PEBD@Z'], JsonValue, null, JsonValue, makefunc.Utf8);
const jsonValueGetMemberNames = makefunc.js(proc['Json::Value::getMemberNames'], CxxVector.make(CxxString), {this: JsonValue, structureReturn: true});
const jsonValueResolveReference = makefunc.js(proc['Json::Value::resolveReference'], JsonValue, null, JsonValue, makefunc.Utf8, bool_t);
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
     * @alias getIdentityName
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
    getJsonValue():{
        AnimatedImageData:{AnimationExpression:number, Frames:number, Image:string, ImageHeight:number, ImageWidth:number, Type:number}[],
        ArmSize:string,
        CapeData:string,
        CapeId:string,
        CapeImageHeight:number,
        CapeImageWidth:number,
        CapeOnClassicSkin:boolean,
        ClientRandomId:number,
        CurrentInputMode:number,
        DefaultInputMode:number,
        DeviceId:string,
        DeviceModel:string,
        DeviceOS:number,
        GameVersion:string,
        GuiScale:number,
        LanguageCode:string,
        PersonaPieces:{IsDefault:boolean, PackId:string, PieceId:string, PieceType:string, ProductId:string}[],
        PersonaSkin:boolean,
        PieceTintColors:{Colors:[string, string, string, string], PieceType:string}[],
        PlatformOfflineId:string,
        PlatformOnlineId:string,
        PlayFabId:string,
        PremiumSkin:boolean,
        SelfSignedId:string,
        ServerAddress:string,
        SkinAnimationData:string,
        SkinColor:string,
        SkinData:string,
        SkinGeometryData:string,
        SkinId:string,
        SkinImageHeight:number,
        SkinImageWidth:number,
        SkinResourcePatch:string,
        ThirdPartyName:string,
        ThirdPartyNameOnly:boolean,
        UIProfile:number }|null {
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
