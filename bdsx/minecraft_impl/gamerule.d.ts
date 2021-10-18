import { bool_t, float32_t, int32_t } from "../nativetype";
declare module "../minecraft" {
    namespace GameRule {
        interface Value {
            boolVal: bool_t;
            intVal: int32_t;
            floatVal: float32_t;
        }
    }
}
