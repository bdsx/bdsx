import { uint8_t } from "../nativetype";
declare module "../minecraft" {
    interface CommandName {
        name: string;
        unknown: uint8_t;
    }
}
