import { MobEffectIds } from "../enums";
import { bool_t, int32_t } from "../nativetype";
declare module "../minecraft" {
    interface MobEffectInstance {
        id: MobEffectIds;
        duration: int32_t;
        durationEasy: int32_t;
        durationNormal: int32_t;
        durationHard: int32_t;
        amplifier: int32_t;
        displayAnimation: bool_t;
        ambient: bool_t;
        noCounter: bool_t;
        showParticles: bool_t;
        constructWith(id: MobEffectIds): void;
        constructWith(id: MobEffectIds, duration: int32_t): void;
        constructWith(id: MobEffectIds, duration: int32_t, amplifier: int32_t): void;
        constructWith(id: MobEffectIds, duration: int32_t, amplifier: int32_t, ambient: bool_t, showParticles: bool_t, displayAnimation: bool_t): void;
        constructWith(id: MobEffectIds, duration: int32_t, durationEasy: int32_t, durationNormal: int32_t, durationHard: int32_t, amplifier: int32_t, ambient: bool_t, showParticles: bool_t, displayAnimation: bool_t): void;
    }
}
