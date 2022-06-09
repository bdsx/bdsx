import { CxxVector } from "../cxxvector";
import { mce } from "../mce";
import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, CxxStringWith8Bytes, float32_t, NativeType, uint32_t, uint8_t, void_t } from "../nativetype";
import { procHacker } from "../prochacker";
import { JsonValue } from "./connreq";
import { SemVersion } from "./server";

export enum TrustedSkinFlag {
    Unset,
    False,
    True,
}

export enum PersonaAnimatedTextureType {
    None,
    Face,
    Body32x32,
    Body128x128,
}

export enum PersonaPieceType {
    Unknown,
    Skeleton,
    Body,
    Skin,
    Bottom,
    Feet,
    Dress,
    Top,
    HighPants,
    Hands,
    Outerwear,
    Back,
    FacialHair,
    Mouth,
    Eyes,
    Hair,
    FaceAccessory,
    Head,
    Legs,
    LeftLeg,
    RightLeg,
    Arms,
    LeftArm,
    RightArm,
    Capes,
    ClassicSkin,
}

@nativeClass(0x38)
export class AnimatedImageData extends NativeClass {
    @nativeField(uint32_t)
    type:PersonaAnimatedTextureType;
    @nativeField(mce.Image)
    image:mce.Image;
    @nativeField(float32_t)
    frames:float32_t;
}

@nativeClass()
export class SerializedPersonaPieceHandle extends NativeClass {
    @nativeField(CxxString)
    pieceId:CxxString;
    @nativeField(uint32_t)
    pieceType:uint32_t;
    @nativeField(mce.UUID, 0x28)
    packId:mce.UUID;
    @nativeField(bool_t)
    isDefaultPiece:bool_t;
    @nativeField(CxxString, 0x40)
    productId:CxxString;
}

@nativeClass()
export class SerializedSkin extends NativeClass {
    /** @deprecated Use {@link id} instead */
    @nativeField(CxxString, {ghost:true})
    skinId:CxxString;
    @nativeField(CxxString)
    id:CxxString;
    @nativeField(CxxString)
    playFabId:CxxString;
    @nativeField(CxxString)
    fullId:CxxString;
    @nativeField(CxxString)
    resourcePatch:CxxString;
    @nativeField(CxxString)
    defaultGeometryName:CxxString;
    @nativeField(mce.Image)
    skinImage:mce.Image;
    @nativeField(mce.Image)
    capeImage:mce.Image;
    @nativeField(CxxVector.make(AnimatedImageData))
    skinAnimatedImages:CxxVector<AnimatedImageData>;
    @nativeField(JsonValue)
    geometryData:JsonValue;
    @nativeField(SemVersion)
    geometryDataEngineVersion:SemVersion;
    @nativeField(JsonValue)
    geometryDataMutable:JsonValue;
    @nativeField(CxxString)
    animationData:CxxString;
    @nativeField(CxxString)
    capeId:CxxString;
    @nativeField(CxxVector.make(SerializedPersonaPieceHandle))
    personaPieces:CxxVector<SerializedPersonaPieceHandle>;
    @nativeField(CxxStringWith8Bytes)
    armSize:CxxStringWith8Bytes;
    // @nativeField(CxxUnorderedMap.make(uint32_t,TintMapColor))
    // pieceTintColors:CxxUnorderedMap<PersonaPieceType,TintMapColor>;
    @nativeField(mce.Color, {offset:0x38, relative:true})
    skinColor:mce.Color;
    @nativeField(uint8_t)
    isTrustedSkin:TrustedSkinFlag;
    @nativeField(bool_t)
    isPremium:bool_t;
    @nativeField(bool_t)
    isPersona:bool_t;
    /** @deprecated Use {@link isPersonaCapeOnClassicSkin} instead */
    @nativeField(bool_t, {ghost:true})
    isCapeOnClassicSkin:bool_t;
    @nativeField(bool_t)
    isPersonaCapeOnClassicSkin:bool_t;
    @nativeField(bool_t)
    isPrimaryUser:bool_t;
}

SerializedSkin.prototype[NativeType.ctor] = procHacker.js("??0SerializedSkin@@QEAA@XZ", void_t, {this:SerializedSkin});
SerializedSkin.prototype[NativeType.dtor] = procHacker.js("??1SerializedSkin@@QEAA@XZ", void_t, {this:SerializedSkin});
SerializedSkin.prototype[NativeType.ctor_copy] = procHacker.js("??0SerializedSkin@@QEAA@AEBV0@@Z", void_t, {this:SerializedSkin}, SerializedSkin);
SerializedSkin.prototype[NativeType.ctor_move] = procHacker.js("??0SerializedSkin@@QEAA@$$QEAV0@@Z", void_t, {this:SerializedSkin}, SerializedSkin);
