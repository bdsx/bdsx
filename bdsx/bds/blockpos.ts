import { nativeField, nativeClass, NativeClass } from "../nativeclass";
import { float32_t, int32_t, uint32_t } from "../nativetype";

@nativeClass()
export class BlockPos extends NativeClass {
    @nativeField(int32_t)
    x:int32_t;
    @nativeField(uint32_t)
    y:uint32_t;
    @nativeField(int32_t)
    z:int32_t;
}

@nativeClass()
export class Vec3 extends NativeClass {
    @nativeField(float32_t)
    x:float32_t;
    @nativeField(float32_t)
    y:float32_t;
    @nativeField(float32_t)
    z:float32_t;

    static create(x:number, y:number, z:number):Vec3 {
        const v = new Vec3(true);
        v.x = x;
        v.y = y;
        v.z = z;
        return v;
    }
}
