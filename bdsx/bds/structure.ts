import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, float32_t, int32_t, int8_t, uint32_t } from "../nativetype";
import { ActorUniqueID } from "./actor";
import { BlockPos, Vec3 } from "./blockpos";

export enum Rotation {
    None,
    Rotate90,
    Rotate180,
    Rotate270,
    Rotate360,
}

export enum Mirror {
    None,
    X,
    Z,
    XZ,
}

@nativeClass(0x60)
export class StructureSettings extends NativeClass {
    @nativeField(CxxString)
    paletteName:CxxString;
    @nativeField(bool_t)
    ignoreEntities:bool_t;
    @nativeField(bool_t)
    ignoreBlocks:bool_t;
    @nativeField(BlockPos, 0x24)
    structureSize:BlockPos;
    @nativeField(BlockPos)
    structureOffset:BlockPos;
    @nativeField(Vec3)
    pivot:Vec3;
    @nativeField(ActorUniqueID)
    lastTouchedByPlayer:ActorUniqueID;
    @nativeField(int8_t)
    rotation:Rotation;
    @nativeField(int8_t)
    mirror:Mirror;
    @nativeField(float32_t)
    integrityValue:float32_t;
    @nativeField(uint32_t)
    integritySeed:uint32_t;

    static constructWith(size:BlockPos, ignoreEntities:boolean = false, ignoreBlocks:boolean = false):StructureSettings {
        abstract();
    }
}

@nativeClass(0xA8)
export class StructureTemplateData extends NativeClass {
    @nativeField(int32_t, 0x08)
    formatVersion:int32_t;
    @nativeField(BlockPos)
    size:BlockPos;
    @nativeField(BlockPos)
    structureWorldOrigin:BlockPos;
    @nativeField(CxxVector.make(int32_t))
    blockIndices:CxxVector<int32_t>;
    @nativeField(CxxVector.make(int32_t))
    extraBlockIndices:CxxVector<int32_t>;
    // @nativeField(CxxUnorderedMap.make(CxxString, StructureBlockPalette))
    // palettes:CxxUnorderedMap<CxxString, StructureBlockPalette>;
    // @nativeField(CxxVector.make(CompoundTag))
    // entityData:CxxVector<CompoundTag>;
}

@nativeClass(0xC8)
export class StructureTemplate extends NativeClass {
    @nativeField(CxxString)
    name:CxxString;
    @nativeField(StructureTemplateData)
    structureTemplateData:StructureTemplateData;
}

@nativeClass(0x88)
export class StructureManager extends NativeClass {
    // getOrCreate(structureName:string):StructureTemplate {
    //     abstract();
    // }
}
