import { DimensionId } from "bdsx/bds/actor";
import { Block, BlockSource } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { serverInstance } from "bdsx/bds/server";
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

        const dimensionId = actor.getDimensionId();

        // change the block name per 1 sec
        let numberForCheckingUpdate = 1;
        const interval = setInterval(()=>{
            if (bedrockServer.isClosed()) {
                clearInterval(interval);
                return;
            }
            const region = getBlockSource(dimensionId, blockpos);
            if (region === null) {
                // cannot access the furnace
                return;
            }
            const blockActor = region.getBlockEntity(blockpos);
            if (blockActor === null) {
                // no block actor, it seems it's destroyed
                clearInterval(interval);
                return;
            }
            blockActor.setCustomName('customname '+numberForCheckingUpdate); // set the custom name
            numberForCheckingUpdate++;
            region.getDimension()._sendBlockEntityUpdatePacket(blockpos); // send update packets, clients are not updated without this
        }, 1000);
    }
}, {});

/**
 * find the BlockSource that can access the specific block position
 */
function getBlockSource(dimensionId:DimensionId, blockpos:BlockPos):BlockSource|null {
    for (const player of serverInstance.getPlayers()) {
        if (player.getDimensionId() !== dimensionId) continue; // different dimension
        const region = player.getRegion();
        const chunk = region.getChunkAt(blockpos);
        if (chunk === null) continue; // chunk is not accessible
        if (!chunk.isFullyLoaded()) return null; // chunk is not loaded
        return player.getRegion();
    }
    return null;
}
