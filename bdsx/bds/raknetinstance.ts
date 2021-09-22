import { abstract } from "../common";
import { VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { RakNet } from "./raknet";

@nativeClass()
export class RakNetInstance extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(RakNet.RakPeer.ref(), 0x230)
    peer:RakNet.RakPeer;

    getPort():number {
        abstract();
    }
}
