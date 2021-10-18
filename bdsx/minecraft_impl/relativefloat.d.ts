import { bin64_t, bool_t, float32_t } from "../nativetype";
declare module "../minecraft" {
    interface RelativeFloat {
        value: float32_t;
        is_relative: bool_t;
        bin_value: bin64_t;
    }
    namespace RelativeFloat {
        function create(value: number, is_relative: boolean): RelativeFloat;
    }
}
