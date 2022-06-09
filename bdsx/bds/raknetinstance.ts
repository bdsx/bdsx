import { abstract } from "../common";
import { VoidPointer } from "../core";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { RakNet } from "./raknet";

@nativeClass()
export class RakNetInstance extends AbstractClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    /**
     * @deprecated use bedrockServer.rakPeer
     */
    @nativeField(RakNet.RakPeer.ref(), 0x230)
    peer:RakNet.RakPeer;

    getPort():number {
        abstract();
    }
}
