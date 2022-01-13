import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { command } from "bdsx/command";
import { events } from "bdsx/event";

command.register('sign', 'generate signed block').overload((params, origin, output)=>{
    const actor = origin.getEntity();
    if (actor === null) {
        output.error('actor not found');
    } else {
        const region = actor.getRegion();
        const pos = actor.getPosition();
        const blockpos = BlockPos.create(Math.floor(pos.x), Math.floor(pos.y)-1, Math.floor(pos.z));
        const block = Block.create('minecraft:standing_sign')!;
        region.setBlock(blockpos, block);
        const blockActor = region.getBlockEntity(blockpos)!;
        blockActor.load({
            Text: 'be happy'
        });
    }
}, {});

events.playerUseItem.on(ev=>{
    ev.itemStack.save();
});
