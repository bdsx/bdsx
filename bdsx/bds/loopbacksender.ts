import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { NetworkSystem } from "./networkidentifier";

@nativeClass(null)
export class LoopbackPacketSender extends AbstractClass {
    @nativeField(NetworkSystem.ref(), 8)
    networkSystem: NetworkSystem;
}
