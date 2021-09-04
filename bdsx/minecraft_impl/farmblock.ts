import { int32_t, uint16_t, uint32_t } from "../nativetype";
import { Wrapper } from "../pointer";

declare module "../minecraft" {
    interface FarmBlock extends Block {
        /** @deprecated Block method */
        constructWith(us:uint16_t, v:Wrapper<BlockLegacy|null>, compoundTag:CompoundTag, u:uint32_t):void;
        /** @deprecated Block method */
        getAABB(blockSource:BlockSource, blockPos:BlockPos, aabb:AABB, b:boolean):AABB;
        /** @deprecated Block method */
        asItemInstance(blockSource:BlockSource, blockPos:BlockPos):ItemInstance;
        /** @deprecated Block method */
        getVariant():int32_t;
    }
}

export { };

