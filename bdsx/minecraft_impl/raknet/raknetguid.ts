import { RakNet } from "../../minecraft";
import { bin64_t, uint16_t } from "../../nativetype";

declare module "../../minecraft" {
    namespace RakNet {
        interface RakNetGUID {
            g:bin64_t;
            systemIndex:uint16_t;
        }
    }
}

RakNet.RakNetGUID.define({
    g:bin64_t,
    systemIndex:uint16_t,
});
