import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { Form } from "bdsx/bds/form";
import { NBT } from "bdsx/bds/nbt";
import { command } from "bdsx/command";
import { events } from "bdsx/event";
import { bin64_t } from "bdsx/nativetype";

command.register('sign', 'generate signed block').overload((params, origin, output)=>{
    const actor = origin.getEntity();
    if (actor === null) {
        output.error('actor not found');
    } else {
        const region = actor.getRegion();
        const pos = actor.getFeetPos();
        const blockpos = BlockPos.create(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
        const block = Block.create('minecraft:standing_sign')!;
        region.setBlock(blockpos, block);
        const blockActor = region.getBlockEntity(blockpos)!;

        const nbt = {
            Text: 'be happy',
            Examples: { // it's not NBTs of the sign, it does not affect the sign.
                ByteTag: NBT.byte(0),
                ByteTag2: false,
                ShortTag: NBT.short(0),
                IntTag: NBT.int(0),
                IntTag2: 0,
                Int64Tag: NBT.int64(0),
                Int64Tag2: NBT.int64(bin64_t.zero),
                FloatTag: NBT.float(0),
                DoubleTag: NBT.double(0),
                StringTag: "text",
                ListTag: ['a','b','c'],
                CompoundTag: {
                    a:'a',
                    b:'b',
                    c:'c',
                },
                ByteArrayTag: NBT.byteArray([1,2,3]),
                ByteArrayTag2: new Uint8Array([1,2,3]),
                IntArrayTag: NBT.intArray([1,2,3]),
                IntArrayTag2: new Int32Array([1,2,3]),
            }
        };
        blockActor.load(nbt);

        Form.sendTo(actor.getNetworkIdentifier(), {
            type: 'form',
            title: 'NBT',
            buttons: [
                { text: 'OK' }
            ],
            content: NBT.stringify(blockActor.save(), 4) // stringified NBT
        });
    }
}, {});

events.playerUseItem.on(ev=>{
    ev.itemStack.save();
});
