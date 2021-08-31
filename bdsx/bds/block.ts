import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import { CxxStringWith8Bytes } from "../nativetype";
import { BlockPos } from "./blockpos";
import { CommandName } from "./commandname";
import { HashedString } from "./hashedstring";

/** @deprecated import it from bdsx/minecraft */
export class BlockLegacy extends NativeClass {
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

/** @deprecated import it from bdsx/minecraft */
export class Block extends NativeClass {
    blockLegacy: BlockLegacy;
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
}

/** @deprecated import it from bdsx/minecraft */
export class BlockSource extends NativeClass {
    protected _setBlock(x:number, y:number, z:number, block:Block, updateFlags:number):boolean {
        abstract();
    }
    getBlock(blockPos:BlockPos):Block {
        abstract();
    }
    setBlock(blockPos:BlockPos, block:Block):boolean {
        abstract();
    }
}
