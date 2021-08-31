import { RakNet } from "../../minecraft";
import { uint16_t } from "../../nativetype";

const portDelineator = '|'.charCodeAt(0);

declare module "../../minecraft" {
    namespace RakNet {
        interface SystemAddress {
            systemIndex:uint16_t;
            toString():string;
        }
    }
}

RakNet.SystemAddress.define({
    systemIndex: [uint16_t, 130]
}, 136);

RakNet.SystemAddress.toString = function(this:RakNet.SystemAddress):string {
    const dest = Buffer.alloc(128);
    this.ToString(true, dest, portDelineator);
    const len = dest.indexOf(0);
    if (len === -1) throw Error('SystemAddress.ToString failed, null character not found');
    return dest.subarray(0, len).toString();
};
