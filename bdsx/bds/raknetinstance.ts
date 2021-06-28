import { VoidPointer } from "bdsx/core";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { RakNet } from "./raknet";

@nativeClass()
export class RakNetInstance extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(RakNet.RakPeer.ref(), 0x1e8)
    peer:RakNet.RakPeer;
}
