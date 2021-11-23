import { abstract } from "../common";
import { VoidPointer } from "../core";
import type { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, CxxStringWith8Bytes, int32_t, uint16_t } from "../nativetype";
import type { BlockPos, ChunkPos } from "./blockpos";
import type { ChunkSource, LevelChunk } from "./chunk";
import type { CommandName } from "./commandname";
import { HashedString } from "./hashedstring";

@nativeClass(null)
export class BlockLegacy extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    /**
     * @deprecated Use `this.getRenderBlock().getDescriptionId()` instead
     */
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
     * @deprecated Use `this.getCommandNames2()` instead
     */
    getCommandNames():CxxVector<CxxStringWith8Bytes> {
        abstract();
    }
    getCommandNames2():CxxVector<CommandName> {
        abstract();
    }
    /**
     * Returns the category of the block in creative inventory
     */
    getCreativeCategory():number {
        abstract();
    }
    /**
     * Changes the time needed to destroy the block
     * @remarks Will not affect actual destroy time but will affect the speed of cracks
     */
    setDestroyTime(time:number):void {
        abstract();
    }
    /**
     * Returns the time needed to destroy the block
     */
    getDestroyTime():number {
        return this.getFloat32(0x12C); // accessed in BlockLegacy::setDestroyTime
    }
    /**
     * Returns the Block instance
     */
    getRenderBlock():Block {
        abstract();
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
    static constructWith(blockName:BlockId, data?: number):Block|null;
    static constructWith(blockName:string, data?: number):Block|null;
    static constructWith(blockName:BlockId|string, data:number = 0):Block|null {
        abstract();
    }

    static create(blockName:BlockId, data?: number):Block|null;
    static create(blockName:string, data?: number):Block|null;

    /**
     * @param blockName Formats like 'minecraft:wool' and 'wool' are both accepted
     */
    static create(blockName:string, data:number = 0):Block|null {
        return this.constructWith(blockName, data);
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

// Neighbors causes block updates around
// Network causes the block to be sent to clients
// Uses of other flags unknown
enum BlockUpdateFlags {
    NONE      = 0b0000,
    NEIGHBORS = 0b0001,
    NETWORK   = 0b0010,
    NOGRAPHIC = 0b0100,
    PRIORITY  = 0b1000,

    ALL = NEIGHBORS | NETWORK,
    ALL_PRIORITY = ALL | PRIORITY,
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
    /**
     *
     * @param blockPos Position of the block to place
     * @param block The Block to place
     * @param updateFlags BlockUpdateFlags, to place without ticking neighbor updates use only BlockUpdateFlags.NETWORK
     * @returns true if the block was placed, false if it was not
     */
    setBlock(blockPos:BlockPos, block:Block, updateFlags = BlockUpdateFlags.ALL):boolean {
        return this._setBlock(blockPos.x, blockPos.y, blockPos.z, block, updateFlags);
    }
    getChunk(pos:ChunkPos):LevelChunk {
        abstract();
    }
    getChunkAt(pos:BlockPos):LevelChunk {
        abstract();
    }
    getChunkSource():ChunkSource {
        abstract();
    }
}
