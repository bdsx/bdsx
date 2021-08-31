import { Vec3 } from "../minecraft";
import { float32_t } from "../nativetype";

declare module "../minecraft" {
    interface Vec3 {
        x:float32_t;
        y:float32_t;
        z:float32_t;
        toJSON():VectorXYZ;
    }
    namespace Vec3 {
        function create(x:number, y:number, z:number):Vec3;
    }
}

Vec3.define({
    x:float32_t,
    y:float32_t,
    z:float32_t,
});

Vec3.create = function(x:number, y:number, z:number):Vec3 {
    const v = new Vec3(true);
    v.x = x;
    v.y = y;
    v.z = z;
    return v;
};

Vec3.prototype.toJSON = function():VectorXYZ {
    return {x:this.x, y:this.y, z:this.z};
};
