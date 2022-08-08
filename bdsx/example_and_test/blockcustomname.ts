import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { CommandAreaFactory } from "bdsx/bds/commandarea";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";

command.register('furnace', 'generate named furnace').overload((params, origin, output)=>{
    const actor = origin.getEntity();
    if (actor === null) {
        output.error('actor not found');
    } else {
        const region = actor.getRegion();
        const pos = actor.getFeetPos();
        const blockpos = BlockPos.create(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
        const block = Block.create('minecraft:furnace')!;
        region.setBlock(blockpos, block);

        const dimension = actor.getDimension();

        // change the block name per 1 sec
        let numberForCheckingUpdate = 1;
        const interval = setInterval(()=>{
            if (bedrockServer.isClosed()) {
                clearInterval(interval);
                return;
            }
            const area = CommandAreaFactory.create(dimension).findArea(blockpos, blockpos, false);
            if (area === null) {
                // cannot access the furnace area
                return;
            }
            const region = area.blockSource;
            const blockActor = region.getBlockEntity(blockpos);
            if (blockActor === null) {
                // no block actor, it seems it's destroyed
                clearInterval(interval);
            } else {
                blockActor.setCustomName('customname '+numberForCheckingUpdate); // set the custom name
                numberForCheckingUpdate++;
                region.getDimension()._sendBlockEntityUpdatePacket(blockpos); // send update packets, clients are not updated without this
            }
            area.dispose();
        }, 1000);
    }
}, {});
