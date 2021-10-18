import { float32_t } from "../nativetype";
declare module "../minecraft" {
    interface Vec2 {
        x: float32_t;
        y: float32_t;
        toJSON(): {
            x: number;
            y: number;
        };
    }
    namespace Vec2 {
        function create(x: number, y: number): Vec2;
    }
}
