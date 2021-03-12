import { defineNative, NativeClass, nativeField } from "../nativeclass";
import { NetworkHandler } from "./networkidentifier";

@defineNative(null)
export class LoopbackPacketSender extends NativeClass {
    @nativeField(NetworkHandler.ref(), 8)
    networkHandler:NetworkHandler;
}
