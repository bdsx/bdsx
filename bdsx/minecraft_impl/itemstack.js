"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const cxxvector_1 = require("../cxxvector");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.ItemStack.setExtends(minecraft_1.ItemStackBase);
minecraft_1.ItemStack.abstract({
    vftable: core_1.VoidPointer,
    item: minecraft_1.Item.ref(),
    userData: minecraft_1.CompoundTag.ref(),
    block: minecraft_1.Block.ref(),
    aux: nativetype_1.int16_t,
    amount: nativetype_1.uint8_t,
    valid: nativetype_1.bool_t,
    pickupTime: nativetype_1.bin64_t,
    showPickup: nativetype_1.bool_t,
    canPlaceOnList: cxxvector_1.CxxVector.make(minecraft_1.BlockLegacy.ref()),
    // something at 0x50
    canDestroyList: [cxxvector_1.CxxVector.make(minecraft_1.BlockLegacy.ref()), 0x58],
}, 0x89);
//# sourceMappingURL=itemstack.js.map