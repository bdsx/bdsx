import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { bool_t, int32_t, void_t } from "../nativetype";
import type { Actor, ActorDefinitionIdentifier, ActorUniqueID, ItemActor, Mob } from "./actor";
import { Vec3 } from "./blockpos";
import { JsonValue } from "./connreq";
import type { ItemStack } from "./inventory";
import { CompoundTag } from "./nbt";

/**
 * defines physics properties of an entity, including if it is affected by gravity or if it collides with objects.
 */
@nativeClass(null)
export class PhysicsComponent extends AbstractClass {
    setHasCollision(actor: Actor, bool: boolean): void {
        abstract();
    }
    setAffectedByGravity(actorData: SyncedActorDataComponent, bool: boolean): void {
        abstract();
    }
}

@nativeClass(null)
export class SyncedActorDataComponent extends AbstractClass {}
/**
 * allows the entity to be a thrown entity.
 */
@nativeClass(null)
export class ProjectileComponent extends AbstractClass {
    public static identifier = "minecraft:projectile";
    shoot(projectile: Actor, shooter: Actor): void {
        abstract();
    }
    setOwnerId(uniqueId: ActorUniqueID): void {
        abstract();
    }
    // @nativeField(bool_t)
    // wasOnGround: bool_t;
    // @nativeField(bool_t)
    // noPhysics: bool_t;
    // @nativeField(ActorUniqueID, 0x08)
    // ownerId: ActorUniqueID;
    // @nativeField(Vec3)
    // readonly thrownPos: Vec3;
    // @nativeField(Vec3)
    // readonly apexPos: Vec3;
    /* TODO
        ProjectileComponent::getShooterAngle
        ProjectileComponent::getIsDangerous
        ProjectileComponent::getUncertaintyMultiplier
        ProjectileComponent::getAnchor
        ProjectileComponent::getShootTarget
        ProjectileComponent::getUncertainty
        ProjectileComponent::getGravity
        ProjectileComponent::getShootSound
        ProjectileComponent::getThrowPower
        ProjectileComponent::getUncertaintyBase
        ProjectileComponent::getCatchFire
        ProjectileComponent::getKnockbackForce
        ProjectileComponent::getOffset
        ProjectileComponent::getNoPhysics
        ProjectileComponent::getEnchantChanneling
    */
}

@nativeClass(0x08)
export class OnHitSubcomponent extends AbstractClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;

    readfromJSON(json: JsonValue): void_t {
        abstract();
    }
    writetoJSON(json: JsonValue): void_t {
        abstract();
    }
    protected _getName(): StaticPointer {
        abstract();
    }
    getName(): string {
        return this._getName().getString();
    }
}

@nativeClass(null)
export class SplashPotionEffectSubcomponent extends OnHitSubcomponent {
    @nativeField(int32_t)
    potionEffect: int32_t;
}

@nativeClass(null)
export class HitResult extends AbstractClass {
    getEntity(): Actor | null {
        abstract();
    }
}
/**
 * defines what events to initiate when the entity is damaged by specific entities or items.
 */
@nativeClass(null)
export class DamageSensorComponent extends AbstractClass {
    isFatal(): boolean {
        abstract();
    }
    getDamageModifier(): number {
        abstract();
    }
}
/**
 * maybe used for command block minecart.
 */
@nativeClass(null)
export class CommandBlockComponent extends AbstractClass {
    addAdditionalSaveData(tag: CompoundTag): void {
        abstract();
    }
    getTicking(): boolean {
        abstract();
    }
    setTicking(bool: boolean): void {
        abstract();
    }
    resetCurrentTicking(): void {
        abstract();
    }
}
/**
 * allows the entity to be named (e.g. using a name tag).
 */
@nativeClass(null)
export class NameableComponent extends AbstractClass {
    nameEntity(actor: Actor, name: string): void {
        abstract();
    }
}
/**
 * minecraft:navigation.climb, minecraft:navigation.float, minecraft:navigation.fly, minecraft:navigation.generic, minecraft:navigation.hover, minecraft:navigation.swim, and minecraft:navigation.walk belong.
 */
