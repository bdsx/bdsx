
// Low Level - API Hooking
import { BlockPos } from "bdsx/bds/blockpos";
import { SurvivalMode } from "bdsx/bds/gamemode";
import { TextPacket } from "bdsx/bds/packets";
import { capi } from "bdsx/capi";
import { pdb } from "bdsx/core";
import { UNDNAME_NAME_ONLY } from "bdsx/dbghelp";
import { bool_t, int32_t } from "bdsx/nativetype";
import { ProcHacker } from "bdsx/prochacker";

if (!capi.isRunningOnWine()) { // Skip for Linux, pdb is not working on Wine.
    // the API hooking is possible on Wine with the generated cache.

    const hacker = ProcHacker.load('../pdbcache_by_example.ini', ['SurvivalMode::destroyBlock'], UNDNAME_NAME_ONLY);
    pdb.close(); // close the pdb to reduce the resource usage.

    let halfMiss = false;
    function onDestroyBlock(gameMode:SurvivalMode, blockPos:BlockPos, v:number):boolean {
        halfMiss = !halfMiss;
        const ni = gameMode.actor.getNetworkIdentifier();
        const packet = TextPacket.create();
        packet.message = `${halfMiss ? 'missed' : 'destroyed'}: ${blockPos.x} ${blockPos.y} ${blockPos.z} ${v}`;
        packet.sendTo(ni);
        packet.dispose();

        if (halfMiss) return false;
        return originalFunc(gameMode, blockPos, v);
    }

    // bool SurvivalMode::destroyBlock(BlockPos&,unsigned char); // it can be dug with the disassembler.
    const originalFunc = hacker.hooking('SurvivalMode::destroyBlock', bool_t, null, SurvivalMode, BlockPos, int32_t)(onDestroyBlock);
}

