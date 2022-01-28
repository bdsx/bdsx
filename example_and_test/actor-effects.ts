import { MobEffectInstance } from "bdsx/bds/effects";
import { events } from "bdsx/event";
import { connectionList } from "./net-login";

const regenId = 10;
const strengthId = 5;

let doingRegen = true;

const interval = setInterval(()=>{
    for (const ni of connectionList.keys()) {
        const actor = ni.getActor();
        if (!actor) continue;
        doingRegen = !doingRegen;
        let effect;
        if(doingRegen) effect = MobEffectInstance.create(strengthId, 20, 1, false, false, false);
        else effect = MobEffectInstance.create(regenId, 20, 1, false, true, false);
        actor.addEffect(effect);
    }
}, 1000);
events.serverStop.on(()=>{
    clearInterval(interval);
});
