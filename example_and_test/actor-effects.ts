import { MobEffectInstance } from "bdsx/bds/effects";
import { serverInstance } from "bdsx/bds/server";
import { events } from "bdsx/event";

const regenId = 10;
const strengthId = 5;

let doingRegen = true;

const interval = setInterval(()=>{
    for (const player of serverInstance.getPlayers()) {
        doingRegen = !doingRegen;
        let effect;
        if(doingRegen) effect = MobEffectInstance.create(strengthId, 20, 1, false, false, false);
        else effect = MobEffectInstance.create(regenId, 20, 1, false, true, false);
        player.addEffect(effect);
    }
}, 1000);
events.serverStop.on(()=>{
    clearInterval(interval);
});
