import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { NetworkHandler } from "./networkidentifier";

@nativeClass(null)
export class LoopbackPacketSender extends AbstractClass {
    @nativeField(NetworkHandler.ref(), 8)
    networkHandler:NetworkHandler;
}
