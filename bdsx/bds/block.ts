import { NativeClass } from "bdsx/nativeclass";
import { abstract } from "bdsx/common";
import { HashedString } from "./hashedstring";
import { CxxStringWrapper } from "bdsx/pointer";
import { BlockPos } from "./blockpos";

export class BlockLegacy extends NativeClass {
    protected _getCommandName(): CxxStringWrapper {
        abstract();
    }
    getCommandName():string {
        return this._getCommandName().value;
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
    protected _getName():HashedString {
        abstract();
    }
    getName():string {
        return this._getName().str;
    }
}

export class BlockSource extends NativeClass {
    getBlock(blockPos:BlockPos):Block {
        abstract();
    }
}
