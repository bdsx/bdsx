import { abstract } from "../common";
import { VoidPointer } from "../core";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { float32_t, uint32_t } from "../nativetype";

// public: static class Attribute const
export enum AttributeId {
    /** @deprecated deleted */
    ZombieSpawnReinforcementsChange = -1,
    PlayerHunger = 1,
    PlayerSaturation = 2,
    PlayerExhaustion = 3,
    PlayerLevel = 4,
    PlayerExperience = 5,
    Health = 6,
    FollowRange = 7,
    KnockbackResistance = 8,
    MovementSpeed = 9,
    UnderwaterMovementSpeed = 10,
    LavaMovementSpeed = 11,
    AttackDamage = 12,
    Absorption = 13,
    Luck = 14,
    JumpStrength = 15, // for horse?
}

export class AttributeInstance extends AbstractClass {
    vftable: VoidPointer;
    u1: VoidPointer;
    u2: VoidPointer;
    currentValue: float32_t;
    minValue: float32_t;
    maxValue: float32_t;
    defaultValue: float32_t;
}
export class BaseAttributeMap extends AbstractClass {
    getMutableInstance(type: AttributeId): AttributeInstance | null {
        abstract();
    }
}
@nativeClass()
export class AttributeInstanceHandle extends AbstractClass {
    @nativeField(uint32_t)
    attributeId: AttributeId;
    @nativeField(BaseAttributeMap.ref(), 0x08)
    attributeMap: BaseAttributeMap;
}
