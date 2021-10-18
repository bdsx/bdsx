import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
declare module "../minecraft" {
    interface Level {
        vftable: VoidPointer;
        players: CxxVector<ServerPlayer>;
        destroyBlock(blockSource: BlockSource, blockPos: BlockPos, dropResources: boolean): boolean;
        fetchEntity(id: ActorUniqueID, fetchRemovedActor: boolean): Actor | null;
    }
}
