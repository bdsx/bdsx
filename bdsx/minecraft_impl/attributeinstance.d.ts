import { VoidPointer } from "../core";
import { float32_t } from "../nativetype";
declare module '../minecraft' {
    interface AttributeInstance {
        vftable: VoidPointer;
        u1: VoidPointer;
        u2: VoidPointer;
        currentValue: float32_t;
        minValue: float32_t;
        maxValue: float32_t;
        defaultValue: float32_t;
    }
}
