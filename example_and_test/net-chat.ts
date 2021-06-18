
// Chat Listening
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";

events.packetBefore(MinecraftPacketIds.Text).on(ev => {
    if (ev.message === 'nochat') {
        return CANCEL; // canceling
    }
    ev.message = ev.message.toUpperCase() + " YEY!";
});
