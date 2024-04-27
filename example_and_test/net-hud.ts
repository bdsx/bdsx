import { HudElement, HudVisibility } from "bdsx/bds/behaviors";
import { SetHudPacket } from "bdsx/bds/packets";
import { command } from "bdsx/command";

command.register("set-hud", "set-hud").overload(
    (p, o, op) => {
        const player = o.getEntity();
        if (!player?.isPlayer()) {
            return;
        }
        const pkt = SetHudPacket.allocate();
        pkt.elements.push(p.element);
        pkt.visibility = p.visibility;
        player.sendNetworkPacket(pkt);
        pkt.dispose();
    },
    { element: command.enum("bdsx:HudElement", HudElement), visibility: command.enum("bdsx:HudVisibility", HudVisibility) },
);
