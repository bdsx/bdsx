import { MinecraftPacketIds, netevent } from "bdsx";
import { Packet } from "bdsx/bds/packet";
import { NativeType } from "bdsx/nativetype";
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
    
    // netevent.raw uses serialized packets
    netevent.raw(i).on((ptr, size, networkIdentifier, packetId) => {
        console.assert(size !== 0, 'invalid packet size');
        const packetName = (MinecraftPacketIds[packetId] || '0x'+packetId.toString(16));
        console.log(`RECV ${packetName}: ${hex(ptr.readBuffer(Math.min(16, size)))}`);
    });
    
    // netevent.send uses C++ packets
    netevent.send<MinecraftPacketIds>(i).on((ptr, networkIdentifier, packetId) => {
        const packetName = (MinecraftPacketIds[packetId] || '0x'+packetId.toString(16));
        const COMMON_AREA_SIZE = Packet[NativeType.size]!; // skip common area of the C++ packet
        console.log(`SEND ${packetName}: ${hex(ptr.getBuffer(16, COMMON_AREA_SIZE))}`);
    });
}
