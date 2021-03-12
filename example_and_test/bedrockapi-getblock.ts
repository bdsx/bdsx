import { system } from "./bedrockapi-system";

export function printBlock(entity:IEntity):void {
    const tickworld = system.getComponent(entity, 'minecraft:tick_world');
    if (tickworld === null) return; // mob does not have tick world

    const pos = system.getComponent(entity, 'minecraft:position');
    if (pos === null) throw Error(`No position in ${entity.__identifier__}`);

    const tickingarea = tickworld.data.ticking_area;

    const roundedpos = {x: Math.round(pos.data.x), y: Math.round(pos.data.y), z: Math.round(pos.data.z)};
    roundedpos.y --; // under foot

    const block = system.getBlock(tickingarea, roundedpos);
    if (block === null) throw Error(`Failed to get block at ${roundedpos.x} ${roundedpos.y} ${roundedpos.z}`);

    console.log(`block at ${roundedpos.x} ${roundedpos.y} ${roundedpos.z}: ${block.__identifier__}`);

    const state = system.getComponent(block, 'minecraft:blockstate');
    if (state === null) throw Error(`Failed to get block state at  ${roundedpos.x} ${roundedpos.y} ${roundedpos.z}`);
    console.log(`block state at ${roundedpos.x} ${roundedpos.y} ${roundedpos.z}: ${JSON.stringify(state.data)}`);
}
