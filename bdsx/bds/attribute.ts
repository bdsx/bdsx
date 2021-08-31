
import minecraft = require('../minecraft');

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
	KnockbackResistance=9,
	MovementSpeed=10,
	UnderwaterMovementSpeed=11,
	AttackDamage=12,
	Absorption=13,
	Luck=14,
	JumpStrength=15, // for horse?
}

/** @deprecated import it from bdsx/minecraft */
export const AttributeInstance = minecraft.AttributeInstance;
/** @deprecated import it from bdsx/minecraft */
export type AttributeInstance = minecraft.AttributeInstance;

/** @deprecated import it from bdsx/minecraft */
export const BaseAttributeMap = minecraft.BaseAttributeMap;
/** @deprecated import it from bdsx/minecraft */
export type BaseAttributeMap = minecraft.BaseAttributeMap;
