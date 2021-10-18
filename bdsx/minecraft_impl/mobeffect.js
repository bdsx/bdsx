"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.MobEffect.abstract({
    id: [nativetype_1.uint32_t, 0x08],
    harmful: nativetype_1.bool_t,
    // color: [mce.Color, 0x10],
    descriptionId: [nativetype_1.CxxString, 0x20],
    icon: nativetype_1.int32_t,
    durationModifier: nativetype_1.float32_t,
    disabled: nativetype_1.bool_t,
    resourceName: [nativetype_1.CxxString, 0x50],
    iconName: nativetype_1.CxxString,
    showParticles: nativetype_1.bool_t,
    componentName: [minecraft_1.HashedString, 0x98],
    // nativeField: [VoidPointer, 0xF8], // std::vector<std::pair<Attribute const*,std::shared_ptr<AttributeModifier>>>
});
//# sourceMappingURL=mobeffect.js.map