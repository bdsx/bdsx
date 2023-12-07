import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";

const RakPeer = bedrockServer.rakPeer;

command.register("ping", "example for getting ping").overload((params, origin, output) => {
    if (origin.isServerCommandOrigin()) {
        output.error(`[EXAMPLE-PING] You are Server`);
        return;
    }
    const actor = origin.getEntity();
    if (!actor) {
        output.error(`[EXAMPLE-PING] the origin is not an Actor`);
        return;
    }
    const name = actor?.getNameTag();
    const address = actor.getNetworkIdentifier().address;
    const out = `[EXAMPLE-PING] ${name}'s average ping is ${RakPeer.GetAveragePing(address)}
[EXAMPLE-PING] ${name}'s last ping is ${RakPeer.GetLastPing(address)}
[EXAMPLE-PING] ${name}'s lowest ping is ${RakPeer.GetLowestPing(address)}`;
    output.success(out);
}, {});
