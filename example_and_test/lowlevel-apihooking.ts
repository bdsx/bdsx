
// Low Level - API Hooking
import { hook } from "bdsx/hook";
import { Actor, GameMode, MapItemSavedData, ServerPlayer, SurvivalMode, TextPacket } from "bdsx/minecraft";

/**
 * send the text packet to the actor
 */
function sendText(actor:Actor, message:string):void {
    if (!(actor instanceof ServerPlayer)) return; // no player
    const packet = TextPacket.create();
    packet.message = message;
    actor.sendNetworkPacket(packet);
    packet.dispose();
}

//////////////////////////
// hook SurvivalMode.destroyBlock

let halfMiss = false;
const originalFunc = hook(SurvivalMode, 'destroyBlock').call(function(blockPos, v){
    const actor = this.actor;
    halfMiss = !halfMiss;
    sendText(actor, `${halfMiss ? 'missed' : 'destroyed'}: ${blockPos.x} ${blockPos.y} ${blockPos.z} ${v}`);
    if (halfMiss) return false; // miss
    return originalFunc.call(this, blockPos, v);
});

//////////////////////////
// hook the item using on block
const itemUseOn = hook(GameMode, 'useItemOn').call(function(item, blockpos, n, pos, block) {
    const actor = this.actor;
    if (!(actor instanceof ServerPlayer)) return; // no player
    sendText(actor, `${item.getName()} using at ${blockpos.x} ${blockpos.y} ${blockpos.z}`);
    return itemUseOn.call(this, item, blockpos, n, pos, block);
});

//////////////////////////
// hide the map marker
hook(MapItemSavedData, '_updateTrackedEntityDecoration').call(()=>false);
