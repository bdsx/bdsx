import { ServerPlayer } from "bdsx/bds/player";
import { events } from "bdsx/event";

events.playerJump.on(ev => {
    (ev.player as ServerPlayer).sendMessage(ev.player.getName() + " jumped");
});
