import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";
import { bedrockServer } from "bdsx/launcher";
import { log2console, plugin2console } from "./utlis";

plugin2console({
    name: 'BetterChat',
    version: [1, 0, 0],
    author: 'BuraQ33'
})

events.packetSend(MinecraftPacketIds.Text).on((ptr, ni,) => {
    const actor = ni.getActor()
    if (actor === null) return
    const player = {
        xuid: actor.getXuid(),
        name: actor.getName()
    }
    actor.sendChat('xxx', `[${player.name}]`)
    console.log('\n--- [ START ]---')
    log2console(player.name)
    console.log('\n--- [ END ]---')
    return CANCEL
});