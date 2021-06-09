import { ArmorSlot } from "bdsx/bds/inventory";
import { command } from "bdsx/command";
import { system } from "./bedrockapi-system";

// with bedrock API
export function dumpInventory(entity:IEntity):void {
    const inv = system.getComponent(entity, 'minecraft:inventory_container');
    if (inv === null) throw Error(`${entity.id} has not inventory`);
    console.log(`[${entity.id}'s inventory]`);
    for (const v of inv.data) {
        console.log(`${v.item}(${v.count})`);
    }
}

// with bdsx API

command.register('eq', 'get equipments').overload((param, origin)=>{
    const actor = origin.getEntity();
    if (actor === null) return;
    console.log(actor.getArmor(ArmorSlot.Head).getName());
    console.log(actor.getArmor(ArmorSlot.Chest).getName());
    console.log(actor.getArmor(ArmorSlot.Legs).getName());
    console.log(actor.getArmor(ArmorSlot.Feet).getName());
}, {});
