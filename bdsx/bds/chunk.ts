import { abstract } from "../common";
import { nativeClass, NativeClass } from "../nativeclass";
import { Actor, ActorUniqueID, WeakEntityRef } from "./actor";
import type { Biome } from "./biome";
import type { BlockPos, ChunkBlockPos, ChunkPos } from "./blockpos";
import type { Level } from "./level";

export class LevelChunk extends NativeClass {
    getBiome(pos:ChunkBlockPos):Biome {
        abstract();
    }
    getLevel():Level {
        abstract();
    }
    getPosition():ChunkPos {
        abstract();
    }
    getMin():BlockPos {
        abstract();
    }
    getMax():BlockPos {
        abstract();
    }
    isFullyLoaded(): boolean {
        abstract();
    }
    /**
     * Converts a local ChunkBlockPos instance to a global BlockPos.
     */
    toWorldPos(pos:ChunkBlockPos):BlockPos {
        abstract();
    }
    getEntity(actorId: ActorUniqueID): Actor | null {
        abstract();
    }
    getChunkEntities(): WeakEntityRef[] {
        abstract();
    }
}

@nativeClass(null)
export class ChunkSource extends NativeClass {
    getLevel():Level {
        abstract();
    }
}
