
// Addon Script
import { Actor, DimensionId } from "bdsx/bds/actor";
import { AttributeId } from "bdsx/bds/attribute";
import { Tester } from "bdsx/tester";
import { system } from "./bedrockapi-system";
import colors = require('colors');

system.listenForEvent('minecraft:entity_created', ev => {
    if (!Tester.isPassed()) return; // logging if test is passed
    console.log('entity created: ' + ev.data.entity.__identifier__);

    // Get extra informations from entity
    const actor = Actor.fromEntity(ev.data.entity);
    if (actor !== null) {
        console.log('entity dimension: ' + DimensionId[actor.getDimensionId()]);
        const level = actor.getAttribute(AttributeId.PlayerLevel);
        console.log('entity level: ' + level);

        if (actor.isPlayer()) {
            const ni = actor.getNetworkIdentifier();
            console.log('player IP: '+ni.getAddress());
        }
    } else {
        console.error(colors.red(`Actor not found: ${ev.data.entity.__identifier__}`));
    }
});
system.listenForEvent('minecraft:entity_death', ev=>{
    // on death
});
