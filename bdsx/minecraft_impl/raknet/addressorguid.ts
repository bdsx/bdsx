import { RakNet } from "../../minecraft";
import { uint16_t } from "../../nativetype";
import './raknetguid';
import './systemaddress';

declare module "../../minecraft" {
    namespace RakNet {
        interface AddressOrGUID {
            rakNetGuid:RakNetGUID;
            systemAddress:SystemAddress;

            GetSystemIndex():uint16_t;
        }
    }
}

RakNet.AddressOrGUID.define({
    rakNetGuid:RakNet.RakNetGUID,
    systemAddress:RakNet.SystemAddress,
});

RakNet.AddressOrGUID.prototype.GetSystemIndex = function():uint16_t {
    const rakNetGuid = this.rakNetGuid;
    if (rakNetGuid.g !== RakNet.UNASSIGNED_RAKNET_GUID.g) {
        return rakNetGuid.systemIndex;
    } else {
        return this.systemAddress.systemIndex;
    }
};
