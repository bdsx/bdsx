
// Network Hooking: disconnected

import { bdsx } from "bdsx/v3";

bdsx.events.playerDisconnect.on(ev => {
    console.log(`${ev.player.name}> disconnected`);
});
