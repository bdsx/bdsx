import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { NetworkHandler } from "./networkidentifier";

@nativeClass(null)
export class LoopbackPacketSender extends NativeClass {
    @nativeField(NetworkHandler.ref(), 8)
    networkHandler:NetworkHandler;
}
