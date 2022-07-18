import { events } from "bdsx/event";

events.playerKnockback.on(event => {
    console.log(`[event-playerknockback] target: ${event.target.getName()}`);
    // Increasing height of knockback
    event.height *= 2;
    event.heightCap *= 2;
});