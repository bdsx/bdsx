import { events } from "bdsx/event";

events.entityKnockback.on(event => {
    console.log(`[event-knockback] target: ${event.target.getIdentifier()}, source: ${event.source?.getIdentifier() ?? "none"}`);
    // Increasing height of knockback
    event.height *= 2;
    event.heightCap *= 2;
});