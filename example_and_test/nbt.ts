import { bedrockServer, command } from "bdsx";
import { BlockActor } from "bdsx/bds/block";
import { RelativeFloat } from "bdsx/bds/blockpos";
import { CompoundTag, ListTag } from "bdsx/bds/nbt";
import { abstract } from "bdsx/common";
import { int32_t, void_t } from "bdsx/nativetype";
import { ProcHacker } from "bdsx/prochacker";

const hacker = ProcHacker.load('pdbcache_by_example.ini', [
    "?save@ChestBlockActor@@UEBA_NAEAVCompoundTag@@@Z",
]);

class ChestBlockActor extends BlockActor {
    save(tag: CompoundTag) {
        abstract();
    }
}

ChestBlockActor.prototype.save = hacker.js("?save@ChestBlockActor@@UEBA_NAEAVCompoundTag@@@Z", void_t, {this:ChestBlockActor}, CompoundTag);

command.register("chestcontents", "Gets the contents of a chest at a specified index, including enchantments if present").overload(({x, y, z, slotId}, origin, output) => {
    const originPos = origin.getBlockPosition();
    originPos.x = x.is_relative ? originPos.x + x.value : x.value;
    originPos.y = y.is_relative ? originPos.y + y.value : y.value;
    originPos.z = z.is_relative ? originPos.z + z.value : z.value;
    const blockActor = origin.getEntity()?.getRegion().getBlockEntity(originPos)?.as(ChestBlockActor);
    if(blockActor === null || blockActor === undefined) return;
    const tag = CompoundTag.create();
    tag.construct();
    blockActor.save(tag);
    const items = tag.get("Items")?.as(ListTag);
    if(items === null || items === undefined) return;
    let itemSlot;
    const size = items.size();
    // It seems the ListTag is always ordered by slot, so in theory we could stop
    // the loop once i > slotId but this isn't guaranteed by nbt spec so we don't
    for(let i = 0; i < size; i++) {
        itemSlot = items.getCompound(i)!;
        if(itemSlot.getByte("Slot") === slotId) break;
    }
    // slot will be either the last slot with content, the correct slot, or undefined
    if(itemSlot === undefined || itemSlot.getByte("Slot") !== slotId) return;
    const itemName = itemSlot.getStringValue("Name");
    if(!itemName) return;
    bedrockServer.executeCommand(`say Item name: ${itemName}`);
    const itemNbtTag = itemSlot.get("tag")?.as(CompoundTag);
    if(itemNbtTag === null || itemNbtTag === undefined) return;
    const enchList = itemNbtTag.get("ench")?.as(ListTag);
    if(enchList === null || enchList === undefined) return;
    const sizeEnch = enchList.size();
    for(let i = 0; i < sizeEnch; i++) {
        const ench = enchList.getCompound(i)!;
        bedrockServer.executeCommand(`say "    Enchant id: ${ench.getShort("id")}, lvl: ${ench.getShort("lvl")}"`);
    }
    tag.destruct();
}, {
    x: RelativeFloat,
    y: RelativeFloat,
    z: RelativeFloat,
    slotId: int32_t
});
