import { MinecraftPacketIds, netevent } from "bdsx";

// Network Hooking: hook the sending StartGamePacket and hiding seeds
netevent.send(MinecraftPacketIds.StartGame).on(packet=>{
    packet.settings.seed = -123;
});