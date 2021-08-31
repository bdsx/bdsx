import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { int32_t, void_t } from "../nativetype";
import { JsonValue } from "./connreq";

@nativeClass(null)
export class ProjectileComponent extends NativeClass {
    // @nativeField(bool_t)
    // wasOnGround: bool_t;
    // @nativeField(bool_t)
    // noPhysics: bool_t;
    // @nativeField(ActorUniqueID, 0x08)
    // ownerId: ActorUniqueID;
    // @nativeField(Vec3)
    // thrownPos: Vec3;
    // @nativeField(Vec3)
    // apexPos: Vec3;

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
export class OnHitSubcomponent extends NativeClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;

    readfromJSON(json:JsonValue):void_t {
        abstract();
    }
    writetoJSON(json:JsonValue):void_t {
        abstract();
    }
    protected _getName():StaticPointer {
        abstract();
    }
    getName():string {
        return this._getName().getString();
    }
}

@nativeClass(null)
export class SplashPotionEffectSubcomponent extends OnHitSubcomponent {
    @nativeField(int32_t)
    potionEffect: int32_t;
}
