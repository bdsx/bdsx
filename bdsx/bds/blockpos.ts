import { NativeClass } from "../nativeclass";
import { float32_t, int32_t, uint32_t } from "../nativetype";

export class BlockPos extends NativeClass {
    x:int32_t;
    y:uint32_t;
    z:int32_t;
}
BlockPos.define({
    x:int32_t,
    y:uint32_t,
    z:int32_t,
});

export class Vec3 extends NativeClass {
    x:float32_t;
    y:float32_t;
    z:float32_t;
}
Vec3.define({
    x:float32_t,
    y:float32_t,
    z:float32_t,
});