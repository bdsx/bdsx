import { abstract } from "../common";
import { VoidPointer } from "../core";
import { AbstractClass, nativeClass, nativeClassUtil, nativeField } from "../nativeclass";
import { CxxString, int32_t } from "../nativetype";
import { Block, BlockSource } from "./block";
import { BlockPos, Vec3 } from "./blockpos";
import type { BlockPalette } from "./level";
import { CompoundTag, NBT } from "./nbt";

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
export class StructureSettings extends AbstractClass {
    static constructWith(size: BlockPos, ignoreEntities: boolean = false, ignoreBlocks: boolean = false): StructureSettings {
        abstract();
    }

    // deleted
    // getIgnoreBlocks(): boolean {
    //     abstract();
    // }
    // getIgnoreEntities(): boolean {
    //     abstract();
    // }
    getIgnoreJigsawBlocks(): boolean {
        return this.getBoolean(0x23);
    }
    isAnimated(): boolean {
        abstract();
    }
    // getStructureOffset(): BlockPos {
    //     abstract();
    // }
    // getStructureSize(): BlockPos {
    //     abstract();
    // }
    // getPivot(): Vec3 {
    //     abstract();
    // }
    getPaletteName(): string {
        return this.getCxxString();
    }
    // getAnimationMode(): number {
    //     abstract();
    // }
    // getMirror(): Mirror {
    //     abstract();
    // }
    getReloadActorEquipment(): boolean {
        return this.getBoolean(0x21);
    }
    // getRotation(): Rotation {
    //     abstract();
    // }
    // getAnimationSeconds(): number {
    //     abstract();
    // }
    // getIntegrityValue(): number {
    //     abstract();
    // }
    getAnimationTicks(): number {
        abstract();
    }
    // getIntegritySeed(): number {
    //     abstract();
    // }
    // setAnimationMode(mode: number): void {
    //     abstract();
    // }
    // setAnimationSeconds(seconds: number): void {
    //     abstract();
    // }
    setIgnoreBlocks(ignoreBlocks: boolean): void {
        abstract();
    }
    setIgnoreEntities(ignoreEntities: boolean): void {
        abstract();
    }
    setIgnoreJigsawBlocks(ignoreJigsawBlocks: boolean): void {
        abstract();
    }
    setIntegritySeed(seed: number): void {
        abstract();
    }
    setIntegrityValue(value: number): void {
        abstract();
    }
    setMirror(mirror: Mirror): void {
        abstract();
    }
    setPaletteName(name: string): void {
        abstract();
    }
    setPivot(pivot: Vec3): void {
        abstract();
    }
    setReloadActorEquipment(reloadActorEquipment: boolean): void {
        abstract();
    }
    setRotation(rotation: Rotation): void {
        abstract();
    }
    setStructureOffset(offset: BlockPos): void {
        abstract();
    }
    setStructureSize(size: BlockPos): void {
        abstract();
    }

    [nativeClassUtil.inspectFields](obj: Record<string, any>): void {
        obj.paletteName = this.getPaletteName();
        // obj.ignoreEntities = this.getIgnoreEntities();
        obj.reloadActorEquipment = this.getReloadActorEquipment();
        // obj.ignoreBlocks = this.getIgnoreBlocks();
        obj.ignoreJigsawBlocks = this.getIgnoreJigsawBlocks();
        // obj.structureSize = this.getStructureSize();
        // obj.structureOffset = this.getStructureOffset();
        // obj.pivot = this.getPivot();
        // obj.rotation = this.getRotation();
        // obj.mirror = this.getMirror();
        // obj.animationMode = this.getAnimationMode();
        obj.animationTicks = this.getAnimationTicks();
        // obj.integrityValue = this.getIntegrityValue();
        // obj.integritySeed = this.getIntegritySeed();
    }
}

@nativeClass(0xb8)
export class StructureTemplateData extends AbstractClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    @nativeField(int32_t)
    formatVersion: int32_t;
    @nativeField(BlockPos)
    readonly size: BlockPos;
    @nativeField(BlockPos)
    readonly structureWorldOrigin: BlockPos;

    save(): Record<string, any> {
        const tag = this.allocateAndSave();
        const out = tag.value();
        tag.dispose();
        return out;
    }
    allocateAndSave(): CompoundTag {
        abstract();
    }
    load(tag: CompoundTag | NBT.Compound): boolean {
        abstract();
    }
}

@nativeClass()
export class StructureTemplate extends AbstractClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    @nativeField(CxxString)
    name: CxxString;
    @nativeField(StructureTemplateData)
    data: StructureTemplateData;

    fillFromWorld(region: BlockSource, pos: BlockPos, settings: StructureSettings): void {
        abstract();
    }
    placeInWorld(region: BlockSource, palette: BlockPalette, pos: BlockPos, settings: StructureSettings): void {
        abstract();
    }
    tryGetBlockAtPos(pos: BlockPos): Block | null {
        abstract();
    }
    /**
     * @deprecated renamed.
     */
    getBlockAtPos(pos: BlockPos): Block | null {
        return this.tryGetBlockAtPos(pos);
    }
    getSize(): BlockPos {
        abstract();
    }
    allocateAndSave(): CompoundTag {
        abstract();
    }
    save(): Record<string, any> {
        const tag = this.allocateAndSave();
        const out = tag.value();
        tag.dispose();
        return out;
    }
    load(tag: CompoundTag | NBT.Compound): boolean {
        return this.data.load(tag);
    }
}

@nativeClass(null) // Last few lines of Minecraft::Minecraft
export class StructureManager extends AbstractClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;

    getOrCreate(name: string): StructureTemplate {
        abstract();
    }
}
