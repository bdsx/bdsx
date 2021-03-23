import { MinecraftPacketIds, nethook } from "bdsx";
import { Packet } from "bdsx/bds/packet";
import { NativeType } from "bdsx/nativetype";
import { Tester } from "bdsx/tester";
import { hex } from "bdsx/util";

// Network Hooking: Print all packets
const tooLoudFilter = new Set([
    MinecraftPacketIds.UpdateBlock,
    MinecraftPacketIds.ClientCacheBlobStatus,
    MinecraftPacketIds.LevelChunk,
    MinecraftPacketIds.ClientCacheMissResponse,
    MinecraftPacketIds.MoveActorDelta,
    MinecraftPacketIds.SetActorMotion,
    MinecraftPacketIds.SetActorData,
    MinecraftPacketIds.NetworkChunkPublisherUpdate,
    MinecraftPacketIds.ActorEvent,
    MinecraftPacketIds.UpdateSoftEnum,
    MinecraftPacketIds.PlayerAuthInput,
    MinecraftPacketIds.UpdateAttributes,
]);
for (let i = 0; i <= 0xff; i++) {
    if (tooLoudFilter.has(i)) continue;

    // nethook.raw uses serialized packets
    nethook.raw(i).on((ptr, size, networkIdentifier, packetId) => {
        if (Tester.errored) return; // stop logging if tests are failed
        const packetName = (MinecraftPacketIds[packetId] || '0x'+packetId.toString(16));
        console.log(`RECV ${packetName}: ${hex(ptr.readBuffer(Math.min(16, size)))}`);
    });

    // nethook.send uses C++ packets
    nethook.send<MinecraftPacketIds>(i).on((ptr, networkIdentifier, packetId) => {
        if (Tester.errored) return; // stop logging if tests are failed
        const packetName = (MinecraftPacketIds[packetId] || '0x'+packetId.toString(16));
        const COMMON_AREA_SIZE = Packet[NativeType.size]!; // skip common area of the C++ packet
        console.log(`SEND ${packetName}: ${hex(ptr.getBuffer(16, COMMON_AREA_SIZE))}`);
    });
}
