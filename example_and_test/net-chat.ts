
// Chat Listening
import { CANCEL, MinecraftPacketIds, nethook } from '../bdsx';
nethook.before(MinecraftPacketIds.Text).on(ev => {
    if (ev.message === 'nochat')
    {
        return CANCEL; // canceling
    }
    ev.message = ev.message.toUpperCase() + " YEY!";
});
