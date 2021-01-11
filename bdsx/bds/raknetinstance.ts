import { NativeClass } from "bdsx/nativeclass";
import { RakNet } from "./raknet";

export class RakNetInstance extends NativeClass
{
    peer:RakNet.RakPeer;
}
RakNetInstance.abstract({
    peer:[RakNet.RakPeer, 0x1c8]
});