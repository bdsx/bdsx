import { NativeClass } from "bdsx/nativeclass";
import { abstract } from "bdsx/common";
import { HashedString } from "./hashedstring";
import { CxxStringWrapper } from "bdsx/pointer";

export class BlockLegacy extends NativeClass {
    protected _getCommandName(): CxxStringWrapper {
        abstract();
    }
    getCommandName():string {
        return this._getCommandName().value;
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
    getCreativeCategory():number {
        abstract();
    }
}

export class BlockSource extends NativeClass {

}
