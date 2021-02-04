import { AttributeId } from "bdsx";
import { connectionList } from "./net-login";

// Change attributes
let healthCounter = 5;
setInterval(()=>{
    for (const ni of connectionList.keys()) {
        const actor = ni.getActor();
        if (!actor) continue;
        actor.setAttribute(AttributeId.Health, healthCounter);
    }

    healthCounter ++;
    if (healthCounter > 20) healthCounter = 5;
}, 100);
