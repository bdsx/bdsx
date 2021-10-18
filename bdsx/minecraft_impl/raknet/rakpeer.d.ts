import { VoidPointer } from "../../core";
declare module "../../minecraft" {
    namespace RakNet {
        interface RakPeer {
            vftable: VoidPointer;
        }
    }
}
