import { int32_t, uint32_t } from "../nativetype";
declare module "../minecraft" {
    interface BlockPos {
        x: int32_t;
        y: uint32_t;
        z: int32_t;
        toJSON(): VectorXYZ;
    }
    namespace BlockPos {
        function create(x: number, y: number, z: number): BlockPos;
    }
}
