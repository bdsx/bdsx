
// Chat Listening
import { CANCEL, MinecraftPacketIds, netevent } from '../bdsx';
netevent.before(MinecraftPacketIds.Text).on(ev => {
    if (ev.message === 'nochat')
    {
        return CANCEL; // canceling
    }
    ev.message = ev.message.toUpperCase() + " YEY!";
});
