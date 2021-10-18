import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { bin64_t, bool_t, int16_t, uint8_t } from "../nativetype";
declare module "../minecraft" {
    interface ItemStack extends ItemStackBase {
        vftable: VoidPointer;
        item: Item;
        userData: CompoundTag;
        block: Block;
        aux: int16_t;
        amount: uint8_t;
        valid: bool_t;
        pickupTime: bin64_t;
        showPickup: bool_t;
        canPlaceOnList: CxxVector<BlockLegacy>;
        canDestroyList: CxxVector<BlockLegacy>;
        getCommandName(): string;
        /**
         * Value is applied only to Damageable items
         */
        setDamageValue(value: number): void;
        /**
         * it returns the enchantability.
         * (See enchantability on https://minecraft.fandom.com/wiki/Enchanting_mechanics)
         */
        getEnchantValue(): number;
        getItemSafe(): Item | null;
        getAmount(): number;
        setAmount(amount: number): void;
        getItemId(): ItemId;
        isBlock(): boolean;
    }
    namespace ItemStack {
        /**
         * @param itemName Formats like 'minecraft:apple' and 'apple' are both accepted, even if the name does not exist, it still returns an ItemStack
         */
        function create(itemName: string, amount?: number, data?: number): ItemStack;
    }
}
