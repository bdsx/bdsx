import { Pointer } from "./pointer";
import { NativeClass } from "./nativeclass";
import { NetworkHandler } from "./bds/networkidentifier";

export class LoopbackPacketSender extends NativeClass
{
    networkHandler:Pointer<NetworkHandler>;
}
LoopbackPacketSender.abstract({
    networkHandler:[NetworkHandler, 8]
});
