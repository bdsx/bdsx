import { ItemStack } from "./inventory";
import { abstract } from "../common";

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
    SoulSpeed = 36
}

export type Enchantments = EnchantmentNames | Enchant.Type;

export class EnchantUtils {
    static applyEnchant(itemstack:ItemStack, enchant:Enchantments, level:number, isUnsafe:boolean):boolean{
        abstract();
    }
    static getEnchantLevel(enchant:Enchantments, itemstack:ItemStack):number{
        abstract();
    }
    static hasEnchant(enchant:Enchantments, itemstack:ItemStack):boolean{
        abstract();
    }

}
