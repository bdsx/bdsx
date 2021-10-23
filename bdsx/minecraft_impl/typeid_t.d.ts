import { uint16_t } from "../nativetype";
declare module "../minecraft" {
    interface typeid_t<T> {
        id: uint16_t;
    }
}
