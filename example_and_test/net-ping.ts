import { serverInstance } from 'bdsx/bds/server';
import { command } from 'bdsx/command';

const peer = serverInstance.networkHandler.instance.peer;

command.register("ping", "example for getting ping").overload((params, origin) => {
    if (origin.isServerCommandOrigin()) {
        console.log(`[EXAMPLE-PING] You are Server`);
        return;
    }
    const actor = origin.getEntity();
    if (!actor) {
        console.log(`[EXAMPLE-PING] the origin is not an Actor`)
        return;
    }
    const name = actor?.getName();
    const address = actor.getNetworkIdentifier().address;
    console.log(`[EXAMPLE-PING] ${name}'s average ping is`, peer.GetAveragePing(address));
    console.log(`[EXAMPLE-PING] ${name}'s last ping is`, peer.GetLastPing(address));
    console.log(`[EXAMPLE-PING] ${name}'s lowest ping is`, peer.GetLowestPing(address));
}, {})
