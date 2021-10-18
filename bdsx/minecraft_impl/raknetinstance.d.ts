import { VoidPointer } from "../core";
declare module "../minecraft" {
    interface RakNetInstance {
        vftable: VoidPointer;
        peer: RakNet.RakPeer;
    }
}
