import { abstract } from "../common";
import { VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, float32_t, int32_t, uint32_t, uint8_t } from "../nativetype";
import { ActorUniqueID } from "./actor";
import { BlockSource } from "./block";
import { BlockPos, Vec3 } from "./blockpos";
import type { BlockPalette } from "./level";
import { CompoundTag, TagPointer } from "./nbt";

console.warn("structure.ts is still in development.".red);

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
    reloadActorEquipment:bool_t;
    @nativeField(bool_t)
    ignoreBlocks:bool_t;
    @nativeField(bool_t)
    ignoreJigsawBlocks:bool_t;
    @nativeField(BlockPos)
    structureSize:BlockPos;
    @nativeField(BlockPos)
    structureOffset:BlockPos;
    @nativeField(Vec3)
    pivot:Vec3;
    @nativeField(ActorUniqueID)
    lastTouchedByPlayer:ActorUniqueID;
    @nativeField(uint8_t)
    rotation:Rotation;
    @nativeField(uint8_t)
    mirror:Mirror;
    @nativeField(uint8_t)
    animationMode:uint8_t;

    @nativeField(float32_t, 0x54)
    integrityValue:float32_t;
    @nativeField(uint32_t)
    integritySeed:uint32_t;

    static constructWith(size:BlockPos, ignoreEntities:boolean = false, ignoreBlocks:boolean = false):StructureSettings {
        abstract();
    }
}

@nativeClass(0xB8)
export class StructureTemplateData extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(int32_t)
    formatVersion:int32_t;
    @nativeField(BlockPos)
    size:BlockPos;
    @nativeField(BlockPos)
    structureWorldOrigin:BlockPos;
    // @nativeField(CxxVector.make(int32_t))
    // blockIndices:CxxVector<int32_t>;
    // @nativeField(CxxVector.make(int32_t))
    // extraBlockIndices:CxxVector<int32_t>;
    // @nativeField(CxxUnorderedMap.make(CxxString, StructureBlockPalette))
    // palettes:CxxUnorderedMap<CxxString, StructureBlockPalette>;
    // @nativeField(CxxVector.make(CompoundTag))
    // entityData:CxxVector<CompoundTag>;

    protected _save(ptr:TagPointer):TagPointer {
        abstract();
    }
    save():CompoundTag {
        return this._save(TagPointer.construct()).value as CompoundTag;
    }
    load(tag:CompoundTag):boolean {
        abstract();
    }
}

@nativeClass()
export class StructureTemplate extends NativeClass {
    @nativeField(CxxString)
    name:CxxString;
    @nativeField(StructureTemplateData)
    data:StructureTemplateData;
    fillFromWorld(region:BlockSource, pos:BlockPos, settings:StructureSettings):void {
        abstract();
    }
    placeInWorld(region:BlockSource, palette:BlockPalette, pos:BlockPos, settings:StructureSettings):void {
        abstract();
    }
}

@nativeClass(0x88)
export class StructureManager extends NativeClass {
    getOrCreate(name:string):StructureTemplate {
        abstract();
    }
}
