import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { Block, BlockLegacy, CompoundTag, Item, ItemStack, ItemStackBase } from "../minecraft";
import { bin64_t, bool_t, int16_t, uint8_t } from "../nativetype";

declare module "../minecraft" {
    interface ItemStack extends ItemStackBase {
        vftable:VoidPointer;
        item:Item;
        userData: CompoundTag;
        block:Block;
        aux:int16_t;
        amount:uint8_t;
        valid:bool_t;
        pickupTime:bin64_t;
        showPickup:bool_t;
        canPlaceOnList:CxxVector<BlockLegacy>;
        canDestroyList:CxxVector<BlockLegacy>;

        getCommandName():string;

        /**
         * Value is applied only to Damageable items
         */
        setDamageValue(value:number):void

        /**
         * it returns the enchantability.
         * (See enchantability on https://minecraft.fandom.com/wiki/Enchanting_mechanics)
         */
        getEnchantValue(): number;

        getItemSafe():Item|null;

        getAmount():number;
        setAmount(amount:number):void;
        getItemId():ItemId;

        isBlock():boolean;
    }

    namespace ItemStack {
        /**
         * @param itemName Formats like 'minecraft:apple' and 'apple' are both accepted, even if the name does not exist, it still returns an ItemStack
         */
        function create(itemName:string, amount?:number, data?:number):ItemStack;
    }
}

(ItemStack as any).prototype.__proto__ = ItemStackBase.prototype;
(ItemStack as any).__proto__ = ItemStackBase;

ItemStack.abstract({
    vftable:VoidPointer, // 0x00
    item:Item.ref(), // 0x08
    userData:CompoundTag.ref(), // 0x10
    block:Block.ref(), // 0x18
    aux:int16_t, // 0x20
    amount:uint8_t, // 0x22
    valid:bool_t, // 0x23
    pickupTime:bin64_t, // 0x28
    showPickup:bool_t, // 0x30
    canPlaceOnList:CxxVector.make(BlockLegacy.ref()), // 0x38
    // something at 0x50
    canDestroyList:[CxxVector.make(BlockLegacy.ref()), 0x58],
}, 0x89);

ItemStack.prototype.getAmount = function():number {
    return this.amount;
};
ItemStack.prototype.setAmount = function(amount:number):void {
    this.amount = amount;
};
ItemStack.prototype.getItemSafe = function():Item|null {
    if (this.isNull()) {
        return null;
    }
    return this.getItem();
};
ItemStack.prototype.getItemId = function():ItemId {
    const item = this.getItem();
    if (item != null) {
        const Name = item.getCommandName();
        if (Name.includes(':')) return Name as any;
        else return 'minecraft:' + Name as any;
    }
    return 'minecraft:air';
};
ItemStack.prototype.isBlock = function():boolean {
    return this.vftable === Block.__vftable;
};
