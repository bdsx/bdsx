// Chat Listening
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";

events.packetBefore(MinecraftPacketIds.Text).on(ev => {
    console.log(`[Chat] <${ev.name}> ${ev.message}`) //logging to console
});
