
// Chat Listening
import { CANCEL } from "bdsx/common";
import { bdsx } from "bdsx/v3";

bdsx.events.playerChat.on(ev=>{
    if (ev.message === 'nochat') {
        return CANCEL; // canceling
    }
    ev.message = ev.message.toUpperCase() + " YEY!";
});
