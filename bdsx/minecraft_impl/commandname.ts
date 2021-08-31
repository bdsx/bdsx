import { CommandName } from "../minecraft";
import { CxxString, uint8_t } from "../nativetype";

declare module "../minecraft" {
    interface CommandName {
        name:string;
        unknown:uint8_t;
    }
}

CommandName.define({
    name: CxxString,
    unknown: uint8_t,
});
