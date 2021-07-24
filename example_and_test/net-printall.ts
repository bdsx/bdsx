import { Packet } from "bdsx/bds/packet";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";
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

    // events.packetRaw uses serialized packets
    events.packetRaw(i).on((ptr, size, networkIdentifier, packetId) => {
        if (!Tester.isPassed()) return; // logging if test is passed
        const packetName = (MinecraftPacketIds[packetId] || '0x'+packetId.toString(16));
        console.log(`RECV ${packetName}: ${hex(ptr.readBuffer(Math.min(16, size)))}`);
    });

    // events.packetSend uses C++ packets
    events.packetSend<MinecraftPacketIds>(i).on((ptr, networkIdentifier, packetId) => {
        if (!Tester.isPassed()) return; // logging if test is passed
        const packetName = (MinecraftPacketIds[packetId] || '0x'+packetId.toString(16));
        const COMMON_AREA_SIZE = Packet[NativeType.size]!; // skip common area of the C++ packet
        console.log(`SEND ${packetName}: ${hex(ptr.getBuffer(16, COMMON_AREA_SIZE))}`);
    });
}
