// enums but not found in BDS symbols

export enum PistonAction {
    Extend = 1,
    Retract = 3,
}

export enum DimensionId { // int32_t
    Overworld = 0,
    Nether = 1,
    TheEnd = 2
}

export enum AttributeName {
	ZombieSpawnReinforcementsChange="minecraft:zombie.spawn.reinforcements",
	PlayerHunger="minecraft:player.hunger",
	PlayerSaturation="minecraft:player.saturation",
	PlayerExhaustion="minecraft:player.exhaustion",
	PlayerLevel="minecraft:player.level",
	PlayerExperience="minecraft:player.experience",
	Health="minecraft:health",
	FollowRange="minecraft:follow_range",
	KnockbackResistance="minecraft:knockback_registance",
	MovementSpeed="minecraft:movement",
	UnderwaterMovementSpeed="minecraft:underwater_movement",
	AttackDamage="minecraft:attack_damage",
	Absorption="minecraft:absorption",
	Luck="minecraft:luck",
	JumpStrength="minecraft:horse.jump_strength",
}

// https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/types/DeviceOS.php
export enum DeviceOS {
	UNKNOWN = -1,
	ANDROID = 1,
	IOS = 2,
	OSX = 3,
	AMAZON = 4,
	GEAR_VR = 5,
	HOLOLENS = 6,
	WINDOWS_10 = 7,
	WIN32 = 8,
	DEDICATED = 9,
	TVOS = 10,
	PLAYSTATION = 11,
	NINTENDO = 12,
	XBOX = 13,
	WINDOWS_PHONE = 14,
}

export enum DisplaySlot {
    BelowName = "belowname",
    List = "list",
    Sidebar = "sidebar",
}
