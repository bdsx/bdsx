
import { abstract } from "../common";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, int32_t, uint32_t } from "../nativetype";
import minecraft = require('../minecraft');

export enum MobEffectIds {
    Empty,
    Speed,
    Slowness,
    Haste,
    MiningFatigue,
    Strength,
    InstantHealth,
    InstantDamage,
    JumpBoost,
    Nausea,
    Regeneration,
    Resistance,
    FireResistant,
    WaterBreathing,
    Invisibility,
    Blindness,
    NightVision,
    Hunger,
    Weakness,
    Poison,
    Wither,
    HealthBoost,
    Absorption,
    Saturation,
    Levitation,
    FatalPoison,
    ConduitPower,
    SlowFalling,
    BadOmen,
    HeroOfTheVillage,
}

export const MobEffect = minecraft.MobEffect;
export type MobEffect = minecraft.MobEffect;

@nativeClass()
export class MobEffectInstance extends NativeClass {
    @nativeField(uint32_t)
    id: uint32_t;
    @nativeField(int32_t)
    duration: int32_t;
    @nativeField(int32_t)
    durationEasy: int32_t;
    @nativeField(int32_t)
    durationNormal: int32_t;
    @nativeField(int32_t)
    durationHard: int32_t;
    @nativeField(int32_t)
    amplifier: int32_t;
    @nativeField(bool_t)
    displayAnimation: bool_t;
    @nativeField(bool_t)
    ambient: bool_t;
    @nativeField(bool_t)
    noCounter: bool_t;
    @nativeField(bool_t)
    showParticles: bool_t;

    /**
     * @param duration How many ticks will the effect last (one tick = 0.05s)
     */
    static create(id: MobEffectIds, duration: number = 600, amplifier: number = 0, ambient: boolean = false, showParticles: boolean = true, displayAnimation: boolean = false): MobEffectInstance {
        const effect = new MobEffectInstance(true);
        (effect as any)._create(id, duration, amplifier, ambient, showParticles, displayAnimation);
        return effect;
    }

    protected _create(id: MobEffectIds, duration: number, amplifier: number, ambient: boolean, showParticles: boolean, displayAnimation: boolean): void {
        abstract();
    }

    getSplashDuration(): number {
        return this.duration * 0.75;
    }
    getLingerDuration(): number {
        return this.duration * 0.25;
    }
}
