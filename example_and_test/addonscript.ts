
// Addon Script
import { Actor, AttributeId, DimensionId } from "bdsx";
const system = server.registerSystem(0, 0);
system.listenForEvent('minecraft:entity_created', ev => {
    console.log('entity created: ' + ev.data.entity.__identifier__);

    // Get extra informations from entity
    const actor = Actor.fromEntity(ev.data.entity);
    if (actor)
    {
        console.log('entity dimension: ' + DimensionId[actor.getDimension()]);
        const level = actor.getAttribute(AttributeId.PlayerLevel);
        console.log('entity level: ' + level);
        
        if (actor.isPlayer())
        {
            const ni = actor.getNetworkIdentifier();
            console.log('player IP: '+ni.getAddress());
        }
    }
});
