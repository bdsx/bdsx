import { events } from "bdsx/event";
import { Tester } from "bdsx/tester";


events.playerJoin.on(ev=>{
    if (Tester.errored) return; // skip if tester failed
    const inv = ev.player.getInventory();
    const slots = inv.container.getSlots();
    const size = slots.size();
    console.log(`[Inventory] Begin`);
    for (let i=0;i<size;i++) {
        const item = slots.get(i);
        if (item === null) continue;
        console.log(`item ${i}: ${item.getName()}`);
    }
    console.log(`[Inventory] End`);
    slots.destruct();
});
