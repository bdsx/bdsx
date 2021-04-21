
// Chat Listening
import { CANCEL, MinecraftPacketIds } from 'bdsx';
import { events } from 'bdsx/event';

events.packetBefore(MinecraftPacketIds.Text).on(ev => {
    if (ev.message === 'nochat')
    {
        return CANCEL; // canceling
    }
    ev.message = ev.message.toUpperCase() + " YEY!";
});
