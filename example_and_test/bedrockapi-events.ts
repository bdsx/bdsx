
// Addon Script
import { Actor, AttributeId, DimensionId } from "bdsx";
import { system } from "./bedrockapi-system";

system.listenForEvent('minecraft:entity_created', ev => {
    console.log('entity created: ' + ev.data.entity.__identifier__);

    // Get extra informations from entity
    const actor = Actor.fromEntity(ev.data.entity);
    if (actor) {
        console.log('entity dimension: ' + DimensionId[actor.getDimensionId()]);
        const level = actor.getAttribute(AttributeId.PlayerLevel);
        console.log('entity level: ' + level);

        if (actor.isPlayer()) {
            const ni = actor.getNetworkIdentifier();
             console.log('player IP: '+ni.getAddress());
        }
    }
});
system.listenForEvent('minecraft:entity_death', ev=>{
    // on death
});
