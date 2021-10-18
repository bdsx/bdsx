"use strict";
// enums but not found in BDS symbols
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplaySlot = exports.DeviceOS = exports.ContainerId = exports.AttributeName = exports.MobEffectIds = exports.AttributeId = exports.DimensionId = exports.PistonAction = void 0;
const minecraft = require("./minecraft");
require("./minecraft_impl/enums");
var PistonAction;
(function (PistonAction) {
    PistonAction[PistonAction["Extend"] = 1] = "Extend";
    PistonAction[PistonAction["Retract"] = 3] = "Retract";
})(PistonAction = exports.PistonAction || (exports.PistonAction = {}));
exports.DimensionId = minecraft.DimensionId;
var AttributeId;
(function (AttributeId) {
    AttributeId[AttributeId["ZombieSpawnReinforcementsChange"] = 1] = "ZombieSpawnReinforcementsChange";
    AttributeId[AttributeId["PlayerHunger"] = 2] = "PlayerHunger";
    AttributeId[AttributeId["PlayerSaturation"] = 3] = "PlayerSaturation";
    AttributeId[AttributeId["PlayerExhaustion"] = 4] = "PlayerExhaustion";
    AttributeId[AttributeId["PlayerLevel"] = 5] = "PlayerLevel";
    AttributeId[AttributeId["PlayerExperience"] = 6] = "PlayerExperience";
    AttributeId[AttributeId["Health"] = 7] = "Health";
    AttributeId[AttributeId["FollowRange"] = 8] = "FollowRange";
    AttributeId[AttributeId["KnockbackResistance"] = 9] = "KnockbackResistance";
    AttributeId[AttributeId["MovementSpeed"] = 10] = "MovementSpeed";
    AttributeId[AttributeId["UnderwaterMovementSpeed"] = 11] = "UnderwaterMovementSpeed";
    AttributeId[AttributeId["AttackDamage"] = 12] = "AttackDamage";
    AttributeId[AttributeId["Absorption"] = 13] = "Absorption";
    AttributeId[AttributeId["Luck"] = 14] = "Luck";
    AttributeId[AttributeId["JumpStrength"] = 15] = "JumpStrength";
})(AttributeId = exports.AttributeId || (exports.AttributeId = {}));
var MobEffectIds;
(function (MobEffectIds) {
    MobEffectIds[MobEffectIds["Empty"] = 0] = "Empty";
    MobEffectIds[MobEffectIds["Speed"] = 1] = "Speed";
    MobEffectIds[MobEffectIds["Slowness"] = 2] = "Slowness";
    MobEffectIds[MobEffectIds["Haste"] = 3] = "Haste";
    MobEffectIds[MobEffectIds["MiningFatigue"] = 4] = "MiningFatigue";
    MobEffectIds[MobEffectIds["Strength"] = 5] = "Strength";
    MobEffectIds[MobEffectIds["InstantHealth"] = 6] = "InstantHealth";
    MobEffectIds[MobEffectIds["InstantDamage"] = 7] = "InstantDamage";
    MobEffectIds[MobEffectIds["JumpBoost"] = 8] = "JumpBoost";
    MobEffectIds[MobEffectIds["Nausea"] = 9] = "Nausea";
    MobEffectIds[MobEffectIds["Regeneration"] = 10] = "Regeneration";
    MobEffectIds[MobEffectIds["Resistance"] = 11] = "Resistance";
    MobEffectIds[MobEffectIds["FireResistant"] = 12] = "FireResistant";
    MobEffectIds[MobEffectIds["WaterBreathing"] = 13] = "WaterBreathing";
    MobEffectIds[MobEffectIds["Invisibility"] = 14] = "Invisibility";
    MobEffectIds[MobEffectIds["Blindness"] = 15] = "Blindness";
    MobEffectIds[MobEffectIds["NightVision"] = 16] = "NightVision";
    MobEffectIds[MobEffectIds["Hunger"] = 17] = "Hunger";
    MobEffectIds[MobEffectIds["Weakness"] = 18] = "Weakness";
    MobEffectIds[MobEffectIds["Poison"] = 19] = "Poison";
    MobEffectIds[MobEffectIds["Wither"] = 20] = "Wither";
    MobEffectIds[MobEffectIds["HealthBoost"] = 21] = "HealthBoost";
    MobEffectIds[MobEffectIds["Absorption"] = 22] = "Absorption";
    MobEffectIds[MobEffectIds["Saturation"] = 23] = "Saturation";
    MobEffectIds[MobEffectIds["Levitation"] = 24] = "Levitation";
    MobEffectIds[MobEffectIds["FatalPoison"] = 25] = "FatalPoison";
    MobEffectIds[MobEffectIds["ConduitPower"] = 26] = "ConduitPower";
    MobEffectIds[MobEffectIds["SlowFalling"] = 27] = "SlowFalling";
    MobEffectIds[MobEffectIds["BadOmen"] = 28] = "BadOmen";
    MobEffectIds[MobEffectIds["HeroOfTheVillage"] = 29] = "HeroOfTheVillage";
})(MobEffectIds = exports.MobEffectIds || (exports.MobEffectIds = {}));
var AttributeName;
(function (AttributeName) {
    AttributeName["ZombieSpawnReinforcementsChange"] = "minecraft:zombie.spawn.reinforcements";
    AttributeName["PlayerHunger"] = "minecraft:player.hunger";
    AttributeName["PlayerSaturation"] = "minecraft:player.saturation";
    AttributeName["PlayerExhaustion"] = "minecraft:player.exhaustion";
    AttributeName["PlayerLevel"] = "minecraft:player.level";
    AttributeName["PlayerExperience"] = "minecraft:player.experience";
    AttributeName["Health"] = "minecraft:health";
    AttributeName["FollowRange"] = "minecraft:follow_range";
    AttributeName["KnockbackResistance"] = "minecraft:knockback_registance";
    AttributeName["MovementSpeed"] = "minecraft:movement";
    AttributeName["UnderwaterMovementSpeed"] = "minecraft:underwater_movement";
    AttributeName["AttackDamage"] = "minecraft:attack_damage";
    AttributeName["Absorption"] = "minecraft:absorption";
    AttributeName["Luck"] = "minecraft:luck";
    AttributeName["JumpStrength"] = "minecraft:horse.jump_strength";
})(AttributeName = exports.AttributeName || (exports.AttributeName = {}));
/**
 * Values from 1 to 100 are for a player's container counter.
 */
