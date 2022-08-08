import { command } from 'bdsx/command';
import { bedrockServer } from 'bdsx/launcher';

const peer = bedrockServer.rakPeer;

command.register("ping", "example for getting ping").overload((params, origin, output) => {
    if (origin.isServerCommandOrigin()) {
        output.error(`[EXAMPLE-PING] You are Server`);
        return;
    }
    const actor = origin.getEntity();
    if (!actor) {
        output.error(`[EXAMPLE-PING] the origin is not an Actor`)
        return;
    }
    const name = actor?.getName();
    const address = actor.getNetworkIdentifier().address;
    const out =
`[EXAMPLE-PING] ${name}'s average ping is ${peer.GetAveragePing(address)}
[EXAMPLE-PING] ${name}'s last ping is ${peer.GetLastPing(address)}
[EXAMPLE-PING] ${name}'s lowest ping is ${peer.GetLowestPing(address)}`;
    output.success(out);
}, {})
