import { abstract } from "bdsx/common";
import { NativeClass } from "bdsx/nativeclass";
import { CxxVector } from "../cxxvector";
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
