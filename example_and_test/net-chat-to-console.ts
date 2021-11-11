// Chat Listening
console.log("[LOGGER] Prepare logging, please wait...!");
import { command, nethook, MinecraftPacketIds } from 'bdsx';

nethook.before(MinecraftPacketIds.Text).on((packet, networkIdentifier) => {
    const name = packet.name;
    const message = packet.message;
    console.log(`[INFO] <${name}> ${message}`); //log the ingame chat to console
});
