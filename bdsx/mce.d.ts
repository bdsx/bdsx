import { MantleClass, NativeClass } from "./nativeclass";
import { bin64_t, uint16_t, uint32_t, uint64_as_float_t, uint8_t } from "./nativetype";
/** @deprecated */
export declare namespace mce {
    /** @deprecated */
    const UUID: import("./nativetype").NativeType<string, string> & {
        v1(uuid: UUID): uint32_t;
        v2(uuid: UUID): uint16_t;
        v3(uuid: UUID): uint16_t;
        v4(uuid: UUID): bin64_t;
        generate(): UUID;
        toString(uuid: UUID): string;
    };
    type UUID = string;
    const UUIDWrapper: import("./pointer").WrapperType<string>;
    /** @deprecated */
    class Blob extends NativeClass {
        /** @deprecated Has to be confirmed working */
        bytes: MantleClass;
        size: uint64_as_float_t;
    }
    /** @deprecated */
    class Image extends NativeClass {
        imageFormat: uint32_t;
        width: uint32_t;
        height: uint32_t;
        usage: uint8_t;
        blob: mce.Blob;
    }
}
