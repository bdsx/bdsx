import { CxxVector } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import { int32_t, uint32_t } from "../nativetype";
import { ItemStack } from "./inventory";
import minecraft = require('../minecraft');
/** @deprecated */
export declare namespace Enchant {
    /** @deprecated */
    const Type: typeof minecraft.Enchant.Type;
    /** @deprecated */
    type Type = minecraft.Enchant.Type;
}
/** @deprecated */
export declare const EnchantmentNames: typeof minecraft.Enchant.Type;
/** @deprecated */
export declare type EnchantmentNames = minecraft.Enchant.Type;
/** @deprecated */
export declare type Enchantments = minecraft.Enchant.Type;
export declare class EnchantmentInstance extends NativeClass {
    type: Enchantments;
    level: int32_t;
}
export declare class ItemEnchants extends NativeClass {
    slot: uint32_t;
    /** 1-8 */
    enchants1: CxxVector<EnchantmentInstance>;
    /** 9-18 */
    enchants2: CxxVector<EnchantmentInstance>;
    /** >19 */
    enchants3: CxxVector<EnchantmentInstance>;
}
export declare namespace EnchantUtils {
    function applyEnchant(itemStack: ItemStack, enchant: Enchantments, level: number, allowUnsafe: boolean): boolean;
    function getEnchantLevel(enchant: Enchantments, itemStack: ItemStack): number;
    function hasCurse(itemStack: ItemStack): boolean;
    function hasEnchant(enchant: Enchantments, itemStack: ItemStack): boolean;
}
