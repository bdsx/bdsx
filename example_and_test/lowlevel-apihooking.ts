
// Low Level - API Hooking
import { hook } from "bdsx/hook";
import { BlockPos, GameMode, MapItemSavedData, NetworkIdentifier, SurvivalMode, TextPacket } from "bdsx/minecraft";

function sendText(ni:NetworkIdentifier, message:string):void {
    const packet = TextPacket.create();
    packet.message = message;
    packet.sendTo(ni);
    packet.dispose();
}

let halfMiss = false;
function onDestroyBlock(this:SurvivalMode, blockPos:BlockPos, v:number):boolean {
    halfMiss = !halfMiss;
    const ni = this.actor.getNetworkIdentifier();

    sendText(ni, `${halfMiss ? 'missed' : 'destroyed'}: ${blockPos.x} ${blockPos.y} ${blockPos.z} ${v}`);

    if (halfMiss) return false;
    return originalFunc.call(this, blockPos, v);
}

// bool SurvivalMode::destroyBlock(BlockPos&,unsigned char); // it can be dug with the disassembler or the decompiler.
const originalFunc = hook(SurvivalMode, 'destroyBlock').call(onDestroyBlock);

//////////////////////////
// hook the item using on block
const itemUseOn = hook(GameMode, 'useItemOn').call(function(item, blockpos, n, pos, block) {
    sendText(this.actor.getNetworkIdentifier(), `${item.getName()} using at ${blockpos.x} ${blockpos.y} ${blockpos.z}`);
    return itemUseOn.call(this, item, blockpos, n, pos, block);
});

//////////////////////////
// hide the map marker
hook(MapItemSavedData, '_updateTrackedEntityDecoration').call(()=>false);
