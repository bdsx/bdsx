import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";

// Network Hooking: hook the sending StartGamePacket and hiding the seed
events.packetSend(MinecraftPacketIds.StartGame).on(packet=>{
    packet.settings.seed = -123;
});
