import { abstract } from "../common";
import { VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { int32_t } from "../nativetype";
import type { DimensionId } from "./actor";
import { procHacker } from "./proc";

@nativeClass(null)
export class Dimension extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;

    getDimensionId():DimensionId {
        abstract();
    }
}

Dimension.prototype.getDimensionId = procHacker.js('Dimension::getDimensionId', int32_t, {this:Dimension, structureReturn:true});
