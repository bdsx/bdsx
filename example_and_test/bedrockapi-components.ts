import { system } from "./bedrockapi-system";

/**
 * print name, health, position for entity
 */
export function componentsOfEntity(entity:IEntity):void {
    console.log(`[entity: ${entity.__identifier__}]`);
    const name = system.getComponent(entity, 'minecraft:nameable');
    if (name !== null) console.log(`name: ${name.data.name}`);
    const health = system.getComponent(entity, 'minecraft:health');
    if (health !== null) console.log(`health: ${health.data.value}`);
    const pos = system.getComponent(entity, 'minecraft:position');
    if (pos !== null) console.log(`pos: ${pos.data.x.toFixed(1)} ${pos.data.y.toFixed(1)} ${pos.data.z.toFixed(2)}`);
}
