import { bdsx } from "bdsx/v3";


bdsx.events.playerJoin.on(ev=>{
    const inv = ev.player.inventory;
    console.log(`[Inventory] Begin`);
    for (let i=0;i<inv.size;i++) {
        const item = inv.get(i);
        if (item === null) continue;
        console.log(`item ${i}: ${item.getName()}`);
    }
    console.log(`[Inventory] End`);
});
