import { abstract } from "../common";
import { VoidPointer } from "../core";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { RakNet } from "./raknet";

@nativeClass()
export class RakNetConnector extends AbstractClass {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
    /**
     * @deprecated use bedrockServer.rakPeer
     */
    peer: RakNet.RakPeer;

    getPort(): number {
        abstract();
    }
}

/** @alias RakNetConnector */
export const RakNetInstance = RakNetConnector;
/** @alias RakNetConnector */
export type RakNetInstance = RakNetConnector;
