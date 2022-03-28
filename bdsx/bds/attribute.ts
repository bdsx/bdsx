
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { float32_t, uint32_t } from "../nativetype";

// public: static class Attribute const
export enum AttributeId {
	PlayerHunger=1,
	PlayerSaturation=2,
	PlayerExhaustion=3,
	PlayerLevel=4,
	PlayerExperience=5,
	ZombieSpawnReinforcementsChange=6,
	Health=7,
	FollowRange=8,
	KnockbackResistance=9,
	MovementSpeed=10,
	UnderwaterMovementSpeed=11,
	LavaMovementSpeed=12,
	AttackDamage=13,
	Absorption=14,
	Luck=15,
	JumpStrength=16, // for horse?
}

export class AttributeInstance extends AbstractClass {
	vftable:VoidPointer;
	u1:VoidPointer;
	u2:VoidPointer;
	currentValue:float32_t;
	minValue:float32_t;
	maxValue:float32_t;
	defaultValue:float32_t;
}
export class BaseAttributeMap extends AbstractClass {
    getMutableInstance(type:AttributeId):AttributeInstance|null {
        abstract();
    }
}
@nativeClass()
export class AttributeInstanceHandle extends AbstractClass {
	@nativeField(uint32_t)
	attributeId:AttributeId;
	@nativeField(BaseAttributeMap.ref(), 0x08)
	attributeMap:BaseAttributeMap;
}
