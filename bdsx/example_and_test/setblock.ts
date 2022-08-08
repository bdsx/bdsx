import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";

let counter = 0;

const airBlock = Block.create('minecraft:air');
const blocks = [
    Block.create('minecraft:planks', 0)!,
    Block.create('minecraft:planks', 1)!,
    Block.create('minecraft:planks', 2)!,
    Block.create('minecraft:planks', 3)!,
    Block.create('minecraft:planks', 4)!,
    Block.create('minecraft:planks', 5)!,
];

const interval = setInterval(()=>{
    const newBlock = blocks[counter];
    for (const player of bedrockServer.serverInstance.getPlayers()) {
        const region = player.getRegion();
        const pos = player.getPosition();
        const blockpos = BlockPos.create(Math.floor(pos.x), Math.floor(pos.y)-2, Math.floor(pos.z));
        const oldBlock = region.getBlock(blockpos);
        if (!oldBlock.equals(airBlock)) {
            region.setBlock(blockpos, newBlock);
        }
    }
    counter = (counter+1) % blocks.length;
}, 100);

events.serverStop.on(()=>{
    clearInterval(interval);
});
