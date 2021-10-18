import { bool_t, CxxString, uint8_t } from "../nativetype";
declare module "../minecraft" {
    interface ObjectiveCriteria {
        name: CxxString;
        readOnly: bool_t;
        renderType: uint8_t;
    }
}