var ContainerId;
(function (ContainerId) {
    ContainerId[ContainerId["Inventory"] = 0] = "Inventory";
    /** Used as the minimum value of a player's container counter. */
    ContainerId[ContainerId["First"] = 1] = "First";
    /** Used as the maximum value of a player's container counter. */
    ContainerId[ContainerId["Last"] = 100] = "Last";
    /** Used in InventoryContentPacket */
    ContainerId[ContainerId["Offhand"] = 119] = "Offhand";
    /** Used in InventoryContentPacket */
    ContainerId[ContainerId["Armor"] = 120] = "Armor";
    /** Used in InventoryContentPacket */
    ContainerId[ContainerId["Creative"] = 121] = "Creative";
    /**
     * @deprecated
     */
    ContainerId[ContainerId["Hotbar"] = 122] = "Hotbar";
    /**
     * @deprecated
     */
    ContainerId[ContainerId["FixedInventory"] = 123] = "FixedInventory";
    /** Used in InventoryContentPacket */
    ContainerId[ContainerId["UI"] = 124] = "UI";
    ContainerId[ContainerId["None"] = 255] = "None";
})(ContainerId = exports.ContainerId || (exports.ContainerId = {}));
exports.DeviceOS = minecraft.BuildPlatform;
var DisplaySlot;
(function (DisplaySlot) {
    DisplaySlot["BelowName"] = "belowname";
    DisplaySlot["List"] = "list";
    DisplaySlot["Sidebar"] = "sidebar";
})(DisplaySlot = exports.DisplaySlot || (exports.DisplaySlot = {}));
const common = require("./common");
common.AttributeName = AttributeName;
common.DeviceOS = exports.DeviceOS;
//# sourceMappingURL=enums.js.map