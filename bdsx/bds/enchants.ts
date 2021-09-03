import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { int32_t, uint32_t } from "../nativetype";
import { ItemStack } from "./inventory";
import minecraft = require('../minecraft');

/** @deprecated */
export namespace Enchant {
    /** @deprecated */
    export const Type = minecraft.Enchant.Type;
    /** @deprecated */
    export type Type = minecraft.Enchant.Type;
}

/** @deprecated */
export const EnchantmentNames = minecraft.Enchant.Type;
/** @deprecated */
export type EnchantmentNames = minecraft.Enchant.Type;

/** @deprecated */
export type Enchantments = minecraft.Enchant.Type;

@nativeClass()
export class EnchantmentInstance extends NativeClass {
    @nativeField(int32_t)
    type:Enchantments;
    @nativeField(int32_t)
    level:int32_t;
}

@nativeClass()
export class ItemEnchants extends NativeClass {
    @nativeField(uint32_t)
    slot: uint32_t;
    @nativeField(CxxVector.make(EnchantmentInstance), 0x08)
    /** 1-8 */
    enchants1: CxxVector<EnchantmentInstance>;
    /** 9-18 */
    @nativeField(CxxVector.make(EnchantmentInstance))
    enchants2: CxxVector<EnchantmentInstance>;
    /** >19 */
    @nativeField(CxxVector.make(EnchantmentInstance))
    enchants3: CxxVector<EnchantmentInstance>;
}

export namespace EnchantUtils {
    export function applyEnchant(itemStack:ItemStack, enchant:Enchantments, level:number, allowUnsafe:boolean):boolean{
        abstract();
    }
    export function getEnchantLevel(enchant:Enchantments, itemStack:ItemStack):number{
        abstract();
    }
    export function hasCurse(itemStack:ItemStack):boolean{
        abstract();
    }
    export function hasEnchant(enchant:Enchantments, itemStack:ItemStack):boolean{
        abstract();
    }

}
