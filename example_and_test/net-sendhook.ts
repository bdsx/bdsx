import { MinecraftPacketIds } from "bdsx/minecraft";
import { bdsx } from "bdsx/v3";

// Network Hooking: hook the sending StartGamePacket and hiding the seed
bdsx.events.packetSend(MinecraftPacketIds.StartGame).on(packet=>{
    packet.settings.seed = -123;
});