@nativeClass(null)
export class NavigationComponent extends AbstractClass {
    protected _createPath(component: NavigationComponent, actor: Actor, target: Actor | Vec3): Path {
        abstract();
    }
    createPath(actor: Actor, target: Actor): Path;
    createPath(actor: Actor, target: Vec3): Path;
    createPath(actor: Actor, target: Actor | Vec3): Path {
        return this._createPath(this, actor, target);
    }
    setPath(path: Path): void {
        abstract();
    }
    stop(mob: Mob): void {
        abstract();
    }
    getMaxDistance(actor: Actor): number {
        abstract();
    }
    getSpeed(): number {
        abstract();
    }
    getAvoidSun(): boolean {
        abstract();
    }
    getCanFloat(): boolean {
        abstract();
    }
    getCanPathOverLava(): boolean {
        abstract();
    }
    getLastStuckCheckPosition(): Vec3 {
        abstract();
    }
    isDone(): boolean {
        abstract();
    }
    isStuck(int: number): boolean {
        abstract();
    }
    setAvoidWater(bool: boolean): void {
        abstract();
    }
    setAvoidSun(bool: boolean): void {
        abstract();
    }
    setCanFloat(bool: boolean): void {
        abstract();
    }
    setSpeed(speed: number): void {
        abstract();
    }
}
@nativeClass(null)
export class Path extends AbstractClass {}
/**
 * Allows the NPC to use the POI
 */
@nativeClass(null)
export class NpcComponent extends AbstractClass {}
/**
 * determines whether the entity can be ridden.
 */
@nativeClass(null)
export class RideableComponent extends AbstractClass {
    areSeatsFull(ride: Actor): boolean {
        abstract();
    }
    canAddPassenger(ride: Actor, rider: Actor): boolean {
        abstract();
    }
    pullInEntity(ride: Actor, rider: Actor): boolean {
        abstract();
    }
}
/**
 * Defines this entity's inventory properties.
 */
@nativeClass(null)
export class ContainerComponent extends AbstractClass {
    addItem(item: ItemActor): boolean;
    addItem(item: ItemStack, count?: number, data?: number): boolean;
    addItem(item: ItemStack | ItemActor, count?: number, data?: number): boolean {
        return this._addItem(item, count, data);
    }

    protected _addItem(item: ItemStack | ItemActor, count?: number, data: number = 0): boolean {
        abstract();
    }

    getEmptySlotsCount(): number {
        abstract();
    }

    getSlots(): CxxVector<ItemStack> {
        abstract();
    }
}
/**
 * defines what can push an entity between other entities and pistons.
 */
@nativeClass(null)
export class PushableComponent extends AbstractClass {
    push(actor: Actor, pos: Vec3): void;
    push(actor: Actor, actor2: Actor, bool: boolean): void;
    push(actor: Actor, arg2: Vec3 | Actor, arg3?: bool_t): void {
        this._push(actor, arg2, arg3);
    }
    protected _push(actor: Actor, arg2: Vec3 | Actor, arg3?: bool_t): void {
        abstract();
    }
}
/**
 * defines the entity's ranged attack behavior.
 */
@nativeClass(null)
export class ShooterComponent extends AbstractClass {
    shootProjectile(projectile: Actor, defi: ActorDefinitionIdentifier, power: number): void {
        abstract();
    }
}
/**
 * defines the Conditional Spatial Update Bandwidth Optimizations of this entity.
 */
@nativeClass(null)
export class ConditionalBandwidthOptimizationComponent extends AbstractClass {}
//; struct ConditionalBandwidthOptimization __stdcall __high ConditionalBandwidthOptimizationComponent::getCurrentOptimizationValues(struct Actor *)
//; void __fastcall ConditionalBandwidthOptimizationComponent::initFromDefinition(ConditionalBandwidthOptimizationComponent *__hidden this, struct Actor *, const struct ConditionalBandwidthOptimizationDefinition *)
