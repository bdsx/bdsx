import { MobEffectIds } from "bdsx/enums";
import { bdsx } from "bdsx/v3";

let doingRegen = true;

setInterval(()=>{
    for (const player of bdsx.Player.all()) {
        doingRegen = !doingRegen;
        player.addEffect(doingRegen ? MobEffectIds.Regeneration : MobEffectIds.Strength, 20);
    }
}, 1000).unref();
