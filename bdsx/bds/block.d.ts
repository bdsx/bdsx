import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import { bool_t, CxxString, CxxStringWith8Bytes, uint16_t } from "../nativetype";
import { BlockPos } from "./blockpos";
import { CommandName } from "./commandname";
import { HashedString } from "./hashedstring";
/** @deprecated import it from bdsx/minecraft */
export declare class BlockLegacy extends NativeClass {
    vftable: VoidPointer;
    /** @deprecated use Block.getDescriptionId() instead */
    descriptionId: CxxString;
    getCommandName(): string;
    /**
     * @deprecated use getCommandNames2
     */
    getCommandNames(): CxxVector<CxxStringWith8Bytes>;
    getCommandNames2(): CxxVector<CommandName>;
    getCreativeCategory(): number;
    /**
     * Will not affect actual destroy time but will affect the speed of cracks
     */
    setDestroyTime(time: number): void;
    getDestroyTime(): number;
}
/** @deprecated import it from bdsx/minecraft */
export declare class Block extends NativeClass {
    vftable: VoidPointer;
    data: uint16_t;
    blockLegacy: BlockLegacy;
    /**
     * @param blockName Formats like 'minecraft:wool' and 'wool' are both accepted
     */
    static create(blockName: string, data?: number): Block | null;
    protected _getName(): HashedString;
    getName(): string;
    getDescriptionId(): CxxString;
}
/** @deprecated import it from bdsx/minecraft */
export declare class BlockSource extends NativeClass {
    vftable: VoidPointer;
    ownerThreadID: VoidPointer;
    allowUnpopulatedChunks: bool_t;
    publicSource: bool_t;
    protected _setBlock(x: number, y: number, z: number, block: Block, updateFlags: number): boolean;
    getBlock(blockPos: BlockPos): Block;
    setBlock(blockPos: BlockPos, block: Block): boolean;
}
