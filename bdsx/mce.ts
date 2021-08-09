import { procHacker } from "./bds/proc";
import { bin } from "./bin";
import { MantleClass, nativeClass, NativeClass, nativeField } from "./nativeclass";
import { bin128_t, bin64_t, uint16_t, uint32_t, uint64_as_float_t, uint8_t } from "./nativetype";
import { Wrapper } from "./pointer";

export namespace mce
{
    export const UUID = bin128_t.extends({
        v1(uuid:UUID):uint32_t {
            return uuid.charCodeAt(0) | (uuid.charCodeAt(1)<<16);
        },
        v2(uuid:UUID):uint16_t {
            return uuid.charCodeAt(2);
        },
        v3(uuid:UUID):uint16_t {
            return uuid.charCodeAt(3);
        },
        v4(uuid:UUID):bin64_t {
            return uuid.substr(4);
        },
        generate():UUID {
            return generateUUID().value;
        },
        toString(uuid:UUID) {
            const hex = bin.hex(uuid);
            const u1 = hex.substr(0, 8);
            const u2 = hex.substr(8, 4);
            const u3 = hex.substr(12, 4);
            const u4 = hex.substr(16, 4);
            const u5 = hex.substr(20);
            return `${u1}-${u2}-${u3}-${u4}-${u5}`;
        },
    }, 'UUID');
    export type UUID = string;
    export const UUIDWrapper = Wrapper.make(mce.UUID);

    @nativeClass()
    export class Blob extends NativeClass {
        @nativeField(MantleClass.ref())
        /** @deprecated Has to be confirmed working */
        bytes:MantleClass;
        @nativeField(uint64_as_float_t)
        size:uint64_as_float_t;
    }

    @nativeClass()
    export class Image extends NativeClass {
        @nativeField(uint32_t)
        imageFormat:uint32_t;
        @nativeField(uint32_t)
        width:uint32_t;
        @nativeField(uint32_t)
        height:uint32_t;
        @nativeField(uint8_t)
        usage:uint8_t;
        @nativeField(mce.Blob, 0x10)
        blob:mce.Blob;
    }
}

const generateUUID = procHacker.js("Crypto::Random::generateUUID", mce.UUIDWrapper, {structureReturn: true});
