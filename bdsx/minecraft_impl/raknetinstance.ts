
import { VoidPointer } from "../core";
import { RakNet, RakNetInstance } from "../minecraft";

declare module "../minecraft" {
    interface RakNetInstance {
        vftable:VoidPointer;
        peer:RakNet.RakPeer;
    }
}

RakNetInstance.define({
    vftable:VoidPointer,
    peer:[RakNet.RakPeer.ref(), 0x1e8],
});
