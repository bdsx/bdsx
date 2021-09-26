// import { abstract } from "../common";
// import { nativeClass, NativeClass, nativeField } from "../nativeclass";
// import { bool_t, int32_t, NativeType, uint32_t, void_t } from "../nativetype";
// import { procHacker } from "./proc";

import { abstract } from "../common";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, float32_t, int32_t, uint32_t } from "../nativetype";
import { HashedString } from "./hashedstring";
import { CompoundTag, TagPointer } from "./nbt";

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

@nativeClass(null)
export class MobEffect extends NativeClass {
    @nativeField(uint32_t, 0x08)
    id: uint32_t;
    @nativeField(bool_t)
    harmful: bool_t;
    // @nativeField(mce.Color, 0x10)
    // color: mce.Color;
    @nativeField(CxxString, 0x20)
    descriptionId: CxxString;
    @nativeField(int32_t)
    icon: int32_t;
    @nativeField(float32_t)
    durationModifier: float32_t;
    @nativeField(bool_t) //0x48
    disabled: bool_t;
    @nativeField(CxxString, 0x50)
    resourceName: CxxString;
    @nativeField(CxxString)
    iconName: CxxString;
    @nativeField(bool_t)
    showParticles: bool_t;
    @nativeField(HashedString, 0x98)
    componentName: HashedString;
    // @nativeField(VoidPointer, 0xF8) // std::vector<std::pair<Attribute const*,std::shared_ptr<AttributeModifier>>>
    // attributeModifiers: CxxVector<CxxPair<Attribute.ref(), SharedPtr<AttributeModifier>>;


    static create(id: MobEffectIds): MobEffect {
        abstract();
    }
    getId(): number {
        abstract();
    }
}

@nativeClass(0x80)
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
        effect._create(id, duration, amplifier, ambient, showParticles, displayAnimation);
        return effect;
    }

    protected _create(id: MobEffectIds, duration: number, amplifier: number, ambient: boolean, showParticles: boolean, displayAnimation: boolean): void {
        abstract();
    }
    protected _save(ptr: TagPointer): TagPointer {
        abstract();
    }

    getSplashDuration(): number {
        return this.duration * 0.75;
    }
    getLingerDuration(): number {
        return this.duration * 0.25;
    }
    save(tag: CompoundTag): void {
        const ptr = new TagPointer(true);
        ptr.value = tag;
        this._save(ptr);
        tag.construct(ptr.value as CompoundTag);
        ptr.value.destruct();
        ptr.destruct();
    }
    constructAndSave(): CompoundTag {
        const tag = CompoundTag.constructWith({});
        this.save(tag);
        return tag;
    }
    load(tag: CompoundTag): MobEffectInstance {
        abstract();
    }
}
