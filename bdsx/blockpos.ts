import { float32_t, uint32_t } from "./nativetype";
import { NativeClass } from "./nativeclass";

export class BlockPos extends NativeClass
{
    x:uint32_t;
    y:uint32_t;
    z:uint32_t;
}
BlockPos.define({
    x:uint32_t,
    y:uint32_t,
    z:uint32_t,
});

export class Vec3 extends NativeClass
{
    x:float32_t
    y:float32_t
    z:float32_t;
}
Vec3.define({
    x:float32_t,
    y:float32_t,
    z:float32_t,
});