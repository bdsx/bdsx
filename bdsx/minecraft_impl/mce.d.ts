import { StaticPointer } from "../core";
import { bin64_t, int32_t, uint16_t, uint32_t, uint64_as_float_t, uint8_t } from "../nativetype";
declare module "../minecraft" {
    namespace mce {
        interface UUID {
            v1: int32_t;
            v2: uint16_t;
            v3: uint16_t;
            v4: bin64_t;
            equals(other: UUID): boolean;
            toString(): string;
        }
        namespace UUID {
            /**
             * @alias Crypto.Random.generateUUID
             */
            function generate(): UUID;
        }
        interface Blob {
            /** @deprecated Has to be confirmed working */
            bytes: StaticPointer;
            size: uint64_as_float_t;
        }
        interface Image {
            imageFormat: uint32_t;
            width: uint32_t;
            height: uint32_t;
            usage: uint8_t;
            blob: mce.Blob;
        }
    }
}
