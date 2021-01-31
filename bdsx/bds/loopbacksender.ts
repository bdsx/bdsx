import { NetworkHandler } from "./networkidentifier";
import { NativeClass } from "../nativeclass";

export class LoopbackPacketSender extends NativeClass {
    networkHandler:NetworkHandler;
}
LoopbackPacketSender.abstract({
    networkHandler:[NetworkHandler.ref(), 8]
});
