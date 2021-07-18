import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import { CxxString } from "../nativetype";
import { BlockPos } from "./blockpos";
import { HashedString } from "./hashedstring";

export class BlockLegacy extends NativeClass {
    getCommandName():string {
        const names = this.getCommandNames();
        const name = names.get(0);
        names.destruct();
        if (name === null) throw Error(`block has not any names`);
        return name;
    }
    getCommandNames():CxxVector<CxxString> {
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
