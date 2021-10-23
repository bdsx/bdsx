
// Addon Script
import { Tester } from "bdsx/tester";
import { system } from "./bedrockapi-system";
import colors = require('colors');
import { bdsx } from "bdsx/v3";
import { AttributeId } from "bdsx/enums";
import { DimensionId } from "bdsx/minecraft";

system.listenForEvent('minecraft:entity_created', ev => {
    if (!Tester.isPassed()) return; // logging if test is passed
    console.log('entity created: ' + ev.data.entity.__identifier__);

    // Get extra informations from entity
    const entity = bdsx.Entity.fromEntity(ev.data.entity);
    if (entity !== null) {
        console.log('entity dimension: ' + DimensionId[entity.dimensionId]);
        const level = entity.getAttribute(AttributeId.PlayerLevel);
        console.log('entity level: ' + level);

        if (entity instanceof bdsx.Player) {
            console.log('player IP: '+entity.ip);
        }
    } else {
        // this case does not occur. a kind of test.
        console.error(colors.red(`Entity not found: ${ev.data.entity.__identifier__}`));
    }
});
system.listenForEvent('minecraft:entity_death', ev=>{
    // on death
});
