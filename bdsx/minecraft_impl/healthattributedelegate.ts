import { Actor, HealthAttributeDelegate } from "../minecraft";

declare module '../minecraft' {
    interface HealthAttributeDelegate {
        actor:Actor;
    }
}

HealthAttributeDelegate.abstract({
    actor:[Actor, 0x20],
});
