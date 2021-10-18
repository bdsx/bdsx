import { mce } from "../mce";
import { NativeClass } from "../nativeclass";
import { bool_t, CxxString } from "../nativetype";
import { JsonValue } from "./connreq";
/** Mojang you serious? */
export declare enum TrustedSkinFlag {
    Unset = 0,
    False = 1,
    True = 2
}
export declare class SerializedSkin extends NativeClass {
    skinId: CxxString;
    playFabId: CxxString;
    resourcePatch: CxxString;
    geometryName: CxxString;
    defaultGeometryName: CxxString;
    skinImage: mce.Image;
    capeImage: mce.Image;
    geometryData: JsonValue;
    geometryDataMutable: JsonValue | null;
    animationData: CxxString;
    capeId: CxxString;
    isPremium: bool_t;
    isPersona: bool_t;
    isCapeOnClassicSkin: bool_t;
    armSize: CxxString;
    isTrustedSkin: TrustedSkinFlag;
}
