import { system } from "./bedrockapi-system";

export function dumpInventory(entity:IEntity):void {
    const inv = system.getComponent(entity, 'minecraft:inventory_container');
    if (inv === null) throw Error(`${entity.id} has not inventory`);
    console.log(`[${entity.id}'s inventory]`);
    for (const v of inv.data) {
        console.log(`${v.item}(${v.count})`);
    }
}
