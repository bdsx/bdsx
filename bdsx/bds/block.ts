import { abstract } from "../common";
import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, CxxStringWith8Bytes, int32_t, uint16_t } from "../nativetype";
import { BlockPos } from "./blockpos";
import { CommandName } from "./commandname";
import { HashedString } from "./hashedstring";
import { CompoundTag } from "./nbt";

@nativeClass(null)
export class BlockLegacy extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    /** @deprecated use Block.getDescriptionId() instead */
    @nativeField(CxxString)
    descriptionId:CxxString;

    getCommandName():string {
        const names = this.getCommandNames2();
        const name = names.get(0).name;
        names.destruct();
        if (name === null) throw Error(`block has not any names`);
        return name;
    }
    /**
     * @deprecated use getCommandNames2
     */
    getCommandNames():CxxVector<CxxStringWith8Bytes> {
        abstract();
    }
    getCommandNames2():CxxVector<CommandName> {
        abstract();
    }
    getCreativeCategory():number {
        abstract();
    }
    /**
     * Will not affect actual destroy time but will affect the speed of cracks
     */
    setDestroyTime(time:number):void {
        abstract();
    }
    getDestroyTime():number {
        return this.getFloat32(0x12C);
    }
}

@nativeClass(null)
export class Block extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(uint16_t)
    data:uint16_t;
    @nativeField(BlockLegacy.ref(), 0x10)
    blockLegacy:BlockLegacy;

    /**
     * @param blockName Formats like 'minecraft:wool' and 'wool' are both accepted
     */
    static create(blockName:string, data:number = 0):Block|null {
        abstract();
    }
    protected _getName():HashedString {
        abstract();
    }
    getName():string {
        return this._getName().str;
    }
    getDescriptionId():CxxString {
        abstract();
    }
    getRuntimeId():int32_t {
        abstract();
    }
}

@nativeClass(null)
export class BlockSource extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(VoidPointer)
    ownerThreadID:VoidPointer;
    @nativeField(bool_t)
    allowUnpopulatedChunks:bool_t;
    @nativeField(bool_t)
    publicSource:bool_t;

    protected _setBlock(x:number, y:number, z:number, block:Block, updateFlags:number):boolean {
        abstract();
    }
    getBlock(blockPos:BlockPos):Block {
        abstract();
    }
    setBlock(blockPos:BlockPos, block:Block):boolean {
        abstract();
    }
    getBlockEntity(blockPos:BlockPos):BlockActor|null {
        abstract();
    }
}

@nativeClass(null)
export class BlockActor extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;

    save(tag:CompoundTag):boolean{
        abstract();
    }
    constructAndSave():CompoundTag{
        const tag = CompoundTag.constructWith({});
        this.save(tag);
        return tag;
    }
}
