import { makefunc } from "../makefunc";
import { RelativeFloat } from "../minecraft";
import { bin64_t, bool_t, float32_t } from "../nativetype";

declare module "../minecraft" {
    interface RelativeFloat {
        value:float32_t;
        is_relative:bool_t;
        bin_value:bin64_t;
    }
    namespace RelativeFloat {
        function create(value:number, is_relative:boolean):RelativeFloat;
    }
}

RelativeFloat[makefunc.registerDirect] = true;
RelativeFloat.define({
    value:float32_t,
    is_relative:bool_t,
    bin_value:[bin64_t, 0],
});

RelativeFloat.create = function(value:number, is_relative:boolean):RelativeFloat {
    const v = new RelativeFloat(true);
    v.value = value;
    v.is_relative = is_relative;
    return v;
};
