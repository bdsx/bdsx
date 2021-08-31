import { Block, ItemStack } from "../minecraft";

declare module "../minecraft" {

    interface Block {
        blockLegacy: BlockLegacy;
    }

    namespace Block {
        /**
         * @param blockName Formats like 'minecraft:wool' and 'wool' are both accepted
         */
        function create(blockName:string, data?:number):Block|null;
    }
}

Block.create = function(blockName:string, data:number = 0):Block|null {
    const itemStack = ItemStack.create(blockName, 1, data);
    if (itemStack.isBlock()) {
        const block = itemStack.block;
        itemStack.destruct();
        return block;
    }
    itemStack.destruct();
    return null;
};
