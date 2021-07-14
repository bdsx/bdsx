import { AttributeId } from "bdsx/bds/attribute";
import { events } from "bdsx/event";
import { connectionList } from "./net-login";

// Change attributes
let healthCounter = 5;
const interval = setInterval(()=>{
    for (const ni of connectionList.keys()) {
        const actor = ni.getActor();
        if (!actor) continue;
        actor.setAttribute(AttributeId.Health, healthCounter);
    }

    healthCounter ++;
    if (healthCounter > 20) healthCounter = 5;
}, 100);

// without this code, bdsx does not end even after BDS closed
events.serverStop.on(()=>{
    clearInterval(interval);
});
