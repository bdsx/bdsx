"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
minecraft_1.Block.create = function (blockName, data = 0) {
    const itemStack = minecraft_1.ItemStack.create(blockName, 1, data);
    if (itemStack.isBlock()) {
        const block = itemStack.block;
        itemStack.destruct();
        return block;
    }
    itemStack.destruct();
    return null;
};
//# sourceMappingURL=block.js.map