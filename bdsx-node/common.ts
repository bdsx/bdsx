
export interface CANCEL{ 
    __CANCEL_OBJECT__?:void;
    toString():'CANCEL';
}

export const CANCEL:CANCEL = {toString(){ return 'CANCEL'; }};

export enum DimensionId
{
	Overworld,
	Nether,
	TheEnd,
}

export enum AttributeId
{
	ZombieSpawnReinforcementsChange=1,
	PlayerHunger=2,
	PlayerSaturation=3,
	PlayerExhaustion=4,
	PlayerLevel=5,
	PlayerExperience=6,
	Health=7,
	FollowRange=8,
	KnockbackRegistance=9,
	MovementSpeed=10,
	UnderwaterMovementSpeed=11,
	AttackDamage=12,
	Absorption=13,
	Luck=14,
	JumpStrength=15, // for horse?
};

export enum AttributeName
{
	ZombieSpawnReinforcementsChange="minecraft:zombie.spawn.reinforcements",
	PlayerHunger="minecraft:player.hunger",
	PlayerSaturation="minecraft:player.saturation",
	PlayerExhaustion="minecraft:player.exhaustion",
	PlayerLevel="minecraft:player.level",
	PlayerExperience="minecraft:player.experience",
	Health="minecraft:health",
	FollowRange="minecraft:follow_range",
	KnockbackRegistance="minecraft:knockback_registance",
	MovementSpeed="minecraft:movement",
	UnderwaterMovementSpeed="minecraft:underwater_movement",
	AttackDamage="minecraft:attack_damage",
	Absorption="minecraft:absorption",
	Luck="minecraft:luck",
	JumpStrength="minecraft:horse.jump_strength",
};

export enum Encoding
{
	Utf16=-2,
	Buffer=-1,
	Utf8=0,
	None,
	Ansi,
	EucKr,
}

export type TypeFromEncoding<T extends Encoding> = T extends Encoding.Buffer ? Uint8Array : string;

export type Bufferable = Uint8Array | Uint16Array | Uint32Array |
    Uint8ClampedArray | Int8Array | Int16Array | Int32Array |
    Float32Array | Float64Array | ArrayBuffer | DataView;
