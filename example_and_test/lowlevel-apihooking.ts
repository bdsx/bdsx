
// Low Level - API Hooking
import { Block } from "bdsx/bds/block";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { GameMode, SurvivalMode } from "bdsx/bds/gamemode";
import { ItemStack } from "bdsx/bds/inventory";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { TextPacket } from "bdsx/bds/packets";
import { capi } from "bdsx/capi";
import { pdb } from "bdsx/core";
import { UNDNAME_NAME_ONLY } from "bdsx/dbghelp";
import { bool_t, int32_t, int8_t } from "bdsx/nativetype";
import { ProcHacker } from "bdsx/prochacker";

function sendText(ni:NetworkIdentifier, message:string):void {
    const packet = TextPacket.create();
    packet.message = message;
    packet.sendTo(ni);
    packet.dispose();
}

if (!capi.isRunningOnWine()) { // Skip for Linux, pdb is not working on Wine.
    // the API hooking is possible on Wine with the generated cache.

    //////////////////////////
    // hook the block breaking
    const hacker = ProcHacker.load('../pdbcache_by_example.ini', [
        'SurvivalMode::destroyBlock',
        'GameMode::useItemOn',
        'MapItemSavedData::_updateTrackedEntityDecoration',
    ], UNDNAME_NAME_ONLY);
    pdb.close(); // close the pdb to reduce the resource usage.

    let halfMiss = false;
    function onDestroyBlock(gameMode:SurvivalMode, blockPos:BlockPos, v:number):boolean {
        halfMiss = !halfMiss;
        const ni = gameMode.actor.getNetworkIdentifier();

        sendText(ni, `${halfMiss ? 'missed' : 'destroyed'}: ${blockPos.x} ${blockPos.y} ${blockPos.z} ${v}`);

        if (halfMiss) return false;
        return originalFunc(gameMode, blockPos, v);
    }

    // bool SurvivalMode::destroyBlock(BlockPos&,unsigned char); // it can be dug with the disassembler or the decompiler.
    const originalFunc = hacker.hooking('SurvivalMode::destroyBlock', bool_t, null, SurvivalMode, BlockPos, int32_t)(onDestroyBlock);

    //////////////////////////
    // hook the item using on block
    const itemUseOn = hacker.hooking('GameMode::useItemOn',
        bool_t, null, GameMode, ItemStack, BlockPos, int8_t, Vec3, Block)(
        (gamemode, item, blockpos, n, pos, block)=>{

        sendText(gamemode.actor.getNetworkIdentifier(), `${item.getName()} using at ${blockpos.x} ${blockpos.y} ${blockpos.z}`);
        return itemUseOn(gamemode, item, blockpos, n, pos, block);
    });

    //////////////////////////
    // hide the map marker
    hacker.hooking('MapItemSavedData::_updateTrackedEntityDecoration', bool_t)(()=>false);
}
