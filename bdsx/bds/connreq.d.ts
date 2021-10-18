import { mce } from "../mce";
import { NativeClass } from "../nativeclass";
import { NativeType } from "../nativetype";
import minecraft = require('../minecraft');
/** @deprecated */
export declare const JsonValueType: typeof minecraft.Json.ValueType;
/** @deprecated */
export declare type JsonValueType = minecraft.Json.ValueType;
/** @deprecated */
export declare class JsonValue extends NativeClass {
    static readonly symbol = "Json::Value";
    type: JsonValueType;
    [NativeType.ctor](): void;
    [NativeType.dtor](): void;
    static constructWith(value: unknown): JsonValue;
    constructWith(value: unknown): void;
    size(): number;
    isMember(name: string): void;
    get(key: string | number): JsonValue;
    getMemberNames(): string[];
    setValue(value: unknown): void;
    value(): any;
    toString(): string;
}
export declare class Certificate extends NativeClass {
    json: JsonValue;
    getXuid(): string;
    /**
     * @alias getIdentityName
     */
    getId(): string;
    getIdentityName(): string;
    getIdentity(): mce.UUID;
    getIdentityString(): string;
}
export declare class ConnectionRequest extends NativeClass {
    cert: Certificate;
    something: Certificate;
    getJson(): JsonValue | null;
    getJsonValue(): {
        AnimatedImageData: {
            AnimationExpression: number;
            Frames: number;
            Image: string;
            ImageHeight: number;
            ImageWidth: number;
            Type: number;
        }[];
        ArmSize: string;
        CapeData: string;
        CapeId: string;
        CapeImageHeight: number;
        CapeImageWidth: number;
        CapeOnClassicSkin: boolean;
        ClientRandomId: number;
        CurrentInputMode: number;
        DefaultInputMode: number;
        DeviceId: string;
        DeviceModel: string;
        DeviceOS: number;
        GameVersion: string;
        GuiScale: number;
        LanguageCode: string;
        PersonaPieces: {
            IsDefault: boolean;
            PackId: string;
            PieceId: string;
            PieceType: string;
            ProductId: string;
        }[];
        PersonaSkin: boolean;
        PieceTintColors: {
            Colors: [string, string, string, string];
            PieceType: string;
        }[];
        PlatformOfflineId: string;
        PlatformOnlineId: string;
        PlayFabId: string;
        PremiumSkin: boolean;
        SelfSignedId: string;
        ServerAddress: string;
        SkinAnimationData: string;
        SkinColor: string;
        SkinData: string;
        SkinGeometryData: string;
        SkinId: string;
        SkinImageHeight: number;
        SkinImageWidth: number;
        SkinResourcePatch: string;
        ThirdPartyName: string;
        ThirdPartyNameOnly: boolean;
        UIProfile: number;
    } | null;
    getDeviceId(): string;
    getDeviceOS(): number;
}
