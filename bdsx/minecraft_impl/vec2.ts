import { Vec2 } from "../minecraft";
import { float32_t } from "../nativetype";

declare module "../minecraft" {
    interface Vec2 {
        x:float32_t;
        y:float32_t;
        toJSON():{x: number, y: number};
    }
    namespace Vec2 {
        function create(x:number, y:number):Vec2;
    }
}

Vec2.define({
    x:float32_t,
    y:float32_t,
});

Vec2.create = function(x:number, y:number):Vec2 {
    const v = new Vec2(true);
    v.x = x;
    v.y = y;
    return v;
};

Vec2.prototype.toJSON = function():{x: number, y: number} {
    return {x:this.x, y:this.y};
};
