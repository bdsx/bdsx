import { MobEffectIds } from "../bds/effects";
import { bool_t, CxxString, float32_t, int32_t, uint32_t } from "../nativetype";
declare module "../minecraft" {
    interface MobEffect {
        id: uint32_t;
        harmful: bool_t;
        descriptionId: CxxString;
        icon: int32_t;
        durationModifier: float32_t;
        disabled: bool_t;
        resourceName: CxxString;
        iconName: CxxString;
        showParticles: bool_t;
        componentName: HashedString;
        getId(): number;
    }
    namespace MobEffect {
        function create(id: MobEffectIds): MobEffect;
    }
}
