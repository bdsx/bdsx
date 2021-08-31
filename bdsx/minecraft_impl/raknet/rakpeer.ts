import { VoidPointer } from "../../core";
import { RakNet } from "../../minecraft";

declare module "../../minecraft" {
    namespace RakNet {
        interface RakPeer {
            vftable:VoidPointer;
        }
    }
}

RakNet.RakPeer.define({
    vftable:VoidPointer
});
