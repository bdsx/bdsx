import { NativeClass } from "bdsx/nativeclass";
import { abstract } from "bdsx/common";
import { HashedString } from "./hashedstring";

export class BlockLegacy extends NativeClass {
}

export class Block extends NativeClass {
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
