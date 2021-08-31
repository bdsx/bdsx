import { MobEffectIds } from "../bds/effects";
import { HashedString, MobEffect } from "../minecraft";
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

MobEffect.abstract({
    id: [uint32_t, 0x08],
    harmful: bool_t,
    // color: [mce.Color, 0x10],
    descriptionId: [CxxString, 0x20],
    icon: int32_t,
    durationModifier: float32_t,
    disabled: bool_t, //0x4
    resourceName: [CxxString, 0x50],
    iconName: CxxString,
    showParticles: bool_t,
    componentName: [HashedString, 0x98],
    // nativeField: [VoidPointer, 0xF8], // std::vector<std::pair<Attribute const*,std::shared_ptr<AttributeModifier>>>
});
