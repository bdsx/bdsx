import { MCRESULT } from "../minecraft";
import { int32_t } from "../nativetype";

declare module "../minecraft" {
    interface MCRESULT {
        result:int32_t;

        getFullCode():int32_t;
        isSuccess():boolean;
    }
}

MCRESULT.define({
    result:int32_t
});
