import { float32_t } from "../nativetype";
declare module "../minecraft" {
    interface Vec3 {
        x: float32_t;
        y: float32_t;
        z: float32_t;
        toJSON(): VectorXYZ;
    }
    namespace Vec3 {
        function create(x: number, y: number, z: number): Vec3;
    }
}
