import { NetworkHandler } from "./networkidentifier";
import { NativeClass } from "../nativeclass";
import { Pointer } from "../pointer";

export class LoopbackPacketSender extends NativeClass
{
    networkHandler:Pointer<NetworkHandler>;
}
LoopbackPacketSender.abstract({
    networkHandler:[NetworkHandler, 8]
});
