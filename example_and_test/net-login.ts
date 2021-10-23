
// Network Hooking: Get login IP and XUID
import { BuildPlatform } from "bdsx/minecraft";
import { bdsx } from "bdsx/v3";

bdsx.events.playerLogin.on(ev=>{
    const player = ev.player;
    console.log(`Connection: ${player.name}> IP=${player.ip}, XUID=${player.xuid}, OS=${BuildPlatform[ev.os] || 'UNKNOWN'}`);

    // sendPacket
    setTimeout(()=>{
        player.message('[message from bdsx]');
    }, 10000);
});
