import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { NativeClass, nativeClass, nativeField, NativeStruct } from "../nativeclass";
import { int32_t, uint32_t, uint8_t } from "../nativetype";
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

        /** @deprecated */
        NumEnchantments = -1,
        /** @deprecated */
        InvalidEnchantment = -1,
    }
}

export enum EnchantmentNames {
    Protection = 0,
    FireProtection = 1,
    FeatherFalling = 2,
    BlastProtection = 3,
    ProjectileProtection = 4,
    Thorns = 5,
    Respiration = 6,
    DepthStrider = 7,
    AquaAffinity = 8,
    Sharpness = 9,
    Smite = 10,
    BaneOfArthropods = 11,
    Knockback = 12,
    FireAspect = 13,
    Looting = 14,
    Efficiency = 15,
    SilkTouch = 16,
    Unbreaking = 17,
    Fortune = 18,
    Power = 19,
    Punch = 20,
    Flame = 21,
    Infinity = 22,
    LuckOfTheSea = 23,
    Lure = 24,
    FrostWalker = 25,
    Mending = 26,
    BindingCurse = 27,
    VanishingCurse = 28,
    Impaling = 29,
    Riptide = 30,
    Loyalty = 31,
    Channeling = 32,
    Multishot = 33,
    Piercing = 34,
    QuickCharge = 35,
    SoulSpeed = 36,
    SwiftSneak = 37,
    WindBurst = 38,
    Desnsity = 39,
    Breach = 40,
}

export type Enchantments = EnchantmentNames | Enchant.Type;

@nativeClass()
export class EnchantmentInstance extends NativeStruct {
    @nativeField(uint8_t)
    type: Enchantments;
    @nativeField(int32_t)
    level: int32_t;
}

@nativeClass()
export class ItemEnchants extends NativeClass {
    @nativeField(uint32_t)
    slot: uint32_t;
    @nativeField(CxxVector.make(EnchantmentInstance), 0x08)
    /** 0-8, 25, 36-37 */
    enchants1: CxxVector<EnchantmentInstance>;
    /** 9-18, 21, 23, 29 */
    @nativeField(CxxVector.make(EnchantmentInstance))
    enchants2: CxxVector<EnchantmentInstance>;
    /** 12, 15, 19-20, 22, 24, 26, 27-28, 30-35 */
    @nativeField(CxxVector.make(EnchantmentInstance))
    enchants3: CxxVector<EnchantmentInstance>;
}

export namespace EnchantUtils {
    export function applyEnchant(itemStack: ItemStack, enchant: Enchantments, level: number, allowUnsafe: boolean): boolean {
        abstract();
    }
    export function getEnchantLevel(enchant: Enchantments, itemStack: ItemStack): number {
        abstract();
    }
    export function hasCurse(itemStack: ItemStack): boolean {
        abstract();
    }
    export function hasEnchant(enchant: Enchantments, itemStack: ItemStack): boolean {
        abstract();
    }
}
