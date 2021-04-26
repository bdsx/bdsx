import { NativeClass } from "bdsx/nativeclass";
import { abstract } from "../common";
import { makefunc } from "../makefunc";
import { int32_t } from "../nativetype";
import type { DimensionId } from "./actor";
import { procHacker } from "./proc";

export class Dimension extends NativeClass {
    getDimensionId():DimensionId {
        abstract();
    }
}

Dimension.prototype.getDimensionId = procHacker.js('Dimension::getDimensionId', int32_t, {this:Dimension, structureReturn:true});
