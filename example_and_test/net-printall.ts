import { MinecraftPacketIds, netevent } from "bdsx";
import { hex } from "bdsx/util";

// Network Hooking: Print all packets
const tooLoudFilter = new Set([
    MinecraftPacketIds.UpdateBlock,
    MinecraftPacketIds.ClientCacheBlobStatus, 
    MinecraftPacketIds.LevelChunk,
    MinecraftPacketIds.ClientCacheMissResponse,
    MinecraftPacketIds.MoveEntityDelta,
    MinecraftPacketIds.SetEntityMotion,
    MinecraftPacketIds.SetEntityData,
    MinecraftPacketIds.NetworkChunkPublisherUpdate,
    MinecraftPacketIds.EntityEvent,
    MinecraftPacketIds.UpdateSoftEnum,
    MinecraftPacketIds.PlayerAuthInput,
]);
for (let i = 2; i <= 0xe1; i++) {
    if (tooLoudFilter.has(i)) continue;
    netevent.raw(i).on((ptr, size, networkIdentifier, packetId) => {
        console.assert(size !== 0, 'invalid packet size');
        console.log(`RECV ${(MinecraftPacketIds[packetId] || '0x'+packetId.toString(16))}: ${hex(ptr.readBuffer(Math.min(16, size)))}`);
    });
    netevent.send<MinecraftPacketIds>(i).on((ptr, networkIdentifier, packetId) => {
        console.log(`SEND ${(MinecraftPacketIds[packetId] || '0x'+packetId.toString(16))}: ${hex(ptr.getBuffer(16))}`);
    });
}
