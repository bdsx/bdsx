import { events } from "bdsx/event";

events.playerJump.on(ev => {
    ev.player.sendMessage(ev.player.getName() + " jumped");
});
