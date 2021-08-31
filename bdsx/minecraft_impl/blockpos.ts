import { BlockPos } from "../minecraft";
import { int32_t, uint32_t } from "../nativetype";

declare module "../minecraft" {
    interface BlockPos {
        x:int32_t;
        y:uint32_t;
        z:int32_t;
        toJSON():VectorXYZ;
    }
    namespace BlockPos {
        function create(x:number, y:number, z:number):BlockPos;
    }
}

BlockPos.define({
    x:int32_t,
    y:uint32_t,
    z:int32_t,
});

BlockPos.create = function(x:number, y:number, z:number):BlockPos {
    const v = new BlockPos(true);
    v.x = x;
    v.y = y;
    v.z = z;
    return v;
};

BlockPos.prototype.toJSON = function():VectorXYZ {
    return {x:this.x, y:this.y, z:this.z};
};
