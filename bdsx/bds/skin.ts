import { mce } from "../mce";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, int8_t } from "../nativetype";
import { JsonValue } from "./connreq";

/** Mojang you serious? */
export enum TrustedSkinFlag {
    Unset,
    False,
    True,
}

@nativeClass(null)
export class SerializedSkin extends NativeClass {
    @nativeField(CxxString)
    skinId:CxxString;
    @nativeField(CxxString)
    playFabId:CxxString;
    @nativeField(CxxString)
    resourcePatch:CxxString;
    @nativeField(CxxString)
    geometryName:CxxString;
    @nativeField(CxxString)
    defaultGeometryName:CxxString;
    @nativeField(mce.Image)
    skinImage:mce.Image;
    @nativeField(mce.Image, 0xC8)
    capeImage:mce.Image;
    // @nativeField(CxxVector.make(AnimatedImageData), 0xF0)
    // animatedImages:CxxVector<AnimatedImageData>;
    @nativeField(JsonValue, 0x108)
    geometryData:JsonValue;
    @nativeField(JsonValue)
    geometryDataMutable:JsonValue|null;
    @nativeField(CxxString)
    animationData:CxxString;
    @nativeField(CxxString)
    capeId:CxxString;
    @nativeField(bool_t)
    isPremium:bool_t;
    @nativeField(bool_t)
    isPersona:bool_t;
    @nativeField(bool_t)
    isCapeOnClassicSkin:bool_t;
    // @nativeField(CxxVector.make(SerializedPersonaPieceHandle), 0x171)
    // personaPieces:CxxVector<SerializedPersonaPieceHandle>;
    @nativeField(CxxString, 0x188)
    armSize:CxxString;
    // @nativeField(CxxUnorderedMap.make(persona.PieceType,TintMapColor), 0x1A8)
    // pieceTintColors:CxxUnorderedMap<persona::PieceType,TintMapColor>;
    // @nativeField(mce.Color, 0x1E8)
    // skinColor:mce.Color;
    @nativeField(int8_t, 0x1F8)
    isTrustedSkin:TrustedSkinFlag;
}
