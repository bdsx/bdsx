import { uint16_t } from "../../nativetype";
import './raknetguid';
import './systemaddress';
declare module "../../minecraft" {
    namespace RakNet {
        interface AddressOrGUID {
            rakNetGuid: RakNetGUID;
            systemAddress: SystemAddress;
            GetSystemIndex(): uint16_t;
        }
    }
}
