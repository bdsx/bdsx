import { MinecraftPacketIds, nethook } from "bdsx";

// Network Hooking: hook the sending StartGamePacket and hiding seeds
nethook.send(MinecraftPacketIds.StartGame).on(packet=>{
    packet.settings.seed = -123;
});