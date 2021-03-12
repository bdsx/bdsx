import { VoidPointer } from "bdsx/core";
import { defineNative, NativeClass, nativeField } from "bdsx/nativeclass";
import { RakNet } from "./raknet";

@defineNative()
export class RakNetInstance extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(RakNet.RakPeer.ref(), 0x1c8)
    peer:RakNet.RakPeer;
}
