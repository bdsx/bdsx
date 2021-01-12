import { proc } from "./bds/proc";
import { makefunc } from "./core";
import { bin64_t, uint16_t, uint32_t } from "./nativetype";
import { Pointer } from "./pointer";

export namespace mce
{
    export const UUID = bin64_t.extends({
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
        }
    });
    export type UUID = string;
    export const UUIDPointer = Pointer.make(mce.UUID);
}

const generateUUID = makefunc.js(proc["Crypto::Random::generateUUID"], mce.UUIDPointer, {structureReturn: true});
