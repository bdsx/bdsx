import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { int32_t, uint32_t } from "../nativetype";
import { ItemStack } from "./inventory";

export namespace Enchant {
    export enum Type {
        ArmorAll,
        ArmorFire,
        ArmorFall,
        ArmorExplosive,
        ArmorProjectile,
        ArmorThorns,
        WaterBreath,
        WaterSpeed,
        WaterAffinity,
        WeaponDamage,
        WeaponUndead,
        WeaponArthropod,
        WeaponKnockback,
        WeaponFire,
        WeaponLoot,
        MiningEfficiency,
        MiningSilkTouch,
        MiningDurability,
        MiningLoot,
        BowDamage,
        BowKnockback,
        BowFire,
        BowInfinity,
        FishingLoot,
        FishingLure,
        FrostWalker,
        Mending,
        CurseBinding,
        CurseVanishing,
        TridentImpaling,
        TridentRiptide,
        TridentLoyalty,
        TridentChanneling,
        CrossbowMultishot,
        CrossbowPiercing,
        CrossbowQuickCharge,
        SoulSpeed,

        NumEnchantments,
        InvalidEnchantment,
    }
}

export enum EnchantmentNames {
    Protection = 0x00,
    FireProtection = 0x01,
    FeatherFalling = 0x02,
    BlastProtection = 0x03,
    ProjectileProtection = 0x04,
    Thorns = 0x05,
    Respiration = 0x06,
    DepthStrider = 0x07,
    AquaAffinity = 0x08,
    Sharpness = 0x09,
    Smite = 0x0a,
    BaneOfArthropods = 0x0b,
    Knockback = 0x0c,
    FireAspect = 0x0d,
    Looting = 0x0e,
    Efficiency = 0x0f,
    SilkTouch = 0x10,
    Unbreaking = 0x11,
    Fortune = 0x12,
    Power = 0x13,
    Punch = 0x14,
    Flame = 0x15,
    Infinity = 0x16,
    LuckOfTheSea = 0x17,
    Lure = 0x18,
    FrostWalker = 0x19,
    Mending = 0x1a,
    BindingCurse = 0x1b,
    VanishingCurse = 0x1c,
    Impaling = 0x1d,
    Riptide = 0x1e,
    Loyalty = 0x1f,
    Channeling = 0x20,
    Multishot = 0x21,
    Piercing = 0x22,
    QuickCharge = 0x23,
    SoulSpeed = 0x24,
}

export type Enchantments = EnchantmentNames | Enchant.Type;

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
