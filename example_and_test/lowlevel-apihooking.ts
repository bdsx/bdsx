// Low Level - API Hooking
import { Block } from "bdsx/bds/block";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { GameMode, SurvivalMode } from "bdsx/bds/gamemode";
import { ItemStack } from "bdsx/bds/inventory";
import { ServerPlayer } from "bdsx/bds/player";
import { StaticPointer } from "bdsx/core";
import { makefunc } from "bdsx/makefunc";
import { bool_t, int32_t, int8_t, uint32_t, void_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";
import { Tester } from "bdsx/tester";

/**
 * Backward compatibility cannot be guaranteed. The symbol name can be changed by BDS updating.
 */

//////////////////////////
// hook the item using on block
const itemUseOn = procHacker.hooking(
    "?useItemOn@GameMode@@UEAA?AVInteractionResult@@AEAVItemStack@@AEBVBlockPos@@EAEBVVec3@@PEBVBlock@@@Z",
    StaticPointer,
    null,
    GameMode,
    StaticPointer,
    ItemStack,
    BlockPos,
    int8_t,
    Vec3,
    Block,
)((gameMode, interactionResult, item, blockpos, n, pos, block) => {
    const actor = gameMode.actor;
    if (actor instanceof ServerPlayer) {
        actor.sendMessage(`${item.getName()} using at ${blockpos.x} ${blockpos.y} ${blockpos.z}`);
    }
    return itemUseOn(gameMode, interactionResult, item, blockpos, n, pos, block);
});

//////////////////////////
// hide the map marker
procHacker.hooking("?_updateTrackedEntityDecoration@MapItemSavedData@@AEAA_NAEAVBlockSource@@V?$shared_ptr@VMapItemTrackedActor@@@std@@@Z", bool_t)(() => false);

//////////////////////////
// Cross thread hooking
// it will synchronize the thread and call the JS engine.

// void BedrockLog::log(enum BedrockLog::LogCategory,class std::bitset<3>,enum BedrockLog::LogRule,enum LogAreaID,unsigned int,char const *,int,char const *,...)
procHacker.hooking(
    "?log@BedrockLog@@YAXW4LogCategory@1@V?$bitset@$02@std@@W4LogRule@1@W4LogAreaID@@IPEBDH4ZZ",
    void_t,
    { crossThread: true },
    int32_t,
    int32_t,
    int32_t,
    int32_t,
    uint32_t,
    makefunc.Utf8,
)((category, bitset, logrule, logarea, n, message) => {
    if (!Tester.isPassed()) return; // logging if test is passed
    console.log(message);
});
