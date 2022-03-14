import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { serverInstance } from "bdsx/bds/server";
import { events } from "bdsx/event";


let dirtStone = false;

const interval = setInterval(()=>{
    for (const player of serverInstance.getPlayers()) {
        const region = player.getRegion();
        const pos = player.getPosition();
        const blockpos = BlockPos.create(Math.floor(pos.x), Math.floor(pos.y)-2, Math.floor(pos.z));
        const block = region.getBlock(blockpos);
        if (block.getName() !== 'minecraft:air') {
            region.setBlock(blockpos, Block.create(dirtStone ? 'minecraft:dirt' : 'minecraft:stone')!);
        }
    }
    dirtStone = !dirtStone;
}, 100);

events.serverStop.on(()=>{
    clearInterval(interval);
});
