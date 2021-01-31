import { VoidPointer } from "bdsx/core";
import { NativeClass } from "bdsx/nativeclass";
import { RakNet } from "./raknet";

export class RakNetInstance extends NativeClass {
    vftable:VoidPointer;
    peer:RakNet.RakPeer;
}
RakNetInstance.abstract({
    vftable:VoidPointer,
    peer:[RakNet.RakPeer.ref(), 0x1c8],
});