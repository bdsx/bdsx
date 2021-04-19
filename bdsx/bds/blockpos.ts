import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, bool_t, float32_t, int32_t, uint32_t } from "../nativetype";

@nativeClass()
export class BlockPos extends NativeClass {
    @nativeField(int32_t)
    x:int32_t;
    @nativeField(uint32_t)
    y:uint32_t;
    @nativeField(int32_t)
    z:int32_t;

    static create(x:number, y:number, z:number):BlockPos {
        const v = new BlockPos(true);
        v.x = x;
        v.y = y;
        v.z = z;
        return v;
    }

    toJSON():VectorXYZ {
        return {x:this.x, y:this.y, z:this.z};
    }
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

    toJSON():VectorXYZ {
        return {x:this.x, y:this.y, z:this.z};
    }
}

@nativeClass()
export class RelativeFloat extends NativeClass {
    @nativeField(float32_t)
    value:float32_t;
    @nativeField(bool_t)
    is_relative:bool_t;

    @nativeField(bin64_t, 0)
    bin_value:bin64_t;
}
