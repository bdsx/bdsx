import { AttributeId } from "bdsx/bds/attribute";
import { serverInstance } from "bdsx/bds/server";
import { events } from "bdsx/event";

// Change attributes
let healthCounter = 5;
const interval = setInterval(()=>{
    for (const player of serverInstance.getPlayers()) {
        player.setAttribute(AttributeId.Health, healthCounter);
    }

    healthCounter ++;
    if (healthCounter > 20) healthCounter = 5;
}, 100);

// without this code, bdsx does not end even after BDS closed
events.serverStop.on(()=>{
    clearInterval(interval);
});
