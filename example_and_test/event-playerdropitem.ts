import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";

let lastHit = false;

events.playerDropItem.on(({ player, itemStack, inContainer, hotbarSlot }) => {
    console.log(`[event-playerdropitem] player: ${player.getName()}, itemStack: ${itemStack.getItem()?.getCommandName()}, inContainer: ${inContainer}, hotbarSlot: ${hotbarSlot}`);
    if(lastHit = !lastHit) return CANCEL;
});
