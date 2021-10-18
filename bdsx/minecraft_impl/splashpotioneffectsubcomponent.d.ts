import { int32_t } from "../nativetype";
import "./onhitsubcomponent";
declare module "../minecraft" {
    interface SplashPotionEffectSubcomponent extends OnHitSubcomponent {
        potionEffect: int32_t;
    }
}
