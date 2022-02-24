import { abstract } from "../common";
import { VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { int32_t } from "../nativetype";
import type { DimensionId } from "./actor";
import { BlockSource } from "./block";
import { ChunkSource } from "./chunk";
import { procHacker } from "./proc";

@nativeClass(null)
export class Dimension extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    /** @deprecated Use `this.getBlockSource()` instead */
    get blockSource():BlockSource {
        return this.getBlockSource();
    }

    getBlockSource():BlockSource {
        abstract();
    }
    getChunkSource():ChunkSource {
        abstract();
    }
    getDimensionId():DimensionId {
        abstract();
    }
}

Dimension.prototype.getBlockSource = procHacker.js('Dimension::getBlockSourceFromMainChunkSource', BlockSource, {this:Dimension});
Dimension.prototype.getChunkSource = procHacker.js('Dimension::getChunkSource', ChunkSource, {this:Dimension});
Dimension.prototype.getDimensionId = procHacker.js('Dimension::getDimensionId', int32_t, {this:Dimension, structureReturn:true});
