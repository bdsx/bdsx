// Low Level - API Hooking
import { Block } from "bdsx/bds/block";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { GameMode } from "bdsx/bds/gamemode";
import { ItemStack } from "bdsx/bds/inventory";
import { ServerPlayer } from "bdsx/bds/player";
import { StaticPointer } from "bdsx/core";
import { bool_t, int8_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";

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
)((gameMode, interactionResult, item, blockpos, face, clickPos, block) => {
    const actor = gameMode.actor;
    if (actor instanceof ServerPlayer) {
        actor.sendMessage(`${item.getName()} using at ${blockpos.x} ${blockpos.y} ${blockpos.z}`);
    }
    return itemUseOn(gameMode, interactionResult, item, blockpos, face, clickPos, block);
});

//////////////////////////
// hide the map marker
procHacker.hooking("?_updateTrackedEntityDecoration@MapItemSavedData@@AEAA_NAEAVBlockSource@@V?$shared_ptr@VMapItemTrackedActor@@@std@@@Z", bool_t)(() => false);
