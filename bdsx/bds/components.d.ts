import { StaticPointer, VoidPointer } from "../core";
import { NativeClass } from "../nativeclass";
import { int32_t, void_t } from "../nativetype";
import { JsonValue } from "./connreq";
export declare class ProjectileComponent extends NativeClass {
}
/** @deprecated */
export declare class OnHitSubcomponent extends NativeClass {
    vftable: VoidPointer;
    readfromJSON(json: JsonValue): void_t;
    writetoJSON(json: JsonValue): void_t;
    protected _getName(): StaticPointer;
    getName(): string;
}
/** @deprecated */
export declare class SplashPotionEffectSubcomponent extends OnHitSubcomponent {
    potionEffect: int32_t;
}
