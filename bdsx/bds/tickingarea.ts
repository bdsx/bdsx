import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass } from "../nativeclass";
import { bool_t } from "../nativetype";
import { procHacker } from "../prochacker";
import { CxxSharedPtr } from "../sharedpointer";
import { ChunkPos } from "./blockpos";
import { LevelChunk } from "./chunk";

@nativeClass()
export class ITickingAreaView extends NativeClass {
    getAvailableChunk(pos: ChunkPos): CxxSharedPtr<LevelChunk> {
        abstract();
    }
}

@nativeClass()
export class ITickingArea extends NativeClass {
    isRemoved(): boolean {
        abstract();
    }

    getView(): ITickingAreaView {
        abstract();
    }
}

@nativeClass()
export class TickingAreaList extends NativeClass {
    getAreas(): CxxVector<CxxSharedPtr<ITickingArea>> {
        abstract();
    }
}

ITickingAreaView.prototype.getAvailableChunk = procHacker.jsv(
    "??_7TickingAreaView@@6B@",
    "?getAvailableChunk@TickingAreaView@@UEAA?AV?$shared_ptr@VLevelChunk@@@std@@AEBVChunkPos@@@Z",
    CxxSharedPtr.make(LevelChunk),
    { this: ITickingAreaView, structureReturn: true },
    ChunkPos,
);

ITickingArea.prototype.isRemoved = procHacker.jsv("??_7TickingArea@@6B@", "?isRemoved@TickingArea@@UEAA_NXZ", bool_t, { this: ITickingArea });

ITickingArea.prototype.getView = procHacker.jsv("??_7TickingArea@@6B@", "?getView@TickingArea@@UEAAAEAVITickingAreaView@@XZ", ITickingAreaView, {
    this: ITickingArea,
});

TickingAreaList.prototype.getAreas = procHacker.js(
    "?getAreas@TickingAreaListBase@@QEBAAEBV?$vector@V?$shared_ptr@VITickingArea@@@std@@V?$allocator@V?$shared_ptr@VITickingArea@@@std@@@2@@std@@XZ",
    CxxVector.make(CxxSharedPtr.make(ITickingArea)),
    { this: TickingAreaList },
);
