import { CommandParameterType } from "../commandparam";
import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { makefunc } from "../makefunc";
import { mce } from "../mce";
import { AbstractClass, nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, int32_t, NativeType, uint8_t, void_t } from "../nativetype";
import { proc } from "./symbols";

export enum JsonValueType {
    Null = 0,
    Int32 = 1,
    Int64 = 2,
    Float64 = 3,
    String = 4,
    Boolean = 5,
    Array = 6,
    Object = 7,
}

@nativeClass({size: 0x10, align: 0x8, symbol: 'VValue@Json@@'})
export class JsonValue extends NativeClass {
    static readonly [CommandParameterType.symbol]:true;

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
                Json$Value$CtorWithType(this, JsonValueType.Object);
                for (const [key, kv] of Object.entries(value)) {
                    const child = Json$Value$ResolveReference(this, key, false);
                    child.setValue(kv);
                }
            }
            break;
        case 'string':
            Json$Value$CtorWithString(this, value);
            break;
        default:
            throw TypeError(`unexpected json type: ${typeof value}`);
        }
    }

    size():number {
        abstract();
    }

    isMember(name:string):boolean {
        abstract();
    }

    getByInt(key:number):JsonValue {
        return Json$Value$GetByInt(this, key);
    }
    getByString(key:string):JsonValue {
        return Json$Value$GetByString(this, key);
    }

    get(key:string|number):JsonValue {
        if (typeof key === 'number') {
            if ((key|0) === key) {
                return Json$Value$GetByInt(this, key);
            }
            key = key+'';
        }
        return Json$Value$GetByString(this, key);
    }

    getMemberNames():string[] {
        const members:CxxVector<CxxString> = Json$Value$GetMemberNames.call(this);
        const array = members.toArray();
        members.destruct();
        return array;
    }

    setValue(value:unknown):void {
        this.destruct();
        this.constructWith(value);
    }

    proxy():any {
        switch (this.type) {
        case JsonValueType.Array: {
            const self = this;
            const base:Record<string|symbol, any> = {};
            return new Proxy(base, {
                get(target, prop){
                    if (typeof prop === 'symbol' || !/^\d+$/.test(prop)) {
                        return base[prop];
                    } else {
                        const idx = +prop|0;
                        if (idx < 0 || idx >= self.size()) return undefined;
                        let v = base[idx];
                        if (!(v instanceof JsonValue)) {
                            v = self.getByInt(+prop|0);
                            base[prop] = v;
                        }
                        return v.proxy();
                    }
                },
                set(base, prop, value){
                    if (typeof prop === 'symbol' || !/^\d+$/.test(prop)) {
                        base[prop] = value;
                    } else {
                        let v = base[prop];
                        if (!(v instanceof JsonValue)) {
                            v = self.getByInt(+prop|0);
                            base[prop] = v;
                        }
                        v.setValue(value);
                    }
                    return true;
                },
            });
        }
        case JsonValueType.Object: {
            const self = this;
            const base:Record<string|symbol, any> = {};
            return new Proxy(base, {
                get(base, prop){
                    if (typeof prop === 'symbol') {
                        return base[prop];
                    } else {
                        if (!self.isMember(prop)) return undefined;
                        let v = base[prop];
                        if (!(v instanceof JsonValue)) {
                            v = self.getByString(prop);
                            base[prop] = v;
                        }
                        return v.proxy();
                    }
                },
                set(base, prop, value){
                    if (typeof prop === 'symbol') {
                        base[prop] = value;
                    } else {
                        let v = base[prop];
                        if (!(v instanceof JsonValue)) {
                            v = self.getByString(prop);
                            base[prop] = v;
                        }
                        v.setValue(value);
                    }
                    return true;
                },
            });
        }
        default:
            return this.value();
        }
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

const Json$Value$CtorWithType = makefunc.js(proc['??0Value@Json@@QEAA@W4ValueType@1@@Z'], JsonValue, null, JsonValue, int32_t);
const Json$Value$CtorWithString = makefunc.js(proc['??0Value@Json@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z'], JsonValue, null, JsonValue, CxxString);
const Json$Value$GetByInt = makefunc.js(proc['??AValue@Json@@QEAAAEAV01@H@Z'], JsonValue, null, JsonValue, int32_t);
const Json$Value$GetByString = makefunc.js(proc['??AValue@Json@@QEAAAEAV01@PEBD@Z'], JsonValue, null, JsonValue, makefunc.Utf8);
const Json$Value$GetMemberNames = makefunc.js(proc['?getMemberNames@Value@Json@@QEBA?AV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@std@@XZ'], CxxVector.make(CxxString), {this: JsonValue, structureReturn: true});
const Json$Value$ResolveReference = makefunc.js(proc['?resolveReference@Value@Json@@AEAAAEAV12@PEBD_N@Z'], JsonValue, null, JsonValue, makefunc.Utf8, bool_t);
JsonValue.prototype.isMember = makefunc.js(proc['?isMember@Value@Json@@QEBA_NAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z'], bool_t, {this: JsonValue}, CxxString);
JsonValue.prototype.size = makefunc.js(proc['?size@Value@Json@@QEBAIXZ'], int32_t, {this:JsonValue});
JsonValue.prototype[NativeType.dtor] = makefunc.js(proc['??1Value@Json@@QEAA@XZ'], void_t, {this:JsonValue});

@nativeClass(null)
export class Certificate extends AbstractClass {
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

@nativeClass(null)
export class ConnectionRequest extends AbstractClass {
    /** @deprecated use getCertificate() */
    get cert():Certificate {
        return this.getCertificate();
    }
    @nativeField(Certificate.ref(), 0x10)
    something:Certificate;

    /**
     * it's possible to return null if before packet processing
     */
    getCertificate():Certificate {
        abstract();
    }

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
