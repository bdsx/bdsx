
import { Actor, GameMode } from "../minecraft";

declare module "../minecraft" {
    interface GameMode {
        actor:Actor;
    }
}

GameMode.define({
    actor: [Actor.ref(), 8]
});
