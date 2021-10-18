import { NativeClass } from "../nativeclass";
import { bool_t, int32_t, uint32_t } from "../nativetype";
import minecraft = require('../minecraft');
import enums = require('../enums');
/** @deprecated import it from bdsx/enums */
export declare const MobEffectIds: typeof enums.MobEffectIds;
/** @deprecated import it from bdsx/enums */
export declare type MobEffectIds = enums.MobEffectIds;
/** @deprecated import it from bdsx/minecraft */
export declare const MobEffect: typeof minecraft.MobEffect;
/** @deprecated import it from bdsx/minecraft */
export declare type MobEffect = minecraft.MobEffect;
export declare class MobEffectInstance extends NativeClass {
    id: uint32_t;
    duration: int32_t;
    durationEasy: int32_t;
    durationNormal: int32_t;
    durationHard: int32_t;
    amplifier: int32_t;
    displayAnimation: bool_t;
    ambient: bool_t;
    noCounter: bool_t;
    showParticles: bool_t;
    /**
     * @param duration How many ticks will the effect last (one tick = 0.05s)
     */
    static create(id: MobEffectIds, duration?: number, amplifier?: number, ambient?: boolean, showParticles?: boolean, displayAnimation?: boolean): MobEffectInstance;
    protected _create(id: MobEffectIds, duration: number, amplifier: number, ambient: boolean, showParticles: boolean, displayAnimation: boolean): void;
    getSplashDuration(): number;
    getLingerDuration(): number;
}
