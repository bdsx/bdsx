import { MinecraftPacketIds } from "bdsx";
import { events } from "bdsx/event";

// Network Hooking: hook the sending StartGamePacket and hiding seeds
events.packetSend(MinecraftPacketIds.StartGame).on(packet=>{
    packet.settings.seed = -123;
});
