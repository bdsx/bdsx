import { proc } from "./bds/proc";
import { makefunc } from "./core";
import { bin128_t, bin64_t, uint16_t, uint32_t } from "./nativetype";
import { Pointer } from "./pointer";
import { bin } from "./bin";

export namespace mce
{
    export const UUID = bin128_t.extends({
        v1(uuid:UUID):uint32_t
        {
            return uuid.charCodeAt(0) | (uuid.charCodeAt(1)<<16);
        },
        v2(uuid:UUID):uint16_t
        {
            return uuid.charCodeAt(2);
        },
        v3(uuid:UUID):uint16_t
        {
            return uuid.charCodeAt(3);
        },
        v4(uuid:UUID):bin64_t
        {
            return uuid.substr(4);
        },
        generate():UUID
        {
            return generateUUID().p;
        },
        toString(uuid:UUID)
        {
            const hex = bin.hex(uuid);
            const u1 = hex.substr(0, 8);
            const u2 = hex.substr(8, 4);
            const u3 = hex.substr(12, 4);
            const u4 = hex.substr(16, 4);
            const u5 = hex.substr(20);
            return `${u1}-${u2}-${u3}-${u4}-${u5}`;
        },
    });
    export type UUID = string;
    export const UUIDPointer = Pointer.make(mce.UUID);
}

const generateUUID = makefunc.js(proc["Crypto::Random::generateUUID"], mce.UUIDPointer, {structureReturn: true});
