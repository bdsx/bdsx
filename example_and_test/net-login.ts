
// Network Hooking: Get login IP and XUID
import { MinecraftPacketIds, NetworkIdentifier } from "bdsx";
import { TextPacket } from "bdsx/bds/packets";
import { DeviceOS } from "bdsx/common";
import { events } from "bdsx/event";

export const connectionList = new Map<NetworkIdentifier, string>();

events.packetAfter(MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {
    const ip = networkIdentifier.getAddress();
    const connreq = ptr.connreq;
    const cert = connreq.cert;
    const xuid = cert.getXuid();
    const username = cert.getId();

    console.log(`Connection: ${username}> IP=${ip}, XUID=${xuid}, OS=${DeviceOS[connreq.getDeviceOS()] || 'UNKNOWN'}`);
    if (username) connectionList.set(networkIdentifier, username);

    // sendPacket
    setTimeout(()=>{
        if (!connectionList.has(networkIdentifier)) return;
        const textPacket = TextPacket.create();
        textPacket.message = '[message packet from bdsx]';
        textPacket.sendTo(networkIdentifier);
        textPacket.dispose();
    }, 10000);
});
