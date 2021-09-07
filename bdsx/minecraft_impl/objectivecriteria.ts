import { ObjectiveCriteria } from "../minecraft";
import { bool_t, CxxString, uint8_t } from "../nativetype";

declare module "../minecraft" {
    export interface ObjectiveCriteria {
        name:CxxString;
        readOnly:bool_t;
        renderType:uint8_t;
    }
}

ObjectiveCriteria.abstract({
    name:CxxString,
    readOnly:bool_t,
    renderType:uint8_t,
});
