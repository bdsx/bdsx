import { CircularDetector } from "../circulardetector";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { CxxString, int32_t } from "../nativetype";
import { Block, BlockSource } from "./block";
import { BlockPos, Vec3 } from "./blockpos";
import type { BlockPalette } from "./level";
import { CompoundTag, TagPointer } from "./nbt";

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
    static constructWith(size:BlockPos, ignoreEntities:boolean = false, ignoreBlocks:boolean = false):StructureSettings {
        abstract();
    }

    getIgnoreBlocks():boolean {
        abstract();
    }
    getIgnoreEntities():boolean {
        abstract();
    }
    getIgnoreJigsawBlocks():boolean {
        return this.getBoolean(0x23);
    }
    isAnimated():boolean {
        abstract();
    }
    getStructureOffset():BlockPos {
        abstract();
    }
    getStructureSize():BlockPos {
        abstract();
    }
    getPivot():Vec3 {
        abstract();
    }
    getPaletteName():string {
        return this.getCxxString();
    }
    getAnimationMode():number {
        abstract();
    }
    getMirror():Mirror {
        abstract();
    }
    getReloadActorEquipment():boolean {
        return this.getBoolean(0x21);
    }
    getRotation():Rotation {
        abstract();
    }
    getAnimationSeconds():number {
        abstract();
    }
    getIntegrityValue():number {
        abstract();
    }
    getAnimationTicks():number {
        abstract();
    }
    getIntegritySeed():number {
        abstract();
    }
    setAnimationMode(mode:number):void {
        abstract();
    }
    setAnimationSeconds(seconds:number):void {
        abstract();
    }
    setIgnoreBlocks(ignoreBlocks:boolean):void {
        abstract();
    }
    setIgnoreEntities(ignoreEntities:boolean):void {
        abstract();
    }
    setIgnoreJigsawBlocks(ignoreJigsawBlocks:boolean):void {
        abstract();
    }
    setIntegritySeed(seed:number):void {
        abstract();
    }
    setIntegrityValue(value:number):void {
        abstract();
    }
    setMirror(mirror:Mirror):void {
        abstract();
    }
    setPaletteName(name:string):void {
        abstract();
    }
    setPivot(pivot:Vec3):void {
        abstract();
    }
    setReloadActorEquipment(reloadActorEquipment:boolean):void {
        abstract();
    }
    setRotation(rotation:Rotation):void {
        abstract();
    }
    setStructureOffset(offset:BlockPos):void {
        abstract();
    }
    setStructureSize(size:BlockPos):void {
        abstract();
    }

    _toJsonOnce(allocator:()=>Record<string, any>):Record<string, any> {
        return CircularDetector.check(this, allocator, obj=>{
            obj.paletteName = this.getPaletteName();
            obj.ignoreEntities = this.getIgnoreEntities();
            obj.reloadActorEquipment = this.getReloadActorEquipment();
            obj.ignoreBlocks = this.getIgnoreBlocks();
            obj.ignoreJigsawBlocks = this.getIgnoreJigsawBlocks();
            obj.structureSize = this.getStructureSize();
            obj.structureOffset = this.getStructureOffset();
            obj.pivot = this.getPivot();
            obj.rotation = this.getRotation();
            obj.mirror = this.getMirror();
            obj.animationMode = this.getAnimationMode();
            obj.animationTicks = this.getAnimationTicks();
            obj.integrityValue = this.getIntegrityValue();
            obj.integritySeed = this.getIntegritySeed();
        });
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

    protected _save(ptr:TagPointer):TagPointer {
        abstract();
    }
    save(tag:CompoundTag):void {
        const ptr = new TagPointer(true);
        ptr.value = tag;
        this._save(ptr);
        tag.construct(ptr.value as CompoundTag);
        ptr.value.destruct();
        ptr.destruct();
    }
    constructAndSave():CompoundTag {
        const tag = CompoundTag.constructWith({});
        this.save(tag);
        return tag;
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
    getBlockAtPos(pos:BlockPos):Block {
        abstract();
    }
    getSize():BlockPos {
        abstract();
    }
}

@nativeClass(0x88)
export class StructureManager extends NativeClass {
    getOrCreate(name:string):StructureTemplate {
        abstract();
    }
}
