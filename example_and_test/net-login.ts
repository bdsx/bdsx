
// Network Hooking: Get login IP and XUID
import { netevent, NetworkIdentifier, PacketId } from "bdsx";
import { TextPacket } from "bdsx/bds/packets";
import { DeviceOS } from "bdsx/common";

export const connectionList = new Map<NetworkIdentifier, string>();

netevent.after(PacketId.Login).on((ptr, networkIdentifier, packetId) => {
    const ip = networkIdentifier.getAddress();
    const connreq = ptr.connreq;
    const cert = connreq.cert;
    const xuid = cert.getXuid();
    const username = cert.getId();
    
    console.log(`${username}> IP=${ip}, XUID=${xuid}, OS=${DeviceOS[connreq.getDeviceOS()] || 'UNKNOWN'}`);
    if (username) connectionList.set(networkIdentifier, username);

    // sendPacket
    setTimeout(()=>{
        const textPacket = TextPacket.create();
        textPacket.message = '[message packet from bdsx]';
        textPacket.sendTo(networkIdentifier);
        textPacket.dispose();
    }, 10000);
});
