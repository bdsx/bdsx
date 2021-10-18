import { uint16_t } from "../../nativetype";
declare module "../../minecraft" {
    namespace RakNet {
        interface SystemAddress {
            systemIndex: uint16_t;
            toString(): string;
        }
    }
}
