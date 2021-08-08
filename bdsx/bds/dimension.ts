import { abstract } from "../common";
import { VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { int32_t } from "../nativetype";
import type { DimensionId } from "./actor";
import { BlockSource } from "./block";
import { procHacker } from "./proc";

@nativeClass(null)
export class Dimension extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    /** @deprecated Use getBlockSource() instead */
    get blockSource():BlockSource {
        return this.getBlockSource();
    }

    getBlockSource():BlockSource {
        abstract();
    }
    getDimensionId():DimensionId {
        abstract();
    }
}

Dimension.prototype.getBlockSource = procHacker.js('Dimension::getBlockSourceDEPRECATEDUSEPLAYERREGIONINSTEAD', BlockSource, {this:Dimension});
Dimension.prototype.getDimensionId = procHacker.js('Dimension::getDimensionId', int32_t, {this:Dimension, structureReturn:true});
