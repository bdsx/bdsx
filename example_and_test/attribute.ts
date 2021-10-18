import { AttributeId } from "bdsx/enums";
import { bdsx } from "bdsx/v3";

// Change attributes
let healthCounter = 5;
const interval = setInterval(()=>{
    for (const player of bdsx.Player.all()) {
        player.setAttribute(AttributeId.Health, healthCounter);
    }

    healthCounter ++;
    if (healthCounter > 20) healthCounter = 5;
}, 100);

// without this code, bdsx does not end even after BDS closed
bdsx.events.serverStop.on(()=>{
    clearInterval(interval);
});
