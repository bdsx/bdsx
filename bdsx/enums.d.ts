import './minecraft_impl/enums';
export declare enum PistonAction {
    Extend = 1,
    Retract = 3
}
export declare enum AttributeId {
    ZombieSpawnReinforcementsChange = 1,
    PlayerHunger = 2,
    PlayerSaturation = 3,
    PlayerExhaustion = 4,
    PlayerLevel = 5,
    PlayerExperience = 6,
    Health = 7,
    FollowRange = 8,
    KnockbackResistance = 9,
    MovementSpeed = 10,
    UnderwaterMovementSpeed = 11,
    AttackDamage = 12,
    Absorption = 13,
    Luck = 14,
    JumpStrength = 15
}
export declare enum MobEffectIds {
    Empty = 0,
    Speed = 1,
    Slowness = 2,
    Haste = 3,
    MiningFatigue = 4,
    Strength = 5,
    InstantHealth = 6,
    InstantDamage = 7,
    JumpBoost = 8,
    Nausea = 9,
    Regeneration = 10,
    Resistance = 11,
    FireResistant = 12,
    WaterBreathing = 13,
    Invisibility = 14,
    Blindness = 15,
    NightVision = 16,
    Hunger = 17,
    Weakness = 18,
    Poison = 19,
    Wither = 20,
    HealthBoost = 21,
    Absorption = 22,
    Saturation = 23,
    Levitation = 24,
    FatalPoison = 25,
    ConduitPower = 26,
    SlowFalling = 27,
    BadOmen = 28,
    HeroOfTheVillage = 29
}
export declare enum AttributeName {
    ZombieSpawnReinforcementsChange = "minecraft:zombie.spawn.reinforcements",
    PlayerHunger = "minecraft:player.hunger",
    PlayerSaturation = "minecraft:player.saturation",
    PlayerExhaustion = "minecraft:player.exhaustion",
    PlayerLevel = "minecraft:player.level",
    PlayerExperience = "minecraft:player.experience",
    Health = "minecraft:health",
    FollowRange = "minecraft:follow_range",
    KnockbackResistance = "minecraft:knockback_registance",
    MovementSpeed = "minecraft:movement",
    UnderwaterMovementSpeed = "minecraft:underwater_movement",
    AttackDamage = "minecraft:attack_damage",
    Absorption = "minecraft:absorption",
    Luck = "minecraft:luck",
    JumpStrength = "minecraft:horse.jump_strength"
}
/**
 * Values from 1 to 100 are for a player's container counter.
 */
export declare enum ContainerId {
    Inventory = 0,
    /** Used as the minimum value of a player's container counter. */
    First = 1,
    /** Used as the maximum value of a player's container counter. */
    Last = 100,
    /** Used in InventoryContentPacket */
    Offhand = 119,
    /** Used in InventoryContentPacket */
    Armor = 120,
    /** Used in InventoryContentPacket */
    Creative = 121,
    /**
     * @deprecated
     */
    Hotbar = 122,
    /**
     * @deprecated
     */
    FixedInventory = 123,
    /** Used in InventoryContentPacket */
    UI = 124,
    None = 255
}
export declare enum DisplaySlot {
    BelowName = "belowname",
    List = "list",
    Sidebar = "sidebar"
}
export declare enum CommandCheatFlag {
    Cheat = 0,
    NotCheat = 64,
    /** @deprecated */
    NoCheat = 64,
    None = 0
}
export declare enum CommandExecuteFlag {
    Allowed = 0,
    Disallowed = 16
}
export declare enum CommandSyncFlag {
    Synced = 0,
    Local = 8
}
export declare enum CommandTypeFlag {
    None = 0,
    Message = 32
}
export declare enum CommandUsageFlag {
    Normal = 0,
    Test = 1,
    /** @deprecated Use CommandVisibilityFlag */
    Hidden = 2,
    _Unknown = 128
}
/** Putting in flag1 or flag2 are both ok, you can also combine with other flags like CommandCheatFlag.NoCheat | CommandVisibilityFlag.HiddenFromCommandBlockOrigin but combining is actually not quite useful */
export declare enum CommandVisibilityFlag {
    Visible = 0,
    /** Bug: Besides from being hidden from command blocks, players cannot see it also well, but they are still able to execute */
    HiddenFromCommandBlockOrigin = 2,
    HiddenFromPlayerOrigin = 4,
    /** Still visible to console */
    Hidden = 6
}
