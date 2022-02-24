
// Low Level - API Hooking
import { Block } from "bdsx/bds/block";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { GameMode, SurvivalMode } from "bdsx/bds/gamemode";
import { ItemStack } from "bdsx/bds/inventory";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { TextPacket } from "bdsx/bds/packets";
import { Config } from "bdsx/config";
import { pdb } from "bdsx/core";
import { UNDNAME_NAME_ONLY } from "bdsx/dbghelp";
import { makefunc } from "bdsx/makefunc";
import { bool_t, int32_t, int8_t, uint32_t, void_t } from "bdsx/nativetype";
import { ProcHacker } from "bdsx/prochacker";

function sendText(ni:NetworkIdentifier, message:string):void {
    const packet = TextPacket.allocate();
    packet.message = message;
    packet.sendTo(ni);
    packet.dispose();
}

if (!Config.WINE) { // Skip for Linux, pdb searching is not working on Wine. but it's possible with the generated cache.

    //////////////////////////
    // hook the block breaking
    const hacker = ProcHacker.load('../pdbcache_by_example.ini', [
        'SurvivalMode::destroyBlock',
        'GameMode::useItemOn',
        'MapItemSavedData::_updateTrackedEntityDecoration',
        'BedrockLog::log',
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


    //////////////////////////
    // Cross thread hooking
    // it will synchronize the thread and call the JS engine.

    // void BedrockLog::log(enum BedrockLog::LogCategory,class std::bitset<3>,enum BedrockLog::LogRule,enum LogAreaID,unsigned int,char const *,int,char const *,...)
    hacker.hooking('BedrockLog::log', void_t, {crossThread: true}, int32_t, int32_t, int32_t, int32_t, uint32_t, makefunc.Utf8)(
        (category, bitset, logrule, logarea, n, message)=>{
        console.log(message);
    });
}
